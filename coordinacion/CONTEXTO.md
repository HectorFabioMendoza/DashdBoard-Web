# Contexto de Arquitectura y Decisiones Técnicas

Este documento reúne las decisiones arquitectónicas estables del proyecto, convenciones de desarrollo y aprendizajes de cosas que ya se intentaron y no funcionaron.

---

## 🖥️ 0. Proyecto Principal: Dashboard Web (Dashboard Comercial JR)
Este es el **proyecto raíz** del repositorio. `Inventario JRP` y `unilever` (Extractor Unilever) son subcarpetas que a su vez son subproyectos independientes (con sus propios repos de GitHub) — no forman parte de este dashboard y no deben mezclarse en su lógica.

### Arquitectura y Stack Tecnológico
* **Backend (extracción de datos)**: Python autónomo. `actualizar_dashboard_dbf.py` lee directamente las tablas DBF del ERP SIESA (FoxPro) desde `E:\DataX_NUEVO\datos` (producción) o `D:\4 Hector Fabio\Distribuidora JR\Base de datos` (fallback dev), consolida ventas/clientes/inventario y genera los Excel que consume el frontend.
* **Automatización**: `programar_actualizacion_dbf.ps1` programa la actualización 4 veces al día (7am, 1pm, 5pm, 10pm) vía Programador de Tareas de Windows con permisos elevados. `actualizar_datos_dbf_silencioso.bat` es la versión sin `pause` para tareas programadas; `actualizar_datos_dbf.bat` es la versión interactiva para depuración manual.
* **Frontend**: React + TypeScript, un único archivo grande `src/App.tsx` (~6200 líneas) con estado, lógica financiera y UI en Bento Grid. **100% serverless en el navegador**: no hay backend de datos en producción, el frontend lee directamente los `.xlsx` de `/public/` con la librería `xlsx` de JS (`1Maestra de clientes2026.xlsx`, `Ventas por linea.xlsx`, `Inventario.xlsx`).
* **Despliegue**: `npm run build` genera `/dist`, servido como estático en IIS (`C:\inetpub\wwwroot` en el servidor) o cualquier servidor HTTP. Guía completa en `Guia_Despliegue_Dashboard.pdf`.
* **Acceso**: contraseña de prueba en dev es `JR2026`. Existe además un candado de seguridad específico para las pestañas Ventas y Tendencias (agregado recientemente, ver ESTADO.md).

### ⚠️ Regla fija de despliegue: NUNCA sobrescribir los Excel del servidor con los del dev
El servidor de producción es el **dueño de la verdad** de los 4 archivos `.xlsx` (`1Maestra de clientes2026.xlsx`, `Ventas por linea.xlsx`, `Inventario.xlsx`, `Cartera.xlsx`) y de `last_update.json`: los regenera `actualizar_dashboard_dbf.py` corriendo **en el propio servidor** 4 veces al día (vía `programar_actualizacion_dbf.ps1`, leyendo directo del ERP). Las copias de esos mismos archivos en el entorno de desarrollo (`public/`, `dist/`) son solo snapshots viejos para poder trabajar localmente.
* **Al desplegar una actualización de código**, copiar ÚNICAMENTE los artefactos estáticos del build (`index.html`, `assets/`, `excel.worker.js`, `xlsx.full.min.js`, `favicon.svg`, `icons.svg`) — **excluir explícitamente** cualquier `.xlsx` y `last_update.json` de la copia (ej. `robocopy ... /XF *.xlsx last_update.json`).
* Copiar el `dist/` completo sin excluir estos archivos sobrescribe datos frescos del servidor con datos de desarrollo desactualizados — es un retroceso de datos, no una actualización.

### 🖥️ 0.1 Inventario Distribuidora JR (despliegue propio, código reutilizado de Cacharrería JRP)
Distribuidora JR reutiliza la herramienta "Inventario JRP" (ver sección 1 — construida originalmente para Cacharrería JRP) para su propio conteo físico de inventario. Es un **despliegue e infraestructura completamente separados** de los de Cacharrería JRP, aunque el código fuente es el mismo repositorio.

