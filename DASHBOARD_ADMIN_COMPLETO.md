# Dashboard Admin Completo

## 🎯 Funcionalidades Implementadas

O admin agora tem um dashboard completo com 5 seções principais para gerenciar o sistema:

### 1. **Dashboard (Inicial)**
- Estatísticas do sistema em tempo real:
  - Total de usuários registados
  - Usuários ativos
  - Total de anúncios
  - Receita total gerada

### 2. **Gerenciamento de Usuários** 👥
- **Listar usuários** com paginação
- **Pesquisa** por email ou nome
- **Filtros** de status:
  - Todos os usuários
  - Usuários ativos
  - Usuários bloqueados
- **Ações por usuário:**
  - ✅ Verificar usuário
  - 🔒 Bloquear usuário
  - 🔓 Desbloquear usuário
- **Informações exibidas:**
  - Email
  - Nome completo
  - Status (Ativo/Bloqueado)
  - Plano atual
  - Número de anúncios

### 3. **Moderação de Anúncios** 📢
- **Filtros por status:**
  - Anúncios pendentes (aguardando aprovação)
  - Anúncios ativos (aprovados)
  - Anúncios rejeitados
- **Visualização em grid:**
  - Imagem do anúncio
  - Título e descrição
  - Preço
  - Email do vendedor
  - Status atual
- **Ações:**
  - ✅ Aprovar anúncio
  - ❌ Rejeitar anúncio (com motivo)
  - 🗑️ Remover anúncio

### 4. **Denúncias e Reportes** 🚨
- **Tabela de denúncias** com:
  - O que foi reportado (ID do anúncio ou usuário)
  - Motivo da denúncia
  - Quem fez a denúncia
  - Data do reporte
  - Status (Pendente/Resolvido)
- **Filtros:**
  - Denúncias pendentes
  - Denúncias resolvidas

### 5. **Histórico de Pagamentos** 💰
- **Tabela completa** de transações com:
  - ID da transação
  - Usuário que fez o pagamento
  - Valor da transação
  - Tipo de pagamento
  - Status (Completo/Pendente/Falhou)
  - Data da transação

---

## 🔐 Segurança

- ✅ **Autenticação obrigatória** - Apenas usuários logados
- ✅ **Validação de role** - Apenas admins (role='admin') podem acessar
- ✅ **Redirecionamento automático** - Usuários não-admin são redirecionados para home
- ✅ **Bearer token** - Todos os requests usam autenticação JWT

---

## 🔗 Endpoints API Utilizados

### Usuários
```
GET  /admin/users          - Listar usuários com filtros e paginação
POST /admin/users/block    - Bloquear um usuário
POST /admin/users/:id/unblock  - Desbloquear um usuário
POST /admin/users/:id/verify   - Verificar um usuário
```

### Anúncios
```
GET  /admin/ads            - Listar anúncios com filtro de status
POST /admin/ads/moderate   - Aprovar/Rejeitar anúncio
DELETE /admin/ads/:id      - Remover anúncio
```

### Denúncias
```
GET  /admin/reports        - Listar denúncias com filtro de status
```

### Pagamentos
```
GET  /admin/payments       - Listar histórico de pagamentos
```

### Dashboard
```
GET  /admin/dashboard      - Obter estatísticas do sistema
```

---

## 🎨 Interface

### Layout
- **Header:** Título, nome do admin, logout
- **Tabs:** Navegação entre as 5 seções
- **Cards/Tabelas:** Exibição de dados com styling consistente
- **Filtros:** Inputs de busca e dropdowns de filtro
- **Paginação:** Navegação entre páginas de dados
- **Ações:** Botões coloridos (verde=aprovar, vermelho=rejeitar, azul=informação)

### Cores
- **Verde:** Ações positivas (aprovar, desbloquear, verificar)
- **Vermelho:** Ações perigosas (bloquear, rejeitar, remover)
- **Azul:** Ações informativas
- **Amarelo:** Status pendente
- **Cinzento:** Dados secundários

---

## 📱 Estados da UI

### Loading
- Mostra componente `<Loading />` durante o fetch de dados
- Impede interações até que os dados sejam carregados

### Erros
- Toast de erro com mensagem específica do servidor
- Mensagem de erro em box vermelha nas seções
- Opção de recarregar manualmente

### Confirmações
- Dialogs do navegador (confirm) para ações irreversíveis
- Bloquear usuário
- Desbloquear usuário
- Rejeitar anúncio
- Remover anúncio
- Remover anúncio permanentemente

### Sucesso
- Toast com mensagem de sucesso
- Refetch automático dos dados
- Atualização imediata da UI

---

## 🚀 Como Usar

### 1. Acessar o Dashboard
1. Login na plataforma com conta admin
2. Navegar para `/admin`
3. Sistema valida automaticamente permissões

### 2. Gerenciar Usuários
1. Ir para aba "Usuários"
2. Usar filtros e pesquisa para encontrar usuários
3. Clicar em "Bloquear", "Desbloquear" ou "Verificar"
4. Confirmar ação no diálogo

