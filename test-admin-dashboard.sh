#!/bin/bash

# 🔍 TESTE: Admin Dashboard Access

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔍 DIAGNÓSTICO: Admin Dashboard Access                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@bissaumarket.com"
ADMIN_PASSWORD="senha123"

echo "📋 TESTES:"
echo ""

# Teste 1: Login
echo "${YELLOW}1️⃣  Tentando login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "Resposta: $LOGIN_RESPONSE"
echo ""

# Extrair token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Login falhou - sem token${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Teste 2: Verificar role
echo "${YELLOW}2️⃣  Verificando role do usuário...${NC}"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Resposta: $ME_RESPONSE"

ROLE=$(echo "$ME_RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
echo "Role: $ROLE"
echo ""

if [ "$ROLE" != "admin" ]; then
  echo -e "${RED}❌ Usuário não é admin!${NC}"
  echo "   Esperado: admin"
  echo "   Obtido: $ROLE"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Role é admin${NC}"
echo ""

# Teste 3: Acessar dashboard
echo "${YELLOW}3️⃣  Tentando acessar dashboard...${NC}"
DASHBOARD_RESPONSE=$(curl -s -X GET "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Resposta: $DASHBOARD_RESPONSE"
echo ""

# Verificar se há erro
if echo "$DASHBOARD_RESPONSE" | grep -q "error\|Erro\|403\|401"; then
  echo -e "${RED}❌ Erro ao acessar dashboard${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Dashboard acessado com sucesso${NC}"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ${GREEN}✅ Todos os testes passaram!${NC}                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
