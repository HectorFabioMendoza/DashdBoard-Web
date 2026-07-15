import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const rootDir = 'd:/4 Hector Fabio/Dashboard Web';
const importDir = path.join(rootDir, 'importar');

const monthNamesInSpanish = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function getExcelSerialFromJSDate(jsDate) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((jsDate.getTime() - excelEpoch.getTime()) / msPerDay);
}

function parseExcelDate(dateVal) {
  if (typeof dateVal === 'number') {
    return dateVal;
  }
  if (dateVal instanceof Date) {
    return getExcelSerialFromJSDate(dateVal);
  }
  if (typeof dateVal === 'string') {
    if (/^\d+$/.test(dateVal)) {
      return parseInt(dateVal);
    }
    const cleaned = dateVal.trim();
    const parts = cleaned.split(/[-/]/);
    if (parts.length === 3) {
      let day = parseInt(parts[0]);
      let monthStr = parts[1].toLowerCase();
      let yearStr = parts[2];
      
      let month = 0;
      if (isNaN(monthStr)) {
        const monthMap = {
          ene: 0, jan: 0,
          feb: 1,
          mar: 2,
          abr: 3, apr: 3,
          may: 4,
          jun: 5,
          jul: 6,
          ago: 7, aug: 7,
          sep: 8, sept: 8, septi: 8,
          oct: 9,
          nov: 10,
          dic: 11, dec: 11
        };
        const prefix = monthStr.substring(0, 3);
        month = monthMap[prefix] !== undefined ? monthMap[prefix] : 0;
      } else {
        month = parseInt(monthStr) - 1;
      }
      
      let year = parseInt(yearStr);
      if (year < 100) {
        year += 2000;
      }
      
      const jsDate = new Date(Date.UTC(year, month, day));
      return getExcelSerialFromJSDate(jsDate);
    }
  }
  return null;
}

function getMonthNameFromSerial(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  const month = date.getUTCMonth();
  return monthNamesInSpanish[month];
}

function cleanString(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function cleanNumber(val) {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

// Obtener valor de fila soportando sinónimos e insensibilidad a mayúsculas/minúsculas
function getField(row, keys) {
  if (!row) return undefined;
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const foundKey = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase());
    if (foundKey !== undefined) {
      return row[foundKey];
    }
  }
  return undefined;
}

function processMaestraFile(importFilePath, dbFileName) {
  console.log(`\nProcesando como MAESTRA DE CLIENTES: ${path.basename(importFilePath)}`);
  
  const importWorkbook = XLSX.readFile(importFilePath);
  const importSheet = importWorkbook.Sheets[importWorkbook.SheetNames[0]];
  const importRows = XLSX.utils.sheet_to_json(importSheet);
  
  const dbFilePath = path.join(rootDir, dbFileName);
  console.log(`Cargando base de datos existente: ${dbFileName}`);
  const dbWorkbook = XLSX.readFile(dbFilePath);
  const dbSheetName = 'Maestra de Clientes';
  const dbSheet = dbWorkbook.Sheets[dbSheetName];
  if (!dbSheet) {
    throw new Error(`No se encontró la hoja "${dbSheetName}" en ${dbFileName}`);
  }
  const dbRows = XLSX.utils.sheet_to_json(dbSheet);
  
  // Crear un Set de claves compuestas para deduplicar
  const makeKey = (docto, vendedor, cod_client) => {
    return `${cleanString(docto).toUpperCase()}_${cleanString(vendedor).toUpperCase()}_${cleanString(cod_client)}`;
  };
  
  const existingKeys = new Set(dbRows.map(r => makeKey(r.docto, r.vendedor, r.cod_client)));
  
  let appendedCount = 0;
  let duplicateCount = 0;
  
  const newRows = [];
  
  importRows.forEach((row, index) => {
    const docto = cleanString(getField(row, ['docto', 'documento', 'docto1']));
    const vendedor = cleanString(getField(row, ['vendedor', 'vended', 'cod_vended']));
    const cod_client = cleanString(getField(row, ['cod_client', 'cliente', 'nit', 'cod_cli']));
    
    if (!docto || !vendedor || !cod_client) {
      return; // saltar filas incompletas
    }
    
    const key = makeKey(docto, vendedor, cod_client);
    if (existingKeys.has(key)) {
      duplicateCount++;
      return;
    }
    
    const rawFecha = getField(row, ['fecha', 'fecha_doc', 'fech']);
    const serialFecha = parseExcelDate(rawFecha);
    if (!serialFecha) {
      console.warn(`[Maestra] Fila ${index + 2}: Fecha inválida "${rawFecha}". Saltando.`);
      return;
    }
    
    const mes = getMonthNameFromSerial(serialFecha);
    const tipo = docto.substring(0, 2).toUpperCase();
    const total1 = cleanNumber(getField(row, ['total1', 'total', 'valor', 'neto']));
    const nombre_cli = cleanString(getField(row, ['nombre_cli', 'nombre', 'cliente']) || getField(row, ['benf1'])?.replace(new RegExp(cod_client + '$'), '').replace(/,?\s+\d+$/, '').trim());
    
    const mappedRow = {
      docto,
      fecha: serialFecha,
      Mes: mes,
      benf1: cleanString(getField(row, ['benf1']) || `${nombre_cli} ${cod_client}`),
      total1,
      vendedor,
      cod_client,
      nombre_cli,
      Tipo: tipo
    };
    
    newRows.push(mappedRow);
    existingKeys.add(key);
    appendedCount++;
  });
  
  if (appendedCount > 0) {
    const combinedRows = [...dbRows, ...newRows];
    
    // Escribir en base de datos de origen (Raíz)
    const newSheet = XLSX.utils.json_to_sheet(combinedRows);
    dbWorkbook.Sheets[dbSheetName] = newSheet;
    XLSX.writeFile(dbWorkbook, dbFilePath);
    console.log(`Guardado en raíz: ${dbFilePath}`);
    
    // Escribir en carpeta public/
    const publicFilePath = path.join(rootDir, 'public', dbFileName);
    XLSX.writeFile(dbWorkbook, publicFilePath);
    console.log(`Guardado en public: ${publicFilePath}`);
  }
  
  console.log(`RESULTADO: Se agregaron ${appendedCount} registros nuevos. Se omitieron ${duplicateCount} duplicados.`);
  return appendedCount;
}

