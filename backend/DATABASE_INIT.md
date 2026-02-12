# 🗄️ Inicialização Automática do Banco de Dados

Este documento descreve como o sistema inicializa e valida automaticamente o banco de dados ao iniciar o backend.

## ✨ Funcionalidades Automáticas

Quando o backend é iniciado, o sistema executa automaticamente:

1. **✅ Teste de Conexão** - Verifica se consegue conectar ao PostgreSQL
2. **✅ Verificação do Banco** - Confirma que o banco de dados existe e está acessível
3. **✅ Aplicação de Migrações** - Executa migrações pendentes automaticamente
4. **✅ Validação do Schema** - Verifica se todas as tabelas necessárias existem
5. **✅ Seed Opcional** - Popula dados iniciais se `AUTO_SEED=true` estiver configurado

## 🚀 Como Funciona

### Inicialização Automática

Ao iniciar o backend (`npm run start:dev` ou `npm run start:prod`), o `DatabaseService` automaticamente:

1. Conecta ao banco de dados PostgreSQL
2. Executa o `DatabaseInitService` que:
   - Testa a conexão
   - Verifica o banco de dados
   - Aplica migrações pendentes
   - Valida o schema
   - Opcionalmente executa seed

### Logs de Inicialização

Você verá logs como:

```
🔌 Conectando ao banco de dados PostgreSQL...
✅ Prisma conectado ao PostgreSQL com sucesso
🔧 Iniciando verificação e inicialização do banco de dados...
🔌 Testando conexão com banco de dados...
✅ Conexão estabelecida com sucesso
🔍 Verificando banco de dados...
✅ PostgreSQL versão: PostgreSQL
✅ Banco de dados: bissaumarket
📦 Verificando migrações pendentes...
✅ Nenhuma migração pendente
🔍 Validando schema do banco de dados...
✅ Schema validado: 12 tabelas encontradas
✅ Tabela User acessível (0 registros)
✅ 3 plano(s) encontrado(s)
✅ Banco de dados inicializado e validado com sucesso!
```

## ⚙️ Configuração

### Variáveis de Ambiente

No arquivo `.env`, configure:

```env
# URL de conexão do banco de dados (obrigatório)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/bissaumarket

# Ambiente (development, production)
NODE_ENV=development

# Seed automático (opcional - true/false)
AUTO_SEED=false
```

### Seed Automático

Para habilitar seed automático ao iniciar:

```env
AUTO_SEED=true
```

**⚠️ Atenção:** O seed automático só executa se:
- `AUTO_SEED=true` estiver configurado
- O arquivo `seed.js` existir na raiz do diretório `backend`

## 📋 Requisitos do Banco de Dados

O sistema valida automaticamente se as seguintes tabelas existem:

- ✅ User
- ✅ Profile
- ✅ Plan
- ✅ Subscription
- ✅ Category
- ✅ Ad
- ✅ Message
- ✅ Review
- ✅ Payment
- ✅ Report
- ✅ AdminLog
- ✅ Invoice

Se alguma tabela estiver faltando, você verá um aviso e será instruído a executar migrações.

## 🔧 Comandos Manuais

Se precisar executar manualmente:

### Migrações

```bash
# Aplicar migrações pendentes
npx prisma migrate deploy

# Criar nova migração (desenvolvimento)
npx prisma migrate dev --name nome_da_migracao
```

### Seed

```bash
# Executar seed manualmente
npm run seed

# Executar seed de categorias
npm run seed:categories
```

### Gerar Prisma Client

```bash
# Regenerar Prisma Client após mudanças no schema
npx prisma generate
```

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não está configurado"

**Solução:** Configure `DATABASE_URL` no arquivo `.env`

### Erro: "Não foi possível conectar ao banco de dados"

**Soluções:**
1. Verifique se o PostgreSQL está rodando
2. Verifique se o banco de dados existe
3. Verifique se as credenciais estão corretas
4. Verifique se a porta está correta (padrão: 5432)

### Aviso: "Tabelas faltando"

**Solução:** Execute migrações:
```bash
npx prisma migrate deploy
```

### Aviso: "Nenhum plano encontrado"

**Solução:** Execute seed:
```bash
npm run seed
```

Ou configure `AUTO_SEED=true` no `.env`

## 📝 Notas Importantes

1. **Migrações em Produção**: Em produção, use `prisma migrate deploy` (não `migrate dev`)
2. **Seed Automático**: Desabilite `AUTO_SEED` em produção para evitar sobrescrever dados
3. **Primeira Execução**: Na primeira vez, você precisa criar o banco de dados manualmente:
   ```sql
   CREATE DATABASE bissaumarket;
   ```
4. **Performance**: A inicialização adiciona alguns segundos ao tempo de startup, mas garante que o banco está pronto

## 🔒 Segurança

- As migrações são aplicadas automaticamente apenas se o banco estiver acessível
- O seed automático só executa se explicitamente habilitado
- Erros de migração não bloqueiam a inicialização (apenas avisam)
- Em produção, considere desabilitar seed automático
