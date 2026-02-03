@echo off
echo ==========================================
echo   FORCANDO LIMPEZA E ATUALIZACAO
echo ==========================================
echo.
echo 1. Adicionando todas as mudancas...
git add .

echo.
echo 2. Salvando alteracoes (Commit)...
git commit -m "style: force hide floating buttons via css override"

echo.
echo 3. Enviando para o GitHub (Push)...
git push

echo.
echo ==========================================
echo   SUCESSO! O Vercel deve atualizar em breve.
echo   Se os botoes nao sumirem, limpe o cache do seu celular.
echo ==========================================
pause
