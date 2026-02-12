# ✅ Guia de Teste - Erro 400 Corrigido

## 🚀 Quick Start

### Pré-requisitos
- ✅ Backend rodando em `http://localhost:3000`
- ✅ Frontend rodando em `http://localhost:3001`
- ✅ Usuário autenticado
- ✅ Categoria criada no BD

---

## 📋 Teste 1: Criar Anúncio Completo

### Passos

1. **Ir para a página de criar anúncio**
   ```
   URL: http://localhost:3001/anuncios/criar
   ```

2. **Preencher o formulário:**
   
   | Campo | Valor |
   |-------|-------|
   | Título | iPhone 12 Pro Max 256GB |
   | Descrição | Telefone em excelente estado, praticamente novo. Sem arranhões. Inclui caixa original e carregador. Garantia até 2026. |
   | Preço | 150000 |
   | Moeda | XOF |
   | Categoria | Eletrônicos |
   | Condição | Bom |
   | Cidade | Bissau |
   | País | Guiné-Bissau |
   | Localidade | Bairro da Praia |
   | Telefone | +245955123456 |
   | WhatsApp | +245955123456 |

3. **Clicar em "Criar Anúncio"**

4. **Resultado Esperado:**
   - ✅ Sem erro 400
   - ✅ Redireciona para `/anuncios/[id]`
   - ✅ Anúncio exibido com todos os dados
   - ✅ Telefone e WhatsApp visíveis

---

## 📋 Teste 2: Campos Opcionais

### Passos

1. **Preencher formulário sem telefones:**
   
   | Campo | Valor |
   |-------|-------|
   | Título | Bicicleta Mountain Bike |
   | Descrição | Bicicleta de montanha em ótimo estado. Pneus novos, corrente bem afinada. |
   | Preço | 75000 |
   | Categoria | Esportes |
   | Cidade | Bissau |
   | Localidade | Platô |
   | **Telefone** | *(deixar em branco)* |
   | **WhatsApp** | *(deixar em branco)* |

2. **Clicar em "Criar Anúncio"**

3. **Resultado Esperado:**
   - ✅ Anúncio criado com sucesso
   - ✅ Campos de telefone salvos como `null`

---

## 📋 Teste 3: Validação de Campos Obrigatórios

### Teste 3.1: Sem Título

1. **Deixar título vazio**
2. **Clicar em "Criar Anúncio"**
3. **Resultado Esperado:**
   - ✅ Mensagem de erro: "Título é obrigatório"
   - ✅ Não envia requisição

### Teste 3.2: Título Curto

1. **Título: "Xbox"** (4 caracteres)
2. **Clicar em "Criar Anúncio"**
3. **Resultado Esperado:**
   - ✅ Mensagem de erro: "Título deve ter pelo menos 5 caracteres"

### Teste 3.3: Descrição Curta

1. **Preencer título e categoria**
2. **Descrição: "Bom"** (3 caracteres)
3. **Clicar em "Criar Anúncio"**
4. **Resultado Esperado:**
   - ✅ Mensagem de erro: "Descrição deve ter pelo menos 20 caracteres"

### Teste 3.4: Preço Inválido

1. **Preço: "0"** ou deixar em branco
2. **Clicar em "Criar Anúncio"**
3. **Resultado Esperado:**
   - ✅ Mensagem de erro: "Preço deve ser maior que zero"

### Teste 3.5: Sem Categoria

1. **Deixar categoria vazia**
2. **Preencher outros campos**
3. **Clicar em "Criar Anúncio"**
4. **Resultado Esperado:**
   - ✅ Mensagem de erro: "Selecione uma categoria"

---

## 📊 Teste 4: Verificação no Banco de Dados

### Após criar um anúncio com telefones

Execute no pgAdmin:

