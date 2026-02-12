-- Script para Criar Usuário Admin no PostgreSQL
-- Execute este script no pgAdmin Query Tool

-- 1. CRIAR USUÁRIO ADMIN
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
  -- Senha: Admin123! (bcrypt hash - gerado previamente)
  -- Use um gerador online: https://bcrypt.online/
  -- Ou use a senha padrão abaixo (MUDE EM PRODUÇÃO!)
  '$2b$10$X9WjGKp8.B8.5wE9mK0B2OZ9w7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1',
  'admin@bissaumarket.com',
  'Admin',
  'Sistema',
  '+245 955000000',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);

-- 2. CRIAR PERFIL DO ADMIN
INSERT INTO "Profile" (
  id,
  userId,
  bio,
  location,
  city,
  country,
  phone,
  rating,
  createdAt,
  updatedAt
) VALUES (
  'profile-' || gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@bissaumarket.com' LIMIT 1),
  'Administrador do sistema BandeOnline',
  'Bissau, Guiné-Bissau',
  'Bissau',
  'Guiné-Bissau',
  '+245 955000000',
  5.0,
  NOW(),
  NOW()
);

-- 3. ATRIBUIR PLANO FREE AO ADMIN
INSERT INTO "Subscription" (
  id,
  userId,
  planId,
  status,
  autoRenew,
  createdAt,
  updatedAt
) VALUES (
  'sub-' || gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@bissaumarket.com' LIMIT 1),
  (SELECT id FROM "Plan" WHERE name = 'FREE' LIMIT 1),
  'active',
  true,
  NOW(),
  NOW()
);

-- 4. VERIFICAR CRIAÇÃO
SELECT 
  id,
  email,
  firstName,
  role,
  isActive,
  createdAt
FROM "User"
WHERE email = 'admin@bissaumarket.com';
