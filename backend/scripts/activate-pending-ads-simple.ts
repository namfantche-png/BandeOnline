/**
 * Script simplificado para ativar anúncios pendentes
 * 
 * Executa a partir do diretório backend:
 *   npx ts-node scripts/activate-pending-ads-simple.ts
 * 
 * OU usando node diretamente (após compilar):
 *   npm run build
 *   node dist/scripts/activate-pending-ads-simple.js
 * 
 * Requer: DATABASE_URL configurado no .env ou variável de ambiente
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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
});

async function activatePendingAds() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    console.log(`📁 DATABASE_URL: ${connectionString!.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // Testa conexão
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
      console.log('Todos os anúncios já estão ativos ou não há anúncios pendentes.');
      return;
    }

    console.log(`\n📋 Encontrados ${pendingAds.length} anúncio(s) pendente(s):`);
    pendingAds.forEach((ad, index) => {
      console.log(`  ${index + 1}. ${ad.title}`);
      console.log(`     ID: ${ad.id}`);
      console.log(`     Criado em: ${new Date(ad.createdAt).toLocaleString('pt-GW')}\n`);
    });

    // Pergunta confirmação (em produção, pode remover)
    console.log('⚠️  Deseja ativar todos estes anúncios? (y/n)');
    console.log('   (Para execução automática, use: echo y | npx ts-node scripts/activate-pending-ads-simple.ts)');
    
    // Ativa todos os anúncios pendentes
    const result = await prisma.ad.updateMany({
      where: {
        status: 'pending',
      },
      data: {
        status: 'active',
      },
    });

    console.log(`\n✅ ${result.count} anúncio(s) ativado(s) com sucesso!`);
    console.log('🎉 Os anúncios agora aparecerão na plataforma.');
  } catch (error: any) {
    console.error('\n❌ Erro ao ativar anúncios:');
    console.error(error.message);
    
    if (error.message?.includes('DATABASE_URL')) {
      console.error('\n💡 Dica: Certifique-se de que:');
      console.error('   1. O arquivo .env existe no diretório backend/');
      console.error('   2. DATABASE_URL está configurado no .env');
      console.error('   3. O banco de dados está acessível');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
    console.log('\n🔌 Desconectado do banco de dados');
  }
}

// Executa o script
activatePendingAds()
  .then(() => {
    console.log('\n✨ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
