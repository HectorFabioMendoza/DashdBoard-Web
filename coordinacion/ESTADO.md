# Estado Actual del Proyecto - Coordinación

## En qué estamos ahora
El foco de trabajo pasa a ser el **proyecto principal, Dashboard Web** (el dashboard comercial de la distribuidora). `Inventario JRP` y `Extractor Unilever` quedan en pausa como subproyectos independientes ya estabilizados (ver sección correspondiente más abajo para su último estado).

En Dashboard Web, según el historial de commits reciente, ya se implementó: tabla interactiva de clientes con paginación/buscador/enlaces desde gráficos y KPIs, evaluación dinámica de recencia y riesgo de inactividad según el rango de meses seleccionado, y un candado de seguridad con contraseña para proteger las pestañas Ventas y Tendencias (con su botón reubicado encima del selector de modo oscuro).

## Trabajo en progreso
* Ninguno en este momento.

## Bloqueadores
* Ningún bloqueador técnico detectado.

## Últimas cosas completadas (Dashboard Web)
1. **Módulo de Cartera Comercial**: Implementada la extracción DBF automatizada (`actualizar_dashboard_dbf.py`) y la interfaz React (`App.tsx`) con Bento Grid, Aging de saldos, filtros y visualización Master-Detail protegida por contraseña.
2. **Candado financiero**: Protección con contraseña de las pestañas Ventas y Tendencias, con el botón de candado reubicado encima del toggle de modo oscuro.
3. **Tabla interactiva de clientes**: Paginación, buscador y enlaces cruzados desde gráficos/KPIs, con contraste corregido en Light Mode y ordenamiento por inactividad descendente.
4. **Evaluación de recencia y riesgo dinámica**: Se recalcula según el rango de meses que el usuario seleccione en los filtros.

## Últimas cosas completadas (Inventario JRP / Extractor Unilever — en pausa)
1. **Congelado de Grilla (Supervisor)**: Botón de control manual y auto-congelado al marcar elementos, reteniendo actualizaciones concurrentes en un buffer con banner de recarga.
2. **Seguimiento de Reconteos (Badge "Rectificado")**: Lógica para incrementar intentos de conteo y mostrar `✓✓ Rectificado` al supervisor tras la reconfirmación del operario.
3. **Independización de Repositorios**: `.gitignore` individuales y despliegue a repos propios de GitHub (`Inventario-JRP` y `Extractor-Unilever`).

## Siguiente paso recomendado
* Validar visualmente el correcto renderizado del Módulo de Cartera Comercial en el navegador local y de producción cargando el archivo `Cartera.xlsx` real.
* (Diferido) Pruebas de campo del Inventario JRP con operarios concurrentes bajo túnel Cloudflare.
