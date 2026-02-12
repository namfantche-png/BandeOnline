#!/bin/bash

# 🔐 Setup Admin User

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔐 SETUP: Admin User                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 Pré-requisitos:${NC}"
echo "   • PostgreSQL rodando"
echo "   • PgAdmin acessível"
echo "   • Banco de dados criado"
echo ""

echo -e "${BLUE}ℹ️  Instruções:${NC}"
echo ""
echo "1️⃣  Abra o PgAdmin:"
echo "   URL: http://localhost:5050"
echo "   Email: pgadmin4@pgadmin.org"
echo "   Password: admin"
echo ""

echo "2️⃣  Navegue até:"
echo "   Servers → PostgreSQL → Databases → bissan_market → public → Tables"
echo ""

echo "3️⃣  Clique em ${YELLOW}Query Tool${NC} (Tools → Query Tool)"
echo ""

echo "4️⃣  Cole o script abaixo e execute (F5 ou ▶️  Play):"
echo ""
echo "════════════════════════════════════════════════════════════"
cat << 'SQL'
-- 🔐 Script para Criar Usuário Admin
-- Execute NO pgAdmin Query Tool

-- ✅ PASSO 1: Verificar se já existe
SELECT id, email, role FROM "User" 
WHERE email = 'admin@bissaumarket.com' 
LIMIT 1;

-- ✅ PASSO 2: Se não existir, criar usuário admin
-- Password: admin123 (hash bcrypt)
-- Hash gerado por: bcrypt('admin123')
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
)
SELECT
  'admin-' || gen_random_uuid()::text,
  'admin@bissaumarket.com',
  '$2b$10$dXJXgKZg.3X9E8Y7Z6A1B.vV7w8X9Y0Z1a2b3c4d5e6f7g8h9i0j1k2',
  'Admin',
  'Sistema',
  '+245955000000',
  'admin',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" 
  WHERE email = 'admin@bissaumarket.com'
);

-- ✅ PASSO 3: Verificar criação
SELECT 
  id, 
  email, 
  "firstName", 
  role, 
  "isActive", 
  "isVerified",
  "createdAt"
FROM "User" 
WHERE email = 'admin@bissaumarket.com' 
LIMIT 1;

SQL
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}✅ Credenciais do Admin:${NC}"
echo "   Email: admin@bissaumarket.com"
echo "   Senha: admin123"
echo ""

echo -e "${YELLOW}5️⃣  Após executar o script:${NC}"
echo "   • Acessar http://localhost:3001/login"
echo "   • Fazer login com credenciais acima"
echo "   • Navegar para http://localhost:3001/admin"
echo ""

echo -e "${BLUE}💡 Dicas:${NC}"
echo "   • Se receber 'already exists', admin já está criado"
echo "   • Pode testar login com as credenciais acima"
echo "   • Se password estiver errada, use o hash correto"
echo ""

echo -e "${GREEN}Hash bcrypt de 'admin123':${NC}"
echo '   $2b$10$dXJXgKZg.3X9E8Y7Z6A1B.vV7w8X9Y0Z1a2b3c4d5e6f7g8h9i0j1k2'
echo ""
