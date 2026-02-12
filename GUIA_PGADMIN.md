# 🐘 PgAdmin - Guia Completo

## O que é pgAdmin?

**pgAdmin** é uma interface web gratuita para gerenciar PostgreSQL. É perfeito para:
- ✅ Ver e editar tabelas visualmente
- ✅ Executar queries SQL
- ✅ Criar backups
- ✅ Monitorar performance
- ✅ Gerenciar usuários e permissões

---

## 📥 Instalação

### Opção 1: PgAdmin 4 Standalone (Recomendado para Windows)

1. Baixar em: https://www.pgadmin.org/download/pgadmin-4-windows/
2. Executar instalador
3. Seguir wizard padrão (clique Next)
4. Ao final, vai pedir senha master (guarde bem!)
   ```
   Exemplo: pgadmin123
   ```
5. PgAdmin abre automaticamente em: `http://localhost:5050`

---

### Opção 2: PgAdmin via Docker (Mais fácil)

```bash
# Navegue ao diretório do projeto
cd c:\Users\24595\MyProject\BandeOnline

# Criar arquivo docker-compose-pgadmin.yml:
```

Crie arquivo `docker-compose-pgadmin.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bissaumarket-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bissaumarket
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - bissaumarket

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: bissaumarket-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@bissaumarket.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - bissaumarket

volumes:
  postgres_data:

networks:
  bissaumarket:
    driver: bridge
```

Executar:
```bash
docker-compose -f docker-compose-pgadmin.yml up -d
```

PgAdmin estará em: `http://localhost:5050`

---

## 🔐 Primeiro Login

**Email:** `admin@bissaumarket.com` (ou o que você configurar)
**Senha:** `admin123` (ou a que você configurar)

---

## 🔌 Conectar ao PostgreSQL

### Dentro do PgAdmin:

1. **Menu lateral esquerdo → Servers**
2. Clique direito em **Servers** → Create → Server
3. **Guia General:**
   - Name: `BissauMarket DB`
   - Comment: `PostgreSQL local`

4. **Guia Connection:**
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: `postgres`
   - ☑️ Save password? (marque)

5. Clique **Save**

✅ Servidor conectado! Você verá na árvore:
```
Servers
└── BissauMarket DB
    └── Databases
        └── bissaumarket
            ├── Schemas
            │   └── public
            │       ├── Tables
            │       ├── Views
            │       └── Functions
```

---

## 📊 Explorar Banco de Dados

### Ver Tabelas

1. Expandir: **Databases → bissaumarket → Schemas → public → Tables**

Você verá:
- `User` - Usuários cadastrados
- `Profile` - Perfis dos usuários
- `Ad` - Anúncios
- `Category` - Categorias
- `Message` - Mensagens de chat
- `Review` - Avaliações
- `Payment` - Pagamentos
- `Subscription` - Planos contratados
- E mais...

### Ver Dados de uma Tabela

1. Clique direito em **User** → View/Edit Data → All Rows
2. Verá todos os usuários cadastrados
3. Pode editar direto clicando nas células

---

## 🗃️ Executar Queries SQL

### Abrir Query Tool

1. Selecione o banco **bissaumarket**
2. Menu superior → **Tools → Query Tool**
3. Editor SQL abre

### Exemplo: Listar Usuários

```sql
SELECT id, email, firstName, lastName, role, isActive, createdAt 
FROM "User" 
ORDER BY createdAt DESC;
```

### Exemplo: Contar Anúncios por Categoria

```sql
SELECT 
  c.name as categoria,
  COUNT(a.id) as total_anuncios,
  ROUND(AVG(a.price), 2) as preco_medio
FROM "Ad" a
JOIN "Category" c ON a.categoryId = c.id
WHERE a.status = 'active'
GROUP BY c.name
ORDER BY total_anuncios DESC;
```

### Exemplo: Inserir Categoria

```sql
INSERT INTO "Category" (id, name, slug, description, isActive)
VALUES (
  'cat-' || gen_random_uuid()::text,
  'Eletrônicos',
  'eletronicos',
  'Celulares, computadores e acessórios',
  true
);
```

---

## 🎯 Tarefas Úteis

### 1. Criar Categoria de Teste

```sql
INSERT INTO "Category" (id, name, slug, description, order, isActive)
VALUES (
  'cat-' || gen_random_uuid()::text,
  'Smartphones',
  'smartphones',
  'Telefones celulares',
  1,
  true
);
```

### 2. Criar Plano de Teste

```sql
INSERT INTO "Plan" (id, name, description, price, maxAds, maxHighlights, adDuration, isActive)
VALUES (
  'plan-' || gen_random_uuid()::text,
  'Pro',
  'Plano profissional',
  50000.00,
  50,
  10,
  90,
  true
);
```

### 3. Ver Todas as Migrações Executadas

```sql
SELECT 
  migration,
  finished_at,
  logs
FROM _prisma_migrations
ORDER BY finished_at DESC;
```