function processVentasLineaFile(importFilePath, dbFileName) {
  console.log(`\nProcesando como VENTAS POR LÍNEA: ${path.basename(importFilePath)}`);
  
  const importWorkbook = XLSX.readFile(importFilePath);
  const importSheet = importWorkbook.Sheets[importWorkbook.SheetNames[0]];
  const importRows = XLSX.utils.sheet_to_json(importSheet);
  
  const dbFilePath = path.join(rootDir, dbFileName);
  console.log(`Cargando base de datos existente: ${dbFileName}`);
  const dbWorkbook = XLSX.readFile(dbFilePath);
  const dbSheetName = 'IN38C_1_VtasxVendedor_LINEA_Doc';
  const dbSheet = dbWorkbook.Sheets[dbSheetName];
  if (!dbSheet) {
    throw new Error(`No se encontró la hoja "${dbSheetName}" en ${dbFileName}`);
  }
  const dbRows = XLSX.utils.sheet_to_json(dbSheet);
  
  // Clave compuesta para Ventas por línea: docto + ref + cod_benf
  const makeKey = (docto, ref, cod_benf) => {
    return `${cleanString(docto).toUpperCase()}_${cleanString(ref).toUpperCase()}_${cleanString(cod_benf)}`;
  };
  
  const existingKeys = new Set(dbRows.map(r => makeKey(r.docto, r.ref, r.cod_benf)));
  
  let appendedCount = 0;
  let duplicateCount = 0;
  
  const newRows = [];
  
  importRows.forEach((row, index) => {
    const docto = cleanString(getField(row, ['docto', 'documento', 'docto1']));
    const ref = cleanString(getField(row, ['ref', 'referencia', 'codigo', 'ref1']));
    const cod_benf = cleanString(getField(row, ['cod_benf', 'cliente', 'nit', 'cod_cli']));
    
    if (!docto || !ref) {
      return; // saltar filas incompletas
    }
    
    const key = makeKey(docto, ref, cod_benf);
    if (existingKeys.has(key)) {
      duplicateCount++;
      return;
    }
    
    const rawFecha = getField(row, ['fecha', 'fecha_doc', 'fech']);
    const serialFecha = parseExcelDate(rawFecha);
    if (!serialFecha) {
      console.warn(`[Líneas] Fila ${index + 2}: Fecha inválida "${rawFecha}". Saltando.`);
      return;
    }
    
    const mappedRow = {
      vendedor: cleanString(getField(row, ['vendedor', 'vend', 'cod_vended'])),
      code01: cleanString(getField(row, ['code01', 'linea', 'linea1'])),
      docto,
      fecha: serialFecha,
      ref,
      articulo: cleanString(getField(row, ['articulo', 'descripcion', 'nombre', 'art'])),
      cant: cleanNumber(getField(row, ['cant', 'cantidad', 'unidades'])),
      cliente: cleanString(getField(row, ['cliente', 'nombre_cli', 'benf1'])),
      valor: cleanNumber(getField(row, ['valor', 'precio', 'neto'])),
      iva: cleanNumber(getField(row, ['iva'])),
      total1: cleanNumber(getField(row, ['total1', 'total', 'valor_total'])),
      detalle: cleanString(getField(row, ['detalle', 'observacion', 'concepto'])),
      observa: cleanString(getField(row, ['observa', 'observacion'])),
      remision: cleanString(getField(row, ['remision']) || '   -'),
      q_adi: cleanNumber(getField(row, ['q_adi']) || getField(row, ['cant', 'cantidad'])),
      n_adi: cleanString(getField(row, ['n_adi'])),
      uni_factor: cleanNumber(getField(row, ['uni_factor']) || 1),
      cod_benf,
      emp: cleanString(getField(row, ['emp']) || '0202')
    };
    
    newRows.push(mappedRow);
    existingKeys.add(key);
    appendedCount++;
  });
  
  if (appendedCount > 0) {
    const combinedRows = [...dbRows, ...newRows];
    
    // Escribir en base de datos de origen (Raíz)
    const newSheet = XLSX.utils.json_to_sheet(combinedRows);
    dbWorkbook.Sheets[dbSheetName] = newSheet;
    XLSX.writeFile(dbWorkbook, dbFilePath);
    console.log(`Guardado en raíz: ${dbFilePath}`);
    
    // Escribir en carpeta public/
    const publicFilePath = path.join(rootDir, 'public', dbFileName);
    XLSX.writeFile(dbWorkbook, publicFilePath);
    console.log(`Guardado en public: ${publicFilePath}`);
  }
  
  console.log(`RESULTADO: Se agregaron ${appendedCount} registros nuevos. Se omitieron ${duplicateCount} duplicados.`);
  return appendedCount;
}

