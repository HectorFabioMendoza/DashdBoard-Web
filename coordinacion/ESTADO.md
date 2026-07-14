# Estado Actual del Proyecto - Coordinación

## En qué estamos ahora
El foco de trabajo pasa a ser el **proyecto principal, Dashboard Web** (el dashboard comercial de la distribuidora). `Inventario JRP` y `Extractor Unilever` quedan en pausa como subproyectos independientes ya estabilizados (ver sección correspondiente más abajo para su último estado).

En Dashboard Web, según el historial de commits reciente, ya se implementó: tabla interactiva de clientes con paginación/buscador/enlaces desde gráficos y KPIs, evaluación dinámica de recencia y riesgo de inactividad según el rango de meses seleccionado, y un candado de seguridad con contraseña para proteger las pestañas Ventas y Tendencias (con su botón reubicado encima del selector de modo oscuro).

## Trabajo en progreso
* Ninguno en este momento.

## Bloqueadores
* Ningún bloqueador técnico detectado.

## Últimas cosas completadas (Dashboard Web)
1. **Candado financiero**: Protección con contraseña de las pestañas Ventas y Tendencias, con el botón de candado reubicado encima del toggle de modo oscuro.
2. **Tabla interactiva de clientes**: Paginación, buscador y enlaces cruzados desde gráficos/KPIs, con contraste corregido en Light Mode y ordenamiento por inactividad descendente.
3. **Evaluación de recencia y riesgo dinámica**: Se recalcula según el rango de meses que el usuario seleccione en los filtros.

## Últimas cosas completadas (Inventario JRP / Extractor Unilever — en pausa)
1. **Congelado de Grilla (Supervisor)**: Botón de control manual y auto-congelado al marcar elementos, reteniendo actualizaciones concurrentes en un buffer con banner de recarga.
2. **Seguimiento de Reconteos (Badge "Rectificado")**: Lógica para incrementar intentos de conteo y mostrar `✓✓ Rectificado` al supervisor tras la reconfirmación del operario.
3. **Independización de Repositorios**: `.gitignore` individuales y despliegue a repos propios de GitHub (`Inventario-JRP` y `Extractor-Unilever`).

## Siguiente paso recomendado
* Revisar y aprobar el plan de implementación del módulo de Cartera comercial (ver implementation_plan.md) y autorizar el inicio de la Fase 1 (Diagnóstico de DBFs de Cartera en el servidor de producción).
* (Diferido) Pruebas de campo del Inventario JRP con operarios concurrentes bajo túnel Cloudflare.
