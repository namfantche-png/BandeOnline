"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
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
            console.log('Todos os anúncios já estão ativos ou não há anúncios pendentes.');
            return;
        }
        console.log(`\n📋 Encontrados ${pendingAds.length} anúncio(s) pendente(s):`);
        pendingAds.forEach((ad, index) => {
            console.log(`  ${index + 1}. ${ad.title}`);
            console.log(`     ID: ${ad.id}`);
            console.log(`     Criado em: ${new Date(ad.createdAt).toLocaleString('pt-GW')}\n`);
        });
        console.log('⚠️  Deseja ativar todos estes anúncios? (y/n)');
        console.log('   (Para execução automática, use: echo y | npx ts-node scripts/activate-pending-ads-simple.ts)');
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
    }
    catch (error) {
        console.error('\n❌ Erro ao ativar anúncios:');
        console.error(error.message);
        if (error.message?.includes('DATABASE_URL')) {
            console.error('\n💡 Dica: Certifique-se de que:');
            console.error('   1. O arquivo .env existe no diretório backend/');
            console.error('   2. DATABASE_URL está configurado no .env');
            console.error('   3. O banco de dados está acessível');
        }
        throw error;
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
        console.log('\n🔌 Desconectado do banco de dados');
    }
}
activatePendingAds()
    .then(() => {
    console.log('\n✨ Script executado com sucesso!');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
});
//# sourceMappingURL=activate-pending-ads-simple.js.map