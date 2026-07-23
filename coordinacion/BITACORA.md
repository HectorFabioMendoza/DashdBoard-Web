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

---

### [2026-07-16 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Despliegue completo de **Inventario JRP** (rebautizado "Inventario Distribuidora JR") a producción en el servidor de Buenaventura, resolviendo en vivo una cadena de problemas de red/IIS hasta dejarlo operativo con acceso remoto multi-ciudad.
* **Archivos tocados**:
  - `Inventario JRP/src/App.tsx`, `Inventario JRP/src/components/OperatorConsole.tsx` (rebranding "Inventario JRP" → "Inventario" / "Distribuidora JR" en los encabezados)
  - `Inventario JRP/index.html` (título de pestaña actualizado)
  - `Inventario JRP/manual_tunel_cloudflare.md` (reescrito para reflejar el flujo de producción y agregar sección de Tailscale como próximo paso)
  - `Inventario JRP/dist/` (build de producción regenerado dos veces)
  - En el servidor (fuera de este repo): sitio IIS `Inventario JRP` en `C:\inetpub\Inventario` (puerto `8081`), Aplicación IIS `/Inventario` bajo `Default Web Site`, regla de Firewall para el `8081`, binario `cloudflared.exe` instalado en `C:\cloudflared\`.
* **Resultado**:
  - Diseño acordado con el usuario: cada app del servidor vive en carpeta física y puerto propios (Dashboard Web `:80`, Inventario `:8081`) para que nunca se crucen; documentado en `CONTEXTO.md`.
  - Troubleshooting en vivo: carpeta vacía en el primer intento (faltó `robocopy`), error 403.14 resuelto copiando el build; error 403.18 al montar `/Inventario` con un App Pool dedicado, resuelto reutilizando `DefaultAppPool`; `npx` no encontrado en el servidor (no tiene Node.js) resuelto instalando el binario standalone `cloudflared.exe`; timeout de red diagnosticado con `Test-NetConnection` hasta descubrir que la PC de prueba y el servidor están en redes físicas distintas (Palmira vs. Buenaventura) que coinciden por casualidad en el rango `192.168.1.x` — la solución final fue correr el túnel directamente en el servidor en vez de en una PC remota.
  - El usuario confirmó que el túnel ya funciona de punta a punta, probado desde el celular.
  - Se propuso Tailscale (ya usado por las otras dos filiales) como reemplazo futuro de la IP pública expuesta; el usuario lo marcó como su siguiente prioridad de infraestructura.
  - **Pendiente**: Inventario JRP vive en su propio repositorio git independiente (separado de Dashboard Web) con un solo "Initial commit"; los cambios de esta sesión (rebranding + manual) quedaron sin comitear ahí, a la espera de que el usuario autorice explícitamente ese commit.
* **Siguiente paso sugerido**: Confirmar con el usuario si se comitea en el repo de Inventario JRP, y cuando esté listo, planear la migración a Tailscale (instalación en el servidor + unión al tailnet existente).

---

### [2026-07-16 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Corrección de un error de organización — el usuario aclaró que "Inventario JRP" es una herramienta construida originalmente para **Cacharrería JRP** (otra empresa, repo e infraestructura separados), no para Distribuidora JR. El manual que reescribí en la entrada anterior mezclaba indebidamente el flujo de despliegue de Distribuidora JR dentro del repo/manual de Cacharrería JRP.
* **Archivos tocados**:
  - `Inventario JRP/manual_tunel_cloudflare.md` — **restaurado exactamente a su contenido original** (verificado con `git diff`, cero cambios respecto al commit existente).
  - `Manual_Despliegue_Inventario_Distribuidora_JR.md` (nuevo, raíz de Dashboard Web) — manual específico y completo del despliegue de Distribuidora JR (IIS, puertos, túnel, troubleshooting, próximo paso Tailscale).
  - `coordinacion/CONTEXTO.md` — separada la sección 1 (Inventario JRP / Cacharrería JRP, con nota de advertencia sobre la propiedad) de una nueva sección 0.1 (Inventario Distribuidora JR) con los detalles de este despliegue.
  - `coordinacion/ESTADO.md`, `coordinacion/PLAN.md` — referencias corregidas al manual y aclarado que Cacharrería JRP ya tiene su propia red Tailscale funcionando (a reutilizar, no crear una nueva).
* **Resultado**:
  - Los dos manuales quedan completamente separados: uno por infraestructura/empresa.
  - Dato nuevo importante: la migración a Tailscale de Distribuidora JR consiste en sumarse a la red que **ya existe y funciona en Cacharrería JRP**, no crear una desde cero. Pendiente, la ejecuta el usuario.
  - Sigue pendiente de autorización: comitear en el repo de Inventario JRP (Cacharrería JRP) el cambio de branding de UI hecho en sesión anterior — y evaluar si ese cambio debería vivir en una rama separada, ya que el código fuente es compartido entre ambos despliegues.
* **Siguiente paso sugerido**: Esperar decisión del usuario sobre el commit/rama del branding en el repo de Inventario JRP.

---

### [2026-07-16 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Reanudación del subproyecto **Extractor Unilever** (estaba en pausa) a pedido del usuario, y creación de su sistema de coordinación multi-agente dedicado, replicando el protocolo ya usado en este repo raíz.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/unilever/CLAUDE.md` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/unilever/coordinacion/CONTEXTO.md`, `ESTADO.md`, `PLAN.md`, `BITACORA.md` (nuevos)
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/ESTADO.md` (actualizada la línea sobre Unilever: pasa de "en pausa" a "reanudado", con puntero al nuevo sistema dedicado)
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/PLAN.md` (la sección "Extractor Unilever" ahora apunta al backlog detallado en `unilever/coordinacion/PLAN.md` en vez de duplicarlo)
* **Resultado**:
  - No se tocó ningún archivo de lógica de negocio ni de configuración del extractor. Solo se sentó la base documental, reutilizando lo ya escrito en `unilever/README.md` y `unilever/resumen_proyecto.md`.
  - Se detectó (no corregido) un punto de atención de seguridad: `unilever/config_unilever.json` tiene una contraseña de aplicación de Gmail en texto plano y no está en `.gitignore`, por lo que queda commiteada al historial de ese repo independiente. Documentado en `unilever/coordinacion/CONTEXTO.md` y `PLAN.md`, pendiente de decisión del usuario.
* **Siguiente paso sugerido**: Esperar a que el usuario indique la primera tarea concreta sobre el Extractor Unilever para esta sesión.

---

### [2026-07-17 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Construcción de un nuevo reporte por correo "Alertas de Inventario y Abastecimiento" (`enviar_alertas_inventario.py`) para Dashboard Web, integrado a la tarea programada existente, y corrección de una discrepancia numérica entre el correo y el dashboard en vivo.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/enviar_alertas_inventario.py` (nuevo) — replica en Python la lógica de `productSalesVelocityMap`/`processedInventory`/`inventoryKPIs` de `App.tsx`: prioridad = velocidad de venta / (stock+1), estados Agotado/Riesgo/Atención/Saludable según cobertura en días, nunca lee ni muestra precios de Lista 4/Lista 5.
  - `d:/4 Hector Fabio/Dashboard Web/config_alertas_inventario.json` (nuevo, plantilla sin credenciales) y `config_alertas_inventario.local.json` (nuevo, con credenciales reales, gitignorado, nunca comiteado).
  - `d:/4 Hector Fabio/Dashboard Web/actualizar_datos_dbf_silencioso.bat` — se agregó al final la llamada al script de alertas.
  - `.gitignore` — se agregó `config_alertas_inventario.local.json`.
