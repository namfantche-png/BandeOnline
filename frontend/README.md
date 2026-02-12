# BissauMarket Frontend

Frontend web da plataforma SaaS de anúncios classificados BissauMarket.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14+
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io
- **Icons**: Lucide React

## 📁 Estrutura de Pastas

```
frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página home
│   ├── (auth)/            # Grupo de rotas autenticadas
│   ├── ads/               # Páginas de anúncios
│   ├── chat/              # Páginas de chat
│   └── profile/           # Páginas de perfil
├── components/            # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ...
├── lib/                   # Utilitários
│   ├── api.ts            # Cliente HTTP
│   ├── auth.ts           # Autenticação
│   └── ...
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useAds.ts
│   └── ...
├── context/              # Context API
│   └── AuthContext.tsx
├── styles/               # Estilos globais
│   └── globals.css
├── utils/                # Funções utilitárias
│   ├── format.ts
│   └── validation.ts
├── public/               # Arquivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

3. **Iniciar servidor de desenvolvimento**
```bash
npm run dev
```

Acesse http://localhost:3001

## 📚 Páginas Principais

### Públicas
- `/` - Home
- `/login` - Login
- `/register` - Registro
- `/ads` - Lista de anúncios
- `/ads/:id` - Detalhe do anúncio

### Autenticadas
- `/dashboard` - Dashboard
- `/ads/create` - Criar anúncio
- `/ads/my-ads` - Meus anúncios
- `/ads/:id/edit` - Editar anúncio
- `/chat` - Chat
- `/chat/:userId` - Conversa
- `/profile` - Perfil
- `/profile/edit` - Editar perfil
- `/plans` - Planos
- `/payments` - Pagamentos

## 🔐 Autenticação

### Fluxo de Login

```typescript
1. Usuário preenche email e senha
   ↓
2. POST /auth/login
   ↓
3. Recebe token JWT
   ↓
4. Armazena em localStorage
   ↓
5. Redireciona para dashboard
```

### Proteção de Rotas

```typescript
// Componente ProtectedRoute
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 🎨 Temas e Cores

### Paleta de Cores (Azul)

```css
primary-50: #f0f9ff
primary-100: #e0f2fe
primary-200: #bae6fd
primary-300: #7dd3fc
primary-400: #38bdf8
primary-500: #0ea5e9 (principal)
primary-600: #0284c7
primary-700: #0369a1
primary-800: #075985
primary-900: #0c3d66
```

## 📱 Responsividade

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Otimizado para internet lenta

## 🚀 Build e Deploy

### Build para produção
```bash
npm run build
npm start
```

### Variáveis de Ambiente Produção

```
NEXT_PUBLIC_API_URL=https://api.bissaumarket.com
NEXT_PUBLIC_SOCKET_URL=https://bissaumarket.com
NODE_ENV=production
```

## 📝 Scripts

```bash
npm run dev           # Iniciar em desenvolvimento
npm run build         # Build para produção
npm start             # Iniciar servidor de produção
npm run lint          # Executar linter
npm run type-check    # Verificar tipos TypeScript
```

## 🧪 Testes

```bash
npm run test          # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Cobertura
```

## 📦 Dependências Principais

### Core
- **next**: Framework React
- **react**: Biblioteca UI
- **typescript**: Tipagem estática

### Styling
- **tailwindcss**: Utility-first CSS
- **tailwind-merge**: Merge de classes Tailwind

### Forms
- **react-hook-form**: Gerenciamento de formulários
- **zod**: Validação de schemas

### HTTP
- **axios**: Cliente HTTP

### State
- **zustand**: State management leve

### Real-time
- **socket.io-client**: WebSockets

### UI
- **lucide-react**: Ícones

## 🔗 Integração com Backend

### Cliente API

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemplo de Uso

```typescript
// Listar anúncios
const response = await api.get('/ads', {
  params: { page: 1, limit: 20 }
});

// Criar anúncio
const response = await api.post('/ads', {
  title: 'Produto X',
  description: '...',
  price: 1000,
  categoryId: '...'
});
```

## 🚀 PWA (Progressive Web App)

O frontend é preparado para funcionar como PWA:
- Service Workers
- Offline support
- Install prompt
- Push notifications

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Status**: ✅ FASE 4 INICIADA - Frontend estruturado e página home completa
