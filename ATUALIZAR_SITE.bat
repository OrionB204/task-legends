@echo off
echo ========================================
echo   ATUALIZANDO TASKLEGENDS (FORCADO)
echo ========================================
git add .
git commit -m "fix: manual force update and button removal"
git push origin master --force
git push origin main --force
echo ========================================
echo   PROCESSO CONCLUIDO! 
echo   Aguarde 1 minuto e recarregue o site.
echo ========================================
pause
