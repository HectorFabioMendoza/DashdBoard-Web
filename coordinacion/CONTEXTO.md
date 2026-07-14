# Contexto de Arquitectura y Decisiones Técnicas

Este documento reúne las decisiones arquitectónicas estables del proyecto, convenciones de desarrollo y aprendizajes de cosas que ya se intentaron y no funcionaron.

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
