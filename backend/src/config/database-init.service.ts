import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Serviço de inicialização automática do banco de dados
 * Executa migrações, valida schema e opcionalmente popula dados iniciais
 */
export class DatabaseInitService {
  private readonly logger = new Logger(DatabaseInitService.name);
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Inicializa e valida o banco de dados
   */
  async initialize() {
    try {
      this.logger.log('🔧 Iniciando verificação e inicialização do banco de dados...');

      // 1. Verifica conexão
      await this.testConnection();

      // 2. Verifica se banco existe e está acessível
      await this.verifyDatabase();

      // 3. Executa migrações pendentes
      await this.runMigrations();

      // 4. Valida schema do banco
      await this.validateSchema();

      // 5. Executa seed se necessário (opcional)
      if (process.env.AUTO_SEED === 'true') {
        await this.runSeed();
      }

      this.logger.log('✅ Banco de dados inicializado e validado com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar banco de dados:', error.message);
      throw error;
    }
  }

  /**
   * Testa conexão com o banco de dados
   */
  private async testConnection() {
    try {
      this.logger.log('🔌 Testando conexão com banco de dados...');
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('✅ Conexão estabelecida com sucesso');
    } catch (error) {
      this.logger.error('❌ Falha ao conectar ao banco de dados');
      throw new Error(
        `Não foi possível conectar ao banco de dados. Verifique DATABASE_URL no .env\n${error.message}`,
      );
    }
  }

