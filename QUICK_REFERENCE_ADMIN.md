# Quick Reference - Admin Dashboard

## 🎯 Acesso

**URL:** `http://localhost:3000/admin`  
**Requisito:** Estar logado com role='admin'

---

## 📋 Seções Disponíveis

| Seção | Função | Atalho |
|-------|--------|--------|
| Dashboard | Ver estatísticas do sistema | Aba "Dashboard" |
| Usuários | Gerenciar/bloquear usuários | Aba "Usuários" |
| Moderação | Aprovar/rejeitar anúncios | Aba "Moderação" |
| Denúncias | Ver reportes pendentes | Aba "Denúncias" |
| Pagamentos | Consultar transações | Aba "Pagamentos" |

---

## 🔧 Operações Rápidas

### Bloquear Usuário
```
1. Usuários → Procurar email
2. Clique "Bloquear"
3. Confirmar
```

### Aprovar Anúncio
```
1. Moderação → Anúncios Pendentes
2. Clique "Aprovar"
3. Automático!
```

### Rejeitar Anúncio
```
1. Moderação → Anúncios Pendentes
2. Clique "Rejeitar"
3. Entra motivo (ex: "Spam")
```

### Ver Pagamento
```
1. Pagamentos
2. Procura na tabela
3. Clica na linha para ver detalhes
```

---

## 🎨 Cores e Significados

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Aprovar, Desbloquear, Verificar |
| 🔴 Vermelho | Rejeitar, Bloquear, Remover |
| 🔵 Azul | Informação, Verificar |
| 🟡 Amarelo | Pendente, Atenção |
| ⚫ Cinzento | Inativo, Secundário |

---

## 🔍 Filtros

### Usuários
- **Pesquisa:** Email ou nome (real-time)
- **Status:** Todos / Ativos / Bloqueados

### Anúncios
- **Status:** Pendentes / Ativos / Rejeitados

### Denúncias
- **Status:** Pendentes / Resolvidas

### Pagamentos
- Sem filtros (lista tudo)

---

## ⌨️ Inputs

### Pesquisa de Usuários
- Digite email ou nome
- Mínimo: 0 caracteres
- Máximo: ilimitado
- Atualiza automaticamente

### Inputs de Motivo
- Rejeitar anúncio: Entra motivo
- Bloqueio de usuário: Automático (sem motivo)

---

## 📊 Dados Exibidos

### Dashboard
- Total de Usuários
- Usuários Ativos
- Total de Anúncios
- Receita Total

### Usuários
- Email
- Nome Completo
- Status (Ativo/Bloqueado)
- Plano Atual
- Número de Anúncios

### Anúncios
- Imagem Principal
- Título
- Descrição (resumida)
- Preço
- Email do Vendedor
- Status

### Denúncias
- ID Reportado
- Motivo
- Quem Reportou
- Data
- Status

### Pagamentos
- ID da Transação
- Usuário
- Valor
- Tipo
- Status
- Data

---

## ⚠️ Confirmações Necessárias

Estas ações pedem confirmação:
- ✓ Bloquear usuário
- ✓ Desbloquear usuário
- ✓ Rejeitar anúncio
- ✓ Remover anúncio

---

## 🔄 Atualização de Dados

- **Automática:** Após ação bem-sucedida
- **Manual:** Trocar de filtro/página
- **Refresh:** Recarregar navegador (F5)

---

## 📱 Responsividade

- ✓ Desktop: Layout completo
- ✓ Tablet: Grid ajustado
- ✓ Mobile: Tabelas com scroll horizontal

---

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Não autorizado" | Não é admin | Login com conta admin |
| "Falha ao carregar" | Rede offline | Verificar internet |
| "404 Not Found" | API não existe | Verificar backend está rodando |
| "CORS error" | Configuração CORS | Verificar corsOrigin no backend |

---

## 💡 Dicas

- Use pesquisa em vez de scroll para encontrar usuários
- Filtros carregam dados novos (não cache)
- Paginação vai até a última página disponível
- Toast aparece no canto superior direito
- Abas salvam estado (não perdem dados ao trocar)

---

## 🔗 Endpoints Utilizados

```
GET  /admin/dashboard          → Estatísticas
GET  /admin/users              → Lista usuários
POST /admin/users/block        → Bloquear
POST /admin/users/:id/unblock  → Desbloquear
POST /admin/users/:id/verify   → Verificar
GET  /admin/ads                → Lista anúncios
POST /admin/ads/moderate       → Moderar
DELETE /admin/ads/:id          → Remover
GET  /admin/reports            → Denúncias
GET  /admin/payments           → Pagamentos
```

---

## 📞 Troubleshooting

### Dashboard não carrega
1. Verificar se está logado (icon de perfil no topo)
2. Verificar se role='admin' (verificar token no localStorage)
3. Recarregar página (Ctrl+F5)
4. Verificar console (F12 → Console)

### Ação não funciona
1. Verificar internet (Network tab)
2. Verificar resposta da API (Status 200/201)
3. Validar dados enviados (Payload correto)
4. Tentar novamente ou recarregar

### Toast não aparece
1. Verificar se há espaço na tela
2. Revisar console para erros JavaScript
3. Verificar se notificações estão bloqueadas (não é toast do browser)

---

Última atualização: 2024
