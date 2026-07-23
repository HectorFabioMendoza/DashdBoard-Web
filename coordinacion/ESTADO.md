# Estado Actual del Proyecto - Coordinación

## En qué estamos ahora
El foco de trabajo es **Dashboard Web** (el dashboard comercial de la distribuidora), pero en esta sesión también se llevó **Inventario Distribuidora JR** — despliegue propio de Distribuidora JR sobre el código de "Inventario JRP" (herramienta construida originalmente para **Cacharrería JRP**, otra empresa, con su propio repo e infraestructura separada) — de modo desarrollo a **producción real en el servidor de Buenaventura**, con acceso remoto para operarios en otras ciudades vía túnel de Cloudflare corriendo en el propio servidor. `Extractor Unilever` volvió a quedar **en pausa** (2026-07-17): el diseño del correo ya está aprobado y solo falta el despliegue real al servidor de producción (checklist de 5 pasos ya documentado, nada ejecutado todavía). Tiene su propio sistema de coordinación dedicado (`unilever/CLAUDE.md` + `unilever/coordinacion/`), que es la fuente detallada de su estado, plan y bitácora — este documento solo mantiene el resumen ejecutivo.

En Dashboard Web, según el historial de commits reciente, ya se implementó: tabla interactiva de clientes con paginación/buscador/enlaces desde gráficos y KPIs, evaluación dinámica de recencia y riesgo de inactividad según el rango de meses seleccionado, y un candado de seguridad con contraseña para proteger las pestañas Ventas y Tendencias (con su botón reubicado encima del selector de modo oscuro).

El 2026-07-22 se construyó y completó el subproyecto **Tablero Inventario Carapacho** en la carpeta `Dashboard Inventario Carapacho/`, diseñado para mostrar la página/pestaña de Inventario alimentada directamente de la base de datos ERP (DataX) del Servidor Carapacho. El extractor Python (`actualizar_inventario_carapacho.py`), la aplicación React/Vite/TypeScript (`src/App.tsx`), los scripts de automatización en Windows y la compilación estática de producción (`dist/`) quedaron completamente listos para ser desplegados en IIS bajo `http://localhost/tableroinventario/`.