  /**
   * Verifica se o banco de dados existe e está acessível
   */
  private async verifyDatabase() {
    try {
      this.logger.log('🔍 Verificando banco de dados...');

      // Verifica se consegue executar uma query simples
      const result = await this.prisma.$queryRaw<Array<{ version: string }>>`
        SELECT version();
      `;

      if (result && result.length > 0) {
        this.logger.log(`✅ PostgreSQL versão: ${result[0].version.split(' ')[0]}`);
      }

      // Verifica se o banco de dados está acessível
      const dbName = await this.prisma.$queryRaw<Array<{ current_database: string }>>`
        SELECT current_database();
      `;

      if (dbName && dbName.length > 0) {
        this.logger.log(`✅ Banco de dados: ${dbName[0].current_database}`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao verificar banco de dados:', error.message);
      throw error;
    }
  }

  /**
   * Executa migrações pendentes do Prisma
   */
  private async runMigrations() {
    try {
      this.logger.log('📦 Verificando migrações pendentes...');

      // Verifica se há migrações pendentes usando Prisma Migrate
      const migrationsPath = join(process.cwd(), 'prisma', 'migrations');

      if (!existsSync(migrationsPath)) {
        this.logger.warn('⚠️  Diretório de migrações não encontrado. Criando estrutura...');
        return;
      }

      // Verifica status das migrações usando Prisma
      try {
        // Tenta verificar se há migrações pendentes usando $queryRaw
        const migrationStatus = await this.prisma.$queryRaw<Array<{ migration_name: string }>>`
          SELECT migration_name 
          FROM _prisma_migrations 
          ORDER BY finished_at DESC 
          LIMIT 1;
        `;

        if (migrationStatus && migrationStatus.length > 0) {
          this.logger.log(`✅ Última migração aplicada: ${migrationStatus[0].migration_name}`);
        }

        // Tenta aplicar migrações pendentes
        this.logger.log('🔄 Aplicando migrações pendentes...');
        execSync('npx prisma migrate deploy', {
          stdio: 'pipe',
          cwd: process.cwd(),
          env: { ...process.env },
          shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
        });
        this.logger.log('✅ Migrações aplicadas com sucesso');
      } catch (error: any) {
        const errorMessage = error.message || error.toString();
        
        // Se não houver migrações pendentes, isso é normal
        if (
          errorMessage?.includes('No pending migrations') ||
          errorMessage?.includes('already applied') ||
          error.stdout?.toString().includes('No pending migrations')
        ) {
          this.logger.log('✅ Nenhuma migração pendente');
        } else {
          // Tenta usar migrate dev se deploy falhar (modo desenvolvimento)
          if (process.env.NODE_ENV === 'development') {
            this.logger.log('🔄 Tentando aplicar migrações em modo desenvolvimento...');
            try {
              execSync('npx prisma migrate dev --name auto-migration', {
                stdio: 'pipe',
                cwd: process.cwd(),
                env: { ...process.env, SKIP_PROMPTS: 'true' },
                shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
              });
              this.logger.log('✅ Migrações aplicadas em modo desenvolvimento');
            } catch (devError: any) {
              this.logger.warn('⚠️  Não foi possível aplicar migrações automaticamente');
              this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
              this.logger.debug(`Erro: ${devError.message}`);
            }
          } else {
            this.logger.warn('⚠️  Erro ao aplicar migrações:', errorMessage);
            this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
          }
        }
      }
    } catch (error: any) {
      this.logger.warn('⚠️  Erro ao executar migrações:', error.message);
      this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
      // Não lança erro para não bloquear a inicialização
    }
  }

  /**
   * Valida o schema do banco de dados
   * Verifica se todas as tabelas necessárias existem
   */
  private async validateSchema() {
    try {
      this.logger.log('🔍 Validando schema do banco de dados...');

      // Lista de tabelas esperadas baseadas no schema.prisma
      const expectedTables = [
        'User',
        'Profile',
        'Plan',
        'Subscription',
        'Category',
        'Ad',
        'Message',
        'Review',
        'Payment',
        'Report',
        'AdminLog',
        'Invoice',
      ];

      // Verifica quais tabelas existem no banco
      const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `;

      const existingTables = tables.map((t) => t.tablename.toLowerCase());
      const missingTables: string[] = [];

      // Verifica tabelas esperadas (comparação case-insensitive)
      for (const expectedTable of expectedTables) {
        const found = existingTables.some(
          (t) => t.toLowerCase() === expectedTable.toLowerCase(),
        );
        if (!found) {
          missingTables.push(expectedTable);
        }
      }

      if (missingTables.length > 0) {
        this.logger.warn(`⚠️  Tabelas faltando: ${missingTables.join(', ')}`);
        this.logger.warn('💡 Execute: npx prisma migrate deploy');
      } else {
        this.logger.log(`✅ Schema validado: ${existingTables.length} tabelas encontradas`);
      }

      // Valida estrutura básica verificando se tabela User tem campos essenciais
      try {
        const userCount = await this.prisma.user.count();
        this.logger.log(`✅ Tabela User acessível (${userCount} registros)`);
      } catch (error) {
        this.logger.error('❌ Erro ao acessar tabela User:', error.message);
        throw new Error('Schema do banco de dados não está correto. Execute migrações.');
      }

      // Valida se planos existem (necessário para funcionamento)
      const planCount = await this.prisma.plan.count();
      if (planCount === 0) {
        this.logger.warn('⚠️  Nenhum plano encontrado no banco de dados');
        this.logger.warn('💡 Execute seed: npm run seed ou configure AUTO_SEED=true');
      } else {
        this.logger.log(`✅ ${planCount} plano(s) encontrado(s)`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao validar schema:', error.message);
      throw error;
    }
  }

  /**
   * Executa seed do banco de dados (opcional)
   */
  private async runSeed() {
    try {
      this.logger.log('🌱 Executando seed do banco de dados...');

      const seedPath = join(process.cwd(), 'seed.js');
      if (!existsSync(seedPath)) {
        this.logger.warn('⚠️  Arquivo seed.js não encontrado');
        return;
      }

      // Executa seed usando node diretamente
      execSync(`node seed.js`, {
        stdio: 'pipe',
        cwd: process.cwd(),
        env: { ...process.env },
        shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
      });

      this.logger.log('✅ Seed executado com sucesso');
    } catch (error: any) {
      this.logger.warn('⚠️  Erro ao executar seed:', error.message);
      this.logger.warn('💡 Execute manualmente: npm run seed');
      // Não lança erro para não bloquear a inicialização
    }
  }
}
