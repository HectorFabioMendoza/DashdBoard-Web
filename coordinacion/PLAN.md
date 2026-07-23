# Plan de Trabajo / Backlog - Coordinación

## En progreso
* *(No hay tareas activas en progreso en este momento)*

## Pendientes sin asignar
### Dashboard Web (proyecto principal)
- [ ] **Validar en el servidor las Alertas de Inventario y Abastecimiento**: copiar el `enviar_alertas_inventario.py` corregido (ventana de 4/3 meses + fix de `total_alertas`) a `D:\DashBoard Web` en el servidor y re-ejecutar `python enviar_alertas_inventario.py --forzar` allá contra los Excel de producción, comparando el correo resultante contra el dashboard recién cargado (sin tocar el filtro de Periodos) para confirmar que ahora coinciden.
- [ ] **Activar destinatarios reales de producción**: cuando el usuario lo autorice, editar manualmente en el servidor `D:\DashBoard Web\config_alertas_inventario.local.json` para poner `destinatario: "jstimebo@hotmail.com, distribuidorajr2009@hotmail.com"` y `cc: "hectorfabio.mendoza@gmail.com"` (hoy sigue en modo prueba, solo al correo del usuario).

### Inventario Distribuidora JR (despliegue propio de Distribuidora JR, sobre el código de Inventario JRP / Cacharrería JRP)
- [ ] **Migración a Tailscale**: Instalar Tailscale en el servidor de Buenaventura y sumarlo a la red Tailscale que **ya tiene funcionando Cacharrería JRP** (reutilizar esa red existente), para eliminar la exposición de la IP pública/puerto usada hoy para el túnel de Cloudflare. Marcada por el usuario como la siguiente prioridad de infraestructura (2026-07-16) — la ejecuta el usuario directamente.
- [ ] **Confirmar commit en el repo de Inventario JRP (Cacharrería JRP)**: el rebranding de UI a "Inventario Distribuidora JR" (`App.tsx`, `OperatorConsole.tsx`, `index.html`) quedó sin comitear en ese repo — pendiente de que el usuario autorice el commit, y de decidir si ese cambio de marca debe vivir en una rama separada para no afectar el despliegue original de Cacharrería JRP si vuelven a compartir el mismo build.
- [ ] **Pruebas de Concurrencia de Red**: Validar el correcto funcionamiento del buffer de congelación de grilla bajo condiciones de envío masivo y simultáneo de datos de conteo por parte de múltiples operarios.
- [ ] **Alertas en Consola de Operarios**: Implementar una señal sonora (mediante Beep/Web Audio API) o una alerta visual parpadeante en `OperatorConsole.tsx` cuando un operario reciba un artículo devuelto para reconteo, mejorando la visibilidad del operador.
- [ ] **Optimización del Build de Producción**: Evaluar la división de código (code-splitting) o imports dinámicos en Vite para reducir la advertencia de chunks superiores a 500kB.

### Extractor Unilever
> ⚠️ **Reanudado (2026-07-16)**: este subproyecto ya tiene su propio sistema de coordinación dedicado — ver [`unilever/coordinacion/PLAN.md`](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/unilever/coordinacion/PLAN.md) para el backlog detallado y actualizado. Esta sección solo queda como referencia histórica del resumen ejecutivo.

## Completadas
- [x] **Desarrollo del subproyecto Tablero Inventario Carapacho** — Codex, 2026-07-22. Extractor Python (`actualizar_inventario_carapacho.py`), frontend React/Vite/TypeScript enfocado en el Tablero de Inventario, scripts de automatización en Windows, compilación de producción verificada (`dist/`) y guía completa de despliegue en IIS bajo `http://localhost/tableroinventario/`.
- [x] **Crear repositorio independiente de Inventario Carapacho SM y publicarlo en GitHub** — Codex, 2026-07-17. Repositorio privado `HectorFabioMendoza/Inventario-Carapacho-SM`, rama `main`, commit inicial `ec28d64`; hashes local/remoto verificados. Firebase real, `dist`, `node_modules`, catálogos y archivos generados quedaron excluidos.
- [x] **Finalizar lanzador de túnel de Inventario Carapacho SM** — Codex, 2026-07-17. El `.bat` invoca un PowerShell que valida IIS en `127.0.0.1:8081`, abre el Quick Tunnel, detecta la URL, la resalta y la copia al portapapeles. Sintaxis verificada.
- [x] **Compartir Firebase entre Distribuidora JR y Carapacho SM con namespace independiente** — Codex, 2026-07-17. Carapacho reutiliza el mismo proyecto/configuración Firebase, pero todas sus operaciones usan `sessions/carapacho_sm/session_active`; también se aislaron todas las claves locales, se regeneró el build y se verificó que no contenga `sessions/session_active`.
- [x] **Crear variante independiente Inventario Carapacho SM y guía de despliegue** — Codex, 2026-07-17. Nueva carpeta con código fuente, build de producción, marca y almacenamiento local independientes, utilidades operativas renombradas, scripts de túnel y manual completo para Firebase/IIS. Los datos y catálogos permanecen separados; por decisión posterior del usuario, el proyecto Firebase sí se comparte mediante namespace independiente.
- [x] **Fase 3: Desarrollo de la Interfaz de Cartera (React)**: Diseñar la pestaña de Cartera protegida por contraseña con KPIs de cartera, gráfico de aging (vencimientos), tabla de clientes y detalle expandible de facturas.
- [x] **Fase 2: Extracción y Generación de Excel**: Ampliar `actualizar_dashboard_dbf.py` para procesar la cartera y exportar `Cartera.xlsx` (resumen por cliente y detalle de documentos).
- [x] **Fase 1: Diagnóstico de DBFs de Cartera**: Crear y ejecutar un script de descubrimiento para encontrar e inspeccionar las tablas de cartera (CxC) en el servidor de producción.
- [x] Filtro dinámico de diferencias por signo (Positivo/Negativo) en el dashboard del supervisor.
- [x] Refinamiento de tiempos en scripts de emulación de teclado (`digitar_ajustes_erp.py`) para evitar saltarse campos en Siesa/DataX.
- [x] Sistema de teclas de escape (`BACKSPACE` para iniciar, `1`/`S` para confirmar, `Espacio` para abortar de emergencia).
- [x] Implementación de congelación manual y automática de la grilla del supervisor con buffer temporal y banner de actualización.
- [x] Badge visual `✓✓ Rectificado` con indicador de intentos de reconteo en el dashboard de supervisor.
- [x] Creación de repositorios Git independientes para `Inventario JRP` y `unilever` y subida exitosa a GitHub.
