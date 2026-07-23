# Manual de Despliegue: Tablero Inventario Carapacho

Este documento detalla los pasos para compilar, alojar y automatizar el **Tablero Inventario Carapacho** en el Servidor de Carapacho SM bajo `http://localhost/tableroinventario/`.

---

## 1. Requisitos Previos en el Servidor Carapacho

1. **Python 3.8+** instalado en el servidor con las librerías `dbfread` y `openpyxl`.
2. **Servidor Web IIS** habilitado.
3. Base de Datos DataX ubicada localmente en `F:\DataX\datos`.

---

## 2. Pasos para Compilación e Instalación

### Paso A: Compilar el Frontend React / Vite
En la máquina de desarrollo o directamente en el servidor:
```cmd
cd "d:\4 Hector Fabio\Dashboard Web\Dashboard Inventario Carapacho"
cmd /c npm run build
```
Esto genera la carpeta con archivos estáticos compilados en `dist/`.

### Paso B: Copiar Artefactos a IIS
1. En el Servidor Carapacho, cree la carpeta física:
   `C:\inetpub\wwwroot\tableroinventario`
2. Copie todo el contenido de `dist/` a `C:\inetpub\wwwroot\tableroinventario`.
3. Abra el Administrador de IIS (`inetmgr`).
4. Bajo **Default Web Site**, haga clic derecho → **Agregar aplicación...**:
   - **Alias**: `tableroinventario`
   - **Ruta física**: `C:\inetpub\wwwroot\tableroinventario`
   - **Fondo de aplicaciones (Application Pool)**: `DefaultAppPool`
5. Guarde y compruebe en el navegador del servidor ingresando a:
   `http://localhost/tableroinventario/`

---

## 3. Automatización de la Extracción DBF (Python)

1. En la carpeta del proyecto en el servidor, ejecute PowerShell como Administrador:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\programar_actualizacion_dbf.ps1
   ```
2. Esto programará la tarea `Actualizar_Tablero_Inventario_Carapacho` en el Programador de Tareas de Windows para ejecutarse automáticamente 4 veces al día (7:00 AM, 1:00 PM, 5:00 PM, 10:00 PM).
3. Cada corrida actualizará los archivos `Inventario.xlsx` y `Ventas por linea.xlsx` en la carpeta `public/` (o dentro de la carpeta `tableroinventario` en IIS) y actualizará `last_update.json`.

---

## 4. Prueba Manual de Extracción
Para verificar manualmente la lectura DBF sin esperar la tarea programada:
```cmd
actualizar_datos.bat
```
Consulte el registro `log_inventario_carapacho.txt` para confirmar que no haya errores de lectura ni de permisos.
