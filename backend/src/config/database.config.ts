import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { DatabaseInitService } from './database-init.service';

/**
 * Implementação do DatabaseService usando composição + Proxy.
 * O Prisma 7 com engine "client" exige adapter, mas extendendo PrismaClient
 * os delegates ficam undefined. Usamos Proxy para delegar ao client real.
 */
@Injectable()
class DatabaseServiceImpl implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('DatabaseService');
  private initService: DatabaseInitService | null = null;
  private readonly pool: Pool;
  readonly client: PrismaClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não está configurado no arquivo .env');
    }

    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter, errorFormat: 'pretty' });

    return new Proxy(this, {
      get(target: typeof DatabaseServiceImpl.prototype, prop: string | symbol) {
        if (prop in target || prop === 'then') return (target as any)[prop];
        return (target.client as any)[prop];
      },
    }) as any;
  }

  async onModuleInit() {
    try {
      this.logger.log('🔌 Conectando ao banco de dados PostgreSQL...');

      await this.client.$connect();
      this.logger.log('✅ Prisma conectado ao PostgreSQL com sucesso');

      this.initService = new DatabaseInitService(this.client);
      await this.initService.initialize();
    } catch (error) {
      this.logger.error('❌ Erro ao conectar com banco de dados:', error.message);
      
      if (error.message?.includes('DATABASE_URL')) {
        this.logger.error('💡 Verifique se DATABASE_URL está configurado no arquivo .env');
      } else if (error.message?.includes('connect')) {
        this.logger.error('💡 Verifique se o PostgreSQL está rodando e acessível');
        this.logger.error('💡 Verifique se o banco de dados existe');
      }
      
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
    this.logger.log('🔌 Desconectado do banco de dados');
  }
};

/** Interface para tipagem do DatabaseService injetado */
/**
 * Export a DatabaseService type that includes PrismaClient delegates.
 * Adding an index signature prevents TS errors when using Proxy-delegated
 * model delegates (e.g. `db.user`, `db.ad`) while preserving the
 * PrismaClient typings where available.
 */
export interface DatabaseService extends PrismaClient, OnModuleInit, OnModuleDestroy {
  [key: string]: any;
}

/** Classe para injeção no Nest */
export const DatabaseService = DatabaseServiceImpl as unknown as new () => DatabaseService;
