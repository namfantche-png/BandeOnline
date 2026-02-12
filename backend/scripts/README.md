# Scripts Úteis

## Scripts Disponíveis

### activate-pending-ads.ts

Ativa todos os anúncios com status "pending" para "active".

**Como executar:**

```bash
cd backend
npx ts-node scripts/activate-pending-ads.ts
```

**Alternativa (versão simplificada):**

```bash
cd backend
npx ts-node scripts/activate-pending-ads-simple.ts
```

**Ou usando ts-node com configuração:**

```bash
cd backend
npx ts-node --project tsconfig.json scripts/activate-pending-ads.ts
```

**Requisitos:**
- Arquivo `.env` no diretório `backend/` com `DATABASE_URL` configurado
- Banco de dados acessível

**O que faz:**
1. Busca todos os anúncios com status "pending"
2. Lista os anúncios encontrados
3. Atualiza o status para "active"
4. Exibe quantos anúncios foram ativados

**Exemplo de saída:**
```
Buscando anúncios com status "pending"...
📋 Encontrados 5 anúncios pendentes:
  - iPhone 12 Pro Max (ID: clx123...)
  - Notebook Dell (ID: clx456...)
  ...

✅ 5 anúncios ativados com sucesso!
Os anúncios agora aparecerão na plataforma.
```

---

## Troubleshooting

### Erro: "PrismaClient needs to be constructed with valid options"

**Solução:**
1. Certifique-se de estar no diretório `backend/` ao executar
2. Verifique se o arquivo `.env` existe e tem `DATABASE_URL`
3. Execute: `npx prisma generate` antes de executar o script

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
cd backend
npm install
npx prisma generate
```

### Erro de conexão com banco

**Solução:**
1. Verifique se o banco está rodando
2. Verifique se `DATABASE_URL` está correto no `.env`
3. Teste a conexão: `npx prisma db pull`
