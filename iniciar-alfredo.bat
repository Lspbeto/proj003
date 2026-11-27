@echo off
title Alfredo - Assistente pessoal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale a versao LTS em https://nodejs.org/ e execute este arquivo novamente.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Preparando o Alfredo pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar as dependencias. Confira sua conexao e tente novamente.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o Alfredo...
echo No notebook: http://localhost:3000
echo Para o celular, use o IPv4 deste notebook na mesma rede Wi-Fi.
echo Mantenha esta janela aberta enquanto estiver usando o Alfredo.
echo.
call npm start
pause
