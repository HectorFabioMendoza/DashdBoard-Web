# Manual Técnico y Resumen de Arquitectura: Dashboard Comercial JR 📋🚀

Este documento contiene toda la información crítica sobre la arquitectura, la base de datos ERP (SIESA FoxPro DBF), la lógica de negocio y los requisitos del frontend para el **Dashboard Comercial JR**. Está diseñado para que cualquier desarrollador o agente de IA pueda entender el sistema y continuar el trabajo de forma inmediata sin tener que analizar todo el código fuente.

---

## 📁 Estructura General del Proyecto

El proyecto se divide en dos componentes principales: un **extractor de datos en Python** (backend local) y una **aplicación web estática en React** (frontend de alto rendimiento).

### 1. Backend (Automatización de Datos)
*   **[actualizar_dashboard_dbf.py](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/actualizar_dashboard_dbf.py)**: Script principal de Python. Lee las tablas DBF del ERP, consolida ventas, clientes e inventario, y genera los archivos Excel formateados.
*   **[actualizar_datos_dbf.bat](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/actualizar_datos_dbf.bat)**: Lanzador manual interactivo de la importación desde ERP (DBF) que incluye `pause` al final para depuración.
*   **[actualizar_datos_dbf_silencioso.bat](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/actualizar_datos_dbf_silencioso.bat)**: Lanzador silencioso de la importación sin interacción (sin `pause`), diseñado para el Programador de Tareas.
*   **[programar_actualizacion_dbf.ps1](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/programar_actualizacion_dbf.ps1)**: Script automatizador en PowerShell para programar y registrar la actualización del ERP 4 veces al día (7 AM, 1 PM, 5 PM y 10 PM) con permisos elevados.
*   **[log_dbf_dashboard.txt](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/log_dbf_dashboard.txt)**: Bitácora de registro con detalles de ejecución, registros importados y posibles errores del extractor.

