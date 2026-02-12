# Guia Completo: Executar e Testar as Interfaces

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Executar Backend](#executar-backend)
4. [Executar Frontend](#executar-frontend)
5. [Testar as Interfaces](#testar-as-interfaces)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Windows
Certifique-se que tem instalado:
- ✅ Node.js 18+ (https://nodejs.org/)
- ✅ PostgreSQL 15 (https://www.postgresql.org/download/windows/)
- ✅ Redis 7 (https://github.com/microsoftarchive/redis/releases)
- ✅ Docker Desktop (opcional, para containers)
- ✅ Git (https://git-scm.com/)

### Verificar Instalações
```bash
node --version          # v18+
npm --version          # 9+
psql --version         # PostgreSQL 15
redis-cli --version    # 7+
```

---

## ⚙️ Configuração Inicial

### 1. Clonar/Preparar Repositório
```bash
cd c:\Users\24595\MyProject\BandeOnline
```

### 2. Criar Arquivo .env (Backend)
```bash
# Criar arquivo
echo. > backend/.env
```

Copiar conteúdo do `backend/.env.example`:
```env
# BANCO DE DADOS
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bissaumarket

# JWT
JWT_SECRET=seu-super-secret-jwt-key-muito-seguro-mudar-em-producao
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=seu-refresh-token-secret
JWT_REFRESH_EXPIRATION=30d

# APLICAÇÃO
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# FIREBASE (opcional)
FIREBASE_API_KEY=sua_chave_firebase
FIREBASE_AUTH_DOMAIN=seu_dominio

# ADMIN
ADMIN_EMAIL=admin@bissaumarket.com
ADMIN_PASSWORD=senha_super_segura

# EMAIL (opcional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha

# FRONTEND
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

---

## 🚀 Executar Backend

### Opção 1: Com Docker Compose (Recomendado)
```bash
# Navegar à raiz do projeto
cd c:\Users\24595\MyProject\BandeOnline

# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down
```

### Opção 2: Manualmente (PostgreSQL + Redis + Node)

#### Passo 1: Iniciar PostgreSQL
**Windows:**
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT version();"

# Se não estiver rodando:
# Abrir Services (services.msc) e iniciar "postgresql-x64-15"
```

#### Passo 2: Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE bissaumarket;
CREATE USER bissaumarket_user WITH PASSWORD 'secure_password';
ALTER ROLE bissaumarket_user SET client_encoding TO 'utf8';
ALTER ROLE bissaumarket_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bissaumarket_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE bissaumarket TO bissaumarket_user;
\q
```

#### Passo 3: Iniciar Redis
```bash
# Windows - Abrir PowerShell como Admin
redis-server
```

#### Passo 4: Executar Migrações Prisma
```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Opcional: Seed do banco (dados de teste)
npx prisma db seed
```

#### Passo 5: Iniciar Backend
```bash
cd backend

# Desenvolvimento com watch
npm run start:dev

# Ou produção
npm run build
npm run start:prod
```

**Backend rodando em:** `http://localhost:3000`
**Swagger API docs:** `http://localhost:3000/api/docs`

---

## 🎨 Executar Frontend

### Desenvolvimento
```bash
cd frontend

# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Produção
npm start
```

**Frontend rodando em:** `http://localhost:3001`

---

## ✅ Testar as Interfaces

### 1. Teste Manual via Navegador

#### Home Page
```
http://localhost:3001/
```
**Esperado:** 
- ✅ Logo BandeOnline
- ✅ Hero section com "Compre e Venda Online"
- ✅ Search bar funcional
- ✅ Botões Login/Registrar

#### Registro
```
http://localhost:3001/registrar
```
**Preencher formulário:**
```
Email: teste@exemplo.com
Senha: Senha123!
Nome: João
Sobrenome: Silva
Telefone: +245 952000000
```
**Esperado:** 
- ✅ Validação de email
- ✅ Validação de força de senha
- ✅ Redirecionamento para login após sucesso
- ✅ Toast com mensagem de sucesso

#### Login
```
http://localhost:3001/login
```
**Preencher com dados cadastrados:**
```
Email: teste@exemplo.com
Senha: Senha123!
```
**Esperado:**
- ✅ Token JWT armazenado em localStorage
- ✅ Redirecionamento para home
- ✅ Header mostra nome do usuário

#### Anúncios
```
http://localhost:3001/anuncios
```
**Esperado:**
- ✅ Lista de anúncios carregada
- ✅ Filtros funcionais (cidade, preço)
- ✅ Search bar filtra por título
- ✅ Paginação funciona
- ✅ Clique no anúncio abre detalhes

#### Criar Anúncio
```
http://localhost:3001/anuncios/criar
```
**Preencher formulário:**
```
Categoria: Eletrônicos
Título: iPhone 12 - Excelente Estado
Descrição: Celular em perfeito funcionamento
Preço: 50000 XOF
Cidade: Bissau
Condição: Usado
Imagens: Selecionar arquivo
```
**Esperado:**
- ✅ Upload de imagens com preview
- ✅ Validações de campos
- ✅ Anúncio aparece na lista
- ✅ Toast com sucesso

#### Chat
```
http://localhost:3001/mensagens
```
**Esperado:**
- ✅ Lista de conversas carregada
- ✅ Clique em conversa abre chat
- ✅ Mensagens carregam em tempo real
- ✅ Typing indicator funciona
- ✅ Mensagens são persistidas

#### Perfil
```
http://localhost:3001/perfil
```
**Esperado:**
- ✅ Dados do usuário carregados
- ✅ Avatar exibido
- ✅ Lista de anúncios criados
- ✅ Histórico de reviews
- ✅ Rating do vendedor visível

### 2. Teste via API (Swagger)

Abrir em navegador:
```
http://localhost:3000/api/docs
```

#### Teste: Registrar Usuário
1. Expandir `/auth/register`
2. Click "Try it out"
3. Preencher JSON:
```json
{
  "email": "novo@teste.com",
  "password": "Senha123!",
  "firstName": "Maria",
  "lastName": "Santos",
  "phone": "+245 952111111"
}
```
4. Click "Execute"
5. **Esperado:** Status 201, response com userId e tokens

#### Teste: Login
1. Expandir `/auth/login`
2. Click "Try it out"
3. Preencher JSON:
```json
{
  "email": "novo@teste.com",
  "password": "Senha123!"
}
```
4. Click "Execute"
5. **Esperado:** Status 200, response com access_token e refresh_token
6. Copiar o `access_token`

#### Teste: Criar Anúncio
1. Autorizar no Swagger:
   - Click ícone 🔒 no topo
   - Colar token Bearer: `Bearer {seu_token}`
   - Click "Authorize"

2. Expandir `/ads` > POST
3. Click "Try it out"
4. Preencher JSON:
```json
{
  "title": "Laptop Dell XPS 13",
  "description": "Laptop em bom estado, com SSD de 512GB",
  "price": 75000,
  "categoryId": "categoria-id-aqui",
  "city": "Bissau",
  "country": "Guinea-Bissau",
  "location": "Av. Amílcar Cabral",
  "condition": "LIKE_NEW",
  "maxImages": 5
}
```
5. Click "Execute"
6. **Esperado:** Status 201, anúncio criado

#### Teste: Listar Anúncios
1. Expandir `/ads` > GET
2. Click "Execute"
3. **Esperado:** Status 200, array de anúncios

### 3. Teste de Integração Backend

```bash
cd backend

# Executar testes unitários
npm run test

# Executar testes E2E
npm run test:e2e

# Coverage de testes
npm run test:cov
```

### 4. Teste de Performance

#### Com Artillery (carga)
```bash
# Instalar
npm install -g artillery

# Teste de carga simples
artillery quick --count 10 --num 100 http://localhost:3000/api/ads
```

#### Com Postman (recomendado)
1. Instalar Postman (https://www.postman.com/downloads/)
2. Importar coleção:
   - File → Import
   - Selecionar arquivo ou colar JSON
3. Executar requests da coleção

---

## 🔍 Troubleshooting

### Erro: "Cannot find module 'prisma'"
```bash
cd backend
npm install
npx prisma generate
```

### Erro: "Connection refused localhost:5432"
```bash
# Verificar se PostgreSQL está rodando
# Windows:
Get-Service | grep postgres

# Iniciar serviço
Start-Service -Name "postgresql-x64-15"

# Ou verificar credenciais em .env DATABASE_URL
```

### Erro: "EADDRINUSE: address already in use :::3000"
```bash
# Encontrar e matar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID)
taskkill /PID 1234 /F
```

### Erro: "Redis connection refused"
```bash
# Iniciar Redis
redis-server

# Ou verificar se está rodando
redis-cli ping
# Esperado: PONG
```

### Frontend não conecta ao Backend
```bash
# Verificar .env.local do frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Verificar se backend está rodando
curl http://localhost:3000/api/health
```

### Erro de CORS
```bash
# No backend, verificar .env
CORS_ORIGIN=http://localhost:3001

# Ou adicionar múltiplas origins:
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

### Migrações falharam
```bash
cd backend

# Ver status das migrações
npx prisma migrate status

# Resetar banco (⚠️ DELETE DATA!)
npx prisma migrate reset

# Ou criar nova migração
npx prisma migrate dev --name init
```

---

## 📊 Checklist de Testes Completos

- [ ] Backend inicia sem erros
- [ ] Frontend inicia sem erros
- [ ] PostgreSQL conectado (Swagger health)
- [ ] Redis conectado
- [ ] Registrar novo usuário funciona
- [ ] Login retorna tokens válidos
- [ ] Criar anúncio funciona
- [ ] Upload de imagens funciona
- [ ] Chat envia mensagens em tempo real
- [ ] Filtros funcionam
- [ ] Paginação funciona
- [ ] Admin dashboard carrega
- [ ] Payments iniciam corretamente
- [ ] Testes unitários passam
- [ ] Testes E2E passam

---

## 🎯 Próximas Etapas

Após testar tudo:

1. **Deploy em Staging:**
   ```bash
   # Ver GUIA_DEPLOY_PRODUCAO.md
   ```

2. **Executar CHECKLIST_DEPLOY.md:**
   - Verificações pré-deploy
   - Smoke tests
   - Monitoramento

3. **Implementar testes faltantes:**
   - Tests para WebSocket
   - Tests para Cloudinary
   - Tests E2E completos

---

**Dúvidas?** Verifique os arquivos:
- `README_BACKEND.md`
- `README.md` (frontend)
- `GUIA_DESENVOLVIMENTO.md`
