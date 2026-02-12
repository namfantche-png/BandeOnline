# 🚀 Iniciar Projeto Localmente (Sem Docker)

## Pré-requisitos Verificados

- ✅ Node.js 18+
- ✅ npm/yarn
- Você precisa de:
  - PostgreSQL 15
  - Redis 7

---

## Opção 1: Rápida (PostgreSQL Online)

Se não tem PostgreSQL instalado localmente, use um banco online:

### Criar conta Railway.app (FREE)
1. Ir para https://railway.app/
2. Fazer login com GitHub
3. Criar novo projeto → Provisão PostgreSQL
4. Copiar `DATABASE_URL`

### Criar Redis Online
1. Ir para https://redis.com/try-free/
2. Criar banco Redis gratuito
3. Copiar URL de conexão

---

## Opção 2: Local (Recomendado)

### Passo 1: Verificar PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT version();"
```

Se não funcionar:
```bash
# No PowerShell como Admin:
Get-Service postgresql-x64-15 | Start-Service

# Ou abra Services (services.msc) e inicie manualmente
```

### Passo 2: Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco:
CREATE DATABASE bissaumarket;
\q
```

### Passo 3: Iniciar Redis

Abra **outro PowerShell**:
```bash
redis-server
```

Ou se estiver via WSL:
```bash
wsl redis-server
```

---

## Passo 4: Configurar Backend

```bash
# Navegar ao backend
cd backend

# Instalar dependências
npm install

# Criar .env a partir do exemplo
copy .env.example .env

# Editar .env (ajustar DATABASE_URL se necessário)
notepad .env
```

**Mínimo no .env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bissaumarket
JWT_SECRET=seu-super-secret-key-mudar-em-producao
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

### Passo 5: Preparar Banco de Dados

```bash
# No diretório backend:

# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Opcional: Popular com dados de teste
npx prisma db seed
```

### Passo 6: Iniciar Backend

```bash
# No diretório backend:
npm run start:dev
```

✅ **Backend rodando em:** `http://localhost:3000`
✅ **API Docs (Swagger):** `http://localhost:3000/api/docs`

---

## Passo 7: Configurar Frontend

Abra **novo terminal PowerShell**:

```bash
# Navegar ao frontend
cd frontend

# Instalar dependências
npm install

# Criar .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api > .env.local
echo NEXT_PUBLIC_SOCKET_URL=http://localhost:3000 >> .env.local
```

### Passo 8: Iniciar Frontend

```bash
# No diretório frontend:
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:3001`

---

## ✅ Testando

Abrir em navegador:

- **Home:** http://localhost:3001/
- **Login:** http://localhost:3001/login
- **Registrar:** http://localhost:3001/registrar
- **API Docs:** http://localhost:3000/api/docs

---

## 📋 Resumo dos Terminals Abertos

Você deve ter **3 terminals abertos**:

1. **Terminal 1 (Redis):**
   ```bash
   redis-server
   ```

2. **Terminal 2 (Backend):**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Terminal 3 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🐛 Troubleshooting

### ❌ "PostgreSQL connection refused"
```bash
# Iniciar serviço
Get-Service postgresql-x64-15 | Start-Service

# Verificar credenciais em .env
```

### ❌ "Redis connection refused"
```bash
# Você precisa manter o terminal do Redis aberto!
# Não feche a janela onde rode redis-server
```

### ❌ "PORT 3000 already in use"
```bash
# Encontrar processo na porta 3000
Get-NetTCPConnection -LocalPort 3000 | select ProcessName, OwningProcess

# Matar processo
taskkill /PID <PID> /F
```

### ❌ "Module not found: @prisma/client"
```bash
cd backend
npx prisma generate
npm install
```

### ❌ "CORS error"
Certifique-se que em `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3001
```

---

## 🎉 Pronto!

Você deve conseguir:
- ✅ Registrar novo usuário
- ✅ Fazer login
- ✅ Criar anúncios
- ✅ Ver anúncios
- ✅ Chat em tempo real
- ✅ Testar API pelo Swagger

---

**Próximo passo:** Siga [GUIA_EXECUCAO_TESTES.md](GUIA_EXECUCAO_TESTES.md) para testes completos
