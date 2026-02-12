╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🎯 COMO O PLANO DO USUÁRIO É ATIVADO                ║
║                                                               ║
║           Fluxo Completo de Subscrição e Planos              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ESTRUTURA DO BANCO DE DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modelo: Plan
┌─────────────────────────────────────┐
│ Plan                                │
├─────────────────────────────────────┤
│ id: String (CUID)                  │
│ name: String (UNIQUE)              │
│ description: String                │
│ price: Float (padrão 0)            │
│ currency: String (padrão "XOF")    │
│ maxAds: Int (padrão 3)             │
│ maxHighlights: Int (padrão 0)      │
│ maxImages: Int (padrão 3)          │
│ hasStore: Boolean                  │
│ adDuration: Int (dias, padrão 30)  │
│ features: String[]                 │
│ isActive: Boolean                  │
│ createdAt, updatedAt               │
└─────────────────────────────────────┘

Exemplo de Planos no Sistema:
┌──────────┬────────┬──────────┬────────┬────────────┐
│ Nome     │ Preço  │ maxAds   │ maxImg │ Duração    │
├──────────┼────────┼──────────┼────────┼────────────┤
│ FREE     │ 0 XOF  │ 3        │ 3      │ 30 dias    │
│ BASIC    │ 5.000  │ 5        │ 5      │ 30 dias    │
│ PREMIUM  │ 15.000 │ 20       │ 10     │ 30 dias    │
│ BUSINESS │ 50.000 │ 100      │ 20     │ 60 dias    │
└──────────┴────────┴──────────┴────────┴────────────┘

Modelo: Subscription
┌─────────────────────────────────────┐
│ Subscription                        │
├─────────────────────────────────────┤
│ id: String (CUID)                  │
│ userId: String (FK -> User)        │
│ planId: String (FK -> Plan)        │
│ status: String                     │
│   - "active" (subscrição ativa)    │
│   - "cancelled" (cancelada)        │
│   - "expired" (expirada)           │
│ startDate: DateTime (padrão: now)  │
│ endDate: DateTime (nullable)       │
│ renewalDate: DateTime (nullable)   │
│ autoRenew: Boolean (padrão: true)  │
│ createdAt, updatedAt               │
│                                    │
│ UNIQUE [userId, planId]            │
│ Um usuário = Um plano ativo por vez│
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 FLUXO DE ATIVAÇÃO DE PLANO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CENÁRIO 1: NOVO USUÁRIO (REGISTRO)
═════════════════════════════════════════════════════════════

1️⃣ Usuário se registra
   POST /auth/register
   {
     email: "usuario@example.com",
     password: "senha123",
     firstName: "João",
     lastName: "Silva"
   }

2️⃣ Backend - auth.service.ts (linha 45-65)
   a) Cria usuário no banco
   b) Cria perfil do usuário
   c) ✨ ATIVA PLANO FREE AUTOMATICAMENTE
   
   Código:
   ```typescript
   // Cria subscrição FREE automática
   const freePlan = await this.db.plan.findFirst({
     where: { name: 'FREE' }
   });

   if (freePlan) {
     await this.db.subscription.create({
       data: {
         userId: user.id,
         planId: freePlan.id,
         // status: 'active' (padrão)
         // startDate: now() (padrão)
         // autoRenew: true (padrão)
       }
     });
   }
   ```

3️⃣ Resultado
   ✅ Usuário recebe subscrição FREE
   ✅ Status: "active"
   ✅ Pode criar 3 anúncios
   ✅ Pode fazer 3 imagens por anúncio
   ✅ Anúncios duram 30 dias

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CENÁRIO 2: UPGRADE DE PLANO (MUDANÇA)
═════════════════════════════════════════════════════════════

1️⃣ Usuário decide fazer upgrade
   POST /subscriptions/upgrade
   {
     planId: "id_do_plano_premium"
   }