```sql
SELECT id, title, "contactPhone", "contactWhatsapp" 
FROM "Ad" 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Resultado Esperado:**
```
id                | title                    | contactPhone    | contactWhatsapp
ad-abc123...      | iPhone 12 Pro Max 256GB  | +245955123456   | +245955123456
```

### Após criar um anúncio sem telefones

```sql
SELECT id, title, "contactPhone", "contactWhatsapp" 
FROM "Ad" 
WHERE "contactPhone" IS NULL 
LIMIT 1;
```

**Resultado Esperado:**
```
id                | title                    | contactPhone | contactWhatsapp
ad-xyz789...      | Bicicleta Mountain Bike  | NULL         | NULL
```

---

## 🔍 Teste 5: Verificar Logs do Backend

### Se houver erro, verificar logs

```bash
# Terminal do backend
# Procurar por mensagens de erro
```

**Erro Antigo (NÃO deve aparecer):**
```
Property 'contactPhone' should not exist
```

**Comportamento Novo (Esperado):**
- Sem erro de validação
- Campo é aceito e salvo

---

## 📱 Teste 6: Via API (curl)

### Criar anúncio via API

```bash
curl -X POST http://localhost:3000/api/ads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=iPhone 12 Pro Max" \
  -F "description=Telefone em excelente estado, praticamente novo. Sem arranhões. Inclui caixa original e carregador." \
  -F "price=150000" \
  -F "currency=XOF" \
  -F "categoryId=CATEGORY_ID_HERE" \
  -F "condition=used" \
  -F "city=Bissau" \
  -F "country=Guiné-Bissau" \
  -F "location=Bairro da Praia" \
  -F "contactPhone=+245955123456" \
  -F "contactWhatsapp=+245955123456"
```

**Resultado Esperado (Status 201):**
```json
{
  "id": "ad-abc123...",
  "title": "iPhone 12 Pro Max",
  "description": "Telefone em excelente estado...",
  "price": 150000,
  "currency": "XOF",
  "contactPhone": "+245955123456",
  "contactWhatsapp": "+245955123456",
  "createdAt": "2026-01-25T13:30:00Z",
  ...
}
```

---

## ✅ Checklist de Validação

Marque cada item após testar:

### Funcionalidade
- [ ] Anúncio criado com todos os campos
- [ ] Anúncio criado sem campos opcionais
- [ ] Campos de telefone salvos no BD
- [ ] Campos de telefone aparecem no anúncio criado

### Validação
- [ ] Erro ao deixar título vazio
- [ ] Erro ao título ter < 5 caracteres
- [ ] Erro ao descrição ter < 20 caracteres
- [ ] Erro ao preço ser <= 0
- [ ] Erro ao categoria estar vazia
- [ ] Erro ao cidade estar vazia

### Segurança
- [ ] Não há erro 400 genérico
- [ ] Sem `forbidNonWhitelisted` rejeitando campos legítimos
- [ ] Campos inválidos não são salvos

### Performance
- [ ] Requisição responde em < 2 segundos
- [ ] Sem timeouts
- [ ] Sem erros de conexão

---

## 🐛 Troubleshooting

### Erro: "Cannot POST /api/ads"
- ✅ Verificar se backend está rodando em `http://localhost:3000`
- ✅ Verificar se token é válido
- ✅ Verificar CORS

### Erro: "Categoria não encontrada"
- ✅ Criar categoria no admin
- ✅ Usar ID correto da categoria

### Erro: "Usuário sem plano ativo"
- ✅ Criar plano para o usuário
- ✅ Ativar assinatura

### Erro 400 (ainda acontecendo)
- ✅ Verificar se backend foi recompilado: `npm run build`
- ✅ Reiniciar backend: `npm run start:dev`
- ✅ Limpar cache do browser

### Campos não aparecem no anúncio criado
- ✅ Verificar se foram salvos no BD
- ✅ Verificar se o template mostra os campos

---

## 📞 Contato e Suporte

Se encontrar problemas:

1. **Verificar logs do backend:**
   ```
   Terminal: npm run start:dev
   ```

2. **Verificar network na DevTools do navegador:**
   ```
   F12 → Network → Clicar em POST /api/ads
   ```

3. **Verificar BD:**
   ```sql
   SELECT * FROM "Ad" ORDER BY "createdAt" DESC LIMIT 5;
   ```

4. **Documento de análise completa:**
   ```
   Ver: ANALISE_DETALHADA_ERRO_400.md
   ```

---

**Última atualização:** 25 de Janeiro de 2026  
**Status de Testes:** ✅ Pronto para Execução
