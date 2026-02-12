const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bissaumarket';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    console.log('👑 Criando usuário admin padrão...\n');

    // Verifica se admin já existe
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@bissaumarket.com' },
    }).catch(() => null);

    if (existingAdmin) {
      console.log('⚠️  Admin já existe no sistema');
      console.log(`   Email: admin@bissaumarket.com`);
      console.log(`   Senha: Admin@123`);
      return;
    }

    // Criar admin
    const admin = await db.user.create({
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
      include: { profile: true },
    });

    // Atribuir plano BUSINESS ao admin
    const businessPlan = await db.plan.findUnique({
      where: { name: 'BUSINESS' },
    });

    if (businessPlan) {
      await db.subscription.create({
        data: {
          userId: admin.id,
          planId: businessPlan.id,
        },
      });
    }

    console.log('✅ Admin criado com sucesso!\n');
    console.log('📋 Credenciais do Admin:');
    console.log(`   Email: admin@bissaumarket.com`);
    console.log(`   Senha: Admin@123`);
    console.log(`   Role: admin`);
    console.log(`   Plano: BUSINESS`);
    console.log(`\n💡 Use essas credenciais para acessar o dashboard admin`);

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

createAdmin();