2️⃣ Backend - subscriptions.service.ts (linha 68-120)
   a) Valida se plano existe
   b) Busca subscrição ativa atual
   c) Verifica se novo plano tem preço maior
      (upgrade = preço maior)
   d) Cancela subscrição anterior
   e) Cria nova subscrição
   
   Código simplificado:
   ```typescript
   async upgradePlan(userId, upgradePlanDto) {
     const plan = await findPlan(planId); // ✓ Existe?
     
     const current = await findActiveSubscription(userId);
     
     if (plan.price <= current.plan.price) {
       throw Error('Novo plano deve ser mais caro');
     }
     
     // Cancela anterior
     await updateSubscription(current.id, {
       status: 'cancelled'
     });
     
     // Cria nova
     const newSub = await createSubscription({
       userId,
       planId,
       status: 'active',
       autoRenew: true
     });
     
     return newSub;
   }
   ```

3️⃣ Resultado
   ✅ Plano anterior: status = "cancelled"
   ✅ Novo plano: status = "active"
   ✅ Usuário usa novo plano imediatamente
   ✅ Novo limite de anúncios entra em vigor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CENÁRIO 3: PAGAMENTO POR UPGRADE (FUTURO)
═════════════════════════════════════════════════════════════

O SISTEMA ATUAL:
1. Pagamento é registrado (payments.service.ts)
2. Pagamento muda status para "completed"
3. ⚠️ PORÉM: Não cria subscrição automaticamente
4. Admin teria que criar subscrição manualmente

FLUXO PREVISTO PARA PRODUÇÃO:

1️⃣ Usuário inicia pagamento
   POST /payments/initiate
   {
     planId: "plano_premium",
     amount: 15000,
     method: "mobile_money",
     provider: "orange" // Orange Money
   }

2️⃣ Backend cria registro de pagamento
   {
     status: "pending",
     amount: 15000,
     transactionId: "TXN_xxx"
   }

3️⃣ Usuário confirma no telefone
   POST /payments/confirm
   {
     paymentId: "id_pagamento",
     transactionId: "TXN_xxx"
   }

4️⃣ ✨ Webhook / Sistema verifica (futuro)
   if (payment.status === "completed") {
     // Ativa upgrade automático
     await subscriptions.upgradePlan(userId, planId);
   }

5️⃣ Resultado
   ✅ Pagamento: status = "completed"
   ✅ Subscrição: status = "active" (novo plano)
   ✅ Usuário tem acesso aos recursos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CENÁRIO 4: CANCELAMENTO DE PLANO
═════════════════════════════════════════════════════════════

1️⃣ Usuário cancela subscrição
   POST /subscriptions/cancel

2️⃣ Backend - subscriptions.service.ts (linha 125-140)
   ```typescript
   async cancelSubscription(userId) {
     const subscription = await findActiveSubscription(userId);
     
     return updateSubscription(subscription.id, {
       status: 'cancelled',
       endDate: new Date()
     });
   }
   ```

