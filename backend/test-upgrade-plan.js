/**
 * Script de teste para upgrade de plano
 */

const API_URL = 'http://localhost:3000/api';

async function testUpgradePlan() {
  console.log('🧪 Testando upgrade de plano...\n');

  try {
    // 1. Login do usuário
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@bissaumarket.com',
        password: 'teste123',
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Erro no login');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log(`✅ Login bem-sucedido! Email: ${loginData.user.email}\n`);

    // 2. Obter planos disponíveis
    console.log('2️⃣ Obtendo planos...');
    const plansResponse = await fetch(`${API_URL}/plans`);
    const plansData = await plansResponse.json();
    
    if (!Array.isArray(plansData)) {
      console.log('Resposta de planos:', plansData);
      return;
    }
    
    console.log(`✅ ${plansData.length} planos encontrados:`);
    plansData.forEach(p => {
      console.log(`   - ${p.name}: ${p.maxAds} anúncios, ${p.maxImages} imagens`);
    });

    // 3. Obter plano atual
    console.log('\n3️⃣ Obtendo plano atual...');
    const currentResponse = await fetch(`${API_URL}/subscriptions/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const currentData = await currentResponse.json();
    console.log('Plano atual:');
    console.log(`   Nome: ${currentData.plan.name}`);
    console.log(`   Status: ${currentData.status}`);
    console.log(`   Criado em: ${new Date(currentData.startDate).toLocaleDateString('pt-BR')}`);

    // 4. Tentar fazer upgrade para PREMIUM
    console.log('\n4️⃣ Fazendo upgrade para PREMIUM...');
    const premiumPlan = plansData.find(p => p.name === 'PREMIUM');
    
    if (!premiumPlan) {
      console.error('❌ Plano PREMIUM não encontrado');
      return;
    }

    const upgradeResponse = await fetch(`${API_URL}/subscriptions/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: premiumPlan.id,
      }),
    });

    if (!upgradeResponse.ok) {
      const errorData = await upgradeResponse.json();
      console.error('❌ Erro no upgrade:', errorData.message || upgradeResponse.statusText);
      return;
    }

    const upgradeData = await upgradeResponse.json();
    console.log('✅ Upgrade bem-sucedido!');
    console.log(`   Novo plano: ${upgradeData.plan.name}`);
    console.log(`   Status: ${upgradeData.status}`);
    console.log(`   Máx anúncios: ${upgradeData.plan.maxAds}`);
    console.log(`   Máx imagens: ${upgradeData.plan.maxImages}`);
    console.log(`   Destaques: ${upgradeData.plan.maxHighlights}`);

    // 5. Verificar novo plano
    console.log('\n5️⃣ Verificando novo plano...');
    const newCurrentResponse = await fetch(`${API_URL}/subscriptions/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const newCurrentData = await newCurrentResponse.json();
    console.log(`✅ Plano atual: ${newCurrentData.plan.name}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUpgradePlan();
