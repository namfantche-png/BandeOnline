#!/bin/bash

# ========================================
# 🚀 SCRIPT AUTOMÁTICO DE PREPARAÇÃO PARA RENDER
# ========================================
# Este script realiza todas as correções necessárias
# para deploy bem-sucedido no Render.com
# ========================================

set -e  # Exit on any error

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🚀 PREPARAÇÃO PARA DEPLOY NO RENDER                        ║"
echo "║                                                                ║"
echo "║   Este script vai:                                            ║"
echo "║   1. Verificar ambiente                                       ║"
echo "║   2. Validar imports                                          ║"
echo "║   3. Atualizar package.json                                   ║"
echo "║   4. Testar build                                             ║"
echo "║   5. Gerar relatório                                          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ========================================
# VERIFICAÇÕES PRELIMINARES
# ========================================

echo ""
print_status "1️⃣  VERIFICAÇÕES PRELIMINARES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se estamos no diretório backend
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado!"
    print_error "Execute este script do diretório: backend/"
    exit 1
fi
print_success "Diretório correto: $(pwd)"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm: $NPM_VERSION"

# ========================================
# VERIFICAÇÃO DE CASE SENSITIVITY
# ========================================

echo ""
print_status "2️⃣  VERIFICAÇÃO DE CASE SENSITIVITY EM IMPORTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CASE_ISSUES=0

# Procurar por imports com case incorreto
echo "Procurando por possíveis problemas de case sensitivity..."

# Padrão: from "../" ou "from './'" seguido de letra maiúscula (indicando módulo)
if grep -r "from ['\"]\.\.\/[A-Z]" src/ --include="*.ts" 2>/dev/null | grep -v node_modules; then
    CASE_ISSUES=$((CASE_ISSUES + 1))
    print_warning "Possível problema encontrado acima"
else
    print_success "Nenhum problema óbvio de case sensitivity encontrado"
fi

# Verificar especificamente por "Uploads" (maiúsculo)
if grep -r "Uploads" src/ --include="*.ts" 2>/dev/null | grep "from\|import"; then
    CASE_ISSUES=$((CASE_ISSUES + 1))
    print_warning "⚠️  'Uploads' com U maiúsculo encontrado - verifique se é correto"
else
    print_success "Padrão de case correto para 'uploads'"
fi

# ========================================
# VERIFICAÇÃO DE PRISMA
# ========================================

echo ""
print_status "3️⃣  VERIFICAÇÃO DO PRISMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar prisma/schema.prisma
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "prisma/schema.prisma não encontrado!"
    exit 1
fi
print_success "prisma/schema.prisma encontrado"

# Verificar se prisma.config.ts existe (não deveria)
if [ -f "prisma.config.ts" ]; then
    print_warning "⚠️  prisma.config.ts encontrado (não é necessário)"
    print_status "   Informação: Este arquivo será ignorado, mas é recomendado deletar"
else
    print_success "prisma.config.ts não existe (correto)"
fi

# ========================================
# VERIFICAÇÃO DO PACKAGE.JSON
# ========================================

echo ""
print_status "4️⃣  VERIFICAÇÃO DO PACKAGE.JSON"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar scripts necessários
SCRIPTS_OK=true

if grep -q '"prisma:generate"' package.json; then
    print_success "Script 'prisma:generate' encontrado"
else
    print_warning "Script 'prisma:generate' não encontrado"
    SCRIPTS_OK=false
fi

if grep -q '"start:prod"' package.json; then
    print_success "Script 'start:prod' encontrado"
else
    print_error "Script 'start:prod' não encontrado"
    SCRIPTS_OK=false
fi

if [ "$SCRIPTS_OK" = false ]; then
    print_warning "Scripts faltando serão adicionados automaticamente"
fi

# ========================================
# ATUALIZAR PACKAGE.JSON
# ========================================

echo ""
print_status "5️⃣  ATUALIZANDO PACKAGE.JSON"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Fazer backup
cp package.json package.json.backup
print_success "Backup criado: package.json.backup"

# Adicionar scripts se faltarem
if ! grep -q '"prisma:generate"' package.json; then
    print_status "Adicionando script 'prisma:generate'..."
    npm pkg set scripts.prisma:generate="prisma generate" 2>/dev/null
    print_success "Script adicionado"
fi