## Trabajo en progreso
* **Documentación de las 3 redes Tailscale** (Carapacho SM, Cacharrería JRP, Distribuidora JR) en `D:\4 Hector Fabio\Red Tailscale\` (carpeta independiente, fuera de este repo). Estructura e inventario de dispositivos ya creados; falta que el usuario pegue en el chat las contraseñas de las 4 cuentas Tailscale y las credenciales Windows/RDP de cada equipo para completarla. Ver bitácora del 2026-07-20.
* Queda pendiente de validación en servidor el nuevo reporte de "Alertas de Inventario y Abastecimiento" (ver sección siguiente y `PLAN.md`).

## Nota de coordinación (2026-07-17)
* Se sumó un nuevo agente, **Codex**, al esquema multi-agente. Se creó `AGENTS.md` en la raíz (equivalente de `CLAUDE.md` para Codex CLI) con el mismo protocolo de lectura/actualización de `coordinacion/`, para que el usuario no tenga que repetir instrucciones manualmente en cada sesión. Pendiente de confirmar en la primera sesión real que Codex efectivamente lo respeta.

## Bloqueadores
* Ningún bloqueador técnico detectado. Para desplegar Inventario Carapacho SM solo falta conocer la IP/puerto disponible y tener acceso al servidor destino.

## Últimas cosas completadas (Inventario Carapacho SM — preparado, no desplegado)
1. **Variante independiente creada**: carpeta `Inventario Carapacho SM/` con código fuente y utilidades reutilizables, sin `.git`, datos históricos, catálogos ni credenciales de JRP/Distribuidora JR.
2. **Rebranding y aislamiento**: título, encabezados, paquete npm, puerto local (`5176`) y clave de configuración local cambiados a Carapacho SM.
3. **Firebase compartido con datos separados**: reutiliza la configuración de Distribuidora JR, pero todas las lecturas/escrituras de inventario y PIN usan `sessions/carapacho_sm/session_active`. El archivo real está gitignorado.
4. **Build verificado**: `npm run build` correcto; contiene la configuración compartida y el namespace Carapacho, no contiene la ruta activa de Distribuidora JR.
5. **Despliegue documentado y lanzador preparado**: `README_DESPLIEGUE.md` cubre Firebase, build, IIS, copia por RDP/`robocopy`, firewall y pruebas. `Abrir_Tunel_Inventario_Carapacho_SM.bat` valida primero IIS en `127.0.0.1:8081`, abre el túnel y copia la URL al portapapeles.
6. **Repositorio GitHub independiente**: repositorio privado `HectorFabioMendoza/Inventario-Carapacho-SM`, rama `main`, commit inicial `ec28d64`; se verificó que el hash remoto coincide con el local y que no se versionan credenciales ni artefactos generados.

## Últimas cosas completadas (Dashboard Web)
1. **Filtro lateral de Vendedores conectado a Cartera**: El panel global "Vendedores" (`selectedVendors`), que ya filtraba Ventas/Tendencias/Frecuencia, ahora también filtra el módulo de Cartera Comercial (KPIs, tabla y gráfico por asesor). Antes no tenía ningún efecto ahí.
2. **Gráfico de Cartera por Asesor más alto**: Aumentada la altura del gráfico "Análisis de Cartera por Asesor Comercial" en un 30% (de 400px a 520px) para facilitar la lectura.
3. **Saneamiento de git**: Comiteado el trabajo pendiente de Gemini (ordenamiento, exclusión de KPIs, paginación, gráfico por asesor), más varios scripts legítimos que estaban sueltos sin versionar (`reconciliar_datos.py`, pipeline de ingesta manual `actualizar_datos.js`/`.bat`, scripts de automatización DBF ya documentados en README). Se limpiaron archivos de datos de sesiones pasadas hacia `scratch/` y se amplió `.gitignore` para salidas generadas automáticamente.
4. **Gráfico de Vendedores, Ordenamiento y Exclusión (Cartera)**: Implementado gráfico de barras apiladas (Stacked Bar Chart) de Aging por Asesor Comercial side-by-side con la distribución global de Aging. Agregada ordenación interactiva por todas las columnas de la tabla de Cartera Comercial (íconos de Chevron) y checkboxes de inclusión/exclusión que sustraen clientes en tiempo real de los KPIs de la Bento Grid superior y el gráfico de Aging. Rediseñado el panel de detalle derecho renombrando la sección a "Facturas Pendientes" y moviendo el total a una tarjeta destacada al pie del panel con contraste premium. Paginación con scroll vertical y selector de tamaño de página.
2. **Filtros de Aging e Indicadores de Prioridad (Cartera)**: Añadidos filtros interactivos al hacer clic en el gráfico/tarjetas de Aging, columna de Prioridad con badges temáticos premium, y ordenación por score de prioridad ($\text{Saldo Vencido} \times (\text{Días Mora Máxima} + 1)$).
3. **Módulo de Cartera Comercial**: Implementada la extracción DBF automatizada (`actualizar_dashboard_dbf.py`) y la interfaz React (`App.tsx`) con Bento Grid, Aging de saldos, filtros y visualización Master-Detail protegida por contraseña.
4. **Candado financiero**: Protección con contraseña de las pestañas Ventas y Tendencias, con el botón de candado reubicado encima del toggle de modo oscuro.
5. **Tabla interactiva de clientes**: Paginación, buscador y enlaces cruzados desde gráficos/KPIs, con contraste corregido en Light Mode y ordenamiento por inactividad descendente.
6. **Evaluación de recencia y riesgo dinámica**: Se recalcula según el rango de meses que el usuario seleccione en los filtros.

## Últimas cosas completadas (Inventario Distribuidora JR — ahora EN PRODUCCIÓN)
1. **Despliegue a producción en IIS**: la app pasó de `npm run dev` a vivir permanentemente en el servidor, con sitio dedicado en `:8081` y también montada como ruta `/Inventario` bajo el sitio principal. Detalles técnicos completos en `CONTEXTO.md`, sección "Esquema de Alojamiento Multi-App".
2. **Rebranding**: "Inventario JRP" → "Inventario Distribuidora JR" en encabezados (Supervisor y Operario) y título de la pestaña del navegador.
3. **Acceso remoto multi-ciudad resuelto**: `cloudflared.exe` (binario standalone, sin Node) corriendo directamente en el servidor abre un túnel temporal hacia `localhost:8081`, alcanzable por operarios en cualquier ciudad; se cierra con `Ctrl+C`.
4. **Confirmado funcionando de punta a punta** por el usuario: túnel generado, probado desde celular fuera de la red de la oficina.
5. **Manual dedicado creado**: `Manual_Despliegue_Inventario_Distribuidora_JR.md` (raíz de este repo) documenta todo el flujo específico de Distribuidora JR. El manual original de Cacharrería JRP (`Inventario JRP/manual_tunel_cloudflare.md`) se restauró intacto a su versión original — no debe mezclarse con lo de Distribuidora JR.

## Últimas cosas completadas (Inventario JRP — hitos previos / Extractor Unilever — en pausa)
1. **Congelado de Grilla (Supervisor)**: Botón de control manual y auto-congelado al marcar elementos, reteniendo actualizaciones concurrentes en un buffer con banner de recarga.
2. **Seguimiento de Reconteos (Badge "Rectificado")**: Lógica para incrementar intentos de conteo y mostrar `✓✓ Rectificado` al supervisor tras la reconfirmación del operario.
3. **Independización de Repositorios**: `.gitignore` individuales y despliegue a repos propios de GitHub (`Inventario-JRP` y `Extractor-Unilever`).

## Últimas cosas completadas (Alertas de Inventario y Abastecimiento — Dashboard Web)
1. **Nuevo script `enviar_alertas_inventario.py`**: reporte por correo de prioridades de reabastecimiento, replicando exactamente la lógica de negocio de `App.tsx` (velocidad de venta, prioridad, estados de cobertura). Nunca expone precios de Lista 4/Lista 5.
2. **Integrado a la tarea programada existente** (4x/día) sin modificar el Task Scheduler: portón por hora dentro del script limita el envío real a la corrida de las 7am; `--forzar` para pruebas manuales.
3. **Bug corregido**: las cifras del correo no coincidían con el dashboard en vivo porque al script le faltaba replicar la regla fija del dashboard de "mes actual + últimos 3 meses" (o últimos 3 si el mes actual aún no tiene ventas) y la ponderación proporcional del mes en curso. Ya corregido y verificado que corre sin errores.
4. **Resiliencia de red corregida (2026-07-21)**: resuelto el fallo de DNS `[Errno 11001] getaddrinfo failed` en `enviar_alertas_inventario.py` agregando reintentos (3 intentos) y fallback a la IP IPv4 resuelta explícitamente y a IPs públicas directas de Gmail (`74.125.26.109`, `142.250.115.108`). Probado y verificado exitoso con `--forzar`.
5. **Pendiente de validación en servidor con datos reales** y de activar destinatarios de producción — ver `PLAN.md`.

## Siguiente paso recomendado
* En el servidor Carapacho, confirmar que el sitio dedicado responde en `http://127.0.0.1:8081`; copiar los dos archivos del lanzador a `C:\cloudflared` y probar el `.bat`. La aplicación bajo `localhost/Inventario/` y su conexión Firebase ya fueron confirmadas visualmente por el usuario.
* Confirmar con el usuario si se debe comitear al repo independiente de Inventario JRP (Cacharrería JRP) el cambio de branding de UI ("Inventario Distribuidora JR" en `App.tsx`/`OperatorConsole.tsx`/`index.html`) — quedó sin comitear, y falta decidir si ese cambio visual debe vivir en una rama separada para no afectar el despliegue original de Cacharrería JRP.
* Migración a Tailscale para Inventario Distribuidora JR: sumar el servidor a la red Tailscale que **ya tiene Cacharrería JRP funcionando** — el usuario la marcó como "lo próximo que debo generar", la ejecuta él directamente.
* Validar visualmente en navegador real (Claude no tiene herramienta de navegador en este entorno) que el filtro de vendedores afecta correctamente el gráfico de Cartera de Dashboard Web y que la nueva altura se ve bien.
* Validar en producción la experiencia de usuario y recopilar feedback sobre el ordenamiento y exclusión dinámica en la Cartera Comercial.
