/**
 * CORE_SharedUtils
 * Contenedor de funciones isomórficas (se ejecutan igual en Servidor y Cliente).
 * Evitar dependencias de APIs nativas de GAS (SpreadsheetApp) o del DOM (window/document).
 */
function SharedUtilsScope() {
  
  // Validación isomórfica de DPI (Guatemala: 13 dígitos)
  this.validarDPI = function(dpi) {
    if (!dpi) return false;
    const cleanDpi = String(dpi).replace(/[^0-9]/g, '');
    return cleanDpi.length === 13;
  };

  // Formateador de fechas isomórfico (Date -> YYYY-MM-DD)
  this.formatFechaISO = function(dateInput) {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };
  
  // Normalización de cadenas de texto (remueve acentos y espacios adicionales)
  this.normalizarTexto = function(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };
}

// Servidor instancia el objeto para su uso directo
const SharedUtils = new SharedUtilsScope();

/**
 * Expone el código fuente de las utilidades compartidas para inyectar en el cliente (HTML).
 * @returns {string} Código JS ejecutable para instanciar SharedUtils en el navegador.
 */
function getSharedUtilsClientCode() {
  return SharedUtilsScope.toString() + 
         "\nconst SharedUtils = new SharedUtilsScope();";
}