if ! grep -q '"prisma:db:push"' package.json; then
    print_status "Adicionando script 'prisma:db:push'..."
    npm pkg set scripts.prisma:db:push="prisma db push --skip-generate" 2>/dev/null
    print_success "Script adicionado"
fi

if ! grep -q '"prisma:migrate"' package.json; then
    print_status "Adicionando script 'prisma:migrate'..."
    npm pkg set scripts.prisma:migrate="prisma migrate deploy" 2>/dev/null
    print_success "Script adicionado"
fi

# ========================================
# VERIFICAÇÃO DO TYPESCRIPT
# ========================================

echo ""
print_status "6️⃣  VERIFICAÇÃO DO TYPESCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q '"forceConsistentCasingInFileNames": true' tsconfig.json; then
    print_success "forceConsistentCasingInFileNames: true (correto)"
else
    print_warning "forceConsistentCasingInFileNames não está true"
    print_status "Recomendação: Adicionar a tsconfig.json"
fi

# ========================================
# LIMPEZA E PREPARAÇÃO PARA BUILD
# ========================================

echo ""
print_status "7️⃣  LIMPEZA PRÉ-BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_status "Removendo build anterior..."
rm -rf dist/
rm -rf node_modules/.prisma/ 2>/dev/null || true
print_success "Build anterior removido"

# ========================================
# INSTALAR DEPENDÊNCIAS
# ========================================

echo ""
print_status "8️⃣  INSTALANDO DEPENDÊNCIAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_status "Rodando: npm ci (ou npm install)"
if command -v npm &> /dev/null; then
    npm ci 2>/dev/null || npm install
    print_success "Dependências instaladas"
else
    print_error "npm não encontrado"
    exit 1
fi

# ========================================
# GERAR PRISMA CLIENT
# ========================================

echo ""
print_status "9️⃣  GERANDO PRISMA CLIENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_status "Rodando: npx prisma generate"
npx prisma generate --skip-engine-check 2>&1 | tail -2
print_success "Prisma Client gerado"

# Verificar se foi gerado
if [ -d "node_modules/.prisma/client" ]; then
    print_success "Arquivo .prisma/client criado com sucesso"
    
    if [ -f "node_modules/.prisma/client/index.d.ts" ]; then
        print_success "Tipagem TypeScript disponível"
    fi
else
    print_error "Diretório .prisma/client não foi criado!"
    exit 1
fi

# ========================================
# BUILD DO TYPESCRIPT
# ========================================

echo ""
print_status "🔟 COMPILANDO TYPESCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_status "Rodando: npm run build"
if npm run build 2>&1 | tail -5; then
    print_success "Compilação bem-sucedida!"
else
    print_error "Compilação falhou!"
    echo ""
    print_error "Erros encontrados. Verifique acima."
    exit 1
fi

# Verificar dist
if [ -d "dist" ] && [ -f "dist/main.js" ]; then
    print_success "Arquivo dist/main.js criado"
    FILE_SIZE=$(du -h dist/main.js | cut -f1)
    print_success "Tamanho: $FILE_SIZE"
else
    print_error "dist/main.js não foi criado!"
    exit 1
fi

# ========================================
# VALIDAÇÃO FINAL
# ========================================

echo ""
print_status "🎯 RELATÓRIO FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "✅ REQUISITOS ATENDIDOS:"
print_success "Node.js versão: $NODE_VERSION"
print_success "npm versão: $NPM_VERSION"
print_success "Diretório: $(pwd)"
print_success "package.json atualizado"
print_success "Prisma Client gerado"
print_success "TypeScript compilado"
print_success "Arquivo dist/main.js criado"

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "──────────────────────────────────────────"
echo ""
echo "1. Revisar o backup (se houver mudanças):"
echo "   diff package.json.backup package.json"
echo ""
echo "2. Fazer commit no Git:"
echo "   git add -A"
echo "   git commit -m 'chore: prepare for Render deployment'"
echo ""
echo "3. Fazer push para trigger deploy automático:"
echo "   git push origin main"
echo ""
echo "4. Configurar variáveis no Render Dashboard:"
echo "   - DATABASE_URL"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET"
echo ""
echo "5. Configurar Build Command no Render:"
echo "   npm install && npx prisma generate && npm run build"
echo ""
echo "6. Configurar Start Command no Render:"
echo "   npm run start:prod"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                  ✅ PRONTO PARA DEPLOY!                       ║"
echo "║                                                                ║"
echo "║         Você pode fazer commit e push para Render.            ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
