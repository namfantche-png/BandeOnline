@echo off
REM ================================================================
REM Script para CORRIGIR .gitignore e adicionar módulo uploads
REM ================================================================
REM Execute este script do diretório raiz do projeto:
REM   fix-uploads-git.bat
REM ================================================================

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   Corrigindo .gitignore e adicionando uploads ao Git     ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Verificar se estamos no diretório correto
if not exist "backend\src\modules\uploads" (
    echo [ERRO] Diretório backend\src\modules\uploads não encontrado!
    echo        Execute este script do diretório raiz: BandeOnline\
    exit /b 1
)

echo [1/5] Verificando status do Git...
git status --short
echo.

echo [2/5] Verificando .gitignore...
findstr /M "^/uploads/" backend\.gitignore >nul
if %ERRORLEVEL% EQU 0 (
    echo      ✓ .gitignore já está correto!
) else (
    echo      ✗ .gitignore ainda precisa de correção
)
echo.

echo [3/5] Adicionando arquivos do módulo uploads...
echo      Executando: git add -f backend\src\modules\uploads\
git add -f backend\src\modules\uploads\
if %ERRORLEVEL% EQU 0 (
    echo      ✓ Arquivos adicionados com sucesso!
) else (
    echo      ✗ Erro ao adicionar arquivos!
    exit /b 1
)
echo.

echo [4/5] Adicionando .gitignore atualizado...
echo      Executando: git add backend\.gitignore
git add backend\.gitignore
if %ERRORLEVEL% EQU 0 (
    echo      ✓ .gitignore adicionado!
) else (
    echo      ✗ Erro ao adicionar .gitignore!
    exit /b 1
)
echo.

echo [5/5] Verificando o que será commitado...
echo      Arquivos a serem adicionados:
git status --short | find "A  "
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║         Tudo pronto! Agora você pode fazer:              ║
echo ║                                                           ║
echo ║   git commit -m "chore: add uploads module to git"       ║
echo ║   git push origin main                                   ║
echo ║                                                           ║
echo ║         Render vai clonar com os arquivos! 🚀            ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

pause
