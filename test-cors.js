#!/usr/bin/env node

/**
 * Script de teste CORS e criação de anúncio
 */

const http = require('http');

const API_URL = 'http://localhost:3000';
const API_PATH_LOGIN = '/api/auth/login';
const API_PATH_ADS = '/api/ads';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test() {
  console.log('=== Teste de CORS e Criação de Anúncio ===\n');

  try {
    // 1. Teste de CORS - fazer um OPTIONS request
    console.log('1. Testando CORS com OPTIONS request...');
    const corsTest = await makeRequest('OPTIONS', API_PATH_LOGIN);
    console.log('   Status:', corsTest.status);
    console.log('   CORS Headers:', {
      'Access-Control-Allow-Origin': corsTest.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsTest.headers['access-control-allow-methods'],
      'Access-Control-Allow-Credentials': corsTest.headers['access-control-allow-credentials'],
    });
    console.log('   ✓ CORS disponível\n');

    // 2. Login para obter token
    console.log('2. Fazendo login...');
    const loginResponse = await makeRequest('POST', API_PATH_LOGIN, {
      email: 'teste@bissaumarket.com',
      password: 'teste123',
    });

    if (loginResponse.status !== 201 && loginResponse.status !== 200) {
      console.error('   ✗ Login falhou:', loginResponse.status);
      console.error('   Resposta:', loginResponse.data);
      return;
    }

    const loginData = JSON.parse(loginResponse.data);
    const token = loginData.access_token;
    console.log('   ✓ Login bem-sucedido');
    console.log('   Token:', token.substring(0, 20) + '...\n');

    // 3. Obter categorias para pegar um ID válido
    console.log('3. Obtendo categorias...');
    const categoriesResponse = await makeRequest('GET', '/api/categories');
    const categories = JSON.parse(categoriesResponse.data);
    
    if (!Array.isArray(categories) || categories.length === 0) {
      console.error('   ✗ Nenhuma categoria encontrada');
      return;
    }

    const categoryId = categories[0].id;
    console.log('   ✓ Categorias obtidas');
    console.log('   Usando categoria:', categories[0].name, '(ID:', categoryId, ')\n');

    // 4. Criar anúncio
    console.log('4. Criando anúncio...');
    const createAdData = {
      title: 'Teste Anúncio ' + Date.now(),
      description: 'Esta é uma descrição de teste com mais de 20 caracteres para validação do anúncio.',
      price: 5000,
      currency: 'XOF',
      categoryId: categoryId,
      city: 'Bissau',
      country: 'Guiné-Bissau',
      location: 'Plateau',
      condition: 'used',
    };

    // Nota: Para FormData, precisa de outro método, mas vamos tentar com JSON primeiro
    const createResponse = await makeRequest('POST', API_PATH_ADS, createAdData, {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('   Status:', createResponse.status);
    
    if (createResponse.status === 201 || createResponse.status === 200) {
      const adData = JSON.parse(createResponse.data);
      console.log('   ✓ Anúncio criado com sucesso!');
      console.log('   ID do anúncio:', adData.id);
    } else {
      console.error('   ✗ Erro ao criar anúncio');
      console.error('   Resposta:', createResponse.data);
    }
  } catch (error) {
    console.error('✗ Erro:', error.message);
  }
}

test();
