@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   APLICADOR DE CHAVES (LEITOR DE ARQUIVO)
echo ========================================================
echo.
echo Lendo o arquivo 'COLAR_CHAVES_AQUI.txt'...

set "STRIPE_KEY="
set "SUPABASE_KEY="

REM Lê o arquivo linha por linha
for /f "usebackq tokens=1,2 delims==" %%A in ("COLAR_CHAVES_AQUI.txt") do (
    set "KEY_NAME=%%A"
    set "KEY_VALUE=%%B"
    
    REM Remove espaços em branco
    set "KEY_NAME=!KEY_NAME: =!"
    
    if "!KEY_NAME!"=="STRIPE_SECRET_KEY" (
        set "STRIPE_KEY=!KEY_VALUE!"
    )
    if "!KEY_NAME!"=="SUPABASE_SERVICE_ROLE_KEY" (
        set "SUPABASE_KEY=!KEY_VALUE!"
    )
)

REM Verificação básica
if "!STRIPE_KEY!"=="" (
    echo [ERRO] Nao encontrei a STRIPE_SECRET_KEY no arquivo.
    echo Verifique se voce salvou o arquivo corretamente.
    pause
    exit /b
)
if "!STRIPE_KEY!"=="cole_sua_chave_stripe_aqui" (
    echo [ERRO] Voce nao colou a chave do Stripe! Ainda esta o texto de exemplo.
    pause
    exit /b
)

echo.
echo Chaves encontradas! Enviando para o Supabase...
echo.

call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm STRIPE_SECRET_KEY=!STRIPE_KEY!
call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm SUPABASE_URL=https://ljqcnvsethddhaxvytlm.supabase.co
call npx supabase secrets set --project-ref ljqcnvsethddhaxvytlm SUPABASE_SERVICE_ROLE_KEY=!SUPABASE_KEY!

echo.
echo ========================================================
echo   SUCESSO! CHAVES CONFIGURADAS.
echo ========================================================
echo Agora va no STRIPE e clique em "Reenviar" no webhook.
pause
