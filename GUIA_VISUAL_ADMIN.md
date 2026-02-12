# 🎯 Guia Visual - Dashboard Admin

## 📊 Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│  BandeOnline Admin  │  Bem-vindo, João  │  [Logout] 👤  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Dashboard] [Usuários] [Moderação] [Denúncias] [Pagos]│
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CONTEÚDO DA ABA ATIVA                                  │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Aba Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  Dashboard - Estatísticas do Sistema                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ 👥 5.234    │  │ ✅ 3.891    │  │ 📢 8.456    │    │
│  │ Total       │  │ Ativos      │  │ Anúncios    │    │
│  │ Usuários    │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  ┌─────────────┐                                        │
│  │ 💰 45.234   │                                        │
│  │ XOF         │                                        │
│  │ Receita     │                                        │
│  └─────────────┘                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 👥 Aba Usuários

```
┌──────────────────────────────────────────────────────────┐
│  Gerenciamento de Usuários                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Procurar por email ou nome...      ]  [Todos ▼]      │
│                                                          │
│  EMAIL                NAME        STATUS  PLANO  ADS    │
│  ────────────────────────────────────────────────────   │
│  user1@email.com      João Silva  Ativo  Basic   3     │
│    [Bloquear] [Verificar]                             │
│                                                          │
│  user2@email.com      Maria Santos Ativo Premium 5     │
│    [Bloquear] [Verificar]                             │
│                                                          │
│  user3@email.com      Carlos (...)  Bloqueado Basic 0  │
│    [Desbloquear]                                       │
│                                                          │
│  ───────────────────────────────────────────────────── │
│  Página 1 de 45     [Anterior] [Próximo]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📢 Aba Moderação

```
┌──────────────────────────────────────────────────────────┐
│  Moderação de Anúncios                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Pendentes ▼]                                          │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ [IMAGEM]    │  │ [IMAGEM]    │  │ [IMAGEM]    │    │
│  │ Máquina      │  │ Casa 3 Qtos │  │ Moto Honda  │    │
│  │ Costura      │  │ 250.000     │  │ 150.000     │    │
│  │ 30.000 XOF  │  │ XOF         │  │ XOF         │    │
│  │             │  │             │  │             │    │
│  │ seller@...  │  │ seller2@... │  │ seller3@... │    │
│  │ Pendente    │  │ Pendente    │  │ Pendente    │    │
│  │             │  │             │  │             │    │
│  │ [Aprovar]   │  │ [Aprovar]   │  │ [Aprovar]   │    │
│  │ [Rejeitar]  │  │ [Rejeitar]  │  │ [Rejeitar]  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🚨 Aba Denúncias

```
┌──────────────────────────────────────────────────────────┐
│  Denúncias e Reportes                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Pendentes ▼]                                          │
│                                                          │
│  REPORTADO   MOTIVO          QUEM         DATA     STA  │
│  ──────────────────────────────────────────────────    │
│  AD#2345     Spam/Fraude     user1@...    25 Jan  ⏳   │
│                                                          │
│  USER#1234   Assédio         user2@...    24 Jan  ⏳   │
│                                                          │
│  AD#2346     Conteúdo        user3@...    23 Jan  ✅   │
│              Inapropriado                               │
│                                                          │
│  USER#1235   Abuso           user4@...    22 Jan  ✅   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 💰 Aba Pagamentos

```
┌──────────────────────────────────────────────────────────┐
│  Histórico de Pagamentos                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ID TRANSAÇÃO        USUÁRIO        VALOR  STATUS  DATA │
│  ─────────────────────────────────────────────────────  │
│  TXN-2024-0001      user1@email    5.000 ✅ Completo  25/01
│                                                          │
│  TXN-2024-0002      user2@email    10.000 ✅ Completo 24/01
│                                                          │
│  TXN-2024-0003      user3@email    7.500 ⏳ Pendente 23/01
│                                                          │
│  TXN-2024-0004      user4@email    3.000 ❌ Falhou  22/01
│                                                          │
│  TXN-2024-0005      user5@email    15.000 ✅ Completo 21/01
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Paleta de Cores

### Estados

| Estado | Cor | Hex |
|--------|-----|-----|
| Sucesso | 🟢 Verde | #10b981 |
| Erro | 🔴 Vermelho | #ef4444 |
| Pendente | 🟡 Amarelo | #f59e0b |
| Informação | 🔵 Azul | #3b82f6 |
| Inativo | ⚫ Cinzento | #6b7280 |

### Botões

```
[✅ Aprovar]     Fundo verde, texto branco
[❌ Rejeitar]    Fundo vermelho, texto branco
[🔓 Desbloquear] Fundo verde, texto branco
[🔒 Bloquear]    Fundo vermelho, texto branco
[✔️ Verificar]   Fundo azul, texto branco
[🗑️ Remover]     Fundo vermelho, texto branco
```

### Status Badges

