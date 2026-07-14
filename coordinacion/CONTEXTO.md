# Contexto de Arquitectura y Decisiones Técnicas

Este documento reúne las decisiones arquitectónicas estables del proyecto, convenciones de desarrollo y aprendizajes de cosas que ya se intentaron y no funcionaron.

---

## 🖥️ 0. Proyecto Principal: Dashboard Web (Dashboard Comercial JR)
Este es el **proyecto raíz** del repositorio. `Inventario JRP` y `unilever` (Extractor Unilever) son subcarpetas que a su vez son subproyectos independientes (con sus propios repos de GitHub) — no forman parte de este dashboard y no deben mezclarse en su lógica.

### Arquitectura y Stack Tecnológico
* **Backend (extracción de datos)**: Python autónomo. `actualizar_dashboard_dbf.py` lee directamente las tablas DBF del ERP SIESA (FoxPro) desde `E:\DataX_NUEVO\datos` (producción) o `D:\4 Hector Fabio\Distribuidora JR\Base de datos` (fallback dev), consolida ventas/clientes/inventario y genera los Excel que consume el frontend.
* **Automatización**: `programar_actualizacion_dbf.ps1` programa la actualización 4 veces al día (7am, 1pm, 5pm, 10pm) vía Programador de Tareas de Windows con permisos elevados. `actualizar_datos_dbf_silencioso.bat` es la versión sin `pause` para tareas programadas; `actualizar_datos_dbf.bat` es la versión interactiva para depuración manual.
* **Frontend**: React + TypeScript, un único archivo grande `src/App.tsx` (~6200 líneas) con estado, lógica financiera y UI en Bento Grid. **100% serverless en el navegador**: no hay backend de datos en producción, el frontend lee directamente los `.xlsx` de `/public/` con la librería `xlsx` de JS (`1Maestra de clientes2026.xlsx`, `Ventas por linea.xlsx`, `Inventario.xlsx`).
* **Despliegue**: `npm run build` genera `/dist`, servido como estático en IIS o cualquier servidor HTTP. El script de Python en el servidor copia los Excel generados tanto a `/public` (dev) como a `/dist` (producción).
* **Acceso**: contraseña de prueba en dev es `JR2026`. Existe además un candado de seguridad específico para las pestañas Ventas y Tendencias (agregado recientemente, ver ESTADO.md).

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
Dashboard web interactivo y consola móvil para la realización de inventarios físicos en tiempo real de la distribuidora.

### Arquitectura y Stack Tecnológico
* **Frontend**: React (TypeScript + Vite). Componentes estructurados con diseño premium en Vanilla CSS y TailwindCSS para máxima adaptabilidad responsiva.
* **Backend**: Serverless basado en Firebase Realtime Database. Sincronización en tiempo real mediante listeners `onValue` de Firebase.
* **Red y Despliegue**: Los operarios acceden desde sus dispositivos móviles conectándose al servidor del supervisor. Para uso externo, se levanta un canal seguro mediante Cloudflare Tunnel (`cloudflared.exe`) exponiendo el puerto local de desarrollo (normalmente `5174` o `5175`).

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
