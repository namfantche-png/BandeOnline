/**
 * Script para testar o endpoint GET /admin/users
 */

const API_URL = 'http://localhost:3000/api';

async function testAdminUsers() {
  console.log('🧪 Testando endpoint /admin/users...\n');

  try {
    // 1. Login do admin
    console.log('1️⃣ Fazendo login do admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bissaumarket.com',
        password: 'Admin@123',
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Erro no login:', loginResponse.statusText);
      const errorData = await loginResponse.json();
      console.error('Detalhes:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login bem-sucedido!');
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Role: ${loginData.user.role}\n`);

    // 2. Testar GET /admin/users
    console.log('2️⃣ Fazendo GET /admin/users...');
    const usersResponse = await fetch(`${API_URL}/admin/users?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log(`   Status: ${usersResponse.status}`);
    console.log(`   Content-Type: ${usersResponse.headers.get('content-type')}\n`);

    if (!usersResponse.ok) {
      console.error('❌ Erro na requisição:', usersResponse.statusText);
      const errorText = await usersResponse.text();
      console.error('Resposta:', errorText);
      return;
    }

    const usersData = await usersResponse.json();
    console.log('✅ Resposta recebida!\n');

    // 3. Analisar estrutura da resposta
    console.log('📊 Estrutura da resposta:');
    console.log('   Chaves principais:', Object.keys(usersData));

    if (usersData.data) {
      console.log(`\n   Total de usuários: ${usersData.data.length}`);
      console.log(`   Pagination:`, usersData.pagination);

      if (usersData.data.length > 0) {
        console.log('\n📋 Primeiro usuário:');
        const user = usersData.data[0];
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Bloqueado: ${user.isBlocked}`);
        console.log(`   Verificado: ${user.isVerified}`);
        console.log(`   Plano: ${user.currentPlan}`);
        console.log(`   Anúncios: ${user.adsCount}`);
      } else {
        console.log('\n⚠️  Nenhum usuário encontrado na resposta!');
      }
    } else {
      console.log('\n❌ Resposta não possui chave "data"!');
      console.log('   Resposta completa:', JSON.stringify(usersData, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAdminUsers();
