# 📋 Regras de Validação - Criação de Anúncios

## **Validações Implementadas no Backend**

### Campo: **Título**
- ✅ Tipo: String
- ✅ Comprimento mínimo: **5 caracteres**
- ✅ Comprimento máximo: **100 caracteres**
- ❌ Mensagem de erro (mínimo): "Título deve ter no mínimo 5 caracteres"
- ❌ Mensagem de erro (máximo): "Título deve ter no máximo 100 caracteres"
- ❌ Mensagem de erro (tipo): "title must be a string"

**Exemplos Válidos:**
- ✅ "iPhone 14 Pro"
- ✅ "Casa moderna com piscina em Bissau"
- ✅ "Bicicleta montanha nova"

**Exemplos Inválidos:**
- ❌ "App" (menos de 5 caracteres)
- ❌ "Um título muito muito muito muito muito muito muito muito longo que excede 100 caracteres é inválido" (mais de 100 caracteres)

---

### Campo: **Descrição**
- ✅ Tipo: String
- ✅ Comprimento mínimo: **20 caracteres**
- ✅ Comprimento máximo: **5000 caracteres**
- ❌ Mensagem de erro (mínimo): "Descrição deve ter no mínimo 20 caracteres"
- ❌ Mensagem de erro (máximo): "Descrição deve ter no máximo 5000 caracteres"
- ❌ Mensagem de erro (tipo): "description must be a string"

**Exemplos Válidos:**
- ✅ "Smartphone em perfeito estado de funcionamento"
- ✅ "Casa espaçosa com 4 quartos, 2 casas de banho, sala e cozinha moderna. Localizada no bairro de Belém. Pronta para habitar."

**Exemplos Inválidos:**
- ❌ "Bom estado" (menos de 20 caracteres)

---

### Campo: **Preço**
- ✅ Tipo: Number
- ✅ Valor mínimo: **0**
- ✅ Valor máximo: **99999999**
- ❌ Mensagem de erro (negativo): "Preço não pode ser negativo"
- ❌ Mensagem de erro (inválido): "Preço inválido"
- ❌ Mensagem de erro (tipo): "price must be a number conforming to the specified constraints"

**Exemplos Válidos:**
- ✅ 50000
- ✅ 0 (gratuito)
- ✅ 1500000

**Exemplos Inválidos:**
- ❌ -100 (negativo)
- ❌ "123abc" (não é número)
- ❌ 999999999 (maior que 99999999)

---

### Campo: **Categoria**
- ✅ Tipo: String
- ✅ Requerido: **Sim**
- ✅ Deve ser um UUID válido de categoria existente
- ❌ Mensagem de erro: "categoryId must be a string"

**Categorias Disponíveis:**
1. Eletrónicos
2. Automóveis
3. Imóveis
4. Roupas e Calçados
5. Casa e Jardim
6. Livros e Media
7. Esportes e Lazer
8. Serviços
9. Saúde e Beleza
10. Animais de Estimação
11. Comida e Bebidas
12. Educação

---

### Campo: **Localização**
- ✅ Tipo: String
- ✅ Comprimento mínimo: **2 caracteres**
- ✅ Requerido: **Sim**
- ❌ Mensagem de erro: "Localidade inválida"
- ❌ Mensagem de erro (tipo): "location must be a string"

**Exemplos Válidos:**
- ✅ "Bairro de Belém"
- ✅ "Centro da cidade"

**Exemplos Inválidos:**
- ❌ "A" (menos de 2 caracteres)

---

### Campo: **Cidade**
- ✅ Tipo: String
- ✅ Comprimento mínimo: **2 caracteres**
- ✅ Requerido: **Sim**
- ✅ Padrão: "Bissau"
- ❌ Mensagem de erro: "Cidade inválida"
- ❌ Mensagem de erro (tipo): "city must be a string"

**Exemplos Válidos:**
- ✅ "Bissau"
- ✅ "Cacheu"
- ✅ "Oio"

**Exemplos Inválidos:**
- ❌ "B" (menos de 2 caracteres)

---

### Campo: **País**
- ✅ Tipo: String
- ✅ Comprimento mínimo: **2 caracteres**
- ✅ Requerido: **Sim**
- ✅ Padrão: "Guiné-Bissau"
- ❌ Mensagem de erro: "País inválido"
- ❌ Mensagem de erro (tipo): "country must be a string"

**Exemplos Válidos:**
- ✅ "Guiné-Bissau"
- ✅ "Portugal"
- ✅ "Brasil"

**Exemplos Inválidos:**
- ❌ "GB" (apenas 2 caracteres, mas aceita)
- ❌ "A" (menos de 2 caracteres)

---

### Campo: **Condição** (Opcional)
- ✅ Tipo: Enum
- ✅ Valores aceitos:
  - `new` - Novo
  - `like_new` - Como novo
  - `used` - Usado
  - `for_repair` - Para reparar
- ✅ Padrão: `used`

---

### Campo: **Moeda** (Opcional)
- ✅ Tipo: String
- ✅ Padrão: `XOF` (Franco CFA)
- ✅ Valores aceitos: XOF, USD, EUR

---

### Campo: **Imagens** (Opcional)
- ✅ Tipo: Array de strings (URLs)
- ✅ Máximo: 5 imagens por anúncio (depende do plano)
- ✅ Formatos aceitos: JPG, PNG, WebP

---

## **Teste de Validação**

### ✅ Anúncio Válido:
```json
{
  "title": "iPhone 14 Pro de 256GB",
  "description": "Smartphone em perfeito estado de funcionamento, apenas 3 meses de uso. Inclui caixa original e acessórios.",
  "price": 120000,
  "currency": "XOF",
  "categoryId": "cat-eletronicos-id",
  "location": "Bairro de Belém",
  "city": "Bissau",
  "country": "Guiné-Bissau",
  "condition": "like_new"
}
```

### ❌ Anúncio Inválido (Título muito curto):
```json
{
  "title": "App",
  "description": "Smartphone em perfeito estado de funcionamento, apenas 3 meses de uso.",
  "price": 120000,
  "categoryId": "cat-eletronicos-id",
  "location": "Bairro",
  "city": "Bissau",
  "country": "Guiné-Bissau"
}
```
**Erro:** `Título deve ter no mínimo 5 caracteres`

### ❌ Anúncio Inválido (Preço negativo):
```json
{
  "title": "iPhone 14 Pro",
  "description": "Smartphone em perfeito estado de funcionamento, apenas 3 meses de uso.",
  "price": -100,
  "categoryId": "cat-eletronicos-id",
  "location": "Bairro",
  "city": "Bissau",
  "country": "Guiné-Bissau"
}
```
**Erro:** `Preço não pode ser negativo`

---

## **Implementação no Frontend**

Certifique-se de que o formulário:
1. ✅ Valida o comprimento do título (5-100)
2. ✅ Valida o comprimento da descrição (20-5000)
3. ✅ Valida o preço (não-negativo, número)
4. ✅ Requer seleção de categoria
5. ✅ Valida campos de localização
6. ✅ Mostra mensagens de erro claras

---

## **Referências**

**Arquivo Backend:** `backend/src/modules/ads/dto/ad.dto.ts`
**Arquivo Frontend:** `frontend/app/anuncios/criar/page.tsx`
