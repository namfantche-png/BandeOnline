# FASE 0 – PLANEAMENTO E ARQUITETURA

## 1. VISÃO GERAL DO SISTEMA

**BissauMarket** é uma plataforma SaaS de anúncios classificados (tipo OLX) desenvolvida especificamente para o mercado africano lusófono. A plataforma conecta compradores e vendedores, permitindo a criação, visualização e negociação de produtos através de um sistema de planos por subscrição.

### Objetivos Principais

- Permitir que vendedores criem e gerenciem anúncios com base em planos de subscrição
- Facilitar a comunicação entre compradores e vendedores através de chat em tempo real
- Implementar sistema de pagamentos adaptado a Mobile Money (Orange/MTN)
- Fornecer painel administrativo para moderação e gestão
- Garantir escalabilidade, segurança e performance para internet lenta

---

## 2. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Next.js Frontend (React + Tailwind CSS)                        │
│  - Home                                                         │
│  - Lista de Anúncios                                            │
│  - Detalhe do Anúncio                                           │
│  - Criar/Editar Anúncio                                         │
│  - Chat em Tempo Real                                           │
│  - Perfil do Usuário                                            │
│  - Planos & Subscrição                                          │
│  - Admin Panel (Dashboard, Moderação, Relatórios)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO (API)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NestJS Backend                                                 │
│  ├── Auth Module (JWT, Register, Login)                         │
│  ├── User Module (Perfil, Dados)                                │
│  ├── Ad Module (CRUD, Listagem, Busca)                          │
│  ├── Category Module (Categorias)                               │
│  ├── Plan Module (Planos, Limites)                              │
│  ├── Subscription Module (Subscrição, Renovação)                │
│  ├── Payment Module (Simulação, Histórico)                      │
│  ├── Chat Module (Mensagens, WebSocket)                         │
│  ├── Notification Module (Firebase pronto)                      │
│  ├── Review Module (Avaliações)                                 │
│  ├── Admin Module (Moderação, Relatórios)                       │
│  └── Middleware (Rate Limiting, Validação, Auth)                │
│                                                                 │
│  Swagger Documentation                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (SQL)
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE DADOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PostgreSQL Database                                            │
│  ├── Users                                                      │
│  ├── Profiles                                                   │
│  ├── Plans                                                      │
│  ├── Subscriptions                                              │
│  ├── Ads                                                        │
│  ├── Categories                                                 │
│  ├── Messages                                                   │
│  ├── Reviews                                                    │
│  ├── Payments                                                   │
│  └── Admin Logs                                                 │
│                                                                 │
│  Prisma ORM (Gerenciamento de Schema)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SERVIÇOS AUXILIARES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Redis (Cache, Sessions)                                        │
│  Firebase (Notificações Push)                                   │
│  Mobile Money API (Orange/MTN)                                  │
│  WebSocket Server (Socket.io)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUXO DO USUÁRIO

### 3.1 FLUXO DO VENDEDOR

```
1. REGISTRO & AUTENTICAÇÃO
   └─ Vendedor acessa plataforma
   └─ Cria conta (email, senha, nome)
   └─ Completa perfil (foto, descrição, localização)
   └─ Recebe plano FREE automaticamente

2. VISUALIZAÇÃO DE PLANOS
   └─ Vê opções: FREE (3 anúncios), PRO (20 + destaque), PREMIUM (ilimitado + loja)
   └─ Pode fazer upgrade com Mobile Money

3. CRIAÇÃO DE ANÚNCIO
   └─ Clica em "Novo Anúncio"
   └─ Preenche: título, descrição, categoria, preço, fotos
   └─ Sistema verifica limite do plano
   └─ Se limite atingido, sugere upgrade
   └─ Anúncio publicado

4. GERENCIAMENTO DE ANÚNCIOS
   └─ Vê lista de seus anúncios
   └─ Pode editar, destacar (PRO/PREMIUM), ou remover
   └─ Vê estatísticas de visualizações

5. COMUNICAÇÃO COM COMPRADORES
   └─ Recebe mensagens de compradores interessados
   └─ Chat em tempo real
   └─ Pode bloquear usuários

6. RECEBIMENTO DE PAGAMENTOS
   └─ Integração com Mobile Money (Orange/MTN)
   └─ Recebe notificações de transações
```

### 3.2 FLUXO DO COMPRADOR

```
1. REGISTRO & AUTENTICAÇÃO
   └─ Comprador acessa plataforma
   └─ Cria conta (email, senha, nome)
   └─ Completa perfil

2. BUSCA DE ANÚNCIOS
   └─ Acessa home com anúncios em destaque
   └─ Busca por categoria, localização, preço
   └─ Filtra resultados

3. VISUALIZAÇÃO DE DETALHE
   └─ Clica em anúncio
   └─ Vê fotos, descrição, preço, perfil do vendedor
   └─ Vê avaliações do vendedor
   └─ Pode compartilhar anúncio

4. CONTATO COM VENDEDOR
   └─ Clica em "Enviar Mensagem"
   └─ Inicia chat em tempo real
   └─ Negocia preço/detalhes

5. FINALIZAÇÃO DA COMPRA
   └─ Combina com vendedor (local, horário)
   └─ Pode fazer pagamento via Mobile Money (opcional)
   └─ Deixa avaliação do vendedor

6. DENÚNCIA (se necessário)
   └─ Pode denunciar anúncio ou usuário suspeito
   └─ Admin revisa e toma ação
```

