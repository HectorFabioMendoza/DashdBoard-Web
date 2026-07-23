@echo off
chcp 65001 > nul
title Actualizar Tablero Inventario Carapacho desde DBF
echo ===================================================
echo   ACTUALIZANDO DATOS DE INVENTARIO CARAPACHO
echo ===================================================
cd /d "%~dp0"
python actualizar_inventario_carapacho.py
echo.
echo Presione cualquier tecla para salir...
pause > nul
