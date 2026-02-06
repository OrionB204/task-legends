@echo off
echo ========================================================
echo   CONFIGURADOR AUTOMATICO DE CHAVES (SUPABASE SECRETS)
echo ========================================================
echo.
echo Este script vai definir automaticamente as chaves necessarias
echo no seu projeto Supabase para que os Pagamentos funcionem.
echo.
echo POR FAVOR, COLE A SUA CHAVE SECRETA DO STRIPE ABAIXO.
echo (Ela comeca com sk_live_ ou sk_test_)
echo.
set /p STRIPE_KEY="Cole a chave Stripe aqui e de ENTER: "

echo.
echo Definindo chaves no projeto ljqcnvsethddhaxvytlm...
echo Aguarde...

REM Tenta definir as chaves usando o CLI
call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm STRIPE_SECRET_KEY=%STRIPE_KEY%
call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm SUPABASE_URL=https://ljqcnvsethddhaxvytlm.supabase.co

echo.
echo ========================================================
echo   AGORA A CHAVE SECRETA DO SUPABASE (SERVICE ROLE)
echo ========================================================
echo.
echo Infelizmente nao consigo pegar essa chave automaticamente.
echo Voce precisa ir no PAINEL DO SUPABASE > Settings > API
echo e copiar a chave string 'service_role' (secret).
echo.
set /p SERVICE_KEY="Cole a chave service_role aqui: "

call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%

echo.
echo [SUCESSO] Se nao apareceram erros vermelhos acima, suas chaves estao configuradas!
echo Pode testar reenviar o webhook no Stripe agora.
pause
