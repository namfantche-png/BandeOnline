import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

/**
 * Função de bootstrap da aplicação
 * Inicializa o servidor NestJS com Swagger e validação
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  // Servir ficheiros de upload locais em /uploads
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  // Define global API prefix
  app.setGlobalPrefix('api');

  // Ativa validação global
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

  // Configura CORS
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

  // Configura Swagger
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
