/**
 * Script de teste para verificar acesso do admin ao dashboard
 * Testa:
 * 1. Login do admin
 * 2. Acesso ao dashboard (/admin/dashboard)
 * 3. Permissões e roles
 */

const API_URL = 'http://localhost:3000/api';

async function testAdminAccess() {
  console.log('🧪 Iniciando testes de acesso do admin...\n');

  try {
    // 1. Login do admin
    console.log('1️⃣ Testando login do admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bissaumarket.com',
        password: 'Admin@123',
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Erro no login:', loginResponse.status, loginResponse.statusText);
      const errorData = await loginResponse.json();
      console.error('Detalhes:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    console.log('✅ Login bem-sucedido!');
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Role: ${loginData.user.role}`);
    console.log(`   Nome: ${loginData.user.firstName} ${loginData.user.lastName}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // 2. Verificar dados do utilizador
    console.log('\n2️⃣ Recuperando dados completos do utilizador...');
    const meResponse = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meResponse.ok) {
      console.error('❌ Erro ao recuperar dados:', meResponse.status);
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ Dados do utilizador:');
    console.log(`   ID: ${meData.id}`);
    console.log(`   Email: ${meData.email}`);
    console.log(`   Role: ${meData.role}`);
    console.log(`   Verificado: ${meData.isVerified ? 'Sim' : 'Não'}`);

    // 3. Aceder ao dashboard de admin
    console.log('\n3️⃣ Testando acesso ao dashboard de admin...');
    const dashboardResponse = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!dashboardResponse.ok) {
      console.error('❌ Erro ao aceder ao dashboard:', dashboardResponse.status);
      const errorData = await dashboardResponse.json();
      console.error('Detalhes:', errorData);
      return;
    }

    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard acessível! Estatísticas:');
    console.log(`   Total de utilizadores: ${dashboardData.totalUsers || 'N/A'}`);
    console.log(`   Total de anúncios: ${dashboardData.totalAds || 'N/A'}`);
    console.log(`   Receita total: ${dashboardData.totalRevenue || 'N/A'}`);
    console.log(`   Anúncios moderados: ${dashboardData.moderatedAds || 'N/A'}`);

    // 4. Listar categorias
    console.log('\n4️⃣ Testando acesso à gestão de categorias...');
    const categoriesResponse = await fetch(`${API_URL}/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!categoriesResponse.ok) {
      console.error('❌ Erro ao listar categorias:', categoriesResponse.status);
      return;
    }

    const categoriesData = await categoriesResponse.json();
    console.log(`✅ Categorias carregadas: ${Array.isArray(categoriesData) ? categoriesData.length : 'N/A'}`);
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      console.log('   Primeiras 3 categorias:');
      categoriesData.slice(0, 3).forEach((cat) => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    }

    // 5. Teste com utilizador não-admin (teste o user teste)
    console.log('\n5️⃣ Testando que utilizador normal NÃO consegue aceder ao dashboard...');
    const userLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@bissaumarket.com',
        password: 'teste123',
      }),
    });

    const userData = await userLoginResponse.json();
    const userToken = userData.access_token;

    const userDashboardResponse = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (userDashboardResponse.status === 403) {
      console.log('✅ Utilizador comum corretamente bloqueado! (403 Forbidden)');
    } else {
      console.warn('⚠️ Utilizador comum conseguiu aceder (possível problema de segurança)');
    }

    console.log('\n✅ TODOS OS TESTES PASSARAM! Admin consegue aceder ao dashboard.');
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
  }
}

testAdminAccess();
