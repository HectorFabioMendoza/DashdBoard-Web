@echo off
cd /d "%~dp0"
echo ===================================================
echo   IMPORTACION AUTOMATICA DESDE ERP (DBF) - TAREA
echo ===================================================
echo.
echo Iniciando el proceso de actualizacion de datos...
python actualizar_dashboard_dbf.py
echo Proceso terminado.
