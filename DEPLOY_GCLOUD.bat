@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   DIAGNOSTICO E DEPLOY - GOOGLE CLOUD RUN
echo ========================================================
echo.
echo Procurando gcloud installado...

set "GCLOUD_PATH="

REM Tenta encontrar no Local AppData (Instalacao padrao por usuario)
if exist "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" (
    set "GCLOUD_PATH=%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin"
)

REM Tenta encontrar em Program Files (Instalacao global)
if not defined GCLOUD_PATH (
    if exist "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" (
        set "GCLOUD_PATH=C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
    )
)

if not defined GCLOUD_PATH (
    echo [ERRO] Nao foi possivel encontrar o 'gcloud' automaticamente.
    echo.
    echo 1. Se voce acabou de instalar, tente REINICIAR O COMPUTADOR.
    echo 2. Se nao instalou, rode o 'GoogleCloudSDKInstaller.exe' na pasta.
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo [OK] gcloud encontrado em: !GCLOUD_PATH!
set "PATH=!GCLOUD_PATH!;%PATH%"

echo.
echo Verificando autenticacao...
call gcloud auth print-identity-token >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Voce nao esta logado. Abrindo login no navegador...
    call gcloud auth login
)

echo.
echo ========================================================
echo ETAPA 1: CONSTRUINDO CONTAINER (Build)
echo ========================================================
echo.

REM Pegar ID do Projeto automaticamente
FOR /F "tokens=*" %%g IN ('call gcloud config get-value project') do (SET PROJECT_ID=%%g)
echo Projeto detectado: !PROJECT_ID!

REM Definir nome da imagem
set IMAGE_NAME=us-central1-docker.pkg.dev/!PROJECT_ID!/cloud-run-source-deploy/tasklegends

echo Construindo imagem e enviando para o Google Artifact Registry...
call gcloud builds submit --tag !IMAGE_NAME! . > build_log.txt 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao construir o container.
    echo Veja os detalhes em 'build_log.txt'.
    echo --- ULTIMAS LINHAS ---
    powershell -Command "Get-Content build_log.txt -Tail 10"
    echo.
    echo Tente rodar novamente. Se persistir, pode ser erro no Dockerfile.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo ETAPA 2: FAZENDO DEPLOY DO SERVICO
echo ========================================================
echo.

call gcloud run deploy tasklegends ^
  --image !IMAGE_NAME! ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --min-instances 0 ^
  --max-instances 5 ^
  --cpu 1 ^
  --memory 512Mi ^
  --concurrency 80 ^
  --quiet > deploy_log.txt 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCESSO] DEPLOY FINALIZADO!
    echo Veja o final do arquivo deploy_log.txt para o link:
    echo ---------------------------------------------------
    tail -n 5 deploy_log.txt 2>nul || type deploy_log.txt
    echo ---------------------------------------------------
) else (
    echo.
    echo [ERRO] O deploy falhou.
    echo Detalhes do erro foram salvos em 'deploy_log.txt'.
    echo.
    echo --- ULTIMAS LINHAS DO ERRO ---
    powershell -Command "Get-Content deploy_log.txt -Tail 15"
    
    REM Verificacao especifica de erro de faturamento
    findstr /C:"billing-enabled" deploy_log.txt >nul
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ==================================================================
        echo [!] ACAO NECESSARIA: ATIVAR FATURAMENTO (BILLING)
        echo ==================================================================
        echo O Google Cloud EXIGE um cartao de credito ou conta de faturamento
        echo vinculada ao projeto para permitir o uso do Cloud Run e Cloud Build.
        echo.
        echo OBS: O script configura o servico para ser GRATUITO (Free Tier),
        echo mas o cadastro do cartao e obrigatorio pelo Google para "ativar".
        echo.
        echo Abrindo a pagina de ativacao para voce...
        
        FOR /F "tokens=*" %%g IN ('gcloud config get-value project') do (SET CURRENT_PROJECT=%%g)
        timeout /t 3 >nul
        start https://console.cloud.google.com/billing/linkedaccount?project=!CURRENT_PROJECT!
    )
)

echo.
echo Pressione qualquer tecla para sair (ou rode novamente apos ativar o faturamento)...
pause
