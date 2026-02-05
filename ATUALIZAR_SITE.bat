@echo off
echo ========================================
echo   ATUALIZANDO TASKLEGENDS (SINCRONIZACAO TOTAL)
echo ========================================

echo 1. Adicionando arquivos...
git add .
git commit -m "chore: trigger fresh deploy for V2 sync"

echo.
echo 2. Enviando para GITHUB (Origin)...
echo    - Branch: master
git push origin master --force
echo    - Branch: main
git push origin main --force
echo    - Branch: deploy-fix
git push origin deploy-fix --force

echo.
echo 3. Enviando para PRODUCAO (Production)...
echo    - Branch: master
git push production master --force
echo    - Branch: main
git push production main --force
echo    - Branch: deploy-fix
git push production deploy-fix --force

echo.
echo ========================================
echo   TODOS OS CANAIS FORAM FORCADOS!
echo   Aguarde 2 minutos e teste o site online.
echo ========================================
pause
