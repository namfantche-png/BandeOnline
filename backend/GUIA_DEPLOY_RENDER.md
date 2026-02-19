# Guia Completo para Deploy NestJS no Render

## 1. ANÁLISE DOS ERROS

### Erro 1: `Module '"@prisma/client"' has no exported member 'PrismaClient'`

**Causa Raiz:**
- O Prisma Client não foi gerado no ambiente de build
- A pasta `node_modules/.prisma/client` não existe durante o build
- Isso ocorre porque o comando `npm install` não executa `prisma generate` automaticamente

**Por que acontece em Linux (Render) e não no Windows:**
- No Windows, você pode ter rodado `npm install` localmente e depois feito commit dos arquivos
- O Render bate num ambiente limpo (fresh Linux instance) onde nada foi pré-gerado

**Solução:**
Adicionar `prisma generate` no build command

---

### Erro 2: `Cannot find module './modules/uploads/uploads.module'`

**Causa Raiz:**
- **Case Sensitivity**: Windows não diferencia `uploads` de `Uploads`, mas Linux diferencia
- Se em algum lugar há `../Uploads/uploads.module` (com U maiúsculo) o import falha em Linux
- CommonJS/TypeScript resolution no Linux é case-sensitive

**Por que acontece em Linux e não no Windows:**
```
Windows: ../uploads/uploads.module === ../Uploads/uploads.module ✅
Linux:   ../uploads/uploads.module !== ../Uploads/uploads.module ❌
```

**Solução:**
Encontrar todos os imports e garantir case-sensitive correto

---

## 2. CONFIGURAÇÃO DO PRISMA PARA RENDER

### Problema na Geração

O seu `prisma/schema.prisma` está correto:
```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../node_modules/.prisma/client"
  engineType = "library"
}

datasource db {
  provider = "postgresql"
}
```

Mas o `prisma.config.ts` **NÃO É NECESSÁRIO** e pode causar problemas:

```typescript
// ❌ REMOVER ESTE ARQUIVO
// prisma.config.ts não é suportado pelo Prisma
// Use apenas prisma/schema.prisma
```

---

## 3. SOLUÇÃO COMPLETA

### Passo 1: Remover arquivo desnecessário

```bash
# Deletar
rm backend/prisma.config.ts
```

### Passo 2: Atualizar BUILD COMMAND no Render

**Build Command CORRETO:**
```bash
npm install && npm run prisma:generate && npm run build
```

**OU com versão mais robusta:**
```bash
npm install && npx prisma generate && npm run build
```

### Passo 3: Adicionar script no package.json

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:db:push": "prisma db push --skip-generate",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

**Package.json completo (relevante):**
```json
{
  "name": "backend-app",
  "version": "0.0.1",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "seed": "node seed.js",
    "seed:categories": "node seed-categories.js",
    "prisma:generate": "prisma generate",
    "prisma:db:push": "prisma db push --skip-generate",
    "prisma:migrate": "prisma migrate deploy"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.12",
    "@nestjs/core": "^11.1.12",
    "@prisma/client": "^7.4.0",
    "pg": "^8.17.2"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@prisma/adapter-pg": "^7.3.0",
    "prisma": "^7.4.0",
    "typescript": "^5.9.3"
  }
}
```

---

## 4. CORRIGIR CASE SENSITIVITY EM IMPORTS

### Verificação de imports com Uploads

Verificar se há algum import com case incorreto:

```bash
# Procurar por imports incorretos
grep -r "Uploads/uploads.module" src/
grep -r "../Uploads/" src/
grep -r "from.*[A-Z].*uploads" src/
```

**Padrão correto (tudo minúsculo):**
```typescript
import { UploadsModule } from '../uploads/uploads.module';
```

### Lista de Verificação de Case Sensitivity

Verificar todos esses padrões:

