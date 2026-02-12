const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bissaumarket';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding database com dados reais...\n');

    // ============================================
    // CREATE PLANS
    // ============================================
    console.log('📋 Criando planos...');
    
    const plans = [
      {
        name: 'FREE',
        description: 'Plano gratuito com funcionalidades básicas',
        price: 0,
        currency: 'XOF',
        maxAds: 3,
        maxHighlights: 0,
        maxImages: 3,
        hasStore: false,
        adDuration: 30,
        features: ['Até 3 anúncios', '3 imagens por anúncio', 'Duração de 30 dias'],
      },
      {
        name: 'BASIC',
        description: 'Plano básico com mais funcionalidades',
        price: 5000,
        currency: 'XOF',
        maxAds: 5,
        maxHighlights: 1,
        maxImages: 5,
        hasStore: false,
        adDuration: 30,
        features: ['Até 5 anúncios', '5 imagens por anúncio', '1 destaque', 'Duração de 30 dias'],
      },
      {
        name: 'PREMIUM',
        description: 'Plano premium com mais destaques',
        price: 15000,
        currency: 'XOF',
        maxAds: 20,
        maxHighlights: 5,
        maxImages: 10,
        hasStore: false,
        adDuration: 30,
        features: ['Até 20 anúncios', '10 imagens por anúncio', '5 destaques', 'Duração de 30 dias'],
      },
      {
        name: 'BUSINESS',
        description: 'Plano completo para negócios',
        price: 50000,
        currency: 'XOF',
        maxAds: 100,
        maxHighlights: 20,
        maxImages: 20,
        hasStore: true,
        adDuration: 60,
        features: ['Até 100 anúncios', '20 imagens por anúncio', '20 destaques', 'Loja virtual', 'Duração de 60 dias'],
      },
    ];

    for (const planData of plans) {
      const existingPlan = await db.plan.findUnique({
        where: { name: planData.name },
      }).catch(() => null);

      if (!existingPlan) {
        await db.plan.create({ data: planData });
        console.log(`  ✅ Plano ${planData.name} criado`);
      } else {
        console.log(`  ⏭️  Plano ${planData.name} já existe`);
      }
    }

    // ============================================
    // CREATE CATEGORIES
    // ============================================
    console.log('\n📂 Criando categorias...');
    
    const categories = [
      { name: 'Imóveis', slug: 'imoveis', icon: '🏠', description: 'Compra, venda e aluguel de propriedades' },
      { name: 'Automóveis', slug: 'automoveis', icon: '🚗', description: 'Carros, motos e outros veículos' },
      { name: 'Eletrônicos', slug: 'eletronicos', icon: '📱', description: 'Celulares, computadores e acessórios' },
      { name: 'Moda e Vestuário', slug: 'moda', icon: '👕', description: 'Roupas, sapatos e acessórios' },
      { name: 'Móveis e Decoração', slug: 'moveis', icon: '🪑', description: 'Móveis, decoração e utensílios' },
      { name: 'Esportes e Lazer', slug: 'esportes', icon: '⚽', description: 'Equipamentos esportivos e lazer' },
      { name: 'Animais de Estimação', slug: 'animais', icon: '🐕', description: 'Venda e adoção de animais' },
      { name: 'Livros e Educação', slug: 'livros', icon: '📚', description: 'Livros, cursos e materiais educativos' },
      { name: 'Serviços', slug: 'servicos', icon: '🔧', description: 'Serviços diversos e profissionais' },
      { name: 'Emprego', slug: 'emprego', icon: '💼', description: 'Ofertas de emprego e trabalho' },
      { name: 'Alimentação', slug: 'alimentacao', icon: '🍔', description: 'Alimentos, bebidas e restaurantes' },
      { name: 'Casa e Jardim', slug: 'casa-jardim', icon: '🌿', description: 'Plantas, ferramentas e jardinagem' },
    ];

    for (const categoryData of categories) {
      const existing = await db.category.findUnique({
        where: { slug: categoryData.slug },
      }).catch(() => null);

      if (!existing) {
        await db.category.create({ data: categoryData });
        console.log(`  ✅ Categoria ${categoryData.name} criada`);
      } else {
        console.log(`  ⏭️  Categoria ${categoryData.name} já existe`);
      }
    }

    // ============================================
    // CREATE USERS
    // ============================================
    console.log('\n👤 Criando usuários reais...');

    // Check if test user exists
    const existingUser = await db.user.findUnique({
      where: { email: 'teste@bissaumarket.com' },
      include: { profile: true, subscriptions: true },
    }).catch(() => null);

    // Array de usuários reais para criar
    const usersToCreate = [
      {
        email: 'teste@bissaumarket.com',
        password: await bcrypt.hash('teste123', 10),
        firstName: 'João',
        lastName: 'Silva',
        role: 'user',
        phone: '+245950123456',
        isVerified: true,
      },
      {
        email: 'maria@bissaumarket.com',
        password: await bcrypt.hash('maria123', 10),
        firstName: 'Maria',
        lastName: 'Santos',
        role: 'user',
        phone: '+245950234567',
        isVerified: true,
      },
      {
        email: 'carlos@bissaumarket.com',
        password: await bcrypt.hash('carlos123', 10),
        firstName: 'Carlos',
        lastName: 'Oliveira',
        role: 'user',
        phone: '+245950345678',
        isVerified: true,
      },
      {
        email: 'ana@bissaumarket.com',
        password: await bcrypt.hash('ana123', 10),
        firstName: 'Ana',
        lastName: 'Costa',
        role: 'user',
        phone: '+245950456789',
        isVerified: true,
      },
      {
        email: 'pedro@bissaumarket.com',
        password: await bcrypt.hash('pedro123', 10),
        firstName: 'Pedro',
        lastName: 'Martins',
        role: 'user',
        phone: '+245950567890',
        isVerified: true,
      },
    ];

    let createdUsers = [];
    for (const userData of usersToCreate) {
      const existingTestUser = await db.user.findUnique({
        where: { email: userData.email },
        include: { profile: true, subscriptions: true },
      }).catch(() => null);

      if (!existingTestUser) {
        const testUser = await db.user.create({
          data: {
            ...userData,
            profile: {
              create: {
                bio: `Olá, sou ${userData.firstName} ${userData.lastName} do Bissau`,
                location: 'Bissau, Guiné-Bissau',
              },
            },
          },
          include: { profile: true },
        });
        createdUsers.push(testUser);
        
        // Criar subscrição com plano aleatório
        const allPlans = await db.plan.findMany();
        const randomPlan = allPlans[Math.floor(Math.random() * allPlans.length)];
        
        if (randomPlan) {
          await db.subscription.create({
            data: {
              userId: testUser.id,
              planId: randomPlan.id,
            },
          });
          console.log(`   ✅ ${userData.firstName} criado com plano ${randomPlan.name}`);
        }
      } else {
        console.log(`   ⏭️  ${userData.firstName} ${userData.lastName} já existe`);
        createdUsers.push(existingTestUser);
      }
    }

    // ============================================
    // CREATE ADMIN USER
    // ============================================
    console.log('\n👑 Criando usuário admin...');

    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@bissaumarket.com' },
      include: { profile: true, subscriptions: true },
    }).catch(() => null);

    let adminUser;
    if (!existingAdmin) {
      adminUser = await db.user.create({
        data: {
          email: 'admin@bissaumarket.com',
          password: await bcrypt.hash('Admin@123', 10),
          firstName: 'Admin',
          lastName: 'Bissau',
          role: 'admin',
          phone: '+245950999999',
          isVerified: true,
          profile: {
            create: {
              bio: 'Administrador da Plataforma Bissau Market',
              location: 'Bissau, Guiné-Bissau',
            },
          },
        },
        include: { profile: true, subscriptions: true },
      });

      // Criar subscrição BUSINESS para admin
      const businessPlan = await db.plan.findUnique({
        where: { name: 'BUSINESS' },
      });

      if (businessPlan) {
        await db.subscription.create({
          data: {
            userId: adminUser.id,
            planId: businessPlan.id,
          },
        });
        console.log('   ✅ Admin criado com plano BUSINESS');
        console.log('      Email: admin@bissaumarket.com');
        console.log('      Senha: Admin@123');
      }
    } else {
      adminUser = existingAdmin;
      console.log('   ⏭️  Admin já existe');
    }

    // ============================================
    // CREATE ADS (ANÚNCIOS REAIS)
    // ============================================
    console.log('\n📢 Criando anúncios reais...');

    const adsData = [
      {
        title: 'Apartamento moderno no centro de Bissau',
        description: 'Belo apartamento com 2 quartos, sala espaçosa, cozinha equipada e varanda. Localizado em prédio com segurança 24h.',
        category: 'imoveis',
        userId: createdUsers[0]?.id,
        location: 'Bissau Centro',
        price: 50000,
        status: 'active',
      },
      {
        title: 'Toyota Corolla 2015 - Excelente estado',
        description: 'Carro bem conservado, revisões em dia, 120 mil km. Documentação completa e em dia.',
        category: 'automoveis',
        userId: createdUsers[1]?.id,
        location: 'Bissau',
        price: 12000000,
        status: 'active',
      },
      {
        title: 'iPhone 14 Pro Max 256GB',
        description: 'Celular com 3 meses de uso, sem riscos, com capa original e carregador. Nota fiscal disponível.',
        category: 'eletronicos',
        userId: createdUsers[2]?.id,
        location: 'Bissau',
        price: 3500000,
        status: 'active',
      },
      {
        title: 'Jogo de sofá estofado 3+2',
        description: 'Sofá em ótimo estado, pouco usado. Cor cinza. Entrega local possível.',
        category: 'moveis',
        userId: createdUsers[3]?.id,
        location: 'Bissau',
        price: 800000,
        status: 'active',
      },
      {
        title: 'Bicicleta Mountain Bike aro 29',
        description: 'Bicicleta profissional com suspensão, pouco usada. Ideal para trilhas.',
        category: 'esportes',
        userId: createdUsers[4]?.id,
        location: 'Bissau',
        price: 450000,
        status: 'active',
      },
      {
        title: 'Terreno de 500m² em zona residencial',
        description: 'Terreno bem localizado, plano, com acesso fácil. Documentação em dia.',
        category: 'imoveis',
        userId: createdUsers[0]?.id,
        location: 'Bissau Zona Residencial',
        price: 150000,
        status: 'active',
      },
      {
        title: 'Moto Honda CB 250 - 2020',
        description: 'Moto conservada, revisões em dia, consumo econômico. Para aprendiz ou uso urbano.',
        category: 'automoveis',
        userId: createdUsers[1]?.id,
        location: 'Bissau',
        price: 8000000,
        status: 'active',
      },
      {
        title: 'Notebook Dell i7 16GB RAM SSD',
        description: 'Notebook gamer, rápido e potente. Bateria durável. Pouquíssimo uso.',
        category: 'eletronicos',
        userId: createdUsers[2]?.id,
        location: 'Bissau',
        price: 2000000,
        status: 'active',
      },
    ];

    for (const adData of adsData) {
      if (adData.userId) {
        const existingAd = await db.ad.findFirst({
          where: { title: adData.title },
        }).catch(() => null);

        if (!existingAd) {
          const category = await db.category.findUnique({
            where: { slug: adData.category },
          });

          if (category) {
            await db.ad.create({
              data: {
                title: adData.title,
                description: adData.description,
                categoryId: category.id,
                userId: adData.userId,
                location: adData.location,
                price: adData.price,
                status: adData.status,
                images: [],
              },
            });
            console.log(`   ✅ Anúncio "${adData.title}" criado`);
          }
        }
      }
    }

    // ============================================
    // CREATE REVIEWS
    // ============================================
    console.log('\n⭐ Criando avaliações...');

    // Criar reviews entre usuários
    const reviewsData = [
      {
        rating: 5,
        comment: 'Excelente vendedor! Produto conforme descrito e entrega rápida.',
        revieweeId: createdUsers[0]?.id,
        reviewerId: createdUsers[1]?.id,
      },
      {
        rating: 4,
        comment: 'Ótimo atendimento, recomendo!',
        revieweeId: createdUsers[1]?.id,
        reviewerId: createdUsers[2]?.id,
      },
      {
        rating: 5,
        comment: 'Produto de qualidade, vendedor confiável.',
        revieweeId: createdUsers[2]?.id,
        reviewerId: createdUsers[3]?.id,
      },
      {
        rating: 4,
        comment: 'Bom negócio, entrega pontual.',
        revieweeId: createdUsers[3]?.id,
        reviewerId: createdUsers[4]?.id,
      },
      {
        rating: 5,
        comment: 'Vendedor muito responsável e prestativo!',
        revieweeId: createdUsers[4]?.id,
        reviewerId: createdUsers[0]?.id,
      },
    ];

    for (const reviewData of reviewsData) {
      if (reviewData.revieweeId && reviewData.reviewerId) {
        const existingReview = await db.review.findFirst({
          where: {
            revieweeId: reviewData.revieweeId,
            reviewerId: reviewData.reviewerId,
          },
        }).catch(() => null);

        if (!existingReview) {
          await db.review.create({
            data: reviewData,
          });
          console.log(`   ✅ Avaliação criada: ${reviewData.rating} ⭐`);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully');
  } catch (e) {
    console.error('❌ Error during seeding:', e.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

main();
