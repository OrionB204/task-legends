@echo off
echo ========================================================
echo   DEPLOY DA FUNCAO DE PAGAMENTO (STRIPE WEBHOOK)
echo ========================================================
echo.
echo Este script vai enviar a logica de processamento de pagamentos 
echo para o seu projeto Supabase (LJQ...).
echo.
echo 1. Voce precisa ter o Supabase CLI instalado.
echo 2. Voce precisa estar logado (supabase login).
echo.
echo Pressione qualquer tecla para tentar fazer o deploy...
pause

call npx supabase functions deploy stripe-webhook --project-ref ljqcnvsethddhaxvytlm --no-verify-jwt

echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCESSO] Funcao enviada!
    echo.
    echo AHORA VAI NO STRIPE DASHBOARD E CONFIGURE O WEBHOOK:
    echo URL: https://ljqcnvsethddhaxvytlm.supabase.co/functions/v1/stripe-webhook
    echo Eventos: checkout.session.completed
) else (
    echo [ERRO] Falha ao enviar. Verifique se o CLI esta instalado e logado.
)
pause