```typescript
// ✅ CORRETO
import { UploadsModule } from '../uploads/uploads.module';
import { AdsModule } from '../ads/ads.module';
import { DatabaseService } from '../../config/database.config';

// ❌ INCORRETO
import { UploadsModule } from '../Uploads/uploads.module';  // Uploads com U maiúsculo
import { AdsModule } from '../ADS/ads.module';             // ADS maiúsculo
```

---

## 5. CONFIGURAÇÃO DO TYPESCRIPT

Seu `tsconfig.json` está bem, mas adicione esta opção para ser mais rigoroso:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

## 6. CONFIGURAÇÃO DO ENVIRONMENT NO RENDER

### Variables de Ambiente Necessárias

No Dashboard do Render.com, em **Secrets/Environment**:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_SECRET=seu_secret_aqui
JWT_EXPIRATION=7d
```

### Exemplo DATABASE_URL para PostgreSQL no Render:

```
postgresql://username:password@dpg-xxxxxxxx-xxxx.render.com:5432/bandeonline_db
```

---

## 7. CONFIGURAÇÃO FINAL NO RENDER

### Settings > Build & Deploy

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Node Version:** 22 (já que você usa Node 22)

---

## 8. CHECKLIST FINAL

### Antes de fazer Deploy:

- [ ] Arquivo `prisma.config.ts` foi deletado
- [ ] Arrays de imports verificados para case sensitivity
- [ ] `package.json` tem os scripts `prisma:generate`, `prisma:db:push`, `prisma:migrate`
- [ ] Build command atualizado para: `npm install && npx prisma generate && npm run build`
- [ ] Start command é: `npm run start:prod`
- [ ] `DATABASE_URL` está nos Secrets do Render
- [ ] `NODE_ENV=production` está nos Secrets
- [ ] `tsconfig.json` tem `"forceConsistentCasingInFileNames": true`

### Processo de Deploy no Render:

1. **Fazer commit das mudanças:**
   ```bash
   git add -A
   git commit -m "chore: fix prisma generation for Render deployment"
   git push
   ```

2. **No Render.com:**
   - Atualizar Build Command
   - Verificar Secrets/Environment variables
   - Clicar em "Manual Deploy"

3. **Monitorar logs:**
   - Render mostra logs em tempo real
   - Se falhar, os logs indicarão exatamente onde

---

## 9. DEBUGGING ADICIONAL

### Se ainda não funcionar:

**Verificar se Prisma foi gerado:**
```bash
# No Render, isso pode aparecer nos logs
ls -la node_modules/.prisma/client/

# Deve conter:
# index.d.ts
# index.js
# schema.prisma
```

**Validar imports TypeScript:**
```bash
# Localmente, testar o build
npm run build

# Se passar localmente no Windows, mas falhar no Render (Linux):
# É definitivamente case sensitivity
```

**Forçar regeneração do Prisma antes do build:**
```bash
# Adicionar ao build script
npm install && npx prisma generate --skip-engine-check && npm run build
```

---

## 10. MELHORIAS RECOMENDADAS

### 1. Adicionar Dockerfile para teste local com Linux

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 2. Script para validar build em ambiente Linux:

```bash
# docker-build.sh
#!/bin/bash
docker build -t bandeonline-test .
docker run --rm bandeonline-test npm run build
```

### 3. CI/CD Pipeline (GitHub Actions):

```yaml
name: Build and Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Generate Prisma
        run: cd backend && npx prisma generate
      
      - name: Build
        run: cd backend && npm run build
      
      - name: Type check
        run: cd backend && npx tsc --noEmit
```

---

## Resumo Executivo

| Problema | Causa | Solução |
|----------|-------|---------|
| PrismaClient not exported | Prisma não gerado no build | Adicionar `npx prisma generate` no Build Command |
| Module uploads not found | Case sensitivity Linux vs Windows | Verificar imports (tudo minúsculo) e remover `prisma.config.ts` |
| Build falha em Linux | Configuração para Windows | Usar `forceConsistentCasingInFileNames: true` |

