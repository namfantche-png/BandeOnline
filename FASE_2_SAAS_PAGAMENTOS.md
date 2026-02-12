# FASE 2 – SaaS E PAGAMENTOS

## 📋 Resumo

Implementação completa do sistema de subscrições SaaS com 3 planos (FREE, PRO, PREMIUM) e sistema de pagamentos com mock para Mobile Money.

---

## 1. SISTEMA DE PLANOS

### Planos Implementados

| Plano | Preço | Anúncios | Destaques | Loja | Recursos |
|-------|-------|----------|-----------|------|----------|
| **FREE** | 0 XOF | 3 | 0 | Não | Criar até 3 anúncios, Chat, Perfil básico |
| **PRO** | 5.000 XOF | 20 | 1 | Não | 20 anúncios, 1 destaque, Chat prioritário, Estatísticas |
| **PREMIUM** | 15.000 XOF | Ilimitado | Ilimitado | Sim | Tudo ilimitado, Loja virtual, Suporte dedicado |

### Fluxo de Planos

```
Novo Usuário
    ↓
Registro automático no plano FREE
    ↓
Pode criar até 3 anúncios
    ↓
Deseja mais? → Upgrade para PRO/PREMIUM
    ↓
Pagamento processado
    ↓
Subscrição ativa no novo plano
```

---

## 2. MÓDULO DE SUBSCRIÇÕES

### Endpoints Implementados

#### GET /subscriptions/active
Obtém subscrição ativa do usuário autenticado.

**Resposta:**
```json
{
  "id": "sub_123",
  "userId": "user_456",
  "planId": "plan_789",
  "status": "active",
  "startDate": "2024-01-22T10:00:00Z",
  "endDate": null,
  "renewalDate": "2024-02-22T10:00:00Z",
  "autoRenew": true,
  "plan": {
    "id": "plan_789",
    "name": "PRO",
    "price": 5000,
    "maxAds": 20,
    "maxHighlights": 1
  }
}
```

#### POST /subscriptions/upgrade
Faz upgrade para um plano superior.

**Request:**
```json
{
  "planId": "plan_premium_id"
}
```

**Regras:**
- Novo plano deve ter preço maior que o atual
- Subscrição anterior é cancelada
- Nova subscrição começa imediatamente

#### GET /subscriptions/history
Obtém histórico completo de subscrições.

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 10)

#### POST /subscriptions/cancel
Cancela subscrição ativa.

#### POST /subscriptions/renew
Renova subscrição (automático ou manual).

#### GET /subscriptions/limits/ads
Obtém limite de anúncios do usuário.

**Resposta:**
```json
{
  "current": 5,
  "max": 20
}
```

#### GET /subscriptions/limits/highlights
Obtém limite de destaques do usuário.

---

## 3. MÓDULO DE PAGAMENTOS

### Sistema de Pagamento (Mock)

O sistema de pagamentos foi implementado com mock para MVP. Em produção, será integrado com:
- **Orange Money** (Senegal, Mali, etc.)
- **MTN Mobile Money** (Múltiplos países africanos)

### Endpoints Implementados

#### POST /payments/initiate
Inicia processo de pagamento.

**Request:**
```json
{
  "amount": 5000,
  "currency": "XOF",
  "method": "mobile_money",
  "provider": "orange_money",
  "planId": "plan_pro_id",
  "description": "Upgrade para plano PRO"
}
```

**Resposta:**
```json
{
  "paymentId": "pay_123",
  "transactionId": "TXN_1705918800000_abc123def",
  "amount": 5000,
  "currency": "XOF",
  "method": "mobile_money",
  "provider": "orange_money",
  "status": "pending",
  "message": "Pagamento iniciado. Confirme a transação no seu dispositivo móvel.",
  "redirectUrl": null
}
```

#### POST /payments/confirm
Confirma pagamento após transação.

**Request:**
```json
{
  "transactionId": "TXN_1705918800000_abc123def",
  "paymentId": "pay_123"
}
```

**Resposta (Sucesso):**
```json
{
  "id": "pay_123",
  "status": "completed",
  "transactionId": "TXN_1705918800000_abc123def",
  "message": "Pagamento processado com sucesso!"
}
```

#### GET /payments/history
Obtém histórico de pagamentos do usuário.

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 10)

#### GET /payments/:id
Obtém detalhes de um pagamento específico.

#### GET /payments/stats
Estatísticas de pagamento (admin).

**Resposta:**
```json
{
  "totalPayments": 150,
  "completedPayments": 135,
  "failedPayments": 15,
  "successRate": 90,
  "totalRevenue": 500000
}
```

#### POST /payments/webhook/confirm
Webhook para confirmação automática de pagamento (simulado).

---

## 4. FLUXO DE UPGRADE

### Passo a Passo

