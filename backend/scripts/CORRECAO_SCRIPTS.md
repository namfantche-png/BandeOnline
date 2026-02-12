# Correção dos Scripts de Ativação de Anúncios

## Problema Identificado

O erro ocorria porque o Prisma está configurado para usar um **adapter** (PrismaPg) em vez do driver padrão. O script estava tentando criar um `PrismaClient` sem o adapter necessário.

## Erro Original

```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

## Solução

Atualizei ambos os scripts para usar o mesmo padrão do `DatabaseService`:

1. **Criar Pool do PostgreSQL**
2. **Criar Adapter PrismaPg**
3. **Inicializar PrismaClient com adapter**

## Scripts Corrigidos

### ✅ activate-pending-ads-simple.ts
- Versão simplificada e mais direta
- Usa adapter corretamente
- Melhor tratamento de erros

### ✅ activate-pending-ads.ts
- Versão com suporte a dotenv
- Usa adapter corretamente
- Logs mais detalhados

## Como Executar

```bash
cd backend
npx ts-node scripts/activate-pending-ads-simple.ts
```

## Estrutura Corrigida

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Carrega DATABASE_URL
const connectionString = process.env.DATABASE_URL;

// 2. Cria Pool PostgreSQL
const pool = new Pool({ connectionString });

// 3. Cria Adapter Prisma
const adapter = new PrismaPg(pool);

// 4. Inicializa PrismaClient com adapter
const prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });
```

## Verificação

Execute o script e verifique:
- ✅ Conecta ao banco
- ✅ Busca anúncios pendentes
- ✅ Ativa anúncios
- ✅ Desconecta corretamente

---

**Status:** ✅ Corrigido e pronto para uso
