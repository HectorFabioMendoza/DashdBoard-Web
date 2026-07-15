@echo off
cd /d "%~dp0"
title Actualizar Datos desde ERP (DBF) - Distribuidora JR
color 0a
echo ===================================================
echo   IMPORTACION AUTOMATICA DESDE ERP (DBF)
echo ===================================================
echo.
echo Iniciando el proceso de actualizacion desde DBF...
echo.

python actualizar_dashboard_dbf.py

echo.
echo ===================================================
echo   PROCESO TERMINADO
echo ===================================================
echo.
pause
