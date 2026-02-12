╔══════════════════════════════════════════════════════════════╗
║         AUDITORIA COMPLETA DO SEED.JS                        ║
║                                                              ║
║ O que está sendo criado vs O que deveria ser criado         ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TABELAS DO BANCO DE DADOS (SCHEMA PRISMA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User
✅ Profile
✅ Plan
✅ Subscription
✅ Category
✅ Ad
✅ Message
✅ Review
✅ Payment
✅ Invoice
✅ Report
✅ AdminLog

Total: 12 tabelas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. O QUE O SEED.JS ATUAL CRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PLANS (4 planos)
   ├─ FREE (0 XOF)
   │  ├─ 3 anúncios
   │  ├─ 0 destaques
   │  ├─ 3 imagens por anúncio
   │  ├─ 30 dias duração
   │  └─ Sem loja virtual
   │
   ├─ BASIC (5.000 XOF)
   │  ├─ 5 anúncios
   │  ├─ 1 destaque
   │  ├─ 5 imagens por anúncio
   │  ├─ 30 dias duração
   │  └─ Sem loja virtual
   │
   ├─ PREMIUM (15.000 XOF)
   │  ├─ 20 anúncios
   │  ├─ 5 destaques
   │  ├─ 10 imagens por anúncio
   │  ├─ 30 dias duração
   │  └─ Sem loja virtual
   │
   └─ BUSINESS (50.000 XOF)
      ├─ 100 anúncios
      ├─ 20 destaques
      ├─ 20 imagens por anúncio
      ├─ 60 dias duração
      └─ Com loja virtual

✅ USERS (2 usuários)
   ├─ teste@bissaumarket.com (role: user)
   │  ├─ Senha: teste123
   │  ├─ Nome: Teste User
   │  ├─ isVerified: true
   │  └─ Profile: criado
   │
   └─ admin@bissaumarket.com (role: admin)
      ├─ Senha: Admin@123
      ├─ Nome: Admin Bissau
      ├─ isVerified: true
      └─ Profile: criado

✅ SUBSCRIPTIONS (2 subscrições)
   ├─ teste@bissaumarket.com → FREE plan
   └─ admin@bissaumarket.com → FREE plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. O QUE ESTÁ FALTANDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ CATEGORIES (Categorias de anúncios)
   ├─ Eletrônicos
   ├─ Vestuário
   ├─ Imóveis
   ├─ Automóvel
   ├─ Móveis
   ├─ Serviços
   ├─ Outros
   └─ E subcategorias

   Schema: Suporta hierarquia com parentId
   Uso: Anúncios precisam de categoriaId

❌ ADS (Anúncios de teste)
   Campos obrigatórios:
   ├─ userId (teste user)
   ├─ categoryId (precisa de categorias primeiro!)
   ├─ title: Título do anúncio
   ├─ description: Descrição
   ├─ price: Preço
   ├─ location: Localização
   ├─ city: Cidade
   ├─ country: País
   ├─ images: Array de URLs
   ├─ status: pending, active, sold, paused, removed, expired
   └─ condition: new, used, refurbished

   Dados sugeridos:
   ├─ 3-5 anúncios por categoria
   ├─ Mix de status (pending, active, sold)
   ├─ Alguns com images, alguns sem
   └─ Alguns highlighted, alguns não

❌ MESSAGES (Mensagens de teste)
   Campos:
   ├─ senderId: User ID (teste)
   ├─ receiverId: User ID (admin)
   ├─ adId: Ad ID (opcional)
   ├─ content: Texto da mensagem
   └─ isRead: Boolean

   Dados sugeridos:
   ├─ 3-5 mensagens de teste para admin
   └─ Algumas lidas, algumas não

❌ REVIEWS (Avaliações de teste)
   Campos:
   ├─ reviewerId: User ID (teste)
   ├─ reviewedUserId: User ID (admin)
   ├─ adId: Ad ID (opcional)
   ├─ rating: 1-5
   ├─ comment: Texto opcional
   └─ Unique constraint: reviewerId + reviewedUserId + adId

   Dados sugeridos:
   ├─ 2-3 reviews
   ├─ Ratings: 3, 4, 5
   └─ Com e sem comentários

❌ PAYMENTS (Pagamentos de teste)
   Campos:
   ├─ userId: User ID
   ├─ subscriptionId: Subscription ID (opcional)
   ├─ amount: Valor
   ├─ currency: XOF
   ├─ status: pending, completed, failed, refunded
   ├─ method: mobile_money, card, bank
   ├─ provider: orange_money, mtn_money
   ├─ transactionId: ID único da transação
   └─ description: Descrição

   Dados sugeridos:
   ├─ 1-2 pagamentos para upgrade FREE→BASIC
   ├─ Status: completed, failed
   └─ Providers: orange_money, mtn_money

❌ INVOICES (Faturas)
   Campos:
   ├─ userId: User ID
   ├─ paymentId: Payment ID (relacionado)
   ├─ invoiceNumber: BM-2024-0001 (único)
   ├─ amount: Valor
   ├─ currency: XOF
   ├─ status: paid, pending, cancelled
   ├─ description: Descrição
   ├─ issuedAt: Data de emissão
   ├─ dueDate: Data de vencimento
   └─ paidAt: Data de pagamento

   Dados sugeridos:
   ├─ Uma fatura por pagamento completado
   ├─ invoiceNumber: BM-2024-0001, BM-2024-0002
   └─ Status: paid

❌ REPORTS (Denúncias)
   Campos:
   ├─ reporterId: User ID (quem denunciou)
   ├─ reportedUserId: User ID (quem foi denunciado) - opcional
   ├─ reportedAdId: Ad ID (qual anúncio foi denunciado) - opcional
   ├─ reason: Motivo (spam, imagem inapropriada, estafa, etc)
   ├─ description: Descrição detalhada
   ├─ status: pending, reviewed, resolved, dismissed
   ├─ resolution: Resolução (texto)
   └─ Pelo menos um de reportedUserId ou reportedAdId deve existir

   Dados sugeridos:
   ├─ 1-2 reports de teste
   ├─ Status: pending, resolved
   └─ Diferentes razões

❌ ADMINLOGS (Logs de administrador)
   Campos:
   ├─ adminId: User ID (admin user)
   ├─ action: create, update, delete, block, unblock, verify, moderate
   ├─ targetType: user, ad, plan, subscription, category, report
   ├─ targetId: ID do alvo
   ├─ details: JSON stringified (opcional)
   └─ createdAt: Timestamp

   Dados sugeridos:
   ├─ Log de criação de usuário teste
   ├─ Log de criação de anúncios
   ├─ Log de moderação de anúncios
   └─ Log de resolução de reports

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. PRIORIDADE DE IMPLEMENTAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRÍTICO (Sem isso, o sistema não funciona):
1. ✅ PLANS (JÁ CRIADO)
2. ✅ USERS (JÁ CRIADO)
3. ✅ SUBSCRIPTIONS (JÁ CRIADO)
4. 🔴 CATEGORIES (Necessário para criar anúncios)

IMPORTANTE (Usuário comum vai usar):
5. 🟡 ADS (Anúncios de teste para testar sistema)
6. 🟡 MESSAGES (Chat entre usuários)

MODERAÇÃO/ADMIN:
7. 🟠 REPORTS (Para testar moderação)
8. 🟠 ADMINLOGS (Para auditoria)

FINANCEIRO:
9. 🟡 PAYMENTS (Para testar pagamentos)
10. 🟡 INVOICES (Para testar faturas)

SOCIAL:
11. 🟡 REVIEWS (Avaliações de usuários)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. CHECKLIST DE COMPLETUDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dados Criados:
✅ Plans (4)
✅ Users (2) + Profiles (2)
✅ Subscriptions (2)

Dados Faltando:
❌ Categories (0 de ~10 sugeridas)
❌ Ads (0 de ~5-10 sugeridas)
❌ Messages (0 de ~5 sugeridas)
❌ Reviews (0 de ~3 sugeridas)
❌ Payments (0 de ~2 sugeridas)
❌ Invoices (0 de ~2 sugeridas)
❌ Reports (0 de ~2 sugeridas)
❌ AdminLogs (0 sugeridos)

Estatísticas:
┌─────────────────────────────────┐
│ Tabelas com dados:      3 / 12  │
│ Tabelas vazias:         9 / 12  │
│ Cobertura do seed:     25 %     │
└─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. RECOMENDAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURTO PRAZO (CRÍTICO):
1. Adicionar CATEGORIES ao seed.js
   └─ Sem isso não consegue criar anúncios
   
2. Adicionar ADS ao seed.js
   └─ Anúncios de teste para validar fluxo
   
3. Adicionar MESSAGES ao seed.js
   └─ Para testar chat entre usuários

MÉDIO PRAZO:
4. Adicionar PAYMENTS + INVOICES ao seed.js
   └─ Para testar fluxo de pagamentos

5. Adicionar REVIEWS ao seed.js
   └─ Para testar sistema de ratings

LONGO PRAZO:
6. Adicionar REPORTS + ADMINLOGS ao seed.js
   └─ Para testar moderação e auditoria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. EXEMPLO DO QUE ADICIONAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CATEGORIES (Exemplo):
```javascript
const categories = [
  {
    name: 'Eletrônicos',
    slug: 'eletronicos',
    description: 'Eletrônicos e gadgets',
    icon: '📱',
    order: 1,
  },
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Telefones celulares',
    parentId: null, // Será preenchido com o ID de Eletrônicos
    order: 1,
  },
  // ... mais categorias
];
```

ADS (Exemplo):
```javascript
const ads = [
  {
    userId: testUser.id,
    categoryId: categoryId,
    title: 'iPhone 13 impecável',
    description: 'iPhone 13 preto com capa original',
    price: 450000,
    currency: 'XOF',
    location: 'Bissau, Centro',
    city: 'Bissau',
    country: 'Guiné-Bissau',
    images: [
      'https://via.placeholder.com/400x300?text=iPhone+1',
      'https://via.placeholder.com/400x300?text=iPhone+2',
    ],
    condition: 'used',
    status: 'active',
  },
  // ... mais anúncios
];
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO EXECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status Atual:
- Sistema de planos: ✅ 100% PRONTO
- Sistema de usuários: ✅ 100% PRONTO
- Sistema de subscrições: ✅ 100% PRONTO
- Dados de teste: 🟡 25% PRONTO (faltam 9 tabelas)

Impacto Atual:
- Admin consegue logar: ✅ SIM
- Usuário consegue logar: ✅ SIM
- Usuário consegue criar anúncio: ❌ NÃO (sem categorias)
- Usuário consegue fazer upgrade: ✅ SIM
- Testar chat: ❌ NÃO (sem dados de teste)
- Testar moderação: ❌ NÃO (sem dados de teste)

Recomendação:
Expandir seed.js para incluir CATEGORIES, ADS e MESSAGES
como dados de teste mínimos viáveis para demonstração completa
do sistema.

Data: 26 de Janeiro de 2026
Status: ANÁLISE COMPLETA
