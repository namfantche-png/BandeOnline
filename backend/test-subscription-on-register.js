/**
 * Script para testar se subscrição FREE é criada ao registrar novo usuário
 */

const API_URL = 'http://localhost:3000/api';

async function testSubscriptionOnRegister() {
  console.log('🧪 Testando criação de subscrição ao registrar...\n');

  try {
    // 1. Registrar novo usuário
    const email = `teste-${Date.now()}@bissaumarket.com`;
    console.log(`1️⃣ Registrando novo usuário: ${email}`);
    
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'Teste@123',
        firstName: 'Lucas',
        lastName: 'Teste',
        phone: '+245950123456',
      }),
    });

    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok) {
      console.error('❌ Erro no registro:', registerData);
      return;
    }

    const token = registerData.access_token;
    const userId = registerData.user.id;
    console.log(`✅ Usuário registrado!`);
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${email}\n`);

    // 2. Verificar subscrição ativa
    console.log('2️⃣ Verificando subscrição ativa...');
    const subscriptionResponse = await fetch(`${API_URL}/subscriptions/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!subscriptionResponse.ok) {
      console.error('❌ Erro ao buscar subscrição:', subscriptionResponse.statusText);
      const errorData = await subscriptionResponse.json();
      console.error('Detalhes:', errorData);
      return;
    }

    const subscription = await subscriptionResponse.json();
    console.log('✅ Subscrição encontrada!');
    console.log(`   ID da subscrição: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plano: ${subscription.plan.name}`);
    console.log(`   Preço: ${subscription.plan.price} ${subscription.plan.currency}`);
    console.log(`   Máx Anúncios: ${subscription.plan.maxAds}`);
    console.log(`   Máx Destaques: ${subscription.plan.maxHighlights}\n`);

    // 3. Verificar limite de anúncios
    console.log('3️⃣ Verificando limite de anúncios...');
    const limitsResponse = await fetch(`${API_URL}/subscriptions/limits/ads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const limits = await limitsResponse.json();
    console.log('✅ Limites:');
    console.log(`   Anúncios ativos: ${limits.current}/${limits.max}`);
    console.log(`   Pode criar anúncio: ${limits.current < limits.max ? '✅ SIM' : '❌ NÃO'}\n`);

    console.log('🎉 Teste completado com sucesso!');
    console.log('✅ A subscrição FREE está sendo criada automaticamente ao registrar!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testSubscriptionOnRegister();