### 2. Frontend (Dashboard React)
*   **[src/App.tsx](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/src/App.tsx)**: Código fuente principal del Dashboard. Contiene el estado, las consultas asíncronas de archivos locales, la lógica de cálculo financiero y la interfaz de usuario en Bento Grid.
*   **[public/](file:///d:/4%20Hector%20Fabio/Dashboard%20Web/public/)**: Contiene los archivos Excel de entrada leídos por la aplicación:
    *   `1Maestra de clientes2026.xlsx`: Historial de facturas y visitas únicas por asesor.
    *   `Ventas por linea.xlsx`: Detalle de transacciones individuales por ítem para análisis de líneas y artículos.
    *   `Inventario.xlsx`: Catálogo de stock físico actual y stock de seguridad (mínimo/máximo) extraídos del ERP.

---

## 💾 Descubrimientos y Estructura de la Base de Datos (FoxPro DBF)

El ERP SIESA exporta su información en formato dBase/FoxPro DBF en la ruta de red de producción (usualmente `E:\DataX_NUEVO\datos` o en el fallback de desarrollo `D:\4 Hector Fabio\Distribuidora JR\Base de datos`).

### 1. Tablas y Campos Clave Utilizados

| Tabla | Propósito | Campos Clave Utilizados |
| :--- | :--- | :--- |
| **`infact.dbf`** | Cabeceras de Facturas | `FC_DOC` (FE/CT), `FC_NRO`, `FC_FECHA`, `FC_VENTAS` (Vendedor), `FC_BENF` (Cliente), `FC_VLRBRUT`, `FC_VLR_DSC`, `FC_VLR_IVA`, `FC_ANULA` |
| **`inmvto.dbf`** | Detalle de Movimientos | `MOV_DOC`, `MOV_NRO`, `MOV_COD` (Código Artículo), `MOV_CANT` (Cantidad), `MOV_FC_PVE` (Precio de Venta), `MOV_FC_DSC`, `MOV_IVA` |
| **`initem.dbf`** | Maestro de Artículos | `COD_ITEM`, `DESCRIP` (Descripción), `ITM_LINEA` (Código Línea), `ITM_MINIMO` (Stock Mínimo), `ITM_MAXIMO` (Stock Máximo), `UNI_FACTOR` (Empaque) |
| **`insaldo.dbf`** | Saldos de Inventario | `COD_SDO` (Código de Producto), `ACTUAL_SDO` (Stock consolidado físico actual) |
| **`instock.dbf`** | Inventario por Bodega | `ST_COD` (Código), `ST_PIEZA` (Existencia física - Usado como fallback si no hay `insaldo.dbf`) |
| **`cgvend.dbf`** | Vendedores | `COD_VEND`, `DES_VEND` (Nombre del Vendedor) |
| **`cgbenf.dbf`** | Maestro de Clientes | `COD_BENF`, `NOM_BENF` (Nombre Real de la Empresa/Cliente) |

### 2. Hallazgo Crítico: Corrupción de Valores Nulos (`\x00`) en DBFs
*   **Problema:** Los motores antiguos de FoxPro a menudo escriben bytes nulos binarios (`\x00\x00...`) en los campos numéricos en lugar de espacios o números válidos en formato string. Al intentar leerlos con la biblioteca `dbfread` estándar, se produce una excepción fatal (`ValueError: could not convert string to float`) que detiene la extracción.
*   **Solución (SafeFieldParser):** Implementamos un parser heredado de `dbfread.field_parser.FieldParser` que intercepta `parseN` y `parseF`. Reemplaza los bytes nulos con cadenas vacías, garantizando que los registros se importen de forma segura convirtiendo los valores nulos en `0` o `0.0` sin abortar el proceso.

---

## 📊 Lógica y Requerimientos del Frontend (React)

El frontend funciona de manera **105% autónoma** (Serverless local). No utiliza bases de datos relacionales tradicionales; en su lugar, consume los archivos Excel de `/public/` mediante la librería `xlsx` de JS. Esto simplifica enormemente la infraestructura y permite un renderizado instantáneo en el navegador del cliente.

### 1. Cruce de Datos Dinámico (Stock vs Velocidad de Venta)
Para calcular las prioridades de reabastecimiento en la pestaña **Inventario**, cruzamos dinámicamente dos fuentes:

*   **Ventas Recientes (Rotación)**: Se extrae del archivo `Ventas por linea.xlsx`. Se calcula la cantidad de meses únicos representados en la selección de filtros del usuario. Para cada referencia, se suman sus unidades vendidas y se dividen por este número de meses para obtener la **Velocidad de Ventas Promedio Mensual**.
*   **Índice de Prioridad de Compra**:
    $$\text{Prioridad} = \frac{\text{Velocidad de Ventas Promedio Mensual}}{\text{Stock Actual} + 1}$$
    *Un producto con ventas muy altas en los últimos meses y stock en 0 tendrá una prioridad crítica (ej: $150 / (0+1) = 150$), mientras que un producto sin ventas recientes tendrá prioridad 0.*

### 2. Clasificación Automatizada del Stock
Cada referencia de inventario se clasifica en tiempo real en los siguientes estados:
*   `Agotado`: Stock actual es igual o menor a 0.
*   `Riesgo` (Stock Crítico): Stock actual es menor o igual al stock mínimo (`stock_min`) configurado en el ERP.
*   `Atención`: Stock actual supera el mínimo pero está en el rango del 30% de seguridad (`stock_actual <= stock_min * 1.3`).
*   `Saludable`: Cobertura óptima (`stock_actual > stock_min * 1.3`).

### 3. Componentes Visuales del Módulo de Inventario
*   **KPI Cards**: Tarjetas de alto impacto con micro-animaciones en Tailwind para mostrar ítems bajo mínimo, agotados en demanda, stock saludable y los días estimados de cobertura promedio.
*   **Stacked Bar Chart (Recharts)**: Gráfico de barras apiladas que agrupa las alertas por marca/línea (mostrando la proporción de Agotados en Rojo y Críticos en Naranja) ordenadas por volumen de alertas.
*   **Tabla Paginada**: Grid con búsqueda instantánea de referencias, paginación dinámica (15 filas por página) y filtros selectivos por Línea Comercial y Estado de Stock.

---

## 🚀 Despliegue y Desarrollo Local

### Desarrollo
1. Instalar dependencias del frontend: `npm install`.
2. Iniciar el servidor local: `npm run dev` (abre el puerto `5173`).
3. Credenciales de acceso de prueba: contraseña `JR2026`.

### Producción y Actualización
1. El script de Python en el servidor genera los archivos y los copia tanto a la carpeta `/public` de desarrollo como a `/dist` de producción.
2. Para compilar el frontend después de cualquier cambio en el código:
   ```bash
   npm run build
   ```
3. El directorio `/dist` resultante contiene la versión estática final lista para ser servida en IIS o cualquier servidor HTTP web.
