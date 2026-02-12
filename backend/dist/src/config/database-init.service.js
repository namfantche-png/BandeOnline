"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
class DatabaseInitService {
    logger = new common_1.Logger(DatabaseInitService.name);
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initialize() {
        try {
            this.logger.log('🔧 Iniciando verificação e inicialização do banco de dados...');
            await this.testConnection();
            await this.verifyDatabase();
            await this.runMigrations();
            await this.validateSchema();
            if (process.env.AUTO_SEED === 'true') {
                await this.runSeed();
            }
            this.logger.log('✅ Banco de dados inicializado e validado com sucesso!');
        }
        catch (error) {
            this.logger.error('❌ Erro ao inicializar banco de dados:', error.message);
            throw error;
        }
    }
    async testConnection() {
        try {
            this.logger.log('🔌 Testando conexão com banco de dados...');
            await this.prisma.$queryRaw `SELECT 1`;
            this.logger.log('✅ Conexão estabelecida com sucesso');
        }
        catch (error) {
            this.logger.error('❌ Falha ao conectar ao banco de dados');
            throw new Error(`Não foi possível conectar ao banco de dados. Verifique DATABASE_URL no .env\n${error.message}`);
        }
    }
    async verifyDatabase() {
        try {
            this.logger.log('🔍 Verificando banco de dados...');
            const result = await this.prisma.$queryRaw `
        SELECT version();
      `;
            if (result && result.length > 0) {
                this.logger.log(`✅ PostgreSQL versão: ${result[0].version.split(' ')[0]}`);
            }
            const dbName = await this.prisma.$queryRaw `
        SELECT current_database();
      `;
            if (dbName && dbName.length > 0) {
                this.logger.log(`✅ Banco de dados: ${dbName[0].current_database}`);
            }
        }
        catch (error) {
            this.logger.error('❌ Erro ao verificar banco de dados:', error.message);
            throw error;
        }
    }
    async runMigrations() {
        try {
            this.logger.log('📦 Verificando migrações pendentes...');
            const migrationsPath = (0, path_1.join)(process.cwd(), 'prisma', 'migrations');
            if (!(0, fs_1.existsSync)(migrationsPath)) {
                this.logger.warn('⚠️  Diretório de migrações não encontrado. Criando estrutura...');
                return;
            }
            try {
                const migrationStatus = await this.prisma.$queryRaw `
          SELECT migration_name 
          FROM _prisma_migrations 
          ORDER BY finished_at DESC 
          LIMIT 1;
        `;
                if (migrationStatus && migrationStatus.length > 0) {
                    this.logger.log(`✅ Última migração aplicada: ${migrationStatus[0].migration_name}`);
                }
                this.logger.log('🔄 Aplicando migrações pendentes...');
                (0, child_process_1.execSync)('npx prisma migrate deploy', {
                    stdio: 'pipe',
                    cwd: process.cwd(),
                    env: { ...process.env },
                    shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
                });
                this.logger.log('✅ Migrações aplicadas com sucesso');
            }
            catch (error) {
                const errorMessage = error.message || error.toString();
                if (errorMessage?.includes('No pending migrations') ||
                    errorMessage?.includes('already applied') ||
                    error.stdout?.toString().includes('No pending migrations')) {
                    this.logger.log('✅ Nenhuma migração pendente');
                }
                else {
                    if (process.env.NODE_ENV === 'development') {
                        this.logger.log('🔄 Tentando aplicar migrações em modo desenvolvimento...');
                        try {
                            (0, child_process_1.execSync)('npx prisma migrate dev --name auto-migration', {
                                stdio: 'pipe',
                                cwd: process.cwd(),
                                env: { ...process.env, SKIP_PROMPTS: 'true' },
                                shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
                            });
                            this.logger.log('✅ Migrações aplicadas em modo desenvolvimento');
                        }
                        catch (devError) {
                            this.logger.warn('⚠️  Não foi possível aplicar migrações automaticamente');
                            this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
                            this.logger.debug(`Erro: ${devError.message}`);
                        }
                    }
                    else {
                        this.logger.warn('⚠️  Erro ao aplicar migrações:', errorMessage);
                        this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn('⚠️  Erro ao executar migrações:', error.message);
            this.logger.warn('💡 Execute manualmente: npx prisma migrate deploy');
        }
    }
    async validateSchema() {
        try {
            this.logger.log('🔍 Validando schema do banco de dados...');
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
            const tables = await this.prisma.$queryRaw `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `;
            const existingTables = tables.map((t) => t.tablename.toLowerCase());
            const missingTables = [];
            for (const expectedTable of expectedTables) {
                const found = existingTables.some((t) => t.toLowerCase() === expectedTable.toLowerCase());
                if (!found) {
                    missingTables.push(expectedTable);
                }
            }
            if (missingTables.length > 0) {
                this.logger.warn(`⚠️  Tabelas faltando: ${missingTables.join(', ')}`);
                this.logger.warn('💡 Execute: npx prisma migrate deploy');
            }
            else {
                this.logger.log(`✅ Schema validado: ${existingTables.length} tabelas encontradas`);
            }
            try {
                const userCount = await this.prisma.user.count();
                this.logger.log(`✅ Tabela User acessível (${userCount} registros)`);
            }
            catch (error) {
                this.logger.error('❌ Erro ao acessar tabela User:', error.message);
                throw new Error('Schema do banco de dados não está correto. Execute migrações.');
            }
            const planCount = await this.prisma.plan.count();
            if (planCount === 0) {
                this.logger.warn('⚠️  Nenhum plano encontrado no banco de dados');
                this.logger.warn('💡 Execute seed: npm run seed ou configure AUTO_SEED=true');
            }
            else {
                this.logger.log(`✅ ${planCount} plano(s) encontrado(s)`);
            }
        }
        catch (error) {
            this.logger.error('❌ Erro ao validar schema:', error.message);
            throw error;
        }
    }
    async runSeed() {
        try {
            this.logger.log('🌱 Executando seed do banco de dados...');
            const seedPath = (0, path_1.join)(process.cwd(), 'seed.js');
            if (!(0, fs_1.existsSync)(seedPath)) {
                this.logger.warn('⚠️  Arquivo seed.js não encontrado');
                return;
            }
            (0, child_process_1.execSync)(`node seed.js`, {
                stdio: 'pipe',
                cwd: process.cwd(),
                env: { ...process.env },
                shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
            });
            this.logger.log('✅ Seed executado com sucesso');
        }
        catch (error) {
            this.logger.warn('⚠️  Erro ao executar seed:', error.message);
            this.logger.warn('💡 Execute manualmente: npm run seed');
        }
    }
}
exports.DatabaseInitService = DatabaseInitService;
//# sourceMappingURL=database-init.service.js.map