### 3. Moderar Anúncios
1. Ir para aba "Moderação"
2. Ver anúncios pendentes (default)
3. Clicar "Aprovar" ou "Rejeitar"
4. Se rejeitar, informar motivo
5. Visualizar anúncios ativos ou rejeitados em outros filtros

### 4. Revisar Denúncias
1. Ir para aba "Denúncias"
2. Ver denúncias pendentes
3. Investigar casos
4. Sistema mostra de automático: quem reportou, o quê foi reportado e quando

### 5. Consultar Pagamentos
1. Ir para aba "Pagamentos"
2. Ver todo o histórico de transações
3. Informações: ID, usuário, valor, tipo, status, data

---

## 🔄 Fluxo de Dados

```
Admin abre dashboard
    ↓
AuthContext verifica se está logado
    ↓
Valida se role === 'admin'
    ↓
Se não é admin → Redireciona para home
    ↓
Se é admin → Carrega dados do backend
    ↓
API retorna dados (com filtros/paginação)
    ↓
UI renderiza seção ativa
    ↓
Admin pode filtrar/pesquisar → Refetch com novos parâmetros
    ↓
Admin pode executar ações → API é chamada
    ↓
Toast de sucesso/erro aparece
    ↓
Dados são recarregados automaticamente
```

---

## 📊 Estrutura de Componentes

```
AdminDashboard (Componente Principal)
├── UsersTab
│   ├── Filtro de pesquisa
│   ├── Filtro de status
│   ├── Tabela de usuários
│   ├── Paginação
│   └── Botões de ação
├── AdsTab
│   ├── Filtro de status
│   ├── Grid de anúncios
│   └── Botões de ação
├── ReportsTab
│   ├── Filtro de status
│   ├── Tabela de denúncias
│   └── Informações detalhadas
└── PaymentsTab
    ├── Tabela de pagamentos
    └── Informações de transação
```

---

## ⚙️ Configurações

### Paginação
- **Limite padrão:** 10 usuários por página
- **Página inicial:** 1
- **Total de páginas:** Calculado dinamicamente

### Timeouts
- **Toast sucesso:** 3 segundos (automático)
- **Toast erro:** 5 segundos (automático)
- **Fetch timeout:** Configurado globalmente no Axios

### Validações
- **Pesquisa:** Mínimo 0 caracteres (real-time)
- **Filtros:** Dropdowns com opções pré-definidas
- **Confirmações:** Dialogs do navegador (confirm)

---

## 🐛 Tratamento de Erros

Cada seção trata erros de forma consistente:

1. **Durante o fetch:**
   - Mostra `<Loading />` inicialmente
   - Se erro → Exibe mensagem de erro em box vermelho
   - Mensagem vem do backend quando possível

2. **Nas ações:**
   - Toast de erro com detalhes
   - Ação não refaz o fetch se falhar
   - Admin pode tentar novamente

3. **Rede indisponível:**
   - Erro do Axios é capturado
   - Mensagem genérica é exibida se backend não responder

---

## 📝 Notas Importantes

- Todos os requests usam o **Bearer token** do localStorage automaticamente
- **Não há cache** - Dados são sempre frescos (fetch on demand)
- **Sem reloads** - Todas as operações são assíncronas
- **Responsive** - UI adapta-se a diferentes tamanhos de tela
- **Acessibilidade** - Botões, inputs e tabelas seguem padrões WCAG

---

## 🎓 Exemplos de Uso

### Bloquear um usuário spam
1. Admin → Usuários → Pesquisa por email
2. Encontra o usuário → Clica "Bloquear"
3. Confirma no diálogo
4. Toast: "Sucesso: Usuário bloqueado com sucesso"
5. Tabela atualiza automaticamente

### Moderar anúncio questionável
1. Admin → Moderação → Anúncios pendentes
2. Visualiza imagens e descrição
3. Clica "Rejeitar"
4. Entra motivo (ex: "Conteúdo inapropriado")
5. Toast: "Sucesso: Anúncio rejeitado com sucesso"

### Analisar receita
1. Admin → Pagamentos
2. Vê tabela com todas as transações
3. Filtra por período se necessário
4. Verifica status de cada pagamento

---

## 🔮 Melhorias Futuras

- [ ] Exportar dados para CSV/PDF
- [ ] Gráficos de crescimento
- [ ] Agendamento de ações (ex: desativar ads em 7 dias)
- [ ] Notificações push para admins
- [ ] Auditoria de ações administrativas
- [ ] Two-factor authentication para admin
- [ ] Logs detalhados de todas as ações

---

## 📞 Suporte

Se encontrar bugs ou tiver sugestões:
1. Verificar console do navegador (F12) para erros
2. Verificar network tab para requests falhados
3. Consultar logs do backend em `/logs`
4. Documentar erro com screenshots/passos para reproduzir
