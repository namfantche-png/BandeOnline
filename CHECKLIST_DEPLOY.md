# ✅ CHECKLIST DE DEPLOY - BandeOnline v1.1

Use este checklist antes de fazer deploy em qualquer ambiente.

---

## 🟢 PRÉ-DEPLOY (1-2 horas antes)

### Código
- [ ] `git pull origin main` - Código atualizado
- [ ] `git log --oneline -5` - Verificar commits
- [ ] Nenhuma branch não-mergeada com mudanças críticas
- [ ] `.env` não está comitado (verificar .gitignore)

### Backend
- [ ] `npm install` no backend atualiza dependências
- [ ] `npx prisma migrate status` - Migrations prontas
- [ ] `npm run build` - Compila sem erros
- [ ] `npm run lint` - Sem erros de linting
- [ ] `npm run test` - Testes passando (se houver)

### Frontend
- [ ] `npm install` no frontend atualiza dependências
- [ ] `npm run build` - Build sem erros
- [ ] `npm run lint` - Sem erros de linting
- [ ] Variáveis `NEXT_PUBLIC_*` corretas em `.env.local`

### Docker
- [ ] `docker-compose build` - Imagens constroem sem erros
- [ ] `docker images` - Imagens estão presentes
- [ ] Não há containers antigos rodando

### Variáveis de Ambiente
- [ ] `.env` existe e está preenchido
- [ ] `CLOUDINARY_*` configurado corretamente
- [ ] `JWT_SECRET` tem 32+ caracteres aleatórios
- [ ] `DATABASE_URL` aponta para o banco correto
- [ ] `CORS_ORIGIN` inclui domínios corretos
- [ ] Senhas não estão em valores padrão

---

## 🟡 DURANTE O DEPLOY

### Staging (Recomendado Primeiro)
- [ ] Deploy em servidor de staging
- [ ] Acessar frontend via HTTPS
- [ ] Acessar API via HTTPS
- [ ] Testar login
- [ ] Testar criar anúncio
- [ ] Testar upload de imagem
- [ ] Testar chat (WebSocket)
- [ ] Testar pagamento (mock)
- [ ] Verificar logs para erros

### Produção
- [ ] Backup do banco existente
- [ ] Health check - `curl https://api.seu-dominio.com/api/health`
- [ ] Logs limpos - `docker-compose logs --tail 100`
- [ ] Zero downtime se possível

```bash
# Desplegar com zero downtime
docker-compose up -d --build --no-deps backend frontend
docker-compose exec backend npx prisma migrate deploy
docker-compose restart backend frontend
```

---

## 🟢 PÓS-DEPLOY (Imediatamente após)

### Testes de Smoke
- [ ] Frontend carrega em 3 segundos
- [ ] Logo é visível e clickável
- [ ] Página de login é acessível
- [ ] Login com credenciais de teste funciona
- [ ] Página de anúncios carrega
- [ ] Pode criar anúncio
- [ ] Pode fazer upload de imagem
- [ ] Pode enviar mensagem (chat)
- [ ] Pode acessar Swagger (API docs)
- [ ] Nenhum erro 500 nos logs

### Performance
- [ ] Swagger carrega em < 2s
- [ ] Lista de anúncios carrega em < 1s
- [ ] Imagens carregam via CDN (Cloudinary)
- [ ] WebSocket conecta sem erro
- [ ] Nenhuma requisição que demora > 5s

### Segurança
- [ ] HTTPS está ativo
- [ ] Headers de segurança estão presentes
- [ ] Rate limiting está funcionando
- [ ] Tokens JWT são válidos
- [ ] Admin panel rejeita usuários não-admin

### Database
- [ ] `docker-compose exec postgres pg_isready`
- [ ] Dados foram importados corretamente
- [ ] Planos padrão existem
- [ ] Usuário admin existe
- [ ] Nenhuma tabela vazia inesperadamente

### Monitoramento
- [ ] Logs estão sendo salvos
- [ ] Alertas estão configurados
- [ ] Sentry está recebendo erros
- [ ] CPU < 50%
- [ ] RAM < 70%
- [ ] Disk space > 20% livre

---

## 🔴 PROBLEMAS COMUNS E SOLUÇÕES

### "502 Bad Gateway"
```bash
# 1. Verificar se backend está rodando
docker-compose ps

# 2. Ver logs
docker-compose logs backend --tail 50

# 3. Reiniciar se necessário
docker-compose restart backend

# 4. Se persistir, usar docker-compose up -d --build
```

