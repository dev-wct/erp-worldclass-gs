/**
 * INFRA_MockFileProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Proveedor simulado para almacenamiento de archivos (entorno de pruebas / mock).
 * Implementa la interfaz de almacenamiento para testeo local sin llamadas a Drive.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockFileProvider = {
  getName: function() { return 'MOCK'; },

  /**
   * Simula la subida de un archivo en Base64.
   */
  uploadFileBase64: function(base64Data, fileName, mimeType, pathArray, subFolder) {
    const pathStr = (pathArray || []).join('/') + (subFolder ? '/' + subFolder : '');
    const simulatedUrl = 'https://storage-simulado.com/' + pathStr + '/' + fileName;
    Logger_ERP.info('INFRA', 'MOCK: Subiendo archivo Base64 simulado -> ' + simulatedUrl);
    return simulatedUrl;
  },

  /**
   * Simula la subida de un blob de archivo.
   */
  uploadFileBlob: function(fileBlob, fileName, folderName) {
    const simulatedUrl = 'https://storage-simulado.com/' + folderName + '/' + (fileName || 'archivo');
    Logger_ERP.info('INFRA', 'MOCK: Subiendo blob simulado -> ' + simulatedUrl);
    return simulatedUrl;
  },

  /**
   * Simula la normalización de la URL.
   */
  normalizeUrl: function(url) {
    return url || '';
  },

  /**
   * Simula la conversión de un archivo a Base64.
   */
  getFileBase64: function(url) {
    // Retorna una imagen transparente de 1x1 en Base64
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
};
