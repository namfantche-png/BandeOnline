-- 🔐 CRIAR USUÁRIO ADMIN - VERSÃO UNIVERSAL
-- Execute NO pgAdmin Query Tool

-- OPÇÃO 1: Ver todas as colunas da tabela User
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- OPÇÃO 2: Inserir Admin (escolha uma das versões abaixo conforme as colunas do seu banco)

-- ✅ VERSÃO A: Se a coluna é "firstname" e "lastname" (sem camelCase)
INSERT INTO "User" (
  id,
  email,
  password,
  firstname,
  lastname,
  phone,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@bissaumarket.com',
  '$2b$10$X9WjGKp8.B8.5wE9mK0B2OZ9w7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1',
  'Admin',
  'Sistema',
  '+245 955000000',
  true,
  NOW(),
  NOW()
);

-- ✅ VERSÃO B: Se a coluna é "firstName" e "lastName" (camelCase com aspas)
-- INSERT INTO "User" (
--   id, email, password, "firstName", "lastName", phone, "isActive", "createdAt", "updatedAt"
-- ) VALUES (
--   'admin-' || gen_random_uuid()::text,
--   'admin@bissaumarket.com',
--   '$2b$10$X9WjGKp8.B8.5wE9mK0B2OZ9w7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1',
--   'Admin', 'Sistema', '+245 955000000', true, NOW(), NOW()
-- );

-- ✅ VERIFICAR SE FOI CRIADO
SELECT id, email, firstname, "isActive" FROM "User" WHERE email = 'admin@bissaumarket.com';
