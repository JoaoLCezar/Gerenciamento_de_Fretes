@echo off
REM Script para instalar dependências do projeto Gerenciamento de Fretes
REM Execute este arquivo como administrador

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo  Instalador - Gerenciamento de Fretes
echo ============================================================
echo.

REM Verificar se Node.js está instalado
echo Verificando Node.js...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERRO] Node.js não está instalado!
    echo.
    echo Por favor, instale Node.js LTS de: https://nodejs.org/
    echo Após instalar, execute este script novamente.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado:
node --version
echo.

REM Verificar npm
echo Verificando npm...
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERRO] npm não está instalado!
    pause
    exit /b 1
)

echo [OK] npm encontrado:
npm --version
echo.

REM Instalar dependências
echo Instalando dependências do projeto...
echo.
call npm install

if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [SUCESSO] Dependências instaladas com sucesso!
echo ============================================================
echo.
echo Próximos passos:
echo.
echo 1. Configure o Firebase em src/services/firebaseConfig.ts
echo    - Obtenha suas credenciais de https://console.firebase.google.com/
echo    - Atualize apiKey, projectId, etc.
echo.
echo 2. Inicie o projeto com um dos comandos:
echo    - npm start              (Expo Go - mais fácil)
echo    - npm run android        (Emulador Android)
echo    - npm run ios            (Emulador iOS - apenas macOS)
echo.
echo 3. Abra em seu emulador/celular e teste!
echo.
pause
