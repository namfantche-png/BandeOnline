# 🔍 DIAGNÓSTICO: Admin Dashboard Inacessível

## 📋 Problema

Admin não consegue acessar seu dashboard para fazer gestão do sistema.

## 🔎 Investigação

### Backend
✅ **Admin Controller** - Endpoints estão corretos
✅ **Admin Guard** - Valida role=admin corretamente  
✅ **Admin Service** - Métodos estão implementados
✅ **Auth Service** - Retorna role no `/auth/me`

### Frontend
❌ **Admin Page** - Problemas encontrados:

1. **useEffect dependências incompletas**
   - Quando `user` muda, apenas checa role
   - Não seta `loading=false` se user não é admin
   - Dashboard fica carregando infinitamente

2. **Erro ao carregar stats**
   - setLoading nunca é chamado em certos cenários
   - Mensagem de erro é genérica
   - Sem informação de debug

3. **Navegação defeituosa**
   - Redireciona para `/` mas não volta
   - Estado anterior da página permanece
   - Usuário fica confuso

---

## ✅ CORREÇÃO IMPLEMENTADA

### Frontend: admin/page.tsx

**Problema 1: useEffect incompleto**
```typescript
// ANTES: setLoading nunca é chamado se user não é admin
useEffect(() => {
  const fetchStats = async () => {
    // ...
  };
  if (user?.role === 'admin') {
    fetchStats();  // ← mas e se não for admin?
  }
}, [user]);

// DEPOIS: trata todos os cenários
useEffect(() => {
  const fetchStats = async () => {
    try {
      // ...
    } finally {
      setLoading(false);  // ← sempre chamado
    }
  };
  
  if (user?.role === 'admin') {
    setLoading(true);
    fetchStats();
  } else if (!authLoading && user) {
    // Usuário existe mas não é admin
    setLoading(false);  // ← importantissimo!
  }
}, [user, authLoading]);
```

**Problema 2: Erro genérico**
```typescript
// ANTES: Toast desaparece rápido, sem contexto
if (error) {
  return (
    <Toast 
      type="error"
      message={error}
    />
  );
}

// DEPOIS: Página de erro clara com soluções
if (error) {
  return (
    <div className="...">
      <h2>Erro ao Carregar Dashboard</h2>
      <p>{error}</p>
      <ul>
        <li>Você não tem permissão de administrador</li>
        <li>Servidor não está respondendo</li>
        <li>Token expirou - faça login novamente</li>
      </ul>
      <button onClick={() => router.push('/login')}>
        Ir para Login
      </button>
    </div>
  );
}
```

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Login como Admin
1. Acessar `http://localhost:3001/login`
2. Email: `admin@bissaumarket.com`
3. Senha: (verificar no BD ou SQL script)
4. ✅ Deve fazer login com sucesso

### Teste 2: Acessar Dashboard
1. Após login, ir para `http://localhost:3001/admin`
2. ✅ Deve carregar dashboard com stats

### Teste 3: Se não for Admin
1. Criar usuário comum
2. Fazer login com usuário comum
3. Tentar acessar `http://localhost:3001/admin`
4. ✅ Deve mostrar erro claro e opção de logout

---

## 🐛 Como Diagnosticar Mais

### Se dashboard não carregar:
1. **Abrir DevTools (F12)**
2. **Ir para Console**
3. **Ver logs de erro**
4. **Verificar Network tab → XHR → /admin/dashboard**
   - Status code?
   - Response body?
   - Authorization header presente?

### Se problema for no backend:
```bash
# Backend logs devem mostrar qual guard está bloqueando
# Procurar por:
# - "Acesso negado"
# - "Usuário não encontrado"
# - "Acesso restrito a administradores"
# - "Conta bloqueada"
```

---

## ✨ Próximos Passos

1. ✅ Frontend corrigido
2. [ ] Testar login como admin
3. [ ] Testar acesso ao dashboard
4. [ ] Se ainda falhar → revisar BD (usuário admin existe?)
5. [ ] Se BD OK → revisar guard (logs do backend)

---

**Documentação:** 25 de Janeiro de 2026
