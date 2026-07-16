# Estado Actual del Proyecto - Coordinación

## En qué estamos ahora
El foco de trabajo es **Dashboard Web** (el dashboard comercial de la distribuidora), pero en esta sesión también se llevó **Inventario Distribuidora JR** — despliegue propio de Distribuidora JR sobre el código de "Inventario JRP" (herramienta construida originalmente para **Cacharrería JRP**, otra empresa, con su propio repo e infraestructura separada) — de modo desarrollo a **producción real en el servidor de Buenaventura**, con acceso remoto para operarios en otras ciudades vía túnel de Cloudflare corriendo en el propio servidor. `Extractor Unilever` **se reanudó** (2026-07-16): ya tiene su propio sistema de coordinación dedicado (`unilever/CLAUDE.md` + `unilever/coordinacion/`), que es ahora la fuente detallada de su estado, plan y bitácora — este documento solo mantiene el resumen ejecutivo.

En Dashboard Web, según el historial de commits reciente, ya se implementó: tabla interactiva de clientes con paginación/buscador/enlaces desde gráficos y KPIs, evaluación dinámica de recencia y riesgo de inactividad según el rango de meses seleccionado, y un candado de seguridad con contraseña para proteger las pestañas Ventas y Tendencias (con su botón reubicado encima del selector de modo oscuro).

## Trabajo en progreso
* Ninguno en este momento.

## Bloqueadores
* Ningún bloqueador técnico detectado.

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

## Siguiente paso recomendado
* Confirmar con el usuario si se debe comitear al repo independiente de Inventario JRP (Cacharrería JRP) el cambio de branding de UI ("Inventario Distribuidora JR" en `App.tsx`/`OperatorConsole.tsx`/`index.html`) — quedó sin comitear, y falta decidir si ese cambio visual debe vivir en una rama separada para no afectar el despliegue original de Cacharrería JRP.
* Migración a Tailscale para Inventario Distribuidora JR: sumar el servidor a la red Tailscale que **ya tiene Cacharrería JRP funcionando** — el usuario la marcó como "lo próximo que debo generar", la ejecuta él directamente.
* Validar visualmente en navegador real (Claude no tiene herramienta de navegador en este entorno) que el filtro de vendedores afecta correctamente el gráfico de Cartera de Dashboard Web y que la nueva altura se ve bien.
* Validar en producción la experiencia de usuario y recopilar feedback sobre el ordenamiento y exclusión dinámica en la Cartera Comercial.
