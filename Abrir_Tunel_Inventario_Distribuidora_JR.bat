@echo off
title Tunel - Inventario Distribuidora JR
color 0b
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0abrir_tunel_inventario.ps1"
echo.
echo Presiona una tecla para cerrar esta ventana...
pause >nul
