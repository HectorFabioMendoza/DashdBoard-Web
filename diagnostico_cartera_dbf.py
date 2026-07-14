import os
import sys

# Intentar importar librerias requeridas o instalarlas automaticamente
try:
    from dbfread import DBF
except ImportError:
    print("Instalando libreria dbfread...")
    os.system('pip install dbfread')
    from dbfread import DBF

from dbfread.field_parser import FieldParser

class SafeFieldParser(FieldParser):
    def parseN(self, field, data):
        try:
            data_clean = data.replace(b'\x00', b'').strip()
            if not data_clean:
                return 0
            return super().parseN(field, data_clean)
        except ValueError:
            return 0

    def parseF(self, field, data):
        try:
            data_clean = data.replace(b'\x00', b'').strip()
            if not data_clean:
                return 0.0
            return super().parseF(field, data_clean)
        except ValueError:
            return 0.0

# Directorios a buscar
RUTA_DATOS = r'E:\DataX_NUEVO\datos'
if not os.path.exists(RUTA_DATOS):
    fallbacks = [
        r"D:\4 Hector Fabio\Distribuidora JR\Base de datos",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Distribuidora JR', 'Base de datos')
    ]
    for fb in fallbacks:
        if os.path.exists(fb):
            RUTA_DATOS = fb
            break

print(f"Buscando tablas en: {RUTA_DATOS}")
output_file = "diagnostico_resultado_cartera.txt"

with open(output_file, "w", encoding="utf-8") as f:
    f.write(f"=== RESULTADOS DE DIAGNOSTICO DE CARTERA ===\n")
    f.write(f"Directorio de datos: {RUTA_DATOS}\n\n")

    if not os.path.exists(RUTA_DATOS):
        f.write("ERROR: No se encontró el directorio de datos.\n")
        print("ERROR: No se encontró el directorio de datos.")
        sys.exit(1)

    dbf_files = [x for x in os.listdir(RUTA_DATOS) if x.lower().endswith(".dbf")]
    f.write(f"Total archivos DBF encontrados: {len(dbf_files)}\n")
    f.write(", ".join(dbf_files) + "\n\n")

    # Filtrar por posibles nombres de cartera y maestros necesarios:
    # cgcxpe, cgaux, cgauxiliar, cgsald, cgdoc, cgmov, cgmvto, etc.
    palabras_clave = ["cx", "pe", "sald", "aux", "mov", "doc", "vend", "benf", "ciudad"]
    relevant_files = []
    for dbf in dbf_files:
        name_lower = dbf.lower()
        if any(kw in name_lower for kw in palabras_clave):
            relevant_files.append(dbf)

    f.write(f"Archivos relevantes filtrados ({len(relevant_files)}):\n")
    f.write(", ".join(relevant_files) + "\n\n")

    for dbf in relevant_files:
        path = os.path.join(RUTA_DATOS, dbf)
        size_mb = os.path.getsize(path) / (1024 * 1024)
        f.write(f"--------------------------------------------------\n")
        f.write(f"TABLA: {dbf} (Tamaño: {size_mb:.2f} MB)\n")
        f.write(f"--------------------------------------------------\n")
        print(f"Analizando {dbf}...")
        try:
            table = DBF(path, load=False, encoding='latin-1', ignore_missing_memofile=True, parserclass=SafeFieldParser)
            f.write(f"Número de registros: {len(table)}\n")
            f.write(f"Campos ({len(table.fields)}):\n")
            field_details = []
            for field in table.fields:
                field_details.append(f"  - {field.name} ({field.type}, longitud: {field.length})")
            f.write("\n".join(field_details) + "\n\n")

            # Muestra de primeros 3 registros
            f.write("Muestra de registros (primeros 3):\n")
            count = 0
            for row in table:
                f.write(f"  Reg {count + 1}: {dict(row)}\n")
                count += 1
                if count >= 3:
                    break
            if count == 0:
                f.write("  (Tabla vacía)\n")
            f.write("\n")
        except Exception as e:
            f.write(f"ERROR AL LEER LA TABLA: {str(e)}\n\n")

print(f"Diagnóstico completado. Resultados guardados en: {output_file}")
