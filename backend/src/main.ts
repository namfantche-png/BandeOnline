import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Função de bootstrap da aplicação
 * Inicializa o servidor NestJS com Swagger e validação
 * ✅ CORRIGIDO: app.listen() chamado APENAS UMA VEZ
 * ✅ CORRIGIDO: Tratamento de graceful shutdown
 * ✅ CORRIGIDO: Porta correta do Render/Docker
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ========================================
  // 1. CONFIGURAÇÕES GERAIS
  // ========================================
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Define global API prefix
  app.setGlobalPrefix('api');

  // Servir ficheiros de upload locais em /uploads (se não usar Cloudinary)
  try {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  } catch (error) {
    console.warn('⚠️  Pasta de uploads não encontrada (usando Cloudinary)');
  }

  // ========================================
  // 2. VALIDAÇÃO GLOBAL
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ========================================
  // 3. CORS
  // ========================================
  app.enableCors({
    origin: isProduction
      ? process.env.CORS_ORIGIN?.split(',') || ['https://bandeonline.com']
      : [
          'http://localhost:3001',
          'http://localhost:3002',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3002',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ========================================
  // 4. SWAGGER (desabilitado em produção)
  // ========================================
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('BissauMarket API')
      .setDescription(
        'API da plataforma SaaS de anúncios classificados BissauMarket',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Authentication', 'Endpoints de autenticação')
      .addTag('Users', 'Gerenciamento de usuários')
      .addTag('Plans', 'Gerenciamento de planos')
      .addTag('Categories', 'Gerenciamento de categorias')
      .addTag('Ads', 'Gerenciamento de anúncios')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // ========================================
  // 5. INICIAR SERVIDOR (CHAMADO UMA ÚNICA VEZ)
  // ========================================
  const server = await app.listen(port, '0.0.0.0');

  // ========================================
  // 6. GRACEFUL SHUTDOWN
  // ========================================
  process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM recebido, encerrando gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT recebido, encerrando gracefully...');
    await app.close();
    process.exit(0);
  });

  // ========================================
  // 7. LOG DE INICIALIZAÇÃO
  // ========================================
  if (!isProduction) {
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
  } else {
    console.log(`✅ Servidor em produção rodando na porta ${port}`);
  }

  return server;
}

bootstrap().catch((error) => {
  console.error('❌ Erro ao iniciar aplicação:', error);
  process.exit(1);
});
