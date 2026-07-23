@echo off
chcp 65001 > nul
cd /d "%~dp0"
python actualizar_inventario_carapacho.py
exit /b %ERRORLEVEL%