function syncWithDist() {
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    console.log('\nSincronizando archivos de base de datos con la carpeta de producción (dist)...');
    const dbFiles = ['1Maestra de clientes2026.xlsx', 'Ventas por linea.xlsx'];
    for (const dbFile of dbFiles) {
      const publicPath = path.join(rootDir, 'public', dbFile);
      const distPath = path.join(distDir, dbFile);
      if (fs.existsSync(publicPath)) {
        try {
          fs.copyFileSync(publicPath, distPath);
          console.log(`Sincronizado: ${dbFile} -> dist/${dbFile}`);
        } catch (e) {
          console.warn(`No se pudo copiar ${dbFile} a dist:`, e.message);
        }
      }
    }
  }
}

try {
  if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir);
    console.log(`Carpeta "importar" creada en: ${importDir}`);
  }
  
  // Sincronizar al inicio por si hay cambios pendientes
  syncWithDist();
  
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
  if (files.length === 0) {
    console.log('No se encontraron archivos de Excel para importar en la carpeta "importar".');
    process.exit(0);
  }
  
  for (const file of files) {
    const filePath = path.join(importDir, file);
    const workbook = XLSX.readFile(filePath);
    
    // Analizar la primera hoja para saber a qué reporte corresponde
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    if (rows.length === 0) {
      console.log(`El archivo ${file} está vacío. Saltando.`);
      continue;
    }
    
    const columns = Object.keys(rows[0]);
    const lowerColumns = columns.map(c => c.toLowerCase().trim());
    
    // Reglas de detección flexibles
    const isMaestra = lowerColumns.includes('benf1') || 
                      lowerColumns.includes('cod_client') || 
                      lowerColumns.includes('cliente') || 
                      sheetName === 'IN3_Docs';
                      
    const isVentas = lowerColumns.includes('code01') || 
                     lowerColumns.includes('ref') || 
                     lowerColumns.includes('referencia') || 
                     sheetName === 'IN38C_1_VtasxVendedor_LINEA_Doc';
    
    if (isMaestra) {
      processMaestraFile(filePath, '1Maestra de clientes2026.xlsx');
    } else if (isVentas) {
      processVentasLineaFile(filePath, 'Ventas por linea.xlsx');
    } else {
      console.log(`No se pudo identificar el tipo de reporte para el archivo: ${file}. Columnas:`, columns);
      continue;
    }
    
    // Renombrar archivo importado para no procesarlo de nuevo
    const parsedPath = path.join(importDir, `${file}.procesado`);
    if (fs.existsSync(parsedPath)) {
      fs.unlinkSync(parsedPath);
    }
    fs.renameSync(filePath, parsedPath);
    console.log(`Archivo movido/marcado como procesado: ${path.basename(parsedPath)}`);
  }
  
  // Sincronizar al final para reflejar las nuevas importaciones
  syncWithDist();
  
  console.log('\n--- PROCESO FINALIZADO CON ÉXITO ---');
} catch (err) {
  console.error('\nERROR DURANTE EL PROCESO DE IMPORTACIÓN:', err);
  process.exit(1);
}
