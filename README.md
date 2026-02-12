# BissauMarket - Plataforma SaaS de Anúncios Classificados v1.1

**BissauMarket** é uma plataforma SaaS de anúncios classificados (semelhante à OLX) focada no mercado da Guiné-Bissau e outros países africanos de língua portuguesa. O projeto foi desenvolvido como um MVP completo, funcional, escalável e pronto para produção, agora atualizado com um novo conjunto de funcionalidades.

## ✨ Funcionalidades Implementadas

| Categoria | Funcionalidade | Status |
|---|---|---|
| **Core** | Autenticação com JWT (Access + Refresh Token) | ✅ Completo |
| | Sistema de Anúncios (CRUD, filtros, busca) | ✅ Completo |
| | Categorias e Subcategorias | ✅ Completo |
| | Upload de Imagens (Cloudinary) | ✅ Completo |
| | Expiração Automática de Anúncios | ✅ Completo |
| **SaaS** | 3 Planos de Subscrição (FREE, PRO, PREMIUM) | ✅ Completo |
| | Pagamentos (Mock para Orange Money/MTN) | ✅ Completo |
| | Geração de Faturas/Recibos | ✅ Completo |
| | Renovação Automática de Subscrições | ✅ Completo |
| **Comunidade** | Chat entre Usuários (REST API) | ✅ Completo |
| | Sistema de Avaliações (Reviews) de Vendedores | ✅ Completo |
| | Sistema de Denúncias com Moderação | ✅ Completo |
| **Admin** | Painel de Administração Completo | ✅ Completo |
| | Gestão de Usuários, Anúncios, Categorias, etc. | ✅ Completo |
| | Dashboard com Estatísticas | ✅ Completo |
| **Segurança** | Rate Limiting (Throttle) | ✅ Completo |
| | Headers de Segurança (Helmet) | ✅ Completo |
| | Sanitização de Inputs | ✅ Completo |
| | CORS Configurável | ✅ Completo |
| | Guards de Rota (Admin, Auth) | ✅ Completo |
| **Infra** | Progressive Web App (PWA) | ✅ Completo |
| | Tarefas Agendadas (Cron Jobs) | ✅ Completo |
| | Docker e Docker Compose | ✅ Completo |

## 🚀 Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | Next.js, React, TypeScript | Framework para renderização SSR e SSG, com tipagem estática. |
| | Tailwind CSS | Framework CSS para estilização rápida e responsiva. |
| | Axios | Cliente HTTP para comunicação com o backend. |
| | Context API | Gerenciamento de estado global (autenticação). |
| **Backend** | NestJS, Node.js, TypeScript | Framework backend para APIs eficientes e escaláveis. |
| | PostgreSQL | Banco de dados relacional para persistência dos dados. |
| | Prisma | ORM para interação com o banco de dados. |
| | JWT (JSON Web Tokens) | Para autenticação segura e stateless. |
| | Swagger (OpenAPI) | Documentação automática da API. |
| | Cloudinary | Para armazenamento e otimização de imagens. |
| **Infraestrutura** | Docker, Docker Compose | Containerização da aplicação para desenvolvimento e produção. |
| | Nginx | Proxy reverso para o frontend e backend. |

## 📁 Estrutura do Projeto

```
/home/ubuntu/BissauMarket
├── backend/         # Projeto NestJS (API)
├── docker/          # Dockerfiles para backend e frontend
├── frontend/        # Projeto Next.js (Web App)
├── .env.example     # Exemplo de variáveis de ambiente
├── docker-compose.yml # Orquestração dos containers
└── README.md        # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos

- Docker
- Docker Compose

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis, especialmente as do **Cloudinary** (`CLOUDINARY_URL`) e do banco de dados.

```bash
cp .env.example .env
```

### 2. Executar com Docker Compose (Recomendado)

Este comando irá construir as imagens e iniciar todos os serviços (banco de dados, backend, frontend e nginx).

```bash
docker-compose up -d --build
```

### 3. Acessar a Aplicação

- **Frontend (Web App)**: [http://localhost:3001](http://localhost:3001)
- **Backend (API)**: [http://localhost:3000](http://localhost:3000)
- **Documentação da API (Swagger)**: [http://localhost:3000/api](http://localhost:3000/api)

## 📝 Documentação Adicional

- **Backend**: A documentação detalhada da API, incluindo todos os endpoints, está disponível no [Swagger](http://localhost:3000/api) após a execução do projeto.
- **Frontend**: O código do frontend é auto-documentado através do uso de componentes bem definidos e TypeScript.
- **Guias de Fase**: Os documentos `FASE_*.md` no repositório detalham o desenvolvimento de cada parte do projeto.

## 👨‍💻 Autor

- **Manus AI**
