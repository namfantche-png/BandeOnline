const axios = require('axios');

// Configurar cliente HTTP
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
});

async function testCreateAd() {
  try {
    console.log('Ì¥ç Testando cria√ß√£o de an√∫ncio com os campos corrigidos...\n');

    // Simular dados de um an√∫ncio
    const formData = new FormData();
    formData.append('title', 'iPhone 12 Pro Max 256GB');
    formData.append('description', 'Telefone em excelente estado, pouqu√≠ssimo usado. Sem arranh√µes. Inclui caixa original e carregador.');
    formData.append('price', '150000');
    formData.append('currency', 'XOF');
    formData.append('categoryId', '1'); // Seria um ID real do DB
    formData.append('condition', 'like_new');
    formData.append('city', 'Bissau');
    formData.append('country', 'Guin√©-Bissau');
    formData.append('location', 'Bairro da Praia');
    formData.append('contactPhone', '+245955123456');
    formData.append('contactWhatsapp', '+245955123456');

    console.log('Ì≥§ Campos sendo enviados:');
    console.log('  - title: "iPhone 12 Pro Max 256GB"');
    console.log('  - description: "Telefone em excelente estado..."');
    console.log('  - price: 150000');
    console.log('  - currency: XOF');
    console.log('  - categoryId: 1');
    console.log('  - condition: like_new');
    console.log('  - city: Bissau');
    console.log('  - country: Guin√©-Bissau');
    console.log('  - location: Bairro da Praia');
    console.log('  - contactPhone: +245955123456');
    console.log('  - contactWhatsapp: +245955123456');
    console.log('\n‚è≥ Aguardando resposta do servidor...\n');

    // Fazer requisi√ß√£o (seria necess√°rio token real)
    const response = await api.post('/ads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer seu-token-aqui', // Em produ√ß√£o, usar token real
      },
    });

    console.log('‚úÖ SUCESSO! An√∫ncio criado:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('‚ùå ERRO ao criar an√∫ncio:');
    if (error.response) {
      console.error('\nÌ≥ã Status:', error.response.status);
      console.error('Ì≤¨ Mensagem:', error.response.data?.message || 'Sem mensagem');
      console.error('Ì≥ù Detalhes:', error.response.data);
    } else {
      console.error('Ì¥ó Erro de conex√£o:', error.message);
    }
  }
}

testCreateAd();
