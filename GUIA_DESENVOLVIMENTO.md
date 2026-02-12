# 📚 GUIA COMPLETO DE DESENVOLVIMENTO - BandeOnline v1.1

**Última Atualização:** 24 de Janeiro de 2026

## 📖 Índice

1. [Setup Inicial](#setup-inicial)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Backend - Desenvolvimento](#backend---desenvolvimento)
4. [Frontend - Desenvolvimento](#frontend---desenvolvimento)
5. [Segurança](#segurança)
6. [Deploy](#deploy)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### Pré-requisitos

- Node.js 18+ (ou superior)
- PostgreSQL 15+
- Docker e Docker Compose
- Git
- Conta no Cloudinary (para uploads de imagens)

### 1. Clonar Repositório

```bash
git clone <seu-repositorio>
cd BandeOnline
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**Variáveis Críticas:**

- `DATABASE_URL`: String de conexão PostgreSQL
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `JWT_SECRET`: Chave secreta para tokens (mín. 32 caracteres)
- `NEXT_PUBLIC_API_URL`: URL do backend para o frontend

### 3. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Setup do Banco de Dados

```bash
# Navegar para backend
cd backend

# Criar banco de dados e rodar migrations
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# Seed do banco (criar planos padrão e usuário admin)
npx ts-node src/seeds/seed.ts
```

---

## 🏗️ Estrutura do Projeto

```
BandeOnline/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── app.module.ts      # Módulo raiz
│   │   ├── app.service.ts
│   │   ├── main.ts            # Entrada da aplicação
│   │   ├── config/            # Configurações
│   │   │   └── database.config.ts
│   │   ├── decorators/        # Decoradores custom
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/           # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/            # Guards de autenticação
│   │   │   ├── admin.guard.ts
│   │   │   ├── jwt.guard.ts
│   │   │   └── throttle.guard.ts
│   │   ├── middleware/        # Middlewares
│   │   │   └── security.middleware.ts
│   │   ├── modules/           # Módulos de negócio
│   │   │   ├── admin/
│   │   │   ├── ads/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── invoices/
│   │   │   ├── messages/      # Chat + WebSocket
│   │   │   ├── payments/
│   │   │   ├── plans/
│   │   │   ├── reports/
│   │   │   ├── reviews/
│   │   │   ├── subscriptions/
│   │   │   ├── tasks/         # Cron jobs
│   │   │   ├── uploads/       # Cloudinary
│   │   │   └── users/
│   │   ├── pipes/             # Validation pipes
│   │   ├── strategies/        # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   └── types/             # Type definitions
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco
│   │   └── migrations/        # Histórico de migrações
│   ├── test/                  # Testes E2E
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Aplicação Next.js
│   ├── app/                   # App Router
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Home
│   │   ├── globals.css        # Estilos globais
│   │   ├── (auth)/            # Grupo de rotas
│   │   │   ├── login/page.tsx
│   │   │   ├── registrar/page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/             # Painel administrativo
│   │   ├── anuncios/          # Anúncios
│   │   │   ├── page.tsx       # Listagem
│   │   │   ├── criar/         # Criar
│   │   │   └── [id]/          # Detalhe e edição
│   │   ├── mensagens/         # Chat
│   │   ├── perfil/            # Perfil do usuário
│   │   └── planos/            # Planos e subscrição
│   ├── components/            # Componentes React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AdCard.tsx
│   │   ├── Loading.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   └── EmptyState.tsx
│   ├── contexts/              # Context API
│   │   └── AuthContext.tsx
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários
│   │   └── api.ts             # Axios config
│   ├── public/                # Arquivos estáticos
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # Orquestração
├── .env.example               # Exemplo de variáveis
└── AUDITORIA_COMPLETA.md      # Este arquivo de auditoria
```

---

## 🎯 Backend - Desenvolvimento

### Estrutura de um Módulo

Cada módulo segue a arquitetura padrão do NestJS:

```
modules/ads/
├── ads.controller.ts      # Rotas HTTP
├── ads.service.ts         # Lógica de negócio
├── ads.module.ts          # Definição do módulo
└── dto/
    └── ad.dto.ts          # Data Transfer Objects
```

### Criando um Novo Endpoint

1. **Adicionar método no Service:**

```typescript
// modules/ads/ads.service.ts
@Injectable()
export class AdsService {
  async getAdById(id: string) {
    const ad = await this.db.ad.findUnique({
      where: { id },
      include: { user: true, category: true }
    });
    
    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }
    
    return ad;
  }
}
```

2. **Adicionar rota no Controller:**

```typescript
// modules/ads/ads.controller.ts
@Get(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Obter anúncio por ID' })
async getAdById(@Param('id') id: string) {
  return this.adsService.getAdById(id);
}
```

3. **Documentação automática:**
   - Use decoradores `@Api*` para Swagger
   - Rode `npm run start` e acesse `http://localhost:3000/api`

### Validação de Entrada

Todos os DTOs devem ter validações:

```typescript
// DTO com validações
import { IsString, IsNumber, MinLength, Min } from 'class-validator';

export class CreateAdDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// O ValidationPipe global valida automaticamente
```

### Proteção de Rotas

```typescript
// Apenas autenticados
@UseGuards(JwtAuthGuard)

// Apenas administradores
@UseGuards(JwtAuthGuard, AdminGuard)

// Rate limiting
@UseGuards(ThrottleGuard)
```

### Tratamento de Erros

```typescript
// Erros padrão do NestJS
throw new NotFoundException('Recurso não encontrado');
throw new BadRequestException('Dados inválidos');
throw new ForbiddenException('Acesso negado');
throw new UnauthorizedException('Não autenticado');
throw new ConflictException('Recurso já existe');

// Todos são capturados pelo HttpExceptionFilter
```

### Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 🎨 Frontend - Desenvolvimento

### Estrutura de Uma Página

```tsx
'use client';  // Client component (usa hooks)

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';
import { Toast } from '@/components/Toast';

export default function MyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      {loading && <Loading />}
      {/* Conteúdo */}
    </div>
  );
}
```

### Requisições HTTP

```tsx
// Use axios que já está configurado
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function fetchAds() {
  try {
    const response = await axios.get(`${apiUrl}/ads`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

### Chat em Tempo Real

```tsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function ChatPage() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      query: { userId: user.id }
    });

    newSocket.on('messageReceived', (message) => {
      console.log('Mensagem recebida:', message);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    socket?.emit('sendMessage', {
      receiverId: 'user123',
      content: 'Olá!'
    });
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

### Estilos

Use **Tailwind CSS**:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 className="text-3xl font-bold text-gray-900">Título</h1>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
    Botão
  </button>
</div>
```

### Build e Deploy

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build em produção
npm run start
```

---

## 🔒 Segurança

### Autenticação

- **JWT**: Tokens com expiração
- **Refresh Token**: Para renovar sessão sem fazer login novamente
- **Password Hashing**: bcryptjs com salt

```typescript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Resposta
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": { "id", "email", "firstName", "lastName" }
}

// Usar token em requisições
Authorization: Bearer <access_token>
```

### Headers de Segurança

Todos os endpoints têm:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### Rate Limiting

- **Login**: 5 requisições por minuto
- **Outros endpoints**: 100 requisições por minuto
- **Resposta**: HTTP 429 Too Many Requests

### Validação de Entrada

- Todos os DTOs usam `class-validator`
- ValidationPipe global rejeita dados inválidos
- Sanitização de strings para XSS

### CORS

Configurado apenas para origens autorizadas:

```env
CORS_ORIGIN=http://localhost:3001,https://seu-dominio.com
```

### Variáveis Sensíveis

**NUNCA** commit em Git:

- `.env` (adicionar a `.gitignore`)
- Chaves privadas
- Senhas

---

## 🚀 Deploy

### Docker (Recomendado)

```bash
# Build e executar
docker-compose up -d --build

# Logs
docker-compose logs -f backend

# Parar
docker-compose down
```

### Produção (DigitalOcean/AWS)

1. **Preparar servidor:**

```bash
# Ubuntu 22.04+
sudo apt update && sudo apt upgrade
sudo apt install docker.io docker-compose git
sudo usermod -aG docker $USER
```

2. **Clonar repositório:**

```bash
git clone <repositorio>
cd BandeOnline
```

3. **Configurar variáveis:**

```bash
# Criar .env com variáveis reais
cp .env.example .env
nano .env  # Editar com valores de produção
```

4. **Executar:**

```bash
docker-compose -f docker-compose.yml up -d
```

5. **Backup automático:**

```bash
# Adicionar cron job para backup diário
0 2 * * * docker-compose exec postgres pg_dump -U postgres bissaumarket > /backups/backup-$(date +\%Y\%m\%d).sql
```

### Certificado SSL

Use Let's Encrypt via Nginx:

```yaml
# docker-compose.yml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt
```

### Monitoramento

Adicione Sentry para rastreamento de erros:

```typescript
// main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🐛 Troubleshooting

### Erro: "Banco de dados não encontrado"

```bash
# Verificar conexão
psql -U postgres -d bissaumarket -h localhost

# Criar banco se não existir
psql -U postgres -c "CREATE DATABASE bissaumarket;"

# Rodar migrations
cd backend && npx prisma migrate dev
```

### Erro: "CORS blocked"

```bash
# Verificar .env
CORS_ORIGIN="http://localhost:3001,http://seu-dominio.com"

# Reiniciar containers
docker-compose restart backend
```

### Erro: "Token inválido"

```bash
# Verificar JWT_SECRET em .env
# Deve ser string aleatória de 32+ caracteres

# Gerar novo secret
openssl rand -base64 32
```

### Erro: "Cloudinary unauthorized"

```bash
# Verificar credenciais em .env
CLOUDINARY_CLOUD_NAME=seu-cloud
CLOUDINARY_API_KEY=sua-chave
CLOUDINARY_API_SECRET=seu-secret

# Testar em https://cloudinary.com/console
```

### Performance Lenta

```bash
# Verificar índices do banco
SELECT * FROM pg_indexes WHERE tablename NOT LIKE 'pg%';

# Adicionar índices se necessário
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_messages_user_id ON messages(user_id);
```

---

## 📞 Suporte

- **Issues**: Abrir issue no GitHub
- **Email**: suporte@bissaumarket.com
- **Documentação**: http://localhost:3000/api (Swagger)

---

## 📝 Changelog

### v1.1 (24 Janeiro 2026)

- ✅ DTOs com validações melhoradas
- ✅ Cloudinary Service implementado
- ✅ WebSocket para chat em tempo real
- ✅ Cron jobs para automação
- ✅ Componentes frontend reutilizáveis

### v1.0 (Release Inicial)

- ✅ MVP completo
- ✅ Sistema de subscrição SaaS
- ✅ Painel administrativo

---

**Última Atualização:** 24 de Janeiro de 2026  
**Versão:** 1.1  
**Status:** Pronto para Produção ✅
