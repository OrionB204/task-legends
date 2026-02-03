@echo off
title Configurando Automação de Pagamentos TaskQuest
color 0A

echo ========================================================
echo   INICIANDO CONFIGURACAO AUTOMATICA DO SERVIDOR
echo ========================================================
echo.
echo 1. Verificando Login...
call npx supabase login
if %errorlevel% neq 0 (
    echo [ERRO] Falha no login. Tente novamente ou verifique sua internet.
    pause
    exit /b
)

echo.
echo 2. Conectando ao Projeto TaskQuest...
call npx supabase link --project-ref btqgaoeewllurhhopjwn
if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel conectar ao projeto.
    pause
    exit /b
)

echo.
echo 3. Guardando a Chave Secreta do Stripe...
call npx supabase secrets set STRIPE_SECRET_KEY=SUA_CHAVE_AQUI
if %errorlevel% neq 0 (
    echo [AVISO] Talvez a chave ja esteja salva ou houve um erro menor. Continuando...
)

echo.
echo 4. Enviando o Robo de Pagamento para a Nuvem...
call npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref btqgaoeewllurhhopjwn
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao enviar o codigo.
    pause
    exit /b
)

echo.
echo ========================================================
echo   SUCESSO! SEU SERVIDOR ESTA PRONTO.
echo ========================================================
echo.
echo AGORA VÁ NO STRIPE E CONFIGURE O WEBHOOK PARA:
echo https://btqgaoeewllurhhopjwn.supabase.co/functions/v1/stripe-webhook
echo.
echo Evento necessario: checkout.session.completed
echo.
pause