* **Manual completo y específico de este despliegue**: `Manual_Despliegue_Inventario_Distribuidora_JR.md` (raíz de este repo). El manual original de Cacharrería JRP (`Inventario JRP/manual_tunel_cloudflare.md`) no debe editarse con detalles de Distribuidora JR.
* La app pasó de correr en modo desarrollo (`npm run dev` + `.bat`) a estar **alojada de forma permanente en IIS en el servidor de producción de Buenaventura** (192.168.1.101), como app independiente de Dashboard Web (ver "Esquema de Alojamiento Multi-App" más abajo). Nombre visible al usuario cambiado de "Inventario JRP" a **"Inventario Distribuidora JR"** (título de pestaña, encabezados de Supervisor y Operario) — cambio hecho solo en el build desplegado para Distribuidora JR.
  - Sitio IIS dedicado en el puerto `8081` (nombre del sitio en IIS: `Inventario JRP`, carpeta física `C:\inetpub\Inventario`) — usado como origen del túnel de Cloudflare.
  - Además, montado como Aplicación IIS en la ruta `/Inventario` bajo `Default Web Site` (mismo `DefaultAppPool` que Dashboard Web, tras un error 403.18 con un App Pool dedicado) — usado para acceso cómodo dentro de la LAN sin puerto.
  - **Acceso externo temporal (operarios en otras ciudades)**: Cloudflare Quick Tunnel corriendo con el binario standalone `cloudflared.exe` (sin Node.js) **directamente en el servidor** vía RDP — no desde una PC remota, ya que el túnel solo puede reenviar tráfico hacia una dirección que él mismo pueda alcanzar por red. Comando: `C:\cloudflared\cloudflared.exe tunnel --url http://localhost:8081`. Se apaga con `Ctrl+C`.
  - Como el build de producción ya incluye `firebase_config.json`, no hace falta configurar Firebase manualmente al entrar por el túnel.
  - **Próximo paso planeado (no implementado aún, lo ejecuta el usuario)**: migrar de IP pública + túnel a **Tailscale**, sumando el servidor de Distribuidora JR a la red Tailscale que **ya tiene funcionando Cacharrería JRP** (reutilizar esa red existente, no crear una nueva).

### 🏗️ Esquema de Alojamiento Multi-App en el Servidor
El servidor de Buenaventura aloja más de una aplicación web (Dashboard Web + Inventario Distribuidora JR, y potencialmente más automatizaciones futuras). Convención acordada para que nunca se crucen entre sí:
* **Carpeta física propia por app**, nunca anidada dentro de la de otra: `C:\inetpub\wwwroot` (Dashboard Web) y `C:\inetpub\Inventario` (Inventario Distribuidora JR). Un despliegue con `robocopy` mal apuntado a una no puede tocar los archivos de la otra.
* **Puerto propio por app** en vez de hostname (no hay DNS local en la red de la empresa, y usar puertos evita tener que editar el archivo `hosts` de cada PC): Dashboard Web en `:80`, Inventario en `:8081`. La siguiente app futura debería tomar `:8082`, y así sucesivamente.
* Adicionalmente, cada app puede montarse también como Aplicación IIS bajo `Default Web Site` (ruta amigable sin puerto, ej. `/Inventario`) para uso cómodo en LAN — pero **el sitio dedicado por puerto debe conservarse igual**, porque es el que se usa como origen del túnel de Cloudflare cuando se necesita acceso externo; si se tunelizara el sitio compartido en el puerto 80, Dashboard Web (sensible para gerencia) viajaría expuesto en el mismo túnel.
* **Lección aprendida — Error IIS 403.18**: al crear una Aplicación IIS con un Application Pool dedicado nuevo bajo un sitio existente, puede aparecer `403.18 Forbidden` (conflicto de grupo de aplicaciones). Arreglo confiable: reutilizar el mismo Application Pool del sitio padre (`DefaultAppPool`) en vez de crear uno nuevo — para apps estáticas (sin código de servidor) esto no representa ningún riesgo real.

### 🐢 0.2 Inventario Carapacho SM (variante independiente, pendiente de despliegue)