3️⃣ Resultado
   ✅ Plano: status = "cancelled"
   ✅ endDate: data do cancelamento
   ✅ Usuário volta ao plano FREE (ou sem acesso)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ RENOVAÇÃO AUTOMÁTICA (AUTO-RENEWAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implementado em: tasks.service.ts (linha 96-133)

Cron Job (a cada dia):
┌────────────────────────────────────────┐
│ @Cron('0 0 * * *')  // Meia-noite      │
│ async renewSubscriptions() {           │
│                                        │
│ 1. Busca subscrições vencidas:        │
│    - renewalDate <= today              │
│    - status = 'active'                │
│    - autoRenew = true                 │
│                                        │
│ 2. Para cada subscrição:              │
│    - Atualiza:                        │
│      startDate = today                │
│      renewalDate = today + 30 dias    │
│      status = 'active' (mantém)       │
│                                        │
│ 3. Log: "Subscrição X renovada"       │
└────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ENDPOINTS DE GERENCIAMENTO DE PLANOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET /subscriptions/active
Obtém subscrição ativa do usuário
Requer: Bearer Token
Retorna: { id, userId, planId, status, startDate, endDate, plan }

GET /subscriptions/history?page=1&limit=10
Obtém histórico de subscrições
Requer: Bearer Token
Retorna: { data: [...], pagination: {...} }

POST /subscriptions/upgrade
Faz upgrade de plano
Requer: Bearer Token + { planId }
Valida: novo plano deve ser mais caro
Retorna: nova subscrição

POST /subscriptions/cancel
Cancela subscrição ativa
Requer: Bearer Token
Retorna: subscrição com status = "cancelled"

POST /subscriptions/renew
Renova subscrição
Requer: Bearer Token
Retorna: subscrição renovada

GET /subscriptions/limits/ads
Obtém limite de anúncios do plano
Requer: Bearer Token
Retorna: { maxAds: 20, currentAds: 3, remaining: 17 }

GET /subscriptions/limits/highlights
Obtém limite de destaques
Requer: Bearer Token
Retorna: { maxHighlights: 5, currentHighlights: 1 }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 FRONTEND - COMO O USUÁRIO VÊ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Página: /planos

UI Mostra:
┌─────────────────────────────────────────────┐
│ Meu Plano Atual: FREE                      │
│ ✓ Ativo até: 2026-02-25                    │
│ ✓ Anúncios: 3/3 criados                    │
│ ✓ Imagens: 3 por anúncio                   │
│ [Botão: Mudar para BASIC]                  │
│                                             │
│ Planos Disponíveis:                        │
│ ┌─────────────────────────────────────┐   │
│ │ BASIC - 5.000 XOF                   │   │
│ │ • 5 anúncios                        │   │
│ │ • 5 imagens por anúncio             │   │
│ │ [Fazer Upgrade]                     │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ PREMIUM - 15.000 XOF               │   │
│ │ • 20 anúncios                       │   │
│ │ • 10 imagens por anúncio            │   │
│ │ [Fazer Upgrade]                     │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ BUSINESS - 50.000 XOF              │   │
│ │ • 100 anúncios                      │   │
│ │ • 20 imagens por anúncio            │   │
│ │ [Fazer Upgrade]                     │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

Fluxo de Upgrade:
1. Clica em [Fazer Upgrade]
2. Sistema inicia pagamento
3. Confirma no Mobile Money (Orange/MTN)
4. Sucesso → Novo plano ativado
5. Página atualiza → Mostra novo plano

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 VERIFICAÇÃO DE LIMITES NO SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quando usuário tenta criar anúncio:
  POST /ads/create

Backend verifica:
1. Obtém subscrição ativa
2. Obtém plano da subscrição
3. Conta anúncios atuais do usuário
4. Compara: count >= plan.maxAds?
   
   if (count >= plan.maxAds) {
     return Error("Você atingiu o limite de anúncios");
   }

Quando usuário faz upload de imagem:
  POST /uploads/image

Backend verifica:
1. Obtém subscrição ativa
2. Obtém plano → maxImages
3. Compara: number_of_images <= plan.maxImages?
4. Aceita ou rejeita upload

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RESUMO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ AUTOMÁTICO:
  • Novo usuário → FREE ativado
  • Usuário upgrade → Plano muda
  • Auto-renewal → Renova a cada 30 dias

❌ MANUAL (FUTURO):
  • Pagamento → Upgrade (será automático em produção)
  • Admin pode atribuir planos manualmente

Status Possíveis:
  • active   = Plano ativo, usuário pode usar
  • cancelled = Plano cancelado, sem acesso
  • expired  = Plano expirou

Limite de Planos:
  • 1 subscrição ACTIVE por usuário (UNIQUE [userId, planId])
  • Múltiplas subscrições históricas (para auditoria)
  • Historicamente rastreia mudanças

Arquivos Relevantes:
  • backend/src/modules/subscriptions/ - Lógica de planos
  • backend/src/modules/auth/auth.service.ts - Cria FREE
  • backend/src/modules/tasks/tasks.service.ts - Auto-renewal
  • backend/prisma/schema.prisma - Modelos Plan/Subscription

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
