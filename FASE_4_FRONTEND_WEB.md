# FASE 4 – FRONTEND WEB

## 📋 Resumo

Implementação do frontend web com Next.js, React, TypeScript e Tailwind CSS. Interface mobile-first, responsiva e otimizada para internet lenta.

---

## 1. STACK TECNOLÓGICO

### Dependências Principais

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "socket.io-client": "^4.7.0",
  "lucide-react": "^0.294.0"
}
```

---

## 2. ESTRUTURA DO PROJETO

### Pastas Principais

```
frontend/
├── app/                          # App Router (Next.js 13+)
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home
│   ├── globals.css              # Estilos globais
│   ├── (auth)/                  # Grupo de rotas autenticadas
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── ads/                     # Anúncios
│   │   ├── page.tsx            # Lista
│   │   ├── [id]/page.tsx       # Detalhe
│   │   ├── create/page.tsx     # Criar
│   │   └── [id]/edit/page.tsx  # Editar
│   ├── chat/                    # Chat
│   │   ├── page.tsx            # Lista de conversas
│   │   └── [userId]/page.tsx   # Conversa
│   ├── profile/                 # Perfil
│   │   ├── page.tsx            # Visualizar
│   │   └── edit/page.tsx       # Editar
│   ├── plans/                   # Planos
│   │   └── page.tsx            # Listar planos
│   └── dashboard/               # Dashboard
│       └── page.tsx            # Dashboard
├── components/                  # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   └── ...
├── lib/                         # Utilitários
│   ├── api.ts                  # Cliente HTTP
│   ├── auth.ts                 # Autenticação
│   ├── storage.ts              # localStorage
│   └── ...
├── hooks/                       # Custom hooks
│   ├── useAuth.ts              # Autenticação
│   ├── useAds.ts               # Anúncios
│   ├── useChat.ts              # Chat
│   └── ...
├── context/                     # Context API
│   ├── AuthContext.tsx         # Contexto de auth
│   └── ...
├── store/                       # Zustand stores
│   ├── authStore.ts            # Estado de auth
│   ├── adsStore.ts             # Estado de anúncios
│   └── ...
├── utils/                       # Funções utilitárias
│   ├── format.ts               # Formatação
│   ├── validation.ts           # Validação
│   └── ...
├── styles/                      # Estilos adicionais
│   └── ...
├── public/                      # Arquivos estáticos
│   ├── favicon.ico
│   ├── manifest.json
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── README.md
```

---

## 3. PÁGINAS IMPLEMENTADAS

### Home (/)

**Componentes:**
- Header com navegação
- Hero section com search
- Seção de features
- Seção de pricing
- Footer

**Funcionalidades:**
- Busca rápida de anúncios
- Links para login/registro
- Exibição de planos
- Links para explorar

---

## 4. PÁGINAS A IMPLEMENTAR

### Autenticação

#### Login (/login)

```typescript
// Formulário
- Email
- Senha
- "Lembrar-me"
- Link para registro
- Link para recuperar senha

// Validação
- Email válido
- Senha mínimo 6 caracteres

// Fluxo
1. Preenche formulário
2. POST /auth/login
3. Recebe token JWT
4. Armazena em localStorage
5. Redireciona para dashboard
```

#### Registro (/register)

```typescript
// Formulário
- Email
- Senha
- Confirmar senha
- Primeiro nome
- Último nome
- Telefone (opcional)

// Validação
- Email único
- Senhas iguais
- Nomes válidos

// Fluxo
1. Preenche formulário
2. POST /auth/register
3. Recebe token JWT
4. Cria subscrição FREE automática
5. Redireciona para dashboard
```

### Anúncios

#### Lista de Anúncios (/ads)

```typescript
// Componentes
- Filtros (categoria, preço, localização)
- Grid de anúncios
- Paginação
- Ordenação

// Funcionalidades
- GET /ads com filtros
- Lazy loading de imagens
- Infinite scroll (opcional)
- Favoritos (localStorage)
```

#### Detalhe do Anúncio (/ads/:id)

```typescript
// Componentes
- Galeria de fotos
- Informações do produto
- Perfil do vendedor
- Botão "Enviar Mensagem"
- Avaliações do vendedor
- Anúncios relacionados

// Funcionalidades
- GET /ads/:id
- Incrementa visualizações
- Chat direto
- Compartilhar em redes sociais
```

#### Criar Anúncio (/ads/create)

```typescript
// Formulário
- Título
- Descrição
- Categoria
- Preço
- Localização/Cidade
- Condição (novo/usado)
- Upload de fotos
- Telefone de contato

// Validação
- Campos obrigatórios
- Máximo 5 fotos
- Tamanho máximo por foto

// Fluxo
1. Verifica limite do plano
2. Preenche formulário
3. POST /ads
4. Redireciona para detalhe
```

#### Editar Anúncio (/ads/:id/edit)

```typescript
// Funcionalidades
- Pré-carrega dados
- PUT /ads/:id
- Redireciona para detalhe
```

### Chat

#### Lista de Conversas (/chat)

```typescript
// Componentes
- Lista de conversas
- Último contato
- Última mensagem
- Contagem de não lidas
- Busca de conversas

