/**
 * CORE_Upload_Controller
 * ============================================================
 * Capa de Adaptador: Controlador genérico para subida de archivos del ERP.
 * Expone un único canal seguro para subir archivos a Google Drive desde cualquier interfaz,
 * promoviendo la reutilización de código (DRY) y eliminando controladores duplicados.
 */

/**
 * Endpoint genérico del ERP para subir archivos a Google Drive de forma segura.
 *
 * @param {string} base64Data  - Datos del archivo codificados en Base64.
 * @param {string} fileName    - Nombre original del archivo (ej: 'logo_erp.png').
 * @param {string} mimeType    - Tipo MIME del archivo (ej: 'image/png').
 * @param {string[]} pathArray - Jerarquía de carpetas destino en Drive (ej: ['CORE', 'Logos']).
 * @param {string} [subFolder] - Opcional. Subcarpeta del registro (ej: 'Empleado_123').
 * @returns {object} Contrato estándar: { ok: true, url: directUrl }
 */
function apiUploadFile(base64Data, fileName, mimeType, pathArray, subFolder) {
  return safeExecute(function() {
    if (!base64Data) throw new Error('Los datos del archivo en Base64 están vacíos.');
    if (!pathArray || !pathArray.length) throw new Error('La ruta destino en Drive no está configurada.');
    
    // Delegar al servicio centralizado de Drive
    var url = DriveService.subirArchivoBase64(base64Data, fileName, mimeType, pathArray, subFolder);
    return { ok: true, url: url };
  }, 'Core.Upload.apiUploadFile');
}
