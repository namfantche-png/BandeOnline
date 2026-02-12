/**
 * Script para ativar anúncios pendentes
 * 
 * Executa a partir do diretório backend:
 *   npx ts-node scripts/activate-pending-ads.ts
 * 
 * Requer: DATABASE_URL configurado no .env
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Tenta carregar dotenv se disponível
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch (e) {
  // dotenv não instalado, usa variáveis de ambiente do sistema
  console.log('ℹ️  dotenv não encontrado, usando variáveis de ambiente do sistema');
}

// Carrega DATABASE_URL do ambiente
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não encontrado!');
  console.error('Por favor, configure DATABASE_URL no arquivo .env');
  process.exit(1);
}

// Cria pool de conexões PostgreSQL
const pool = new Pool({
  connectionString,
});

// Cria adapter Prisma para PostgreSQL
const adapter = new PrismaPg(pool);

// Inicializa PrismaClient com adapter (igual ao DatabaseService)
const prisma = new PrismaClient({
  adapter,
  errorFormat: 'pretty',
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function activatePendingAds() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    console.log(`📁 DATABASE_URL: ${connectionString!.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // Conecta ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('🔍 Buscando anúncios com status "pending"...');

    const pendingAds = await prisma.ad.findMany({
      where: {
        status: 'pending',
      },
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
      },
    });

    if (pendingAds.length === 0) {
      console.log('✅ Nenhum anúncio pendente encontrado.');
      return;
    }

    console.log(`📋 Encontrados ${pendingAds.length} anúncios pendentes:`);
    pendingAds.forEach((ad) => {
      console.log(`  - ${ad.title} (ID: ${ad.id})`);
    });

    // Ativa todos os anúncios pendentes
    const result = await prisma.ad.updateMany({
      where: {
        status: 'pending',
      },
      data: {
        status: 'active',
      },
    });

    console.log(`\n✅ ${result.count} anúncios ativados com sucesso!`);
    console.log('Os anúncios agora aparecerão na plataforma.');
  } catch (error) {
    console.error('❌ Erro ao ativar anúncios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Executa o script
activatePendingAds()
  .then(() => {
    console.log('\n✨ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error.message);
    if (error.message?.includes('PrismaClient') || error.message?.includes('DATABASE_URL')) {
      console.error('\n💡 Solução:');
      console.error('   1. Certifique-se de estar no diretório backend/');
      console.error('   2. Verifique se .env existe e tem DATABASE_URL');
      console.error('   3. Execute: npx prisma generate');
      console.error('   4. Teste conexão: npx prisma db pull');
    }
    process.exit(1);
  });