### 3.3 FLUXO DO ADMINISTRADOR

```
1. ACESSO AO PAINEL
   └─ Login com credenciais admin
   └─ Acessa dashboard

2. MODERAÇÃO DE ANÚNCIOS
   └─ Vê anúncios denunciados
   └─ Aprova ou remove anúncios
   └─ Bloqueia usuários infratores

3. GESTÃO DE USUÁRIOS
   └─ Vê lista de usuários
   └─ Pode suspender/bloquear contas
   └─ Vê histórico de atividades

4. GESTÃO DE PLANOS
   └─ Cria/edita planos
   └─ Define limites e preços
   └─ Vê subscrições ativas

5. RELATÓRIOS
   └─ Visualiza estatísticas de uso
   └─ Receita de subscrições
   └─ Usuários ativos
   └─ Anúncios por categoria
```

---

## 4. DEFINIÇÃO DO MVP (Minimum Viable Product)

### 4.1 FUNCIONALIDADES CORE (OBRIGATÓRIAS)

#### Autenticação & Usuários
- ✅ Registro e login com JWT
- ✅ Perfil de usuário (foto, descrição, localização)
- ✅ Recuperação de senha

#### Anúncios
- ✅ CRUD completo de anúncios
- ✅ Upload de fotos
- ✅ Categorização
- ✅ Busca e filtros básicos
- ✅ Controle de limite por plano

#### Planos & Subscrição
- ✅ 3 planos: FREE, PRO, PREMIUM
- ✅ Simulação de pagamento (mock)
- ✅ Histórico de subscrições
- ✅ Renovação automática

#### Chat & Comunicação
- ✅ Chat em tempo real entre comprador e vendedor
- ✅ WebSocket para mensagens
- ✅ Notificações de novas mensagens

#### Admin
- ✅ Dashboard básico
- ✅ Moderação de anúncios
- ✅ Gestão de usuários
- ✅ Relatórios simples

#### Segurança
- ✅ Rate limiting
- ✅ Validação de inputs
- ✅ Proteção contra spam
- ✅ Logs de atividades

### 4.2 FUNCIONALIDADES FUTURAS (POST-MVP)

- Mobile Money real (Orange/MTN)
- Notificações push (Firebase)
- Sistema de avaliações completo
- Loja virtual (PREMIUM)
- Recomendações por IA
- App mobile (React Native)
- Integração com redes sociais

---

## 5. STACK TECNOLÓGICO

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Next.js | 14+ |
| **Frontend** | React | 18+ |
| **Frontend** | Tailwind CSS | 3+ |
| **Backend** | Node.js | 20+ |
| **Backend** | NestJS | 10+ |
| **Banco de Dados** | PostgreSQL | 15+ |
| **ORM** | Prisma | 5+ |
| **Autenticação** | JWT | - |
| **Real-time** | Socket.io | 4+ |
| **Cache** | Redis | 7+ |
| **Containerização** | Docker | - |
| **Reverse Proxy** | Nginx | - |
| **API Docs** | Swagger/OpenAPI | 3.0 |

---

## 6. CRONOGRAMA DE DESENVOLVIMENTO

| Fase | Descrição | Duração Estimada |
|------|-----------|------------------|
| **FASE 0** | Planeamento e Arquitetura | 1 entrega |
| **FASE 1** | Backend Core | 2-3 entregas |
| **FASE 2** | SaaS e Pagamentos | 1-2 entregas |
| **FASE 3** | Chat e Notificações | 1-2 entregas |
| **FASE 4** | Frontend Web | 2-3 entregas |
| **FASE 5** | Admin Panel | 1-2 entregas |
| **FASE 6** | Segurança e Performance | 1 entrega |
| **FASE 7** | Deploy | 1 entrega |

---

## 7. CONSIDERAÇÕES ESPECIAIS

### Mercado Africano Lusófono

- **Internet Lenta**: Interface otimizada, imagens comprimidas, lazy loading
- **Mobile Money**: Preparado para Orange Money e MTN Mobile Money
- **Localização**: Suporte para múltiplas moedas (XOF, AOA, etc.)
- **Acessibilidade**: Design simples e intuitivo

### Escalabilidade

- Arquitetura modular com NestJS
- Cache com Redis
- Banco de dados normalizado
- Preparado para microserviços futuros

### Segurança

- JWT para autenticação
- Validação de inputs em todas as camadas
- Rate limiting
- Proteção contra CSRF
- Logs de auditoria

---

## 8. PRÓXIMOS PASSOS

Após aprovação desta arquitetura, procederemos com:

1. **FASE 1**: Inicializar projeto NestJS + PostgreSQL + Prisma
2. Criar modelos de dados
3. Implementar autenticação JWT
4. Desenvolver CRUD de anúncios
5. Continuar com as fases subsequentes

---

**Status**: ✅ FASE 0 COMPLETA - PRONTO PARA FASE 1