### "CORS Error"
```bash
# 1. Verificar CORS_ORIGIN em .env
echo $CORS_ORIGIN

# 2. Deve incluir https://seu-dominio.com
# 3. Reiniciar backend
docker-compose restart backend
```

### "Cannot connect to database"
```bash
# 1. Verificar status
docker-compose exec postgres pg_isready

# 2. Ver logs
docker-compose logs postgres --tail 20

# 3. Reiniciar
docker-compose restart postgres

# 4. Se perder dados, restaurar backup
```

### "Out of memory"
```bash
# 1. Ver uso
docker stats

# 2. Aumentar resources em docker-compose.yml
# 3. Limpar imagens antigas
docker image prune -a

# 4. Reiniciar containers
docker-compose restart
```

---

## 📊 MÉTRICAS ESPERADAS (Produção)

### Performance
- Response time API: < 500ms
- Frontend load time: < 2s
- Imagem load time: < 1s (via CDN)
- Uptime: > 99%

### Recursos
- CPU: 15-30%
- RAM: 40-60%
- Disk: < 80% usado
- Network: < 10Mbps em repouso

### Erro Rate
- 5xx errors: < 0.1%
- 4xx errors: < 1%
- Database errors: 0

---

## 🚨 ROLLBACK PROCEDURE

Se algo der errado após deploy:

```bash
# 1. Parar container afetado
docker-compose stop backend

# 2. Volta para versão anterior
git revert HEAD
git push origin main

# 3. Rebuild
docker-compose up -d --build

# 4. Verificar saúde
curl https://api.seu-dominio.com/api/health

# 5. Se BD foi afetada, restaurar backup
docker-compose down
# ... restore database from backup
docker-compose up -d
```

---

## 📱 Teste Manual Completo

Execute este fluxo completo:

```
1. Abrir https://seu-dominio.com
   └─ [ ] Logo carrega
   └─ [ ] Navbar funciona
   └─ [ ] Botão Login clicável

2. Clicar "Login"
   └─ [ ] Redirecionado para /login
   └─ [ ] Formulário funciona

3. Fazer login com admin@seu-dominio.com
   └─ [ ] Login bem-sucedido
   └─ [ ] Redirecionado para home
   └─ [ ] User menu mostra nome

4. Clicar "Criar Anúncio"
   └─ [ ] Form carrega
   └─ [ ] Pode preencher campos
   └─ [ ] Upload de imagem funciona
   └─ [ ] Submissão funciona

5. Ver anúncio criado
   └─ [ ] Aparece na listagem
   └─ [ ] Imagem carrega
   └─ [ ] Clicável

6. Abrir anúncio
   └─ [ ] Detalhe carrega
   └─ [ ] Botão "Enviar mensagem" visível
   └─ [ ] Reviews visíveis

7. Clicar "Enviar mensagem"
   └─ [ ] Chat abre
   └─ [ ] Pode digitar mensagem
   └─ [ ] Mensagem aparece
   └─ [ ] WebSocket conectado

8. Acessar /planos
   └─ [ ] Planos carregam
   └─ [ ] Botões de contratação visíveis

9. Acessar /admin (se admin)
   └─ [ ] Dashboard carrega
   └─ [ ] Gráficos aparecem
   └─ [ ] Dados são reais

10. Fazer logout
    └─ [ ] Redirecionado para home
    └─ [ ] Botão logout funciona
```

---

## ⏰ TEMPO ESTIMADO

- Pré-deploy: 30-60 min
- Deploy em staging: 15-30 min
- Testes de smoke: 30-45 min
- Deploy em produção: 10-15 min
- Monitoramento (primeira hora): contínuo

**Total: 2-3 horas**

---

## 📞 CONTATOS EM CASO DE EMERGÊNCIA

- **Downtime Crítico**: Reiniciar container afetado
- **Security Issue**: Parar imediatamente, investigar logs
- **Database Error**: Restaurar backup mais recente
- **Performance Issue**: Aumentar recursos, otimizar queries

---

## ✅ ASSINATURA DE DEPLOY

```
Preparer: _________________________ Data: ___/___/_____

Reviewer: _________________________ Data: ___/___/_____

Approval: _________________________ Data: ___/___/_____

Status Pós-Deploy: ✅ GREEN / ⚠️ YELLOW / 🔴 RED

Notas: ___________________________________________________
______________________________________________________
```

---

**Última Atualização:** 24 de Janeiro de 2026  
**Versão:** 1.1  
**Próximo Review:** 48 horas após deploy
