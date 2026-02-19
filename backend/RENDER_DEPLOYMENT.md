# Instruções de Deploy no Render.com

## 🚀 Pré-requisitos

- Conta ativa em [render.com](https://render.com)
- Repositório Git com o código (GitHub, GitLab, etc)
- Banco de dados PostgreSQL (Render fornece ou use Amazon RDS)

---

## 📋 Passo 1: Preparar o PostgreSQL

### Opção A: PostgreSQL no Render (Recomendado)

1. Na dashboard do Render, clique em "+ New"
2. Selecione "PostgreSQL"
3. Defina:
   - **Name**: `bandeonline-db`
   - **Database**: `bandeonline`
   - **User**: `postgres`
   - **Region**: Mesma da sua aplicação
   - **Plan**: Standard ($7-15/mês)

4. Anote a Connection String (DATABASE_URL). Formatos de exemplo:
   ```
   postgresql://user:password@dpg-xxxxx.render.com:5432/bandeonline
   ```

### Opção B: PostgreSQL Externo (AWS RDS, etc)

Se usar banco externo, a URL será parecida com:
```
postgresql://user:password@seu-host.rds.amazonaws.com:5432/bandeonline
```

---

## 🔧 Passo 2: Criar Serviço Web no Render

### 2.1 Conectar Repositório

1. Dashboard do Render → "+ New" → "Web Service"
2. Selecione "Connect a repository"
3. Autorize o GitHub/GitLab/Gitea
4. Selecione seu repositório `BandeOnline`

### 2.2 Configurar Serviço

**Configuração Básica:**

| Campo | Valor |
|-------|-------|
| **Name** | `bandeonline-api` |
| **Environment** | `Node` |
| **Region** | `Frankfurt (EU)` ou sua preferida |
| **Branch** | `main` ou `master` |
| **Root Directory** | `backend` |

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Plan:** Standard ($7/mês) ou superior

### 2.3 Variáveis de Ambiente

Clique em "Advanced" e adicione estas variáveis:

```
DATABASE_URL=postgresql://user:password@host:5432/bandeonline
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_minimo_32_caracteres
JWT_EXPIRATION=7d
PORT=3000
```

**Como gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔐 Passo 3: Gerar e Configurar Secrets

No seu terminal local:

```bash
# Gerar JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Copiar o output e adicionar em Render
```

**Variáveis Sensíveis (adicione no Render):**

```
DATABASE_URL=postgresql://...
JWT_SECRET=xxxx...
NODE_ENV=production
```

---

## 📝 Passo 4: Configurar Prisma para Render

Verificar que o arquivo **`prisma/schema.prisma`** está correto:

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../node_modules/.prisma/client"
  engineType = "library"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**❌ REMOVER o arquivo `backend/prisma.config.ts`** (se existir):
```bash
rm backend/prisma.config.ts
```

---

## 🗂️ Passo 5: Verificar Imports (Case Sensitivity)

Execute localmente para verificar problemas de case sensitivity:

```bash
cd backend
bash test-render-build.sh
```

Se houver erros, procure por imports como:
- `from '../Uploads/uploads.module'` ❌
- Use sempre `from '../uploads/uploads.module'` ✅

---

## 📤 Passo 6: Fazer Commit e Push

```bash
# Commitar mudanças
git add -A
git commit -m "chore: configure Render deployment with Prisma generation"

# Push para trigger o build
git push origin main
```

---

## ▶️ Passo 7: Acompanhar o Deploy

1. Na dashboard do Render, vai aparecer seu serviço `bandeonline-api`
2. Clique para ver os logs em tempo real
3. O build seguirá estes passos:
   ```
   npm install
   npx prisma generate
   npm run build
   ```

### Logs Esperados:

```
✅ Install Complete
✅ Prisma client generated successfully
✅ Build succeeded
```

### Se Falhar:

```
❌ error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'
❌ Cannot find module './modules/uploads/uploads.module'
```

Volte para verificar:
- Seu `package.json` tem os scripts?
- Seu `tsconfig.json` tem `forceConsistentCasingInFileNames: true`?
- Os imports estão com case correto?
- O `prisma.config.ts` foi deletado?

---

## 🗄️ Passo 8: Inicializar Banco de Dados

**Opção 1: Migrations Automáticas (Recomendado)**

Adicionar ao seu `start:prod`:
```bash
npm run prisma:migrate && node dist/main
```

Atualizar **Start Command** no Render para:
```bash
npm run prisma:migrate && npm run start:prod
```

**Opção 2: Push do Schema (Desenvolvimento)**

Se usar `prisma db push`:
```bash
npm run prisma:db:push && npm run start:prod
```

**Opção 3: Seed (Criar dados iniciais)**

Adicionar ao package.json:
```json
"scripts": {
  "onrender": "npx prisma db push --skip-generate && npm run seed && npm run start:prod"
}
```

Colocar como Start Command no Render:
```bash
npm run onrender
```

---

## ✅ Passo 9: Testar a Aplicação

Após deploy bem-sucedido:

```bash
# Obter URL da aplicação no Render dashboard
# Será algo como: https://bandeonline-api.onrender.com

# Testar saúde da API
curl https://bandeonline-api.onrender.com/api/health

# Testar Swagger
https://bandeonline-api.onrender.com/api/docs
```

---

## 🔄 Passo 10: Configurar Auto-Deploy

O Render automaticamente faz deploy a cada:
- ✅ Push para a branch configurada
- ✅ Nova tag criada
- ✅ Webhook disparado

Para desabilitar auto-deploy:
1. Settings → Build & Deploy
2. Desabilitar "Auto-Deploy"

---

## 🚨 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
# Garantir que gera no build
npm install && npx prisma generate --skip-engine-check && npm run build
```

### Erro: "Module not found: uploads"

Verificar no seu código:
- Todos os imports em minúscula: `../uploads/`
- Arquivo existe: `src/modules/uploads/uploads.module.ts`
- Run: `bash test-render-build.sh` localmente

### Erro: "DATABASE_URL not configured"

1. Render → Settings → Environment
2. Adicionar `DATABASE_URL`
3. Redeploy manualmente ou push novo código

### Build lento (>5 minutos)

Normal para primeira vez. Subsequent builds são mais rápidos.
Se ficar travado:
1. Cancel no Render
2. Fazer Push novamente para retry

---

## 📊 Monitoramento

Render fornece:
- ✅ Logs em tempo real
- ✅ CPU/Memória
- ✅ Requests/segundo
- ✅ Erros HTTP

Acessar em: "Metrics" no painel do serviço

---

## 🔒 Backup e Recuperação

### Backup do PostgreSQL no Render

Render faz backup automático diário. Para restaurar:

```bash
# Conectar ao banco
psql postgresql://user:password@host:5432/database

# Fazer dump manual
pg_dump postgresql://user:password@host:5432/database > backup.sql
```

---

## 🎯 Checklist Final

- [ ] PostgreSQL criado no Render ou conexão string pronta
- [ ] Serviço Web criado com nome `bandeonline-api`
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] `DATABASE_URL` adicionado em Secrets
- [ ] `JWT_SECRET` adicionado em Secrets
- [ ] `NODE_ENV=production` adicionado
- [ ] Arquivo `prisma.config.ts` deletado ou vazio
- [ ] Build Command testado localmente com `bash test-render-build.sh`
- [ ] Imports com case-sensitivity verificados
- [ ] Código feito commit e push
- [ ] Deploy completado sem erros
- [ ] API respondendo em `/api/health`
- [ ] Swagger acessível em `/api/docs`

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verificar Logs do Render:**
   - Dashboard → Seu serviço → Logs
   
2. **Testar Build Localmente:**
   ```bash
   bash backend/test-render-build.sh
   ```

3. **Validar TypeScript:**
   ```bash
   cd backend
   npx tsc --noEmit
   ```

4. **Checar Prisma:**
   ```bash
   npx prisma validate
   ```

---

**Criado em:** 2026-02-19  
**Última atualização:** 2026-02-19  
**Versão:** NestJS 11, Node 22, Prisma 7.4