### 4. Exportar Dados (Backup)

1. Selecione **bissaumarket** (banco)
2. Menu → **Backup**
3. Configure:
   - Format: Custom
   - Filename: `backup_$(date).sql`
4. Clique **Backup**

### 5. Restaurar Dados (Restore)

1. Selecione **bissaumarket**
2. Menu → **Restore**
3. Selecione arquivo de backup
4. Clique **Restore**

---

## 📈 Monitorar Performance

### Ver Conexões Ativas

```sql
SELECT 
  datname as database,
  count(*) as conexoes_ativas,
  usename as usuario
FROM pg_stat_activity
GROUP BY datname, usename;
```

### Ver Tamanho de Tabelas

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as tamanho
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### Ver Índices

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🔧 Configurações Úteis

### Mudar Tema Escuro

1. Menu (engrenagem) → **Preferences**
2. **Display** → **Theme**
3. Escolha **Dark** ou **Light**

### Aumentar Linhas por Página

1. **Preferences → Display**
2. **Rows in Table View:** `100` (padrão)

### Auto-refresh de Dados

1. **Tools → Query Tool**
2. Menu → **Auto-Commit?** (ative)

---

## 🚀 Workflow Completo com PgAdmin

### Fluxo de Desenvolvimento

```
┌─────────────────────────────────────────────────┐
│ 1. Abrir PgAdmin                                │
│    http://localhost:5050                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Executar Query para Preparar Dados            │
│    INSERT/UPDATE/DELETE conforme necessário     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Testar Frontend                              │
│    http://localhost:3001                        │
│    Verificar se dados aparecem corretamente     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Ver Logs no PgAdmin                          │
│    Tools → Query Tool → Ver queries executadas  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. Fazer Backup                                 │
│    Servers → bissaumarket → Backup              │
└─────────────────────────────────────────────────┘
```

---

## 📋 Checklist de Setup

- [ ] PgAdmin instalado ou rodando em Docker
- [ ] Conectado ao PostgreSQL local
- [ ] Consegue ver banco `bissaumarket`
- [ ] Consegue executar Query Tool
- [ ] Consegue ver dados em tabelas
- [ ] Consegue criar categorias/planos via SQL
- [ ] Consegue fazer backup
- [ ] Tema ajustado (dark/light)

---

## 🔗 Comparação com Outras Ferramentas

| Ferramenta | Custo | Facilidade | Funcionalidade |
|------------|-------|-----------|------------------|
| **PgAdmin** | Grátis | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **DBeaver** | Grátis (Community) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Adminer** | Grátis | ⭐⭐⭐ | ⭐⭐⭐ |
| **TablePlus** | Pago | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **CLI (psql)** | Grátis | ⭐ | ⭐⭐⭐⭐⭐ |

**Recomendação:** PgAdmin para iniciantes, DBeaver para avançados

---

## 🎓 Dicas Profissionais

### 1. Usar Variáveis em Queries
```sql
-- Define variável
\set user_id 'a123b456'

-- Usa em query
SELECT * FROM "Ad" WHERE userId = :'user_id';
```

### 2. Salvar Query Frequentes
1. Clique em **Save** (ao lado da query)
2. Nomeie (ex: "Listar Users Ativos")
3. Reutilize depois

### 3. Usar Transactions para Testes
```sql
BEGIN;
  -- Suas queries aqui
  INSERT INTO "Category" ...
  UPDATE "User" ...
ROLLBACK;  -- Desfaz se algo der errado
-- ou COMMIT para salvar
```

### 4. Monitorar Queries Lentas
```sql
-- Ativar logging de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000; -- queries > 1s
SELECT pg_reload_conf();
```

---

## 🐛 Troubleshooting

### ❌ "PgAdmin não conecta ao PostgreSQL"

```sql
-- Verificar conexão via terminal
psql -h localhost -U postgres -d bissaumarket

-- Se não funcionar, PostgreSQL não está rodando
Get-Service postgresql-x64-15 | Start-Service
```

### ❌ "Porta 5050 já em uso"

```bash
# Usar porta diferente no docker-compose
ports:
  - "5051:80"  # PgAdmin em localhost:5051
```

### ❌ "Esqueci senha do PgAdmin"

```bash
# Se via Docker:
docker-compose down

# Editar docker-compose-pgadmin.yml
# Alterar PGADMIN_DEFAULT_PASSWORD

docker-compose -f docker-compose-pgadmin.yml up -d
```

---

## 📚 Próximas Etapas

1. ✅ Instalar PgAdmin
2. ✅ Conectar ao banco local
3. ✅ Explorar tabelas e dados
4. ✅ Executar queries de teste
5. ✅ Criar dados para testar frontend
6. ✅ Fazer backup regularmente

---

**Links Úteis:**
- PgAdmin Official: https://www.pgadmin.org/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQL Tutorial: https://www.w3schools.com/sql/

