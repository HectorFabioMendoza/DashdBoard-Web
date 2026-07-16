# Bitácora de Cambios / Historial Cronológico

*Las nuevas entradas se agregan al final del archivo en orden cronológico ascendente. Las entradas pasadas nunca se modifican ni se eliminan.*

---

### [2026-07-14 15:10:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Cierre de la Fase 2 del Inventario JRP, optimización de velocidad de digitación automática en Siesa/DataX, y separación de subproyectos en repositorios independientes.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/Inventario JRP/src/App.tsx`
  - `d:/4 Hector Fabio/Dashboard Web/Inventario JRP/src/components/SupervisorDashboard.tsx`
  - `d:/4 Hector Fabio/Dashboard Web/Inventario JRP/src/components/OperatorConsole.tsx`
  - `d:/4 Hector Fabio/Dashboard Web/Inventario JRP/.gitignore`
  - `d:/4 Hector Fabio/Dashboard Web/unilever/.gitignore`
  - `d:/4 Hector Fabio/Dashboard Web/.gitignore`
* **Resultado**:
  - Implementado el modo de congelación de grilla (manual y automático al seleccionar ítems) para evitar el desplazamiento molesto de filas cuando los operarios envían datos.
  - Implementado el badge `✓✓ Rectificado` en la tabla del supervisor para indicar que un producto devuelto a reconteo ya fue re-confirmado en físico por el operario.
  - El proyecto compiló en producción de manera exitosa y sin errores de TypeScript.
  - Se crearon repositorios Git independientes para `Inventario JRP` y `unilever` y se subieron a GitHub.
* **Siguiente paso sugerido**: Validar el buffer de grilla congelada en red bajo concurrencia real y configurar la automatización de la tarea del Extractor Unilever en el servidor local.

---

### [2026-07-14 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Confirmación de protocolo de coordinación multi-agente e incorporación de **Dashboard Web** (proyecto principal) al sistema de coordinación, que hasta ahora solo documentaba los subproyectos Inventario JRP y Extractor Unilever.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/CONTEXTO.md` (nueva sección "0. Proyecto Principal: Dashboard Web" con arquitectura, tablas DBF clave, hallazgo del parser seguro para nulos, y lógica de negocio fija)
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/ESTADO.md` (reescrito para reflejar que el foco pasa a Dashboard Web, con resumen del trabajo reciente: candado financiero, tabla de clientes, recencia/riesgo dinámica)
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/PLAN.md` (nueva sección "Dashboard Web" en pendientes sin asignar, actualmente vacía a la espera de que el usuario defina tareas concretas)
* **Resultado**: No se tomó ni ejecutó ninguna tarea de desarrollo todavía. Se sentó la base documental para trackear Dashboard Web igual que los demás subproyectos.
* **Siguiente paso sugerido**: Esperar a que el usuario defina las primeras tareas concretas de Dashboard Web para poblar el backlog en PLAN.md y proponer la división de trabajo entre Claude y Gemini.

---

### [2026-07-14 15:45:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Creación del plan de implementación y desarrollo del script de diagnóstico de tablas DBF de cartera en el servidor de producción.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/ESTADO.md`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/PLAN.md`
  - `d:/4 Hector Fabio/Dashboard Web/diagnostico_cartera_dbf.py`
* **Resultado**:
  - Creado el script de descubrimiento `diagnostico_cartera_dbf.py` en la raíz del proyecto para extraer el esquema, registros de prueba y nombres de las tablas de Cartera (CxC).
  - Verificado el correcto funcionamiento del script a nivel local (ejecutado con éxito sobre el directorio fallback de desarrollo).

---

### [2026-07-14 16:00:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Implementación de la Fase 2 (Extracción de Cartera y Generación de Excel).
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/actualizar_dashboard_dbf.py`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/PLAN.md`
* **Resultado**:
  - Se modificó `actualizar_dashboard_dbf.py` para cargar los campos `CUP_BENF` (cupo) y `VENDEDOR_B` (vendedor) desde el maestro de clientes `cgbenf.dbf`.
  - Se implementó la lectura de `cgsaldo.dbf` para filtrar cuentas `1305*` con saldo activo (`debito - credito > 0.01`).
  - Se implementó la acumulación del saldo consolidado por cliente y vendedor, calculando de manera dinámica el cupo disponible (`cupo - saldo_total`) y los días de mora (`hoy - fecha_vcto`).
  - Se integró la función `guardar_excel_multisheet` para generar `Cartera.xlsx` con dos hojas (`Resumen_Clientes` y `Detalle_Documentos`), automatizando además su copia a `/public`, `/dist` y la carpeta de IIS.
  - Ejecutado con éxito a nivel local para validar que no tiene errores de sintaxis o ejecución.
