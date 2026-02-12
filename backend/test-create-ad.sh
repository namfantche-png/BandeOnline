#!/bin/bash

# Teste de criação de anúncio

# 1. Login para obter token
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@bissaumarket.com","password":"teste123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Criar anúncio com FormData
echo "2. Criando anúncio..."

curl -X POST http://localhost:3000/api/ads \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Teste Anúncio" \
  -F "description=Esta é uma descrição de teste com mais de 20 caracteres para validação." \
  -F "price=5000" \
  -F "currency=XOF" \
  -F "categoryId=1" \
  -F "city=Bissau" \
  -F "country=Guiné-Bissau" \
  -F "location=Plateau" \
  -F "condition=used"
