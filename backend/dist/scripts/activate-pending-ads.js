"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
catch (e) {
    console.log('ℹ️  dotenv não encontrado, usando variáveis de ambiente do sistema');
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ Erro: DATABASE_URL não encontrado!');
    console.error('Por favor, configure DATABASE_URL no arquivo .env');
    process.exit(1);
}
const pool = new pg_1.Pool({
    connectionString,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
async function activatePendingAds() {
    try {
        console.log('🔌 Conectando ao banco de dados...');
        console.log(`📁 DATABASE_URL: ${connectionString.replace(/:[^:@]+@/, ':****@')}\n`);
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
    }
    catch (error) {
        console.error('❌ Erro ao ativar anúncios:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
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
//# sourceMappingURL=activate-pending-ads.js.map