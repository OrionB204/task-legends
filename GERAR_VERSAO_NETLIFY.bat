@echo off
echo ===================================================
echo   GERANDO VERSAO PARA NETLIFY DROP...
echo ===================================================
echo.
echo 1. Construindo o site (aguarde...)...
call npm run build

echo.
echo 2. Criando arquivo de redirecionamento (Para nao dar erro 404)...
echo /* /index.html 200 > dist\_redirects

echo.
echo 3. Abrindo a pasta para voce...
start "" "%~dp0dist"

echo.
echo ===================================================
echo   PRONTO!
echo   A pasta "dist" foi aberta.
echo   Agora basta arrastar ela para: app.netlify.com/drop
echo ===================================================
pause