* Carpeta propia: `Inventario Carapacho SM/`. Se creó desde la adaptación de Distribuidora JR, pero no comparte datos de sesión, catálogos, build ni historial git con JRP o Distribuidora JR.
* Identidad propia en `index.html`, `src/App.tsx`, `src/components/OperatorConsole.tsx`, paquete npm `inventario-carapacho-sm`, puerto de desarrollo `5176` y claves locales con prefijo `carapacho_sm`.
* **Firebase compartido, namespace separado**: reutiliza el mismo `firebase_config.json`, proyecto y Realtime Database de Distribuidora JR, pero la constante `SESSION_ROOT` fija todas las operaciones de Carapacho en `sessions/carapacho_sm/session_active`. Distribuidora JR sigue en `sessions/session_active`. No cambiar ni eliminar ese namespace.
* Build estático generado en `dist/` con la configuración compartida incluida. Se verificó que el bundle contiene la ruta Carapacho y no contiene `sessions/session_active`.
* Manual dedicado: `Inventario Carapacho SM/README_DESPLIEGUE.md`. Configuración sugerida para un servidor nuevo: `C:\inetpub\InventarioCarapachoSM`, sitio IIS `Inventario Carapacho SM`, puerto `8081` si está libre.
* Lanzador del túnel: copiar `Abrir_Tunel_Inventario_Carapacho_SM.bat` y `abrir_tunel_carapacho_sm.ps1` a `C:\cloudflared` junto a `cloudflared.exe`. El PowerShell valida `http://127.0.0.1:8081`, abre el Quick Tunnel, detecta la URL, la muestra resaltada y la copia al portapapeles; el `.bat` permite operar todo con doble clic.
* Repositorio GitHub independiente y privado: `https://github.com/HectorFabioMendoza/Inventario-Carapacho-SM`, rama `main`. Commit inicial: `ec28d642a169c3bd956109f9afffaa7e9248f1c7`. La carpeta está excluida del repo padre en `.gitignore`; su propio `.gitignore` excluye `public/firebase_config.json`, `dist/`, `node_modules/`, catálogos generados y `.tsbuildinfo`.
* Seguridad conocida: la app actual no implementa Firebase Authentication; el PIN de supervisor no reemplaza reglas de Firebase. El paquete público `xlsx` usado para importar Excel tiene avisos de Prototype Pollution/ReDoS sin corrección disponible; cargar solo Excel confiables.

### Hallazgo Crítico: Corrupción de Valores Nulos (`\x00`) en DBFs
Los motores antiguos de FoxPro escriben bytes nulos binarios en campos numéricos. La librería `dbfread` estándar lanza `ValueError: could not convert string to float` al toparse con esto. Solución: un `SafeFieldParser` (heredado de `dbfread.field_parser.FieldParser`) que intercepta `parseN`/`parseF` y reemplaza los nulos por `0`/`0.0` en vez de abortar. **No revertir a `dbfread` sin este parser.**

### Tablas DBF clave (ERP SIESA)
| Tabla | Propósito | Campos Clave |
| :--- | :--- | :--- |
| `infact.dbf` | Cabeceras de Facturas | `FC_DOC`, `FC_NRO`, `FC_FECHA`, `FC_VENTAS` (vendedor), `FC_BENF` (cliente), `FC_VLRBRUT`, `FC_VLR_DSC`, `FC_VLR_IVA`, `FC_ANULA` |
| `inmvto.dbf` | Detalle de Movimientos | `MOV_DOC`, `MOV_NRO`, `MOV_COD`, `MOV_CANT`, `MOV_FC_PVE`, `MOV_FC_DSC`, `MOV_IVA` |
| `initem.dbf` | Maestro de Artículos | `COD_ITEM`, `DESCRIP`, `ITM_LINEA`, `ITM_MINIMO`, `ITM_MAXIMO`, `UNI_FACTOR` |
| `insaldo.dbf` | Saldos de Inventario | `COD_SDO`, `ACTUAL_SDO` |
| `instock.dbf` | Inventario por Bodega (fallback si no hay `insaldo.dbf`) | `ST_COD`, `ST_PIEZA` |
| `cgvend.dbf` | Vendedores | `COD_VEND`, `DES_VEND` |
| `cgbenf.dbf` | Maestro de Clientes | `COD_BENF`, `NOM_BENF` |

### Lógica de negocio fija
* **Prioridad de Compra** (pestaña Inventario): `Velocidad de Ventas Promedio Mensual / (Stock Actual + 1)`. La velocidad se calcula sumando unidades vendidas de `Ventas por linea.xlsx` en el rango de filtros y dividiendo por el número de meses únicos representados.
* **Clasificación de Stock**: `Agotado` (stock ≤ 0) · `Riesgo` (stock ≤ stock_min) · `Atención` (stock ≤ stock_min * 1.3) · `Saludable` (resto).
* **Evaluación de recencia/riesgo de inactividad de clientes**: dinámica según el rango de meses seleccionado por el usuario (implementada recientemente, ver ESTADO.md).

---

