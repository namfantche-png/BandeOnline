const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';
const TOKEN = 'seu_token_aqui'; // Você precisa pegar um token válido

async function testCreateAd() {
  try {
    // Primeiro, fazer login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'teste@bissaumarket.com',
      password: 'teste123',
    });

    const token = loginResponse.data.access_token;
    console.log('✓ Login bem-sucedido');

    // Agora criar um anúncio com FormData
    console.log('\n2. Criando anúncio...');
    
    // Criar uma imagem de teste (buffer)
    const form = new FormData();
    form.append('title', 'Teste Anúncio 123');
    form.append('description', 'Esta é uma descrição de teste com mais de 20 caracteres para validação.');
    form.append('price', '5000'); // FormData envia como string
    form.append('currency', 'XOF');
    form.append('categoryId', '1'); // Use um ID válido da categoria
    form.append('city', 'Bissau');
    form.append('country', 'Guiné-Bissau');
    form.append('location', 'Plateau');
    form.append('condition', 'used');

    const createResponse = await axios.post(`${API_URL}/ads`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✓ Anúncio criado com sucesso!');
    console.log('Anúncio:', createResponse.data);
  } catch (error) {
    console.error('✗ Erro:', error.response?.data || error.message);
  }
}

testCreateAd();
