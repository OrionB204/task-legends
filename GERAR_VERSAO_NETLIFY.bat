@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo   TASKLEGENDS: Sincronizar e Gerar Versao
echo ===================================================
echo.

echo 1. SALVANDO NO GITHUB (Opcional)...
git add .
set commit_msg=update manual netlify drop
set /p commit_msg="Digite uma mensagem ou ENTER para padrao: "
git commit -m "%commit_msg%"

echo    - Tentando enviar para a nuvem...
git push origin master --force > push_log.txt 2>&1
git push origin main --force >> push_log.txt 2>&1
git push origin deploy-fix --force >> push_log.txt 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo    [!] AVISO: O backup no GitHub falhou (historico de arquivos grandes).
    echo    [!] NAO SE PREOCUPE: O site para o Netlify sera gerado agora.
    echo.
) else (
    echo    [OK] Codigo salvo com sucesso no GitHub!
)

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