```
[Ativo]      Verde claro com texto verde escuro
[Bloqueado]  Vermelho claro com texto vermelho escuro
[Pendente]   Amarelo claro com texto amarelo escuro
[Completo]   Verde claro com texto verde escuro
[Falhou]     Vermelho claro com texto vermelho escuro
```

---

## 📱 Breakpoints Responsivos

### Desktop (1024px+)
```
[LOGO] [Menu] [Search] [Profile]
┌──────────────────────────────────┐
│ 3 colunas (Anúncios grid)        │
│ Tabelas com todas as colunas     │
│ Filtros ao lado                  │
└──────────────────────────────────┘
```

### Tablet (768px-1023px)
```
[LOGO] [Menu] [Profile]
┌──────────────────────┐
│ 2 colunas (Anúncios) │
│ Tabelas com scroll   │
│ Filtros em cima      │
└──────────────────────┘
```

### Mobile (<768px)
```
[Menu]
[LOGO]
┌────────────────┐
│ 1 coluna       │
│ Tabelas scroll │
│ Filtros stack  │
└────────────────┘
```

---

## 🎯 Fluxo de Ações

### Bloquear Usuário
```
Admin abre Usuários
    ↓
Pesquisa por email
    ↓
Encontra usuário
    ↓
Clica [Bloquear]
    ↓
Diálogo: "Confirma?"
    ↓
Clica "OK"
    ↓
API: POST /admin/users/block
    ↓
Toast: "Sucesso"
    ↓
Tabela atualiza automaticamente
    ↓
Status muda para "Bloqueado"
```

### Moderar Anúncio
```
Admin abre Moderação
    ↓
Vê anúncios pendentes
    ↓
Revisa imagens/descrição
    ↓
Clica [Aprovar] ou [Rejeitar]
    ↓
Se rejeitar, entra motivo
    ↓
Diálogo confirma
    ↓
API: POST /admin/ads/moderate
    ↓
Toast: "Anúncio {aprovado/rejeitado}"
    ↓
Grid atualiza (anúncio sai de "Pendentes")
```

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| Tab | Navega entre inputs |
| Enter | Submete confirmação |
| Esc | Cancela diálogo |
| Ctrl+F | Abre pesquisa (browser) |
| F5 | Recarrega página |
| F12 | Abre dev tools |

---

## 📊 Componentes Reutilizáveis

### Badge de Status
```jsx
<span className="px-3 py-1 rounded-full text-xs font-semibold 
       bg-{color}-100 text-{color}-800">
  {status}
</span>
```

### Card com Ícone
```jsx
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between">
    <div>{valor}</div>
    <div className="bg-{color}-100 rounded-full p-3">
      {ícone}
    </div>
  </div>
</div>
```

### Botão de Ação
```jsx
<button className="px-3 py-2 bg-{color}-500 text-white 
         rounded hover:bg-{color}-600">
  {label}
</button>
```

---

## 🔔 Notificações Toast

```
┌─────────────────────────────────┐
│ ✅ Sucesso                      │
│ Usuário bloqueado com sucesso   │
└─────────────────────────────────┘
(Desaparece após 3 segundos)

┌─────────────────────────────────┐
│ ❌ Erro                         │
│ Falha ao conectar ao servidor   │
└─────────────────────────────────┘
(Desaparece após 5 segundos)
```

---

## 📋 Campos de Entrada

### Pesquisa
```
[🔍 Procurar por email ou nome...        ]
```

### Filtro Select
```
[Todos os Usuários              ▼]
```

### Motivo de Rejeição
```
[Motivo da rejeição:
 ________________________________]
```

---

## 📈 Dados em Cards vs Tabelas

### Anúncios (Grid de Cards)
```
Melhor para: Visualização rápida, imagens, mobile
Mostra: Imagem, título, preço, vendedor, status
Ideal para: Moderação visual
```

### Usuários (Tabela)
```
Melhor para: Muitos dados, comparação, filtros
Mostra: Email, nome, status, plano, anúncios
Ideal para: Gerenciamento detalhado
```

### Pagamentos (Tabela)
```
Melhor para: Transações, histórico, auditoria
Mostra: ID, usuário, valor, tipo, status, data
Ideal para: Análise financeira
```

---

## 🚀 Performance Visual

| Elemento | Carregamento |
|----------|-------------|
| Dashboard | Imediato (4 cards) |
| Usuários | 2-3s (primeiro fetch) |
| Anúncios | 1-2s (grid com imagens) |
| Denúncias | <1s (tabela) |
| Pagamentos | <1s (tabela) |

---

## ✅ Checklist Visual

- [ ] Header com logout visível
- [ ] 5 abas claramente marcadas
- [ ] Aba ativa destacada
- [ ] Loading spinner aparece durante fetch
- [ ] Dados carregam completamente
- [ ] Botões são clicáveis
- [ ] Confirmações funcionam
- [ ] Toast aparece no topo
- [ ] Grid é responsivo
- [ ] Tabelas têm hover effect

---

Esta é uma referência visual completa do dashboard admin. Para mais detalhes técnicos, consulte DASHBOARD_ADMIN_COMPLETO.md
