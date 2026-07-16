# Plan de Trabajo / Backlog - Coordinación

## En progreso
* *(No hay tareas activas en progreso en este momento)*

## Pendientes sin asignar
### Dashboard Web (proyecto principal)
* *(No hay más tareas pendientes sin asignar en esta fase)*

### Inventario Distribuidora JR (despliegue propio de Distribuidora JR, sobre el código de Inventario JRP / Cacharrería JRP)
- [ ] **Migración a Tailscale**: Instalar Tailscale en el servidor de Buenaventura y sumarlo a la red Tailscale que **ya tiene funcionando Cacharrería JRP** (reutilizar esa red existente), para eliminar la exposición de la IP pública/puerto usada hoy para el túnel de Cloudflare. Marcada por el usuario como la siguiente prioridad de infraestructura (2026-07-16) — la ejecuta el usuario directamente.
- [ ] **Confirmar commit en el repo de Inventario JRP (Cacharrería JRP)**: el rebranding de UI a "Inventario Distribuidora JR" (`App.tsx`, `OperatorConsole.tsx`, `index.html`) quedó sin comitear en ese repo — pendiente de que el usuario autorice el commit, y de decidir si ese cambio de marca debe vivir en una rama separada para no afectar el despliegue original de Cacharrería JRP si vuelven a compartir el mismo build.
- [ ] **Pruebas de Concurrencia de Red**: Validar el correcto funcionamiento del buffer de congelación de grilla bajo condiciones de envío masivo y simultáneo de datos de conteo por parte de múltiples operarios.
- [ ] **Alertas en Consola de Operarios**: Implementar una señal sonora (mediante Beep/Web Audio API) o una alerta visual parpadeante en `OperatorConsole.tsx` cuando un operario reciba un artículo devuelto para reconteo, mejorando la visibilidad del operador.
- [ ] **Optimización del Build de Producción**: Evaluar la división de código (code-splitting) o imports dinámicos en Vite para reducir la advertencia de chunks superiores a 500kB.

### Extractor Unilever
- [ ] **Validación de Bloqueo de Archivos DBF**: Comprobar el comportamiento de los scripts de extracción (`extraer_datos_unilever.py`, `buscar_facturas_dbf.py`) cuando los archivos DBF origen estén abiertos y siendo modificados en tiempo real por el software contable (FoxPro/Siesa/Olivia).
- [ ] **Automatización de Ejecución de Tareas**: Configurar la tarea programada (`Requerimientos Unilever/programar_tarea.py` y `unilever_auto.py`) en el programador de tareas de Windows del servidor local y verificar la generación correcta de reportes en la carpeta `salidas/`.
- [ ] **Mapeo de Productos Desalineados**: Depurar el archivo `productos_unilever_desalineados.xlsx` para corregir las inconsistencias de referencias cruzadas entre el inventario local y las plantillas solicitadas por Unilever.

## Completadas
- [x] **Fase 3: Desarrollo de la Interfaz de Cartera (React)**: Diseñar la pestaña de Cartera protegida por contraseña con KPIs de cartera, gráfico de aging (vencimientos), tabla de clientes y detalle expandible de facturas.
- [x] **Fase 2: Extracción y Generación de Excel**: Ampliar `actualizar_dashboard_dbf.py` para procesar la cartera y exportar `Cartera.xlsx` (resumen por cliente y detalle de documentos).
- [x] **Fase 1: Diagnóstico de DBFs de Cartera**: Crear y ejecutar un script de descubrimiento para encontrar e inspeccionar las tablas de cartera (CxC) en el servidor de producción.
- [x] Filtro dinámico de diferencias por signo (Positivo/Negativo) en el dashboard del supervisor.
- [x] Refinamiento de tiempos en scripts de emulación de teclado (`digitar_ajustes_erp.py`) para evitar saltarse campos en Siesa/DataX.
- [x] Sistema de teclas de escape (`BACKSPACE` para iniciar, `1`/`S` para confirmar, `Espacio` para abortar de emergencia).
- [x] Implementación de congelación manual y automática de la grilla del supervisor con buffer temporal y banner de actualización.
- [x] Badge visual `✓✓ Rectificado` con indicador de intentos de reconteo en el dashboard de supervisor.
- [x] Creación de repositorios Git independientes para `Inventario JRP` y `unilever` y subida exitosa a GitHub.
