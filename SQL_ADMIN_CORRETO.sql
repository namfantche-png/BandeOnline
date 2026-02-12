-- 🔐 Script CORRIGIDO para Criar Usuário Admin
-- Execute NO pgAdmin Query Tool (Tools → Query Tool)

-- ✅ PASSO 1: Verificar Nomes das Colunas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY column_name;

-- ✅ PASSO 2: Criar Usuário Admin
INSERT INTO "User" (
  id,
  email,
  password,
  "firstName",
  "lastName",
  phone,
  role,
  "isActive",
  "isVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@bissaumarket.com',
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

-- ✅ PASSO 3: Criar Perfil do Admin
INSERT INTO "Profile" (
  id,
  "userId",
  bio,
  city,
  country,
  rating,
  "createdAt",
  "updatedAt"
) VALUES (
  'profile-' || gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@bissaumarket.com' LIMIT 1),
  'Administrador do sistema BandeOnline',
  'Bissau',
  'Guiné-Bissau',
  5.0,
  NOW(),
  NOW()
);

-- ✅ PASSO 4: Criar Plano FREE (se não existir)
INSERT INTO "Plan" (
  id,
  name,
  price,
  "maxAds",
  "maxHighlights",
  "adDuration",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'plan-free-' || gen_random_uuid()::text,
  'FREE',
  0,
  3,
  0,
  30,
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- ✅ PASSO 5: Atribuir Plano FREE ao Admin
INSERT INTO "Subscription" (
  id,
  "userId",
  "planId",
  status,
  "autoRenew",
  "createdAt",
  "updatedAt"
) VALUES (
  'sub-' || gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@bissaumarket.com' LIMIT 1),
  (SELECT id FROM "Plan" WHERE name = 'FREE' LIMIT 1),
  'active',
  true,
  NOW(),
  NOW()
);

-- ✅ PASSO 6: Verificar Criação
SELECT 
  id,
  email,
  "firstName",
  role,
  "isActive",
  "createdAt"
FROM "User"
WHERE email = 'admin@bissaumarket.com';

-- ✅ PASSO 7: Contar Usuários Total
SELECT COUNT(*) as total_users FROM "User";
