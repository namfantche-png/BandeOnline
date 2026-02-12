# BissauMarket Backend

API REST da plataforma SaaS de anúncios classificados BissauMarket.

## 🚀 Stack Tecnológico

- **Framework**: NestJS 10+
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Autenticação**: JWT
- **Documentação**: Swagger/OpenAPI 3.0
- **Real-time**: Socket.io
- **Validação**: class-validator, class-transformer

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   │   ├── auth/            # Autenticação (register, login)
│   │   ├── users/           # Gerenciamento de usuários
│   │   ├── plans/           # Planos de subscrição
│   │   ├── subscriptions/   # Subscrições
│   │   ├── ads/             # Anúncios
│   │   ├── categories/      # Categorias
│   │   ├── messages/        # Chat e mensagens
│   │   ├── reviews/         # Avaliações
│   │   ├── payments/        # Pagamentos
│   │   ├── reports/         # Denúncias
│   │   └── admin/           # Painel administrativo
│   ├── common/              # Utilitários compartilhados
│   ├── config/              # Configurações
│   ├── guards/              # Guards (JWT)
│   ├── decorators/          # Decoradores customizados
│   ├── strategies/          # Estratégias Passport
│   ├── app.module.ts        # Módulo raiz
│   └── main.ts              # Ponto de entrada
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Migrações
├── .env                     # Variáveis de ambiente
└── package.json
```

## 🔧 Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
# Copiar arquivo .env.example
cp .env.example .env

# Editar .env com suas configurações
```

3. **Executar migrações Prisma**
```bash
npx prisma migrate dev --name init
```

4. **Gerar cliente Prisma**
```bash
npx prisma generate
```

5. **Iniciar servidor**
```bash
npm run start
```

## 📚 Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login

### Usuários
- `GET /users/profile` - Obter perfil (autenticado)
- `PUT /users/profile` - Atualizar perfil (autenticado)
- `GET /users/:id` - Obter perfil público

### Planos
- `GET /plans` - Listar planos
- `GET /plans/:id` - Obter plano por ID

### Categorias
- `GET /categories` - Listar categorias
- `GET /categories/:id` - Obter categoria

### Anúncios
- `GET /ads` - Listar anúncios com filtros
- `GET /ads/search?q=termo` - Buscar anúncios
- `GET /ads/:id` - Obter anúncio
- `POST /ads` - Criar anúncio (autenticado)
- `GET /ads/user/my-ads` - Meus anúncios (autenticado)
- `PUT /ads/:id` - Atualizar anúncio (autenticado)
- `DELETE /ads/:id` - Remover anúncio (autenticado)
- `POST /ads/:id/highlight` - Destacar anúncio (autenticado)

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. **Registrar ou fazer login** para obter um token
2. **Incluir token no header** de requisições protegidas:
```
Authorization: Bearer <seu_token_jwt>
```

## 📖 Documentação Swagger

Acesse a documentação interativa em:
```
http://localhost:3000/api
```

## 🗄️ Modelos de Dados

### User
- id, email, password, firstName, lastName, phone, avatar
- isActive, isBlocked, createdAt, updatedAt

### Profile
- bio, location, city, country, website, rating, reviewCount, totalAds

### Plan
- name (FREE, PRO, PREMIUM), price, maxAds, maxHighlights, hasStore, features

### Ad
- title, description, price, categoryId, userId, location, city, country
- images, status, isHighlighted, views, condition

### Message
- senderId, receiverId, adId, content, isRead

### Review
- reviewerId, revieweeId, adId, rating, comment

### Payment
- userId, amount, status, method (mobile_money), provider

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📝 Scripts

```bash
npm run start           # Iniciar servidor
npm run start:dev       # Iniciar em modo desenvolvimento
npm run build           # Compilar para produção
npm run lint            # Executar linter
npm run format          # Formatar código
```

## 🔒 Segurança

- ✅ Validação de inputs em todas as camadas
- ✅ Rate limiting (a implementar)
- ✅ Proteção contra CSRF
- ✅ Hashing de senhas com bcryptjs
- ✅ JWT com expiração
- ✅ CORS configurável

## 🚀 Deploy

### Docker

```bash
# Build
docker build -t bissaumarket-backend .

# Run
docker run -p 3000:3000 bissaumarket-backend
```

### Variáveis de Ambiente Produção

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/bissaumarket
JWT_SECRET=sua-chave-super-secreta
CORS_ORIGIN=https://seu-dominio.com
```

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Status**: ✅ FASE 1 COMPLETA - Backend funcional com autenticação, CRUD de anúncios e planos
