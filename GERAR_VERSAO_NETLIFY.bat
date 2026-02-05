@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo   TASKLEGENDS: Sincronizar e Gerar Versao
echo ===================================================
echo.

echo 1. SALVANDO NO GITHUB (Backup de Seguranca)...
git add .
set /p commit_msg="Digite uma mensagem para o update (ou Enter para padrao): "
if "!commit_msg!"=="" set commit_msg=update manual netlify drop
git commit -m "!commit_msg!"

echo    - Enviando para o GitHub...
git push origin master --force
git push origin main --force
git push origin deploy-fix --force
echo    [OK] Codigo salvo na nuvem!

echo.
echo 2. CONSTRUINDO O SITE (Aguarde...)...
call npm run build

echo.
echo 3. CONFIGURANDO REDIRECIONAMENTOS...
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
echo   PROCESSO FINALIZADO COM SUCESSO!
echo   ------------------------------------------------
echo   1. Seu codigo foi salvo no GitHub (Seguro).
echo   2. A pasta "SITE_PARA_UPLOAD" abriu na sua tela.
echo.
echo   >>> ARRASTE ELA PARA: app.netlify.com/drop
echo ===================================================
pause
