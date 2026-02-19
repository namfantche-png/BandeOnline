#!/bin/bash

# Script para simular build do Render localmente com case sensitivity
# Este script ajuda a detectar problemas antes de fazer deploy

set -e  # Exit on error

echo "🔍 Simulando build do Render (com case sensitivity do Linux)..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: execute este script do diretório backend/"
    exit 1
fi

echo "Step 1️⃣  Verificando imports com case sensitivity..."
echo "---"

# Procurar por padrões incorretos que funcionariam no Windows mas não no Linux
echo "Procurando por possíveis problemas de case sensitivity..."

# Procurar por imports que começam com maiúsculas (que podem ser módulos)
has_issues=false

if grep -r "from.*['\"]\.\.\/[A-Z]" src/ 2>/dev/null | grep -v node_modules; then
    echo "⚠️  Possíveis problemas encontrados! Verifique os imports acima."
    has_issues=true
fi

echo ""
echo "Step 2️⃣  Limpando build anterior..."
echo "---"
rm -rf dist/
rm -rf node_modules/.prisma/client/
echo "✅ Limpeza concluída"

echo ""
echo "Step 3️⃣  Instalando dependências..."
echo "---"
npm ci
echo "✅ Dependências instaladas"

echo ""
echo "Step 4️⃣  Gerando cliente Prisma..."
echo "---"
npx prisma generate
echo "✅ Prisma Cliente gerado"

echo ""
echo "Step 5️⃣  Compilando TypeScript..."
echo "---"
npm run build
echo "✅ Build concluído com sucesso!"

echo ""
echo "Step 6️⃣  Verificando saída do build..."
echo "---"
if [ -d "dist" ]; then
    echo "✅ Diretório dist criado"
    echo "   Aquivos principais:"
    ls -la dist/*.js | head -5
else
    echo "❌ Erro: diretório dist não foi criado"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build simulado com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Você pode agora fazer deploy no Render sem problemas."
echo ""
echo "Build Command no Render deve ser:"
echo "  npm install && npx prisma generate && npm run build"
echo ""
echo "Start Command no Render deve ser:"
echo "  npm run start:prod"
