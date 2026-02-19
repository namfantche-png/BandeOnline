#!/usr/bin/env node

/**
 * Script de diagnóstico e preparação para Render (VERSÃO CORRIGIDA)
 * Pode ser executado com: node prepare-render.js
 * 
 * PROBLEMA ENCONTRADO: prisma.config.ts está causando conflitos
 * SOLUÇÃO: Este script vai deletar prisma.config.ts e gerar Prisma Client
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function info(msg) { log(colors.blue, 'INFO', msg); }
function success(msg) { log(colors.green, '✓', msg); }
function error(msg) { log(colors.red, '✗', msg); }
function warn(msg) { log(colors.yellow, '!', msg); }
function debug(msg) { log(colors.cyan, 'DEBUG', msg); }

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const cmdStr = `${command} ${args.join(' ')}`;
    debug(`Executando: ${cmdStr}`);
    
    const proc = spawn(command, args, {
      shell: true,
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   🚀 PREPARAÇÃO PARA RENDER (PROBLEMA ENCONTRADO)            ║');
  console.log('║                                                                ║');
  console.log('║   DIAGNÓSTICO: prisma.config.ts causando conflitos            ║');
  console.log('║   SOLUÇÃO: Deletar arquivo e gerar Prisma Client             ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: ENCONTRAR E DELETAR prisma.config.ts
    info('🔴 PROBLEMA: prisma.config.ts precisa ser deletado!');
    const configPath = path.join(process.cwd(), 'prisma.config.ts');
    
    if (fs.existsSync(configPath)) {
      warn('⚠️  Encontrado: prisma.config.ts');
      warn('   Causa: Conflita com prisma/schema.prisma');
      warn('   Solução: Deletando...');
      
      fs.unlinkSync(configPath);
      success('✅ prisma.config.ts deletado!');
    } else {
      success('prisma.config.ts não existe (já foi removido)');
    }
    
    console.log();

    // Step 2: Verificar Node.js
    info('1️⃣ Verificando Node.js...');
    const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
    success(`Node.js: ${nodeVersion}`);

    // Step 3: Verificar npm
    info('2️⃣ Verificando npm...');
    const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
    success(`npm: ${npmVersion}`);
    console.log();

    // Step 4: Gerar Prisma Client (AGORA SEM CONFLITOS)
    info('3️⃣ Gerando Prisma Client...');
    console.log('Executando: npx prisma generate\n');
    
    try {
      execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      success('✅ Prisma Client gerado com sucesso!');
    } catch (err) {
      error('❌ Falha ao gerar Prisma Client');
      error(`Erro: ${err.message}`);
      process.exit(1);
    }
    
    console.log();

    // Step 5: Verificar se foi gerado
    info('4️⃣ Verificando geração...');
    const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
    
    if (fs.existsSync(prismaPath)) {
      success(`✅ node_modules/.prisma/client criado`);
    } else {
      error('❌ node_modules/.prisma/client não encontrado!');
      process.exit(1);
    }
    
    console.log();

    // Step 6: Compilar TypeScript
    info('5️⃣ Compilando TypeScript...');
    console.log('Executando: npm run build\n');
    
    try {
      await runCommand('npm', ['run', 'build']);
      success('✅ Compilação bem-sucedida!');
    } catch (err) {
      error('❌ Compilação falhou!');
      error(`Erro: ${err.message}`);
      process.exit(1);
    }

    // Final summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║                  ✅ PROBLEMA RESOLVIDO!                       ║');
    console.log('║                                                                ║');
    console.log('║  ✓ prisma.config.ts foi DELETADO                             ║');
    console.log('║  ✓ Prisma Client gerado com sucesso                          ║');
    console.log('║  ✓ TypeScript compilado                                       ║');
    console.log('║                                                                ║');
    console.log('║     Pronto para fazer deploy no Render!                      ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('$ git status\n');
    console.log('$ git add -A && git commit -m "chore: remove prisma.config.ts for Render"\n');
    console.log('$ git push origin main\n');

  } catch (err) {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  error(err.message);
  process.exit(1);
});