* **Resultado**:
  - El script se integró al *.bat* compartido de la tarea programada `Actualizar_Dashboard_JR_DBF` (4 corridas diarias) sin tocar la tarea de Task Scheduler: un "portón" por hora dentro del propio script hace que el envío real solo ocurra en la corrida de las 7am (con `--forzar` disponible para pruebas manuales en cualquier horario).
  - Destinatarios definidos: en pruebas, solo `hectorfabio.mendoza@gmail.com`; en producción (7am real), `jstimebo@hotmail.com, distribuidorajr2009@hotmail.com` con copia a `hectorfabio.mendoza@gmail.com` — pendiente de activar en el servidor (ver PLAN.md).
  - **Bug encontrado y corregido**: el usuario reportó que las cifras del correo no coincidían con las del dashboard en vivo. Diagnóstico inicial equivocado (se atribuyó a un filtro de "Periodos" arbitrario en el navegador); el usuario corrigió que ese filtro de "mes actual + últimos 3 meses" (o últimos 3 si el mes actual aún no tiene ventas) es una **regla fija y permanente del dashboard** (`src/App.tsx:656-671`), no un estado de sesión accidental. Se reescribió `cargar_velocidad_ventas()` para replicar exactamente esa ventana de meses, además de ponderar el mes más reciente por fracción de días transcurridos (igual que `App.tsx:1081-1112`). También se corrigió `total_alertas` para que solo sume Agotados + Riesgo (no Atención), igual que `inventoryKPIs.totalAlerts` en `App.tsx:1224-1277`.
  - Verificado: el script compila (`py_compile`) y corre de punta a punta sin errores (probado localmente contra datos de desarrollo obsoletos — las cifras numéricas de esas pruebas no son representativas de producción).
