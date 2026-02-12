# Guia de Execução - BissauMarket v1.1

Este guia fornece as instruções passo a passo para configurar e executar o projeto BissauMarket em um ambiente de desenvolvimento local usando Docker.

## Pré-requisitos

- **Docker**: [Instruções de instalação](https://docs.docker.com/get-docker/)
- **Docker Compose**: Geralmente vem com a instalação do Docker Desktop. [Instruções de instalação](https://docs.docker.com/compose/install/)
- **Git**: [Instruções de instalação](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Passo 1: Clonar o Repositório

Abra seu terminal e clone o repositório do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd BissauMarket
```

## Passo 2: Configurar Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para gerenciar as variáveis de ambiente. Um arquivo de exemplo é fornecido.

1.  **Copie o arquivo de exemplo:**

    ```bash
    cp .env.example .env
    ```

2.  **Edite o arquivo `.env`:**

    Abra o arquivo `.env` em um editor de texto e preencha as variáveis. As mais importantes são:

    -   `DATABASE_URL`: A URL de conexão com o banco de dados PostgreSQL. O valor padrão no `docker-compose.yml` já está configurado para funcionar com o serviço de banco de dados do Docker.
    -   `CLOUDINARY_URL`: **Esta é a variável mais importante a ser configurada.** Você precisa de uma conta no [Cloudinary](https://cloudinary.com/) para o upload de imagens. A URL tem o formato `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`.
    -   `JWT_SECRET`: Uma string longa e aleatória para assinar os tokens JWT.
    -   `JWT_REFRESH_SECRET`: Uma string longa e aleatória para assinar os refresh tokens.

    ```env
    # .env

    # PostgreSQL
    DATABASE_URL="postgresql://user:password@db:5432/bissaumarket?schema=public"

    # JWT
    JWT_SECRET="SUA_CHAVE_SECRETA_AQUI"
    JWT_EXPIRATION_TIME="1h"
    JWT_REFRESH_SECRET="SUA_OUTRA_CHAVE_SECRETA_AQUI"
    JWT_REFRESH_EXPIRATION_TIME="7d"

    # Cloudinary (OBRIGATÓRIO)
    CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

    # API Port
    PORT=3000
    ```

## Passo 3: Iniciar a Aplicação com Docker Compose

Com o Docker em execução, navegue até a raiz do projeto (onde o arquivo `docker-compose.yml` está localizado) e execute o seguinte comando:

```bash
docker-compose up -d --build
```

-   `up`: Cria e inicia os containers.
-   `-d`: Modo "detached" (executa em segundo plano).
-   `--build`: Força a reconstrução das imagens Docker, o que é útil na primeira vez ou após alterações nos `Dockerfiles`.

O Docker Compose irá:
1.  Criar uma rede para os serviços se comunicarem.
2.  Iniciar um container para o banco de dados **PostgreSQL**.
3.  Iniciar um container para o **Backend** (API NestJS).
4.  Iniciar um container para o **Frontend** (Web App Next.js).
5.  Iniciar um container para o **Nginx** como proxy reverso.

## Passo 4: Acessar a Aplicação

Após os containers estarem em execução, você pode acessar os serviços nos seguintes endereços:

-   **Frontend (Aplicação Web)**: [http://localhost:3001](http://localhost:3001)
-   **Backend (API)**: [http://localhost:3000](http://localhost:3000)
-   **Documentação da API (Swagger)**: [http://localhost:3000/api](http://localhost:3000/api)

## Comandos Úteis do Docker Compose

-   **Parar os serviços:**

    ```bash
    docker-compose down
    ```

-   **Ver os logs dos serviços:**

    ```bash
    docker-compose logs -f
    ```

    Para ver os logs de um serviço específico (ex: backend):

    ```bash
    docker-compose logs -f backend
    ```

-   **Acessar o shell de um container (ex: backend):**

    ```bash
    docker-compose exec backend sh
    ```

-   **Executar migrações do Prisma manualmente:**

    Se necessário, você pode executar as migrações do banco de dados manualmente:

    ```bash
    docker-compose exec backend npx prisma migrate deploy
    ```

## Solução de Problemas

-   **Erro de porta em uso (`port is already allocated`)**: Verifique se você não tem outro serviço rodando nas portas `3000`, `3001`, ou `5432`. Você pode alterar as portas no arquivo `docker-compose.yml` se necessário.
-   **Falha na conexão com o banco de dados**: Verifique se as credenciais no `DATABASE_URL` no seu arquivo `.env` correspondem às credenciais definidas no `docker-compose.yml`.
-   **Imagens não estão sendo carregadas**: Certifique-se de que a variável `CLOUDINARY_URL` está configurada corretamente no arquivo `.env`.