* **Siguiente paso sugerido**: Solicitar al usuario que ejecute `python actualizar_dashboard_dbf.py` en el servidor de producción para generar el archivo Excel de datos reales, copiar `Cartera.xlsx` a su entorno local e iniciar la Fase 3 (Desarrollo del Frontend en React).

---

### [2026-07-14 16:10:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Implementación de la Fase 3 (Desarrollo de la Interfaz de Cartera en React).
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/src/App.tsx`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/PLAN.md`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/ESTADO.md`
* **Resultado**:
  - Se importó el icono `CreditCard` desde `lucide-react` para identificar la pestaña de Cartera Comercial en la barra lateral.
  - Se definieron los estados necesarios en `App.tsx` para almacenar clientes, documentos, consultas de búsqueda, paginación y filtros de vendedor y estado.
  - Se implementó un hook `useEffect` para cargar y parsear en segundo plano `Resumen_Clientes` y `Detalle_Documentos` desde `/Cartera.xlsx` usando el Web Worker.
  - Se protegió la pestaña de Cartera comercial detrás del candado contable con contraseña (JR2026).
  - Se implementó una Bento Grid de KPIs con 4 tarjetas: Cartera Total, Cartera en Mora, Índice de Morosidad (con badges de severidad dinámica), y Cupo Disponible.
  - Se diseñó un bloque visual de Aging (Envejecimiento de Saldo) con barra de porcentajes interactiva y tarjetas de rangos contables.
  - Se desarrolló un diseño de pantalla dividida responsive (Master-Detail): listado general de clientes paginado a la izquierda y composición de facturas en mora del cliente seleccionado a la derecha.
  - Verificado el correcto build del bundle mediante `npm run build` sin errores de compilación TypeScript.
* **Siguiente paso sugerido**: Validar visualmente la interfaz cargando datos reales en el navegador de producción y desplegar.

---

### [2026-07-14 20:50:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Implementación de filtros interactivos de Aging y ordenación por prioridad de cobro en el módulo de Cartera Comercial.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/src/App.tsx`
* **Resultado**:
  - Añadido el estado `carteraAgingFilter` y el mapa optimizado `clientDocsMap` para filtrar interactivamente la lista de clientes al hacer clic sobre los segmentos de la barra o las tarjetas de Aging.
  - Implementado el score de prioridad de cobro ($\text{Saldo Vencido} \times (\text{Días Mora Máxima} + 1)$) y la ordenación descendente automática de la grilla de clientes.
  - Diseñada la columna **Prioridad** con badges temáticos responsivos y animados (Crítica, Alta, Media, Baja, Al día).
  - Incluido un indicador flotante interactivo para limpiar el filtro de Aging seleccionado.
  - Verificada la compilación limpia del bundle con `npm run build` y el correcto funcionamiento en navegador.
* **Siguiente paso sugerido**: Obtener feedback del usuario tras probar los filtros y prioridades interactivos.

---