* **Siguiente paso sugerido**: Ver tareas pendientes agregadas en `PLAN.md` — validar en el servidor con datos reales, y activar destinatarios de producción cuando el usuario lo autorice.

---

### [2026-07-17 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Incorporación de un nuevo agente, **Codex**, al esquema de coordinación multi-agente. En vez de darle un prompt que el usuario tuviera que repetir manualmente en cada sesión, se creó un archivo `AGENTS.md` en la raíz del repo — Codex CLI lo lee automáticamente al arrancar, igual que Claude Code lee `CLAUDE.md`.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/AGENTS.md` (nuevo) — replica el protocolo de `CLAUDE.md` (leer ESTADO/PLAN/CONTEXTO antes de empezar, marcar tareas en progreso con firma, actualizar BITACORA/PLAN/ESTADO al terminar, todo en español) adaptado para que Codex firme como `Codex`, más un resumen de las reglas ya aprendidas por error en sesiones previas (no sobrescribir Excel de producción, no confundir Inventario JRP/Cacharrería JRP con Inventario Distribuidora JR, no ejecutar efectos secundarios reales sin autorización).
  - `d:/4 Hector Fabio/Dashboard Web/coordinacion/BITACORA.md` (esta entrada).
* **Resultado**: Codex queda alineado con el mismo protocolo que ya siguen Claude y Gemini, sin necesidad de que el usuario repita instrucciones en cada conversación.
* **Siguiente paso sugerido**: Verificar en la primera sesión real con Codex que efectivamente lee y respeta `AGENTS.md` (el comportamiento de auto-lectura puede variar según la versión del CLI de Codex instalada).

---

### [2026-07-17 15:37 (Local Time)] - Agente: Codex
* **Tarea realizada**: Creación de una variante independiente de la aplicación de inventario para **Carapacho SM**, basada en la adaptación de Distribuidora JR, y preparación de su guía de despliegue a un servidor nuevo.
* **Archivos tocados**:
  - `Inventario Carapacho SM/` (nueva carpeta): fuente React/Vite, utilidades operativas reutilizables, plantilla Excel, plantilla Firebase sin credenciales, scripts de desarrollo y túnel, build `dist/` y `README_DESPLIEGUE.md`.
  - `coordinacion/PLAN.md`, `coordinacion/ESTADO.md`, `coordinacion/CONTEXTO.md`, `coordinacion/BITACORA.md`.
* **Resultado**:
  - Marca visible cambiada a “Inventario Carapacho SM” / “Carapacho SM”; paquete npm, puerto de desarrollo y clave de almacenamiento local también quedaron aislados.
  - No se copiaron `.git`, sesiones históricas, catálogos, datos ni credenciales Firebase de JRP/Distribuidora JR. El archivo real `firebase_config.json` está gitignorado y debe pertenecer a un proyecto exclusivo de Carapacho SM.
  - `npm run build` finalizó correctamente. Vista previa validada con HTTP 200, título correcto, recurso JavaScript accesible y marca Carapacho SM presente. No se realizó despliegue ni cambio en servidores externos.
  - `npm audit --omit=dev` reportó una vulnerabilidad alta en `xlsx` (Prototype Pollution/ReDoS, sin fix público); documentado que solo deben cargarse Excel confiables. El chunk principal supera 500 kB, advertencia no bloqueante ya conocida en el backlog de optimización.
