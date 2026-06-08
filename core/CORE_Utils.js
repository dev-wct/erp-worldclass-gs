const Utils = {
  generarCodigo: (prefix, id) => prefix + '-' + String(id).padStart(4, '0'),
  esEmailValido: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
  diasEntre:     (d1, d2) => Math.ceil((d2 - d1) / 86400000),

  stamp: function(user) {
    const now = new Date();
    return { created_at: now, updated_at: now, created_by: user };
  },
};

/**
 * Función global auxiliar requerida por las plantillas HTML (HtmlService)
 * para inyectar recursos (como hojas de estilo CSS o scripts compartidos) dinámicamente.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
