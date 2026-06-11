/**
 * CORE_Customizing
 * ─────────────────────────────────────────────────────────────────────────
 * Servicio de configuración regional por cliente — equivalente al IMG
 * (Implementation Guide) de SAP Basis.
 *
 * PRINCIPIO:
 *  Los términos culturales/regionales NO viven en el código.
 *  Viven en la tabla CAT_Paises del MDM.
 *  Este servicio es el único punto de acceso a esa configuración.
 *
 * USO:
 *  // Obtener el label del documento de identidad para la empresa 1
 *  var label = Customizing.getLabelDocumento(1);  // → "DPI"
 *
 *  // Obtener toda la configuración regional de una empresa
 *  var ctx = Customizing.getContextoEmpresa(1);
 *  ctx.label_documento  // "DPI"
 *  ctx.moneda_simbolo   // "Q"
 *  ctx.moneda_codigo    // "GTQ"
 *  ctx.formato_fecha    // "DD/MM/YYYY"
 *  ctx.codigo_iso       // "GT"
 *
 * FALLBACK:
 *  Si no se puede resolver (empresa sin país, tabla vacía, error),
 *  retorna valores neutros que funcionan en cualquier contexto.
 * ─────────────────────────────────────────────────────────────────────────
 */
const Customizing = (function() {

  // Cache en memoria para no leer Drive en cada llamada dentro de la misma ejecución
  var _cache = {};

  var FALLBACK = {
    label_documento: 'Documento de Identidad',
    moneda_codigo:   'USD',
    moneda_simbolo:  '$',
    formato_fecha:   'DD/MM/YYYY',
    codigo_iso:      'XX',
    nombre_pais:     'Internacional',
  };

  /**
   * Obtiene el contexto regional completo para una empresa.
   * @param {number|string} idEmpresa
   * @returns {object} contexto regional con fallbacks
   */
  function getContextoEmpresa(idEmpresa) {
    if (!idEmpresa) return FALLBACK;

    var key = String(idEmpresa);
    if (_cache[key]) return _cache[key];

    try {
      var empresa = DataAdapter.findById('CAT_Empresas', idEmpresa);
      if (!empresa || !empresa.id_pais) return FALLBACK;

      var pais = DataAdapter.findById('CAT_Paises', empresa.id_pais);
      if (!pais) return FALLBACK;

      var ctx = {
        label_documento: pais.label_documento  || FALLBACK.label_documento,
        moneda_codigo:   pais.moneda_codigo    || FALLBACK.moneda_codigo,
        moneda_simbolo:  pais.moneda_simbolo   || FALLBACK.moneda_simbolo,
        formato_fecha:   pais.formato_fecha    || FALLBACK.formato_fecha,
        codigo_iso:      pais.codigo_iso       || FALLBACK.codigo_iso,
        nombre_pais:     pais.nombre           || FALLBACK.nombre_pais,
      };

      _cache[key] = ctx;
      return ctx;

    } catch(e) {
      Logger.log('[Customizing] Error resolviendo contexto para empresa ' + idEmpresa + ': ' + e.message);
      return FALLBACK;
    }
  }

  /**
   * Shortcut: solo el label del documento de identidad.
   * @param {number|string} idEmpresa
   * @returns {string} Ej: "DPI", "DUI", "Cédula de Ciudadanía"
   */
  function getLabelDocumento(idEmpresa) {
    return getContextoEmpresa(idEmpresa).label_documento;
  }

  /**
   * Shortcut: símbolo de moneda para formatear números.
   * @param {number|string} idEmpresa
   * @returns {string} Ej: "Q", "$", "€"
   */
  function getSimboloMoneda(idEmpresa) {
    return getContextoEmpresa(idEmpresa).moneda_simbolo;
  }

  /**
   * Limpia el cache. Útil después de modificar datos de países/empresas.
   */
  function clearCache() {
    _cache = {};
  }

  /**
   * Retorna la configuración de fallback (neutro/internacional).
   * Útil cuando no se conoce la empresa del candidato (formulario público abierto).
   */
  function getFallback() {
    return Object.assign({}, FALLBACK);
  }

  return {
    getContextoEmpresa: getContextoEmpresa,
    getLabelDocumento:  getLabelDocumento,
    getSimboloMoneda:   getSimboloMoneda,
    clearCache:         clearCache,
    getFallback:        getFallback,
  };

})();