* **Siguiente paso sugerido**: Crear el proyecto Firebase/Realtime Database exclusivo de Carapacho SM, completar `public/firebase_config.json`, regenerar el build y seguir `Inventario Carapacho SM/README_DESPLIEGUE.md` para copiar `dist/` al servidor por RDP.

---

### [2026-07-17 15:42 (Local Time)] - Agente: Codex
* **Tarea realizada**: Corrección de la arquitectura Firebase de **Inventario Carapacho SM** según definición del usuario: compartir la misma Realtime Database de Distribuidora JR, conservando sesiones independientes por namespace.
* **Archivos tocados**:
  - `Inventario Carapacho SM/src/App.tsx`: constante `SESSION_ROOT = sessions/carapacho_sm/session_active`, migración de todas las lecturas/escrituras de items y PIN, y separación de claves locales.
  - `Inventario Carapacho SM/src/components/OperatorConsole.tsx`, `SupervisorDashboard.tsx`: preferencias locales renombradas con prefijo Carapacho.
  - `Inventario Carapacho SM/public/firebase_config.json`: configuración copiada desde Distribuidora JR (gitignorada).
  - `Inventario Carapacho SM/dist/`: build regenerado con configuración compartida y namespace independiente.
  - `Inventario Carapacho SM/README_DESPLIEGUE.md`, `coordinacion/PLAN.md`, `ESTADO.md`, `CONTEXTO.md`, `BITACORA.md`.
* **Resultado**:
  - Carapacho y Distribuidora JR comparten proyecto/configuración Firebase, pero no inventario activo ni PIN: Carapacho usa `sessions/carapacho_sm/session_active`; Distribuidora JR conserva `sessions/session_active`.
  - Se verificó que `firebase_config.json` del build es idéntico al archivo fuente compartido, que el bundle contiene el namespace Carapacho y que no contiene la ruta antigua `sessions/session_active`.
  - `npm run build` completó correctamente. No se realizó ningún despliegue ni cambio externo.
* **Siguiente paso sugerido**: Copiar el `dist/` ya listo al nuevo servidor siguiendo `Inventario Carapacho SM/README_DESPLIEGUE.md` y probar una carga pequeña de Carapacho comprobando que el nodo de Distribuidora JR no cambie.

---

### [2026-07-17 16:35 (Local Time)] - Agente: Codex
* **Tarea realizada**: Finalización del lanzador de doble clic para el túnel temporal de **Inventario Carapacho SM**, replicando la experiencia operativa usada en Distribuidora JR.
* **Archivos tocados**:
  - `Inventario Carapacho SM/abrir_tunel_carapacho_sm.ps1`.
  - `Inventario Carapacho SM/Abrir_Tunel_Inventario_Carapacho_SM.bat` (verificado, sin cambios necesarios).
  - `Inventario Carapacho SM/README_DESPLIEGUE.md`.
  - `coordinacion/PLAN.md`, `ESTADO.md`, `CONTEXTO.md`, `BITACORA.md`.
* **Resultado**:
  - El PowerShell usa `http://127.0.0.1:8081`, verifica primero que IIS responda HTTP 200 y muestra un diagnóstico claro si el sitio o puerto no están disponibles.
  - Si IIS responde, ejecuta `cloudflared`, detecta el enlace `trycloudflare.com`, lo resalta y lo copia automáticamente al portapapeles. El `.bat` permite iniciar todo con doble clic y mantiene la ventana abierta.
  - Sintaxis PowerShell validada sin errores; referencias entre `.bat` y `.ps1` verificadas. No se ejecutó el túnel desde desarrollo ni se modificó el servidor de forma remota.
* **Siguiente paso sugerido**: Copiar ambos archivos a `C:\cloudflared` en el servidor, confirmar primero `http://127.0.0.1:8081` y hacer doble clic en `Abrir_Tunel_Inventario_Carapacho_SM.bat`.

---

### [2026-07-17 16:46 (Local Time)] - Agente: Codex
* **Tarea realizada**: Creación del repositorio Git independiente de **Inventario Carapacho SM**, primer commit, creación del repositorio privado en GitHub y push de la rama `main`.
* **Archivos tocados**:
  - `Inventario Carapacho SM/.gitignore` (`*.tsbuildinfo` y exclusiones de credenciales/artefactos).
  - `Inventario Carapacho SM/README.md` (presentación del proyecto y enlace al despliegue).
  - `.gitignore` del repo padre (exclusión del nuevo subproyecto independiente).
  - Metadatos Git internos de `Inventario Carapacho SM/.git/` y remoto `origin`.
  - `coordinacion/PLAN.md`, `ESTADO.md`, `CONTEXTO.md`, `BITACORA.md`.
