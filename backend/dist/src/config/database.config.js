"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseServiceImpl_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const database_init_service_1 = require("./database-init.service");
let DatabaseServiceImpl = DatabaseServiceImpl_1 = class DatabaseServiceImpl {
    logger = new common_1.Logger('DatabaseService');
    initService = null;
    pool;
    client;
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL não está configurado no arquivo .env');
        }
        this.pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(this.pool);
        this.client = new client_1.PrismaClient({ adapter, errorFormat: 'pretty' });
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target || prop === 'then')
                    return target[prop];
                return target.client[prop];
            },
        });
    }
    async onModuleInit() {
        try {
            this.logger.log('🔌 Conectando ao banco de dados PostgreSQL...');
            await this.client.$connect();
            this.logger.log('✅ Prisma conectado ao PostgreSQL com sucesso');
            this.initService = new database_init_service_1.DatabaseInitService(this.client);
            await this.initService.initialize();
        }
        catch (error) {
            this.logger.error('❌ Erro ao conectar com banco de dados:', error.message);
            if (error.message?.includes('DATABASE_URL')) {
                this.logger.error('💡 Verifique se DATABASE_URL está configurado no arquivo .env');
            }
            else if (error.message?.includes('connect')) {
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
DatabaseServiceImpl = DatabaseServiceImpl_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseServiceImpl);
;
exports.DatabaseService = DatabaseServiceImpl;
//# sourceMappingURL=database.config.js.map