// Funcionalidades
- GET /messages/conversations
- Marca como lida ao clicar
- Delete conversa
```

#### Conversa (/chat/:userId)

```typescript
// Componentes
- Header com info do usuário
- Lista de mensagens
- Input de mensagem
- Indicador de digitação
- Status online/offline

// Funcionalidades
- GET /messages/conversation/:userId
- POST /messages
- WebSocket para tempo real
- Auto-scroll para última mensagem
```

### Perfil

#### Visualizar Perfil (/profile)

```typescript
// Componentes
- Avatar
- Nome
- Bio
- Localização
- Rating
- Número de avaliações
- Botões: Editar, Compartilhar

// Funcionalidades
- GET /users/profile
- GET /users/:id (público)
```

#### Editar Perfil (/profile/edit)

```typescript
// Formulário
- Avatar (upload)
- Primeiro nome
- Último nome
- Bio
- Localização
- Telefone
- Website
- Redes sociais

// Funcionalidades
- PUT /users/profile
- Upload de avatar
- Redireciona para perfil
```

### Planos

#### Listar Planos (/plans)

```typescript
// Componentes
- Cards de planos
- Comparação de features
- Botões de ação

// Funcionalidades
- GET /plans
- Upgrade para PRO/PREMIUM
- Redireciona para pagamento
```

### Pagamentos

#### Pagamento (/payments)

```typescript
// Componentes
- Resumo do plano
- Método de pagamento
- Confirmação

// Funcionalidades
- POST /payments/initiate
- POST /payments/confirm
- Redireciona para sucesso/erro
```

### Dashboard

#### Dashboard (/dashboard)

```typescript
// Componentes
- Resumo de anúncios
- Últimas mensagens
- Plano ativo
- Estatísticas rápidas

// Funcionalidades
- GET /subscriptions/active
- GET /ads/user/my-ads
- GET /messages/unread
```

---

## 5. COMPONENTES REUTILIZÁVEIS

### Componentes Base

```typescript
// Button
<Button variant="primary" size="lg" disabled={false}>
  Clique aqui
</Button>

// Input
<Input
  type="text"
  placeholder="Digite..."
  error="Campo obrigatório"
/>

// Select
<Select
  options={[{ value: '1', label: 'Opção 1' }]}
  value={selected}
  onChange={setSelected}
/>

// Card
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Conteúdo</Card.Body>
  <Card.Footer>Rodapé</Card.Footer>
</Card>

// Modal
<Modal isOpen={open} onClose={handleClose}>
  <Modal.Header>Título</Modal.Header>
  <Modal.Body>Conteúdo</Modal.Body>
  <Modal.Footer>
    <Button>Cancelar</Button>
    <Button>Confirmar</Button>
  </Modal.Footer>
</Modal>

// Toast
toast.success('Operação realizada com sucesso');
toast.error('Erro ao processar');
```

---

## 6. HOOKS CUSTOMIZADOS

### useAuth

```typescript
const { user, token, login, logout, isLoading } = useAuth();
```

### useAds

```typescript
const { ads, loading, error, fetchAds, createAd } = useAds();
```

### useChat

```typescript
const { messages, sendMessage, markAsRead } = useChat(userId);
```

### usePagination

```typescript
const { page, setPage, hasMore } = usePagination();
```

---

## 7. ESTADO GLOBAL (Zustand)

### Auth Store

```typescript
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Ads Store

```typescript
const useAdsStore = create((set) => ({
  ads: [],
  loading: false,
  fetchAds: async () => { ... },
}));
```

---

## 8. CLIENTE HTTP (Axios)

### Configuração

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Interceptor de requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireciona para login
    }
    return Promise.reject(error);
  }
);
```

---

## 9. VALIDAÇÃO COM ZOD

### Schemas

```typescript
// Auth
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

// Ad
const adSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  description: z.string().min(20),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});
```

---

## 10. RESPONSIVIDADE

### Breakpoints

```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### Exemplo

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 coluna em mobile, 2 em tablet, 3 em desktop */}
</div>
```

---

## 11. OTIMIZAÇÕES

### Performance

- ✅ Image optimization (Next.js Image)
- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Compressão de assets
- ✅ Cache de requisições

### SEO

- ✅ Meta tags dinâmicas
- ✅ Open Graph
- ✅ Sitemap
- ✅ Robots.txt

### PWA

- ✅ Service Worker
- ✅ Offline support
- ✅ Install prompt
- ✅ Push notifications

---

## 12. TESTES

### Testes Unitários

```bash
npm run test
```

### Testes E2E

```bash
npm run test:e2e
```

---

## 13. BUILD E DEPLOY

### Build

```bash
npm run build
```

### Produção

```bash
npm start
```

### Vercel

```bash
vercel deploy
```

---

## 14. PRÓXIMOS PASSOS

1. ✅ Estrutura do projeto
2. ✅ Página home
3. ⏳ Páginas de autenticação
4. ⏳ Páginas de anúncios
5. ⏳ Página de chat
6. ⏳ Página de perfil
7. ⏳ Página de planos
8. ⏳ Integração com backend
9. ⏳ Testes
10. ⏳ Deploy

---

**Status**: ✅ FASE 4 INICIADA - Estrutura e home completas
