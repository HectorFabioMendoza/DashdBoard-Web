// Intentar cargar la librería localmente; si falla (por ejemplo, si no se copió al directorio raíz),
// se hace un fallback automático al CDN oficial de SheetJS para evitar que se caiga la carga.
try {
  importScripts('/xlsx.full.min.js');
} catch (e) {
  try {
    importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
  } catch (cdnError) {
    console.error('No se pudo cargar la librería de Excel localmente ni vía CDN:', cdnError);
  }
}

self.onmessage = async function(e) {
  const { url, sheetName } = e.data;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("No se pudo descargar el archivo " + url);
    }
    const arrayBuffer = await response.arrayBuffer();
    
    if (typeof XLSX === 'undefined') {
      throw new Error("La librería de procesamiento de Excel (XLSX) no está cargada en el Worker.");
    }
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error("No se encontró la hoja " + sheetName);
    }
    const rows = XLSX.utils.sheet_to_json(sheet);
    self.postMessage({ success: true, rows: rows });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
