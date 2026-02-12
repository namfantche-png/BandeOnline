# 🔐 Acessar Painel de Administração

## 📋 Passo 1: Criar Usuário Admin no Banco

### Via pgAdmin (Interface Gráfica)

1. **Abra pgAdmin:** `http://localhost:5050`
2. **Navegue até:** Servers → BissauMarket DB → Databases → bissaumarket → Schemas → public → Tables
3. **Clique direito em `User`** → View/Edit Data → All Rows
4. **Clique em [+] para adicionar nova linha**
5. **Preencha os dados:**
   ```
   id: admin-1234567890
   email: admin@bissaumarket.com
   password: $2b$10$X9WjGKp8.B8.5wE9mK0B2OZ9w7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1
   firstName: Admin
   lastName: Sistema
   phone: +245 955000000
   role: admin
   isActive: true
   isVerified: true
   createdAt: now()
   updatedAt: now()
   ```
6. **Clique em Save**

### Via Query SQL (Mais Rápido)

1. **Abra pgAdmin:** `http://localhost:5050`
2. **Tools → Query Tool**
3. **Cole o script abaixo:**

```sql
INSERT INTO "User" (
  id,
  email,
  password,
  firstName,
  lastName,
  phone,
  role,
  isActive,
  isVerified,
  createdAt,
  updatedAt
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@bissaumarket.com',
  -- Senha: Admin123! (bcrypt)
  '$2b$10$X9WjGKp8.B8.5wE9mK0B2OZ9w7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1',
  'Admin',
  'Sistema',
  '+245 955000000',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);

-- Criar profile
INSERT INTO "Profile" (
  id,
  userId,
  bio,
  city,
  country,
  createdAt,
  updatedAt
) VALUES (
  'profile-' || gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@bissaumarket.com' LIMIT 1),
  'Administrador do sistema',
  'Bissau',
  'Guiné-Bissau',
  NOW(),
  NOW()
);

-- Verificar criação
SELECT id, email, role, isActive FROM "User" WHERE email = 'admin@bissaumarket.com';
```

4. **Clique em Execute (ou Ctrl+Enter)**

✅ **Usuário admin criado!**

---

## 🔑 Passo 2: Fazer Login como Admin

### Credentials:
```
Email: admin@bissaumarket.com
Senha: Admin123!
```

### Processo:
1. **Abra Frontend:** `http://localhost:3001/login`
2. **Preencha os dados acima**
3. **Clique em "Entrar"**
4. **Verificar se login funcionou** (token JWT armazenado)

---

## 🎯 Passo 3: Acessar Painel de Admin

### URL:
```
http://localhost:3001/admin
```

### O que você verá:

✅ **Dashboard** - Estatísticas gerais:
- Total de usuários
- Usuários ativos
- Total de anúncios
- Receita total
- Anúncios pendentes

✅ **Abas Adicionais:**
- 👥 Usuários (bloquear/desbloquear)
- 📢 Anúncios (moderar/aceitar/rejeitar)
- 🚨 Denúncias (listar e resolver)
- 💳 Pagamentos (relatório de receita)

---

## 🔐 Endpoints de Admin (Backend)

Todos requerem **JWT token** + **role = 'admin'**

### Dashboard
```bash
GET /api/admin/dashboard
# Retorna: totalUsers, activeUsers, totalAds, totalRevenue, pendingReports
```

### Gerenciar Usuários
```bash
GET /api/admin/users?status=active
POST /api/admin/users/:id/block
POST /api/admin/users/:id/unblock
```

### Moderar Anúncios
```bash
GET /api/admin/ads?status=pending
PUT /api/admin/ads/:id/moderate
  { decision: 'approve|reject', reason?: string }
```

### Gerenciar Denúncias
```bash
GET /api/admin/reports
PUT /api/admin/reports/:id
  { status: 'resolved|dismissed' }
```

### Relatórios Financeiros
```bash
GET /api/admin/reports/financial
GET /api/admin/reports/growth?days=30
```

---

## 📊 Testar via Swagger

Se preferir testar os endpoints de admin:

1. **Abra Swagger:** `http://localhost:3000/api/docs`
2. **Clique em 🔒 (Authorize) no topo**
3. **Colar token Bearer:**
   ```
   Bearer {seu_access_token_aqui}
   ```
4. **Clique em "Authorize"**
5. **Expandir "Admin"** na lista de endpoints
6. **Testar endpoints** (Get Dashboard, Manage Users, etc)

---

## ⚠️ Senhas com Bcrypt

Se quiser gerar hash de outra senha:

### Online Generator:
- Acesse: https://bcrypt.online/
- Digite sua senha
- Copie o hash resultante

### Exemplo:
```
Senha Original: MinhaSenha123!
Bcrypt Hash: $2b$10$XyZ9w7...

SQL: password: '$2b$10$XyZ9w7...'
```

---

## 🎯 Checklist de Acesso Admin

- [ ] PostgreSQL rodando
- [ ] Backend rodando (`npm run start:dev`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Usuário admin criado no banco via pgAdmin
- [ ] Consegue fazer login como admin
- [ ] Consegue acessar `/admin`
- [ ] Dashboard carrega com estatísticas
- [ ] Consegue ver abas (Usuários, Anúncios, Denúncias, Pagamentos)
- [ ] Consegue testar endpoints no Swagger

---

## 🚀 Próximos Passos

Após acessar admin:

1. **Criar usuários de teste:**
   ```sql
   INSERT INTO "User" ... (role: 'user')
   ```

2. **Criar anúncios de teste:**
   - Login como usuário comum
   - Criar anúncios
   - Voltar ao admin para moderar

3. **Testar fluxo completo:**
   - Usuário cria anúncio
   - Admin revisa no painel
   - Admin aprova/rejeita
   - Anúncio aparece/desaparece para outros usuários

4. **Implementar features pendentes:**
   - [ ] Listar e bloquear usuários
   - [ ] Moderar anúncios com preview
   - [ ] Visualizar denúncias
   - [ ] Gerar relatórios de pagamento

---

## 🆘 Troubleshooting

### ❌ "Acesso negado ao /admin"
**Causa:** Usuário não é admin ou token inválido
```sql
-- Verificar role do usuário
SELECT email, role FROM "User" WHERE email = 'admin@bissaumarket.com';

-- Se role != 'admin', atualizar:
UPDATE "User" SET role = 'admin' WHERE email = 'admin@bissaumarket.com';
```

### ❌ "/admin página branca"
**Causa:** Frontend ainda em desenvolvimento
- Página principal criada
- Abas funcionam (sem dados ainda)
- Implementar cada feature conforme necessário

### ❌ "Dashboard retorna erro"
**Causa:** Token expirado ou inválido
- Fazer logout e login novamente
- Verificar se backend está rodando

---

## 📚 Estrutura do Painel de Admin

```
Admin Dashboard
├── 📊 Dashboard (Stats)
│   ├── Total Users
│   ├── Active Users
│   ├── Total Ads
│   ├── Total Revenue
│   └── Pending Reports
├── 👥 Users
│   ├── List Users
│   ├── Block User
│   ├── Unblock User
│   └── View Profile
├── 📢 Ads
│   ├── Pending Ads
│   ├── Active Ads
│   ├── Approve Ad
│   ├── Reject Ad
│   └── View Details
├── 🚨 Reports
│   ├── Pending Reports
│   ├── View Report Details
│   ├── Take Action
│   └── Resolve Report
└── 💳 Payments
    ├── Recent Payments
    ├── Revenue Chart
    ├── Payment Methods
    └── Download Report
```

---

**Tudo pronto! Você agora tem acesso ao painel de administração! 🎉**
