@echo off
echo ==========================================
echo      PREPARANDO PARA PUBLICAR (DEPLOY)
echo ==========================================

:: 1. Apaga histórico antigo se existir (limpeza)
echo [1/6] Limpando configuracoes antigas...
if exist .git (
    rmdir /s /q .git
)

:: 2. Inicia novo repositorio
echo [2/6] Iniciando novo repositorio...
git init

:: 3. Configura usuario generico para nao dar erro
echo [3/6] Configurando usuario...
git config user.email "deploy@tasklegends.com"
git config user.name "TaskLegends Admin"

:: 4. Adiciona arquivos
echo [4/6] Adicionando arquivos (pode demorar um pouco)...
git add .

:: 5. Commit
echo [5/6] Salvando versao...
git commit -m "Versao Final para Deploy"

:: 6. Conecta e Envia
echo [6/6] Enviando para o GitHub...
echo AVISO: Se abrir uma janela de login, faca o login!
git remote add origin https://github.com/OrionB204/task-legends.git
git push -u origin main --force

echo.
echo ==========================================
echo      PROCESSO FINALIZADO!
echo ==========================================
echo Se apareceu "Branch main set up to track", DEU CERTO!
pause
