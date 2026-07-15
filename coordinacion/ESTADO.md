# Estado Actual del Proyecto - Coordinación

## En qué estamos ahora
El foco de trabajo pasa a ser el **proyecto principal, Dashboard Web** (el dashboard comercial de la distribuidora). `Inventario JRP` y `Extractor Unilever` quedan en pausa como subproyectos independientes ya estabilizados (ver sección correspondiente más abajo para su último estado).

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

## Últimas cosas completadas (Inventario JRP / Extractor Unilever — en pausa)
1. **Congelado de Grilla (Supervisor)**: Botón de control manual y auto-congelado al marcar elementos, reteniendo actualizaciones concurrentes en un buffer con banner de recarga.
2. **Seguimiento de Reconteos (Badge "Rectificado")**: Lógica para incrementar intentos de conteo y mostrar `✓✓ Rectificado` al supervisor tras la reconfirmación del operario.
3. **Independización de Repositorios**: `.gitignore` individuales y despliegue a repos propios de GitHub (`Inventario-JRP` y `Extractor-Unilever`).

## Siguiente paso recomendado
* Validar visualmente en navegador real (Claude no tiene herramienta de navegador en este entorno) que el filtro de vendedores afecta correctamente el gráfico de Cartera y que la nueva altura se ve bien.
* Validar en producción la experiencia de usuario y recopilar feedback sobre el ordenamiento y exclusión dinámica en la Cartera Comercial.
* (Diferido) Pruebas de campo del Inventario JRP con operarios concurrentes bajo túnel Cloudflare.
