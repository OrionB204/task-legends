@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo   TASKLEGENDS: Sincronizar e Gerar Versao
echo ===================================================
echo.

echo 1. SALVANDO NO GITHUB (Backup)...
git add .
set commit_msg=update manual netlify drop
git commit -m "%commit_msg%" 2>nul

echo    - Tentando enviar para a nuvem (Pode demorar ou falhar)...
echo    - Se falhar aqui, o processo continuara para gerar o site.
git push origin deploy-fix --force 2>nul

echo.
echo 2. CONSTRUINDO O SITE (Aguarde...)...
echo    Executando comando: npm run build
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!!!] ERRO CRITICO AO GERAR O SITE [!!!]
    echo Verifique se existem erros de código acima.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. CONFIGURANDO REDIRECIONAMENTOS...
if not exist dist mkdir dist
echo /* /index.html 200 > dist\_redirects

echo.
echo 4. PREPARANDO PASTA FINAL...
if exist "SITE_PARA_UPLOAD" rmdir /s /q "SITE_PARA_UPLOAD"
move dist SITE_PARA_UPLOAD

echo.
echo 5. ABRINDO A PASTA...
start "" "%~dp0SITE_PARA_UPLOAD"

echo.
echo ===================================================
echo   PROCESSO FINALIZADO!
echo   ------------------------------------------------
echo   >>> ARRASTE A PASTA "SITE_PARA_UPLOAD" PARA:
echo   >>> app.netlify.com/drop
echo ===================================================
pause