```
1. Usuário clica em "Upgrade"
   ↓
2. Seleciona novo plano
   ↓
3. POST /payments/initiate
   ↓
4. Sistema retorna transactionId e paymentId
   ↓
5. Usuário confirma no seu celular (Orange Money / MTN)
   ↓
6. POST /payments/confirm com transactionId
   ↓
7. Sistema valida pagamento (90% sucesso em mock)
   ↓
8. Se sucesso:
   - Subscrição anterior cancelada
   - Nova subscrição criada
   - Usuário recebe confirmação
   ↓
9. Se falha:
   - Pagamento marcado como failed
   - Usuário pode tentar novamente
```

---

## 5. MIDDLEWARE DE VERIFICAÇÃO DE PLANO

### Validação Automática

Implementada no `AdsService`:

```typescript
// Antes de criar anúncio
const subscription = await db.subscription.findFirst({
  where: { userId, status: 'active' },
  include: { plan: true }
});

const activeAdsCount = await db.ad.count({
  where: { userId, status: 'active' }
});

if (activeAdsCount >= subscription.plan.maxAds) {
  throw new BadRequestException(
    `Limite de ${subscription.plan.maxAds} anúncios atingido. Faça upgrade.`
  );
}
```

---

## 6. RENOVAÇÃO AUTOMÁTICA

### Lógica de Renovação

```typescript
// Renovação automática (a cada 30 dias)
async renewSubscription(userId: string) {
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);
  
  return db.subscription.update({
    where: { id: subscription.id },
    data: {
      renewalDate,
      autoRenew: true
    }
  });
}
```

### Cron Job (Implementar em Produção)

```typescript
// Executar diariamente às 00:00
@Cron('0 0 * * *')
async handleSubscriptionRenewal() {
  const expiringSubscriptions = await db.subscription.findMany({
    where: {
      renewalDate: { lte: new Date() },
      autoRenew: true
    }
  });

  for (const sub of expiringSubscriptions) {
    await this.renewSubscription(sub.userId);
  }
}
```

---

## 7. INTEGRAÇÃO MOBILE MONEY (Preparado)

### Estrutura para Orange Money

```typescript
// Será implementado em produção
async initiateOrangeMoneyPayment(amount: number, phoneNumber: string) {
  const response = await axios.post(
    'https://api.orange.com/payment/v1/initiate',
    {
      amount,
      phoneNumber,
      currency: 'XOF',
      description: 'BissauMarket Subscription'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ORANGE_MONEY_API_KEY}`
      }
    }
  );

  return response.data;
}
```

### Estrutura para MTN Mobile Money

```typescript
// Será implementado em produção
async initiateMTNMoneyPayment(amount: number, phoneNumber: string) {
  const response = await axios.post(
    'https://api.mtn.com/payment/v1/request',
    {
      amount,
      msisdn: phoneNumber,
      currency: 'XOF'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MTN_MONEY_API_KEY}`
      }
    }
  );

  return response.data;
}
```

---

## 8. TESTES

### Teste de Upgrade

```bash
# 1. Registrar usuário
POST /auth/register
{
  "email": "vendedor@test.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva"
}

# 2. Fazer login
POST /auth/login
{
  "email": "vendedor@test.com",
  "password": "senha123"
}

# 3. Verificar subscrição FREE
GET /subscriptions/active
Authorization: Bearer <token>

# 4. Iniciar pagamento para PRO
POST /payments/initiate
Authorization: Bearer <token>
{
  "amount": 5000,
  "currency": "XOF",
  "method": "mobile_money",
  "provider": "orange_money",
  "planId": "<plan_pro_id>",
  "description": "Upgrade para PRO"
}

# 5. Confirmar pagamento
POST /payments/confirm
Authorization: Bearer <token>
{
  "transactionId": "<transaction_id>",
  "paymentId": "<payment_id>"
}

# 6. Verificar nova subscrição
GET /subscriptions/active
Authorization: Bearer <token>
```

---

## 9. BANCO DE DADOS

### Tabelas Principais

#### Subscriptions
```sql
CREATE TABLE "Subscription" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  planId TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  startDate TIMESTAMP DEFAULT NOW(),
  endDate TIMESTAMP,
  renewalDate TIMESTAMP,
  autoRenew BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

#### Payments
```sql
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  subscriptionId TEXT,
  amount FLOAT NOT NULL,
  currency TEXT DEFAULT 'XOF',
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  method TEXT DEFAULT 'mobile_money',
  provider TEXT, -- orange_money, mtn_money
  transactionId TEXT UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

---

## 10. SEGURANÇA

- ✅ Validação de plano antes de criar anúncio
- ✅ Verificação de propriedade em operações de pagamento
- ✅ TransactionId único para evitar duplicatas
- ✅ Status de pagamento imutável após conclusão
- ✅ Logs de todas as transações

---

## 11. PRÓXIMOS PASSOS

1. ✅ Sistema de subscrições completo
2. ✅ Pagamentos com mock
3. ⏳ Integração real com Orange Money
4. ⏳ Integração real com MTN Mobile Money
5. ⏳ Notificações de pagamento
6. ⏳ Relatórios de receita

---

**Status**: ✅ FASE 2 COMPLETA - Sistema SaaS e pagamentos funcional
