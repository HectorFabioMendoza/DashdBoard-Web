import os
from datetime import date
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

RUTA_DATOS = r'E:\DataX_NUEVO\datos'
if not os.path.exists(RUTA_DATOS):
    RUTA_DATOS = r"D:\4 Hector Fabio\Distribuidora JR\Base de datos"

DBF_SALDO = os.path.join(RUTA_DATOS, 'cgsaldo.dbf')
DBF_CLIENTES = os.path.join(RUTA_DATOS, 'cgbenf.dbf')

print(f"Leyendo tablas desde: {RUTA_DATOS}")

# 1. Buscar cliente 901932243 o PEREZ & CUERO en cgbenf.dbf
cliente_info = None
if os.path.exists(DBF_CLIENTES):
    print("Cargando cgbenf.dbf...")
    table_cli = DBF(DBF_CLIENTES, load=False, encoding='latin-1', ignore_missing_memofile=True, parserclass=SafeFieldParser)
    for r in table_cli:
        cod = str(r.get('COD_BENF', '')).strip()
        nit = str(r.get('NIT_BENF', '')).strip()
        nom = str(r.get('NOM_BENF', '')).strip()
        if 'PEREZ' in nom.upper() or nit == '901932243' or cod == '901932243':
            cliente_info = dict(r)
            print(f"Encontrado Cliente en cgbenf.dbf: COD={cod}, NIT={nit}, NOM={nom}")
            print(f"  Cupo Asignado (CUP_BENF): {r.get('CUP_BENF')}")
            print(f"  Vendedor (VENDEDOR_B): {r.get('VENDEDOR_B')}")
            print(f"  Estado (ESTADO_BEN): {r.get('ESTADO_BEN')}")
            print(f"  Bloqueo Mora (BLQMORA_BE): {r.get('BLQMORA_BE')}")
            break

# 2. Buscar registros con saldo en cgsaldo.dbf para este cliente
if os.path.exists(DBF_SALDO):
    print("\nCargando cgsaldo.dbf...")
    table_sal = DBF(DBF_SALDO, load=False, encoding='latin-1', ignore_missing_memofile=True, parserclass=SafeFieldParser)
    
    total_registros = 0
    con_saldo = 0
    perez_registros = []
    
    for r in table_sal:
        total_registros += 1
        cuenta = str(r.get('CUENTA_SAL', '')).strip()
        benf = str(r.get('BENF_SALDO', '')).strip()
        deb = float(r.get('DEB_SALDO', 0.0))
        cre = float(r.get('CRE_SALDO', 0.0))
        saldo = deb - cre
        
        # Filtramos por las cuentas de cartera típicas que comiencen con 1305
        if cuenta.startswith('1305'):
            if saldo > 0.01:
                con_saldo += 1
                if benf == '901932243' or (cliente_info and benf == cliente_info.get('COD_BENF')):
                    perez_registros.append(dict(r))
                    
    print(f"Total registros analizados en cgsaldo: {total_registros}")
    print(f"Total registros con saldo pendiente en cuenta 1305*: {con_saldo}")
    print(f"\nFacturas pendientes encontradas para este cliente ({len(perez_registros)}):")
    
    for idx, r in enumerate(perez_registros):
        deb = float(r.get('DEB_SALDO', 0.0))
        cre = float(r.get('CRE_SALDO', 0.0))
        saldo = deb - cre
        print(f"  Factura {idx+1}:")
        print(f"    Cuenta: {r.get('CUENTA_SAL')}")
        print(f"    Documento: {r.get('DOC_SALDO')}-{r.get('NRO_SALDO')}")
        print(f"    Fecha Elab: {r.get('FECELA_SAL')} | Fecha Vcto: {r.get('FECVCT_SAL')}")
        print(f"    Vlr Debito: {deb} | Vlr Credito: {cre} | Saldo: {saldo}")
        print(f"    Vendedor: {r.get('VEND_SALDO')}")
        print(f"    Detalle: {r.get('DET_SALDO')}")