## 📦 1. Proyecto: Inventario JRP
> ⚠️ **Ojo con la propiedad**: esta herramienta fue construida originalmente para **Cacharrería JRP** (otra empresa/filial, con su propio repositorio de GitHub independiente). Distribuidora JR **reutiliza este mismo código** para su propia operación (ver sección 0.1 más abajo). Los documentos y detalles específicos del despliegue de Cacharrería JRP viven dentro de la carpeta `Inventario JRP/` (ej. `manual_tunel_cloudflare.md`); los específicos de Distribuidora JR viven en la raíz de este repo (`Manual_Despliegue_Inventario_Distribuidora_JR.md`). **No mezclar los dos** — son dos despliegues/infraestructuras distintas sobre el mismo código base.

Dashboard web interactivo y consola móvil para la realización de inventarios físicos en tiempo real.

### Arquitectura y Stack Tecnológico
* **Frontend**: React (TypeScript + Vite). Componentes estructurados con diseño premium en Vanilla CSS y TailwindCSS para máxima adaptabilidad responsiva.
* **Backend**: Serverless basado en Firebase Realtime Database. Sincronización en tiempo real mediante listeners `onValue` de Firebase.
* **Red y Despliegue (Cacharrería JRP, uso original)**: Los operarios acceden desde sus dispositivos móviles conectándose al servidor del supervisor. Para uso externo, se levanta un canal seguro mediante Cloudflare Tunnel (`cloudflared.exe`) exponiendo el puerto local de desarrollo (normalmente `5174` o `5175`). Cacharrería JRP **ya tiene una red Tailscale funcionando** para su propia infraestructura — dato relevante para la migración planeada de Distribuidora JR (ver 0.1).

### Digitación Automática (Siesa / DataX ERP)
Para cargar los saldos conciliados al ERP sin errores de digitación, se utiliza un script de emulación de teclado en Python (`digitar_ajustes_erp.py`) que lee el Excel exportado por el dashboard.
* **Librerías clave**: `pyautogui` para simular pulsaciones y `keyboard` para escuchar eventos globales en segundo plano.
* **Tiempos de espera óptimos**: Carga de referencia a 1.7s, estándar entre teclas a 0.65s, paso TAB de código a referencia a 0.35s, retorno a 2.4s.
* **Atajos de Control**:
  - `BACKSPACE`: Espera ilimitada inicial hasta que el usuario pulse esta tecla en el ERP para comenzar el script de forma segura.
  - `1` o `S`: Pulsado directamente en Siesa para confirmar el artículo e indicarle al script que avance de fila automáticamente.
  - `SHIFT` o `CTRL`: Teclas seguras "comodines" de confirmación rápida por si la red tiene lag y el script no detecta el avance de fila automáticamente.
  - `BARRA ESPACIADORA`: Aborto inmediato de emergencia en caso de diálogos de error del ERP.

### Lecciones Aprendidas (Cosas que NO funcionaron)
* **Captura de Teclado Bloqueante**: Inicialmente se intentó usar `keyboard.read_event()` de forma síncrona en el bucle principal de Python. Esto congelaba el script y perdía las pulsaciones de confirmación rápidas del usuario. Se solucionó instalando un listener en segundo plano (`keyboard.hook`).
* **Enter en Código de Movimiento**: Siesa realiza un salto automático (auto-tab) al ingresar los dos dígitos del movimiento (ej. `30` / `70`). Intentar mandar un `Enter` desplazaba el cursor fuera del campo de cantidad. Se eliminó dicha pulsación de enter en el script.
* **Desplazamiento de Grilla**: Las actualizaciones concurrentes de Firebase reordenaban la tabla mientras el supervisor revisaba o marcaba casillas. Esto se solucionó implementando un buffer temporal (`bufferedItems`) y un toggle de "Congelar Grilla".

---

## 🚜 2. Proyecto: Extractor Unilever
Script de extracción de facturación y ventas diarias para reportar a Unilever en el formato de plantilla de datos estructurados requerido.

### Arquitectura y Stack Tecnológico
* **Backend**: Python autónomo.
* **Lectura de Base de Datos**: Acceso directo y decodificación de archivos DBF de FoxPro (`buscar_facturas_dbf.py`, `extraer_datos_unilever.py`) pertenecientes a la base de datos local del software contable de la distribuidora.
* **Generación de Reportes**: Librería `openpyxl` y `pandas` para estructurar y exportar las ventas diarias en formato Excel (`.xlsx`) alineadas con las plantillas de requerimientos del fabricante.

### Lecciones Aprendidas (Cosas que NO funcionaron)
* **Incompatibilidad de Nombres de Columnas**: La estructura interna de las tablas DBF de FoxPro tiene nombres y longitudes limitadas de columnas. Se tuvo que realizar mapeo flexible para autodetectar tipos de registros.
