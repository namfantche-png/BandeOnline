# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO - BandeOnline v1.1

**Data:** 24 de Janeiro de 2026  
**Status:** Pronto para Deploy ✅

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy em produção, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] Banco de dados está backup
- [ ] SSL/HTTPS está configurado
- [ ] Cloudinary credenciais estão ativas
- [ ] Rate limiting está ativo
- [ ] Logs estão configurados
- [ ] Monitoring está ativo
- [ ] Backups automáticos estão programados

---

## 🌍 Opção 1: Deploy no DigitalOcean (Recomendado)

### Passo 1: Criar Droplet

1. Acesse https://cloud.digitalocean.com
2. Clique em "Create" > "Droplet"
3. Escolha:
   - **Image**: Ubuntu 22.04 LTS x64
   - **Size**: $12/mês (2GB RAM, 2vCPU)
   - **Region**: Escolha mais próximo
   - **Auth**: SSH Key
4. Clique "Create"

### Passo 2: SSH no Servidor

```bash
# Conectar ao servidor
ssh root@seu-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Criar usuário non-root
adduser deploy
usermod -aG docker deploy
su - deploy
```

### Passo 3: Clonar e Configurar

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/BandeOnline.git
cd BandeOnline

# Copiar arquivo de ambiente
cp .env.example .env

# Editar com variáveis reais
nano .env
```

**Variáveis Críticas em Produção:**

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://deploy:senha-segura@postgres:5432/bissaumarket"
DATABASE_PASSWORD="gere-senha-aleatoria-com-32-caracteres"

# JWT
JWT_SECRET="gere-secret-aleatorio-com-32-caracteres"
JWT_REFRESH_SECRET="gere-outro-secret-aleatorio-com-32-caracteres"

# CORS
CORS_ORIGIN="https://seu-dominio.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu-cloud"
CLOUDINARY_API_KEY="sua-chave"
CLOUDINARY_API_SECRET="seu-secret"

# Admin
ADMIN_EMAIL="admin@seu-dominio.com"
ADMIN_PASSWORD="senha-super-segura-aleatorio"

# Frontend
NEXT_PUBLIC_API_URL="https://api.seu-dominio.com"
NEXT_PUBLIC_SOCKET_URL="https://seu-dominio.com"
```

### Passo 4: SSL/HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado (substitua seu-dominio.com)
sudo certbot certonly --standalone -d seu-dominio.com -d api.seu-dominio.com -d www.seu-dominio.com

# Resultado: /etc/letsencrypt/live/seu-dominio.com/
```

### Passo 5: Nginx como Reverse Proxy

```bash
# Criar arquivo de configuração Nginx
sudo nano /etc/nginx/sites-available/bissaumarket

# Copiar conteúdo abaixo
```

```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com api.seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # SSL moderno
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Backend API
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/bissaumarket /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ativar na inicialização
sudo systemctl enable nginx
```

### Passo 6: Docker Compose em Produção

Editar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: bissaumarket-postgres
    environment:
      POSTGRES_USER: deploy
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: bissaumarket
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - bissaumarket

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: bissaumarket-redis
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - bissaumarket

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bissaumarket-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: "postgresql://deploy:${DATABASE_PASSWORD}@postgres:5432/bissaumarket"
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      REDIS_URL: "redis://redis:6379"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - bissaumarket

  # Frontend Web App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://api.seu-dominio.com
        NEXT_PUBLIC_SOCKET_URL: https://seu-dominio.com
    container_name: bissaumarket-frontend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_ENV: production
    restart: unless-stopped
    networks:
      - bissaumarket

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  bissaumarket:
    driver: bridge
```

### Passo 7: Iniciar Produção

```bash
# Navegar para diretório do projeto
cd /home/deploy/BandeOnline

# Iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Rodar migrations
docker-compose exec backend npx prisma migrate deploy

# Acessar aplicação
# Frontend: https://seu-dominio.com
# API: https://api.seu-dominio.com
# Swagger: https://api.seu-dominio.com/api
```

---

## 🔐 Segurança em Produção

### 1. Firewall

```bash
# Ativar firewall
sudo ufw enable

# Permitir SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquear tudo mais
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 2. Backup Automático

```bash
# Criar script de backup
mkdir -p /backups
nano /backups/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups"
DB_NAME="bissaumarket"
DB_USER="deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup do banco
docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$TIMESTAMP.tar.gz /home/deploy/BandeOnline

# Manter apenas últimos 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup realizado: $TIMESTAMP"
```

```bash
# Tornar executável
chmod +x /backups/backup.sh

# Agendar backup diário (2:00 AM)
crontab -e
# Adicionar: 0 2 * * * /backups/backup.sh
```

### 3. Monitoramento

```bash
# Instalar node_exporter para Prometheus
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.5.0.linux-amd64.tar.gz
sudo mv node_exporter-1.5.0.linux-amd64/node_exporter /usr/local/bin/
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### 4. Updates Automáticos

```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Verificar status
sudo systemctl status unattended-upgrades
```

---

## 📊 Monitoramento e Logs

### Sentry para Erro Tracking

```bash
# Criar conta em https://sentry.io
# Obter DSN
# Adicionar ao .env
SENTRY_DSN="https://key@sentry.io/projectid"
```

### Logs Centralizados

```bash
# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Salvar logs
docker-compose logs backend > backend.log
```

### Health Check

```bash
# Testar API
curl -X GET https://api.seu-dominio.com/api/health

# Verificar status dos containers
docker-compose ps
```

---

## 🔄 Updates em Produção

```bash
# Pull das mudanças
git pull origin main

# Rebuild dos containers
docker-compose up -d --build

# Rodar migrations
docker-compose exec backend npx prisma migrate deploy

# Reiniciar se necessário
docker-compose restart
```

---

## 📞 Troubleshooting de Produção

### "502 Bad Gateway"

```bash
# Verificar se backend está rodando
docker-compose ps

# Ver logs do backend
docker-compose logs backend --tail 50

# Reiniciar container
docker-compose restart backend
```

### "Conexão recusada no banco"

```bash
# Verificar status do PostgreSQL
docker-compose exec postgres pg_isready

# Reiniciar banco
docker-compose restart postgres

# Checar conexão
docker-compose exec backend psql -U deploy -d bissaumarket -c "SELECT 1;"
```

### "Rate limit muito agressivo"

```env
# Ajustar em .env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

---

## ✅ Checklist Pós-Deploy

- [ ] Frontend acessível em https://seu-dominio.com
- [ ] API acessível em https://api.seu-dominio.com
- [ ] Swagger doc em https://api.seu-dominio.com/api
- [ ] SSL/HTTPS funcionando
- [ ] Login funcionando
- [ ] Upload de imagens funcionando
- [ ] Chat em tempo real funcionando
- [ ] Rate limiting ativo
- [ ] Backups sendo feitos
- [ ] Logs sendo salvos
- [ ] Monitoramento ativo

---

## 🎉 Parabéns!

Sua plataforma BandeOnline está **LIVE EM PRODUÇÃO** ✅

---

**Próximos Passos:**

1. Monitorar performance e erros
2. Coletar feedback dos usuários
3. Otimizar conforme necessário
4. Planejar melhorias futuras

**Data de Deploy:** 24 de Janeiro de 2026  
**Status:** Pronto ✅
