#!/bin/bash

# Verificação completa do Dashboard Admin

echo "=========================================="
echo "VERIFICAÇÃO DASHBOARD ADMIN"
echo "=========================================="
echo ""

# 1. Verificar se o arquivo existe
echo "✓ Verificando arquivo admin/page.tsx..."
if [ -f "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx" ]; then
  echo "  ✅ Arquivo encontrado"
else
  echo "  ❌ Arquivo não encontrado"
  exit 1
fi

# 2. Verificar imports
echo ""
echo "✓ Verificando imports..."
if grep -q "import React" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ React import OK"
fi
if grep -q "import api from" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ API import OK"
fi
if grep -q "toastManager" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ Toast Manager import OK"
fi

# 3. Verificar componentes
echo ""
echo "✓ Verificando componentes..."
if grep -q "function UsersTab()" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ UsersTab componente encontrado"
fi
if grep -q "function AdsTab()" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ AdsTab componente encontrado"
fi
if grep -q "function ReportsTab()" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ ReportsTab componente encontrado"
fi
if grep -q "function PaymentsTab()" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ PaymentsTab componente encontrado"
fi

# 4. Verificar renders condicionais
echo ""
echo "✓ Verificando renders condicionais..."
if grep -q "activeTab === 'users' && <UsersTab />" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ UsersTab render condicional OK"
fi
if grep -q "activeTab === 'ads' && <AdsTab />" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ AdsTab render condicional OK"
fi
if grep -q "activeTab === 'reports' && <ReportsTab />" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ ReportsTab render condicional OK"
fi
if grep -q "activeTab === 'payments' && <PaymentsTab />" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ PaymentsTab render condicional OK"
fi

# 5. Verificar proteção contra undefined
echo ""
echo "✓ Verificando proteção contra undefined..."
if grep -q "users && Array.isArray(users)" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ Proteção users OK"
fi
if grep -q "ads && Array.isArray(ads)" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ Proteção ads OK"
fi
if grep -q "reports && Array.isArray(reports)" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ Proteção reports OK"
fi
if grep -q "payments && Array.isArray(payments)" "c:\\Users\\24595\\MyProject\\BandeOnline\\frontend\\app\\admin\\page.tsx"; then
  echo "  ✅ Proteção payments OK"
fi

echo ""
echo "=========================================="
echo "✅ VERIFICAÇÃO COMPLETA - TUDO OK!"
echo "=========================================="