* **Resultado**:
  - Repositorio privado creado: `https://github.com/HectorFabioMendoza/Inventario-Carapacho-SM`.
  - Commit inicial `ec28d642a169c3bd956109f9afffaa7e9248f1c7` en `main`; `origin/main` configurado y hashes local/remoto confirmados idénticos.
  - Se revisaron los archivos versionados: no entraron `public/firebase_config.json`, `dist/`, `node_modules/`, catálogos generados ni `tsconfig.tsbuildinfo`; solo se versiona la plantilla Firebase con valores ficticios.
  - GitHub CLI 2.96.0 quedó instalada. La creación del repositorio utilizó temporalmente y en memoria la credencial ya guardada por Git Credential Manager; no se mostró ni almacenó en archivos del proyecto.
  - No se incluyeron en este commit los cambios pendientes y ajenos del repositorio padre Dashboard Web.
* **Siguiente paso sugerido**: Validar en el servidor `http://127.0.0.1:8081`, copiar el lanzador a `C:\cloudflared` y probar el `.bat`; luego hacer una carga pequeña de Carapacho verificando que `sessions/session_active` de Distribuidora JR permanezca intacto.

---

### [2026-07-20 (Local Time)] - Agente: Claude (Claude Code)
* **Tarea realizada**: Inicio de la documentación completa de las 3 redes Tailscale de los negocios del usuario (Carapacho SM, Cacharrería JRP y Distribuidora JR), en la carpeta independiente `D:\4 Hector Fabio\Red Tailscale\` (fuera de este repo). Trabajo directamente relacionado con la migración a Tailscale de Distribuidora JR ya anotada como pendiente en este `PLAN.md`.
* **Archivos tocados** (todos fuera de este repo, en `D:\4 Hector Fabio\Red Tailscale\`):
  - `README.md` (nuevo) — índice general: estado de las 3 redes, las 4 cuentas de Tailscale y sus roles, ubicaciones físicas (Buenaventura/Cali/Palmira), arquitectura recomendada de "3 redes independientes unidas por sus servidores" vía compartición puntual de dispositivos.
  - `Carapacho/README.md` (nuevo) — inventario completo de los 15 dispositivos del tailnet `jstimebo@hotmail.com` (red principal) + `smcarapacho@gmail.com` (cuenta operativa), con IPs Tailscale, SO/versión y último visto capturados de las imágenes que compartió el usuario.
  - `Cacharreria JRP/README.md` (nuevo) — inventario completo de los 12 dispositivos del tailnet `cacharreriajrp77@gmail.com`.
  - `Distribuidora JR/README.md` (nuevo) — plan de migración de 6 pasos desde el esquema actual (IP pública + puerto abierto en el modem) hacia un tailnet propio bajo `gestiondistribuidorajr@gmail.com`, replicando el patrón ya usado en los otros dos negocios.
* **Resultado**:
  - Se aclaró con el usuario (vía preguntas) el mapeo cuenta→negocio: `jstimebo@hotmail.com` es la red principal de Carapacho (con `smcarapacho@gmail.com` como cuenta operativa secundaria compartida hacia adentro), `cacharreriajrp77@gmail.com` es JRP, y `gestiondistribuidorajr@gmail.com` queda reservada para la futura red de Distribuidora JR. Los dispositivos `distribuidorajr`/`distribuidorajr-1` que ya aparecían sueltos dentro de los tailnets de Carapacho y JRP se mantienen a propósito (visibilidad cruzada intencional).
  - Toda la estructura y el inventario de dispositivos (hostnames, IPs Tailscale, SO, último visto) quedó completo a partir de las capturas de pantalla. Las columnas de contraseñas (de las 4 cuentas Tailscale y de los usuarios Windows/RDP de cada dispositivo) quedaron como `[COMPLETAR]`, porque el usuario eligió pegarlas directamente en el chat y ese intercambio aún no ocurrió.
  - No se ejecutó ningún cambio real de infraestructura (no hay acceso de este agente a paneles de Tailscale, al router/modem ni a los servidores) — el alcance acordado con el usuario fue documentación más scripts/config de apoyo, dejando la ejecución real en manos del usuario.
---

### [2026-07-21 (Local Time)] - Agente: Codex
* **Tarea realizada**: Diagnóstico y corrección del fallo de envío de correo en `enviar_alertas_inventario.py` (`[Errno 11001] getaddrinfo failed`).
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/enviar_alertas_inventario.py`: Importado `socket` y `time`, sanitizados parámetros de entrada con `.strip()`, e implementado bucle de reintentos (3 intentos) con fallback a la IP IPv4 resuelta explícitamente y a IPs directas públicas de Gmail (`74.125.26.109`, `142.250.115.108`, `173.194.76.108`) para omitir bloqueos/fallas de DNS local de Windows.
* **Resultado**:
  - Resueltos los fallos de DNS (`[Errno 11001] getaddrinfo failed`) en `extraer_datos_unilever.py` y `enviar_alertas_inventario.py` mediante reintentos y fallback automático a IPs directas IPv4 de Gmail (`74.125.26.109`, `142.250.115.108`).
  - Alineada la lógica de `enviar_alertas_inventario.py` con `App.tsx` (filtrado de asesores desde `1Maestra de clientes2026.xlsx`, resolución dual `cleanCod` / `cleanRef`, y ventana ponderada de 4 meses).
  - Optimizada la velocidad de lectura de Excel a una sola pasada en openpyxl (`data_only=True`).
