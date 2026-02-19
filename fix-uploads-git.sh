#!/bin/bash

# ================================================================
# Script para CORRIGIR .gitignore e adicionar módulo uploads
# ================================================================
# Execute este script do diretório raiz do projeto:
#   bash fix-uploads-git.sh
# ================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   Corrigindo .gitignore e adicionando uploads ao Git      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "backend/src/modules/uploads" ]; then
    echo "[ERRO] Diretório backend/src/modules/uploads não encontrado!"
    echo "       Execute este script do diretório raiz: BandeOnline/"
    exit 1
fi

echo "[1/5] Verificando status do Git..."
git status --short | head -5
echo ""

echo "[2/5] Verificando .gitignore (deve dizer /uploads/, não uploads/)..."
if grep -q "^/uploads/" backend/.gitignore; then
    echo "      ✓ .gitignore já está correto!"
else
    echo "      ✗ .gitignore ainda precisa de correção"
fi
echo ""

echo "[3/5] Adicionando arquivos do módulo uploads..."
echo "      Executando: git add -f backend/src/modules/uploads/"
git add -f backend/src/modules/uploads/
if [ $? -eq 0 ]; then
    echo "      ✓ Arquivos adicionados com sucesso!"
else
    echo "      ✗ Erro ao adicionar arquivos!"
    exit 1
fi
echo ""

echo "[4/5] Adicionando .gitignore atualizado..."
echo "      Executando: git add backend/.gitignore"
git add backend/.gitignore
if [ $? -eq 0 ]; then
    echo "      ✓ .gitignore adicionado!"
else
    echo "      ✗ Erro ao adicionar .gitignore!"
    exit 1
fi
echo ""

echo "[5/5] Verificando o que será commitado..."
echo "      Arquivos a serem adicionados:"
git status --short | grep "^A  " | sed 's/^A  /        ✓ /'
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         Tudo pronto! Agora você pode fazer:              ║"
echo "║                                                           ║"
echo "║   git commit -m \"chore: add uploads module to git\"      ║"
echo "║   git push origin main                                   ║"
echo "║                                                           ║"
echo "║         Render vai clonar com os arquivos! 🚀            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
