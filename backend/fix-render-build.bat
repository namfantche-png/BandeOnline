@echo off
REM Script para preparar Render deployment (Windows CMD)
REM Este script contorna o problema de permissão do PowerShell

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║   🚀 PREPARAÇÃO PARA DEPLOY NO RENDER (Windows CMD)           ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

REM Step 1: Verificar Node.js
echo [INFO] 1️⃣ Verificando Node.js...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js não está instalado!
    exit /b 1
)
echo [✓] Node.js OK
echo.

REM Step 2: Verificar npm
echo [INFO] 2️⃣ Verificando npm...
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] npm não está instalado!
    exit /b 1
)
echo [✓] npm OK
echo.

REM Step 3: Limpeza
echo [INFO] 3️⃣ Limpando build anterior...
if exist dist (
    rmdir /s /q dist
)
mkdir dist
echo [✓] Limpeza concluída
echo.

REM Step 4: Instalar dependências
echo [INFO] 4️⃣ Instalando dependências...
echo Executando: npm ci (ou npm install)
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] npm ci falhou, tentando npm install...
    call npm install
)
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependências!
    exit /b 1
)
echo [✓] Dependências instaladas
echo.

REM Step 5: Gerar Prisma Client
echo [INFO] 5️⃣ Gerando Prisma Client...
echo Executando: npx prisma generate
call npx prisma generate --skip-engine-check
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao gerar Prisma Client!
    echo.
    echo [DEBUG] Verificando pasta .prisma...
    if exist "node_modules\.prisma\client" (
        echo ✓ node_modules\.prisma\client encontrado!
    ) else (
        echo ✗ node_modules\.prisma\client NÃO encontrado!
    )
    exit /b 1
)
echo [✓] Prisma Client gerado
echo.

REM Verificar se .prisma/client foi criado
if exist "node_modules\.prisma\client" (
    echo [✓] ✅ Arquivo .prisma/client criado com sucesso!
    dir /b "node_modules\.prisma\client" | findstr /R "index" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [✓] Tipagem TypeScript disponível
    )
) else (
    echo [ERROR] ✗ Diretório .prisma/client não foi criado!
    exit /b 1
)
echo.

REM Step 6: Compilar TypeScript
echo [INFO] 6️⃣ Compilando TypeScript...
echo Executando: npm run build
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Compilação falhou!
    exit /b 1
)
echo [✓] Compilação bem-sucedida!
echo.

REM Step 7: Verificar dist
echo [INFO] 7️⃣ Verificando saída do build...
if exist "dist\main.js" (
    echo [✓] ✅ Arquivo dist/main.js criado com sucesso!
    for /F "usebackq" %%A in ('dir "dist\main.js" /B') do (
        echo [✓] Arquivo: %%A
    )
) else (
    echo [ERRO] dist/main.js não foi criado!
    exit /b 1
)
echo.

REM Final Summary
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║                  ✅ SUCESSO!                                   ║
echo ║                                                                ║
echo ║         Build testado com sucesso localmente!                 ║
echo ║                                                                ║
echo ║         Você pode fazer push para Render.com                  ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo Próximos passos:
echo  1. Fazer commit: git add -A & git commit -m "chore: ..."
echo  2. Fazer push: git push origin main
echo  3. Acompanhar em Render.com
echo.

endlocal