* **Siguiente paso sugerido**: Continuar con las tareas pendientes del backlog de Dashboard Web.

---

### [2026-07-22 12:30 (Local Time)] - Agente: Codex
* **Tarea realizada**: Desarrollo completo del subproyecto **Tablero Inventario Carapacho**, incluyendo extractor Python (`actualizar_inventario_carapacho.py`), frontend React + Vite + TypeScript (`App.tsx`), scripts de automatización batch/PowerShell y guía de despliegue en IIS bajo `http://localhost/tableroinventario/`.
* **Archivos tocados**:
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/actualizar_inventario_carapacho.py` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/actualizar_datos.bat` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/actualizar_datos_silencioso.bat` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/programar_actualizacion_dbf.ps1` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/package.json` (nuevo)
  - `d:/4 Hector Fabio/Dashboard Web/Dashboard Inventario Carapacho/src/App.tsx` (modificado)
* **Resultado**:
  - Extractor Python verificado exitosamente contra `IN52_SaldosInv_2026-JUL-23.xlsx` e `initem.dbf`: mapeó los **22 Grupos GA oficiales (GA01 al GA22)** y limpió sus nombres asignando descripciones completas sin códigos de índice.
  - **Prioridad Enmascarada (#1, #2, #3...)**: La columna Prioridad ahora enmascara el puntaje técnico float y posiciona cada ítem como ranking numerado `#1`, `#2`, `#3`... hasta `#N` (donde `#1` es la mayor urgencia de reabastecimiento), facilitando la lectura directa por parte de la Gerencia.
  - **Rediseño de Badge de Prioridad**: Reemplazado el fondo rojo cuadrado por una insignia redondeada tipo pill (`px-2.5 py-0.5 rounded-md font-black`) en tono suave con bordes sutiles, idéntica visualmente a la columna Estado.
  - **Paginación Predeterminada a 25 Ítems**: La tabla ahora carga por defecto con **25 productos por página** habilitando su scroll interno independiente sin desajustar el diseño de una sola pantalla.
  - **UX Invertida en Botones de Grupos**: Todos los botones de grupo inician ACTIVOS (verdes con ícono de ojo) por defecto. Al hacer clic en un grupo, este se **deselecciona/desactiva** (se oculta de la tabla y del gráfico con un tachado suave) permitiendo al usuario filtrar por exclusión de forma muy fácil e intuitiva.
  - Frontend React compilado limpiamente en 20.18s (`npm run build`) generando `/dist/` preparado para alojarse en IIS Carapacho.

* **Siguiente paso sugerido**: En el Servidor Carapacho, copiar los archivos estáticos de `dist/` a `C:\inetpub\wwwroot\tableroinventario` y refrescar `http://localhost/tableroinventario/`.















