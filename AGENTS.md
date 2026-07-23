# Protocolo de Coordinación Multi-Agente (Codex)

Este repositorio es trabajado por varios agentes de IA en paralelo (Claude Code, Gemini/Antigravity, Codex). Para no pisar el trabajo de los demás ni duplicar tareas, sigue este protocolo **siempre**, sin que el usuario tenga que pedirlo cada vez.

Antes de empezar cualquier tarea en este proyecto, debes leer en orden los siguientes archivos de coordinación:
1. [/coordinacion/ESTADO.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/ESTADO.md)
2. [/coordinacion/PLAN.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/PLAN.md)
3. [/coordinacion/CONTEXTO.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/CONTEXTO.md) (este último solo una vez por sesión).

Si vas a trabajar en el subproyecto **Extractor Unilever** (carpeta `unilever/`), ese subproyecto tiene su propio sistema de coordinación dedicado — lee en su lugar `unilever/CLAUDE.md` y los archivos en `unilever/coordinacion/`.

Antes de tomar una tarea de [/coordinacion/PLAN.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/PLAN.md):
* Verifica que ningún otro agente la tenga marcada "en progreso".
* Márcala con tu firma (`Codex` y la fecha/hora de inicio).

Al terminar cualquier tarea o al cerrar la sesión de trabajo:
* Agrega una entrada nueva y cronológica al final de [/coordinacion/BITACORA.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/BITACORA.md), firmada como `Agente: Codex`, siguiendo el mismo formato que las entradas existentes (Tarea realizada / Archivos tocados / Resultado / Siguiente paso sugerido).
* Mueve la tarea correspondiente a la sección "Completadas" en [/coordinacion/PLAN.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/PLAN.md).
* Sobrescribe [/coordinacion/ESTADO.md](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/coordinacion/ESTADO.md) detallando el nuevo estado del proyecto.

Todo el contenido de los archivos de la carpeta `/coordinacion/` (y de `unilever/coordinacion/`) debe mantenerse en **español**. Realiza esta actualización siempre de forma automática al finalizar tus tareas, sin necesidad de que el usuario lo solicite de manera explícita.

## Reglas adicionales de este proyecto (para no repetir errores ya corregidos)

* **Nunca sobrescribir Excel de producción**: al desplegar Dashboard Web al servidor, jamás copiar los `.xlsx` ni `last_update.json` desde el entorno de desarrollo — esos los regenera `actualizar_dashboard_dbf.py` corriendo en el propio servidor 4 veces al día contra datos reales del ERP. Al desplegar, copiar solo el código estático (`index.html`, `assets/`, `excel.worker.js`, `xlsx.full.min.js`, `favicon.svg`, `icons.svg`).
* **Inventario JRP vs. Inventario Distribuidora JR**: `Inventario JRP/` es una herramienta construida originalmente para **Cacharrería JRP** (otra empresa, con su propio repo/infraestructura). El despliegue "Inventario Distribuidora JR" reutiliza ese mismo código pero es un despliegue separado para Distribuidora JR. No mezclar sus manuales de despliegue ni asumir que son el mismo negocio.
* **Nunca ejecutar efectos secundarios reales** (envíos de correo a destinatarios de producción, despliegues al servidor, cambios de configuración productiva) sin autorización explícita del usuario en esa sesión — por defecto, pruebas y correos de prueba van solo a `hectorfabio.mendoza@gmail.com`.
