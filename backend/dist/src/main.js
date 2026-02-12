"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path = __importStar(require("path"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = process.env.PORT || 3000;
    const uploadsPath = path.join(process.cwd(), 'uploads');
    app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:3001',
            'http://localhost:3002',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('BissauMarket API')
        .setDescription('API da plataforma SaaS de anúncios classificados BissauMarket')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Authentication', 'Endpoints de autenticação')
        .addTag('Users', 'Gerenciamento de usuários')
        .addTag('Plans', 'Gerenciamento de planos')
        .addTag('Categories', 'Gerenciamento de categorias')
        .addTag('Ads', 'Gerenciamento de anúncios')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(port, () => {
        console.log(`
    ╔════════════════════════════════════════╗
    ║       🚀 Bande Online API v1.0         ║
    ║                                        ║
    ║  Servidor rodando em:                  ║
    ║  http://localhost:${port}                    ║
    ║                                        ║
    ║  📚 Documentação Swagger:              ║
    ║  http://localhost:${port}/api              ║
    ║                                        ║
    ╚════════════════════════════════════════╝
    `);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map