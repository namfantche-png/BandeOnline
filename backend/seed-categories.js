const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const categories = [
  {
    name: 'Eletrónicos',
    slug: 'eletronicos',
    description: 'Computadores, telemóveis, tablets, câmaras e outros dispositivos eletrónicos',
  },
  {
    name: 'Automóveis',
    slug: 'automoveis',
    description: 'Carros, motos, peças e acessórios para automóveis',
  },
  {
    name: 'Imóveis',
    slug: 'imoveis',
    description: 'Casas, apartamentos, terrenos e propriedades',
  },
  {
    name: 'Roupas e Calçados',
    slug: 'roupas-calcados',
    description: 'Vestuário, sapatos e acessórios de moda',
  },
  {
    name: 'Casa e Jardim',
    slug: 'casa-jardim',
    description: 'Móveis, decoração, utensílios de cozinha e artigos para jardim',
  },
  {
    name: 'Livros e Media',
    slug: 'livros-media',
    description: 'Livros, revistas, DVD, CD e outros materiais de media',
  },
  {
    name: 'Esportes e Lazer',
    slug: 'esportes-lazer',
    description: 'Equipamento desportivo, jogos e artigos de lazer',
  },
  {
    name: 'Serviços',
    slug: 'servicos',
    description: 'Oferecimento de serviços profissionais e pessoais',
  },
  {
    name: 'Saúde e Beleza',
    slug: 'saude-beleza',
    description: 'Produtos de beleza, cosméticos, suplementos e cuidados pessoais',
  },
  {
    name: 'Animais de Estimação',
    slug: 'animais-estimacao',
    description: 'Animais de estimação, alimentos e acessórios para pets',
  },
  {
    name: 'Comida e Bebidas',
    slug: 'comida-bebidas',
    description: 'Alimentos frescos, bebidas e produtos alimentares',
  },
  {
    name: 'Educação',
    slug: 'educacao',
    description: 'Cursos, aulas particulares e materiais educacionais',
  },
];

async function seedCategories() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bissaumarket';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    console.log('🌱 Criando categorias padrão...');

    for (const category of categories) {
      const existing = await db.category.findUnique({
        where: { slug: category.slug },
      }).catch(() => null);

      if (!existing) {
        const created = await db.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
        });
        console.log(`✅ Categoria criada: ${created.name}`);
      } else {
        console.log(`⏭️ Categoria já existe: ${category.name}`);
      }
    }

    console.log('✅ Todas as categorias foram processadas com sucesso');
  } catch (e) {
    console.error('❌ Erro ao criar categorias:', e.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

seedCategories();