### [2026-07-15 10:00:00 (Local Time)] - Agente: Gemini (Antigravity IDE)
* **Tarea realizada**: Implementación de ordenación interactiva, checkboxes para exclusión de KPIs, y mejoras en scroll y paginación en Cartera.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/src/App.tsx`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/BITACORA.md`
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/ESTADO.md`
* **Resultado**:
  - Incorporada ordenación interactiva (ascendente/descendente) en todos los encabezados de columna en la tabla de Cartera Comercial (Cliente, Prioridad, Cupo Asignado, Saldo Total, Saldo Vencido, Mora Máxima) con indicadores visuales de Chevron.
  - Implementadas casillas de selección (checkboxes) individuales y selección global en cabecera para excluir/incluir clientes específicos en tiempo real del cómputo de los KPIs globales (Bento Grid) y la distribución de Aging.
  - Añadido scroll vertical (`max-h-[550px] overflow-y-auto`) a la grilla y selector desplegable para elegir cantidad de clientes por página (15, 30, 50, 100), con un tamaño inicial de 30.
  - Rediseñado el panel de detalle derecho: se renombró el listado a **"Facturas Pendientes"**, se acotó su altura a `max-h-[320px]` y se movió el saldo total a una tarjeta footer destacada e independiente con estilo y contraste premium (con `mr-5` para alinearla con el listado).
  - Diseñado e implementado el gráfico de barras apiladas (**Stacked Bar Chart**) de Aging por Asesor Comercial a la derecha de la distribución global de Aging (rediseñados como componentes side-by-side en una cuadrícula), con tooltip personalizado que desglosa detalladamente en COP los saldos corrientes y de mora de cada vendedor.
  - Verificada la compilación exitosa sin errores y la interactividad fluida mediante agente automatizado.
* **Siguiente paso sugerido**: Obtener la validación del usuario en producción.

---

### [2026-07-15 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Revisión del estado dejado por Gemini en Dashboard Web, saneamiento de git (commits pendientes + limpieza de archivos sueltos en la raíz), y dos ajustes puntuales solicitados en vivo por el usuario sobre el módulo de Cartera Comercial.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/src/App.tsx` (ordenamiento/exclusión de KPIs/paginación de Gemini comiteado; altura del gráfico de Cartera por Asesor +30%; filtro lateral de vendedores conectado al módulo de Cartera)
  - `d:/4 Hector Fabio/Dashboard Web/.gitignore` (excluye salidas generadas automáticamente y los Excel voluminosos de `/public` regenerados por el extractor DBF)
  - `d:/4 Hector Fabio/Dashboard Web/README.md`, `d:/4 Hector Fabio/Dashboard Web/src/index.css`
  - `d:/4 Hector Fabio/Dashboard Web/actualizar_datos_dbf.bat`, `actualizar_datos_dbf_silencioso.bat`, `programar_actualizacion_dbf.ps1` (ya documentados en README, nunca se habían comiteado)
  - `d:/4 Hector Fabio/Dashboard Web/actualizar_datos.js`, `actualizar_datos.bat`, `reconciliar_datos.py` (herramientas reales encontradas sueltas en la raíz, ahora versionadas)
  - `d:/4 Hector Fabio/Dashboard Web/1Maestra de clientes2026.xlsx` y su copia en `/public` (refresco de datos)
* **Resultado**:
  - Commiteado el trabajo pendiente de Gemini (ordenamiento por columna, checkboxes de inclusión/exclusión de KPIs, paginación configurable, gráfico de Aging por asesor) — confirmado que compila con `npm run build` antes de comitear.
  - Reorganizados archivos de datos sueltos de sesiones pasadas (Kardex, SaldosInv, Ventas Mayo, etc.) hacia `scratch/`, sin borrarlos.
  - Corregido: el gráfico "Análisis de Cartera por Asesor Comercial" pasó de `400px` a `520px` de alto (+30%) a pedido del usuario.
  - Corregido: el panel lateral de Vendedores (`selectedVendors`, usado en Ventas/Tendencias/Frecuencia) no tenía ningún efecto sobre Cartera. Se agregó como condición de filtro en `filteredClientes` dentro de `carteraKPIs`, lo cual cascada automáticamente a los KPIs, la tabla y el gráfico por asesor.
  - **Nota importante**: no hay herramienta de navegador disponible en este entorno para verificar visualmente los dos cambios de UI; solo se confirmó que compilan sin errores (`npm run build`). Falta validación visual en el navegador real.
* **Siguiente paso sugerido**: Validar visualmente en el navegador que (a) el gráfico de Cartera por Asesor se ve proporcionado con la nueva altura, y (b) desmarcar un vendedor en el panel lateral realmente reduce sus barras/KPIs en Cartera.

---

### [2026-07-16 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Ajustes adicionales al módulo de Cartera (segundo incremento de altura del gráfico por asesor, botón para colapsar la sección de Aging) y corrección de una guía de despliegue que hubiera sobrescrito datos de producción.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/src/App.tsx` (altura del gráfico 520px → 676px; nuevo botón "Ocultar/Mostrar Aging" junto al de KPIs)
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/CONTEXTO.md` (nueva regla fija de despliegue)
* **Resultado**:
  - El usuario pidió los pasos para desplegar a producción. Al dar la respuesta inicial, propuse copiar el `dist/` completo (código + Excel) al servidor.
  - El usuario corrigió: los 4 archivos `.xlsx` y `last_update.json` en el servidor los regenera `actualizar_dashboard_dbf.py` corriendo ahí mismo 4 veces al día leyendo del ERP — son más frescos que cualquier copia de desarrollo. Copiar el `dist/` completo hubiera sido un retroceso de datos.
  - Corregido el procedimiento de despliegue para excluir explícitamente los `.xlsx` y `last_update.json` de la copia al servidor (solo código estático: `index.html`, `assets/`, `excel.worker.js`, `xlsx.full.min.js`, `favicon.svg`, `icons.svg`). Documentado como regla fija en CONTEXTO.md para que no se repita el error en sesiones futuras (propias o de Gemini).
* **Siguiente paso sugerido**: Ejecutar el despliegue real en el servidor usando el procedimiento corregido y validar en navegador que los datos de producción no se vieron afectados.
