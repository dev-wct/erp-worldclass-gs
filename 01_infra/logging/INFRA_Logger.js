/**
 * INFRA_Logger
 * ─────────────────────────────────────────────────────────────────────────
 * Capa de Infraestructura: Logger centralizado del ERP WorldClass.
 *
 * PROPÓSITO:
 *  - Reemplaza todos los Logger.log('[Módulo] msg') dispersos por llamadas
 *    estructuradas con nivel, módulo y contexto.
 *  - Anti Vendor Locking: en GAS usa Logger.log nativo. En Vercel/Node.js
 *    solo se cambia la implementación interna del transport.
 *  - Niveles de log: DEBUG < INFO < WARN < ERROR
 *  - El nivel mínimo se controla con la Script Property 'LOG_LEVEL'.
 *
 * EQUIVALENTE SAP:
 *  Application Log (SLG1) — BAL_LOG_CREATE / BAL_LOG_MSG_ADD
 *
 * USO:
 *  Logger_ERP.info('HCM', 'Empleado creado', { id: 'EMP-001' });
 *  Logger_ERP.error('EREC', 'Fallo en contratación', e);
 *  Logger_ERP.warn('EAM', 'Equipo sin serie definida');
 *  Logger_ERP.debug('DataAdapter', 'findAll ejecutado', { table: 'Empleados' });
 *
 * NOTA: Se llama Logger_ERP (no Logger) para no colisionar con el
 * objeto Logger nativo de Google Apps Script.
 * ─────────────────────────────────────────────────────────────────────────
 */
const Logger_ERP = (() => {

  // ── Niveles de log (orden ascendente de severidad) ──────────────────────
  const LEVELS = Object.freeze({
    DEBUG : 0,
    INFO  : 1,
    WARN  : 2,
    ERROR : 3,
    NONE  : 99,
  });

  // ── Nivel mínimo activo ──────────────────────────────────────────────────
  function _getMinLevel() {
    try {
      const prop = PropertiesService.getScriptProperties().getProperty('LOG_LEVEL');
      if (prop && LEVELS[prop.toUpperCase()] !== undefined) {
        return LEVELS[prop.toUpperCase()];
      }
    } catch (e) { /* sin propiedades → usar default */ }
    // En DEBUG_MODE → DEBUG. En producción → INFO.
    try {
      const isDebug = PropertiesService.getScriptProperties().getProperty('DEBUG_MODE') === 'true';
      return isDebug ? LEVELS.DEBUG : LEVELS.INFO;
    } catch (e) {
      return LEVELS.INFO;
    }
  }

  // ── Transport (escribir el mensaje) ──────────────────────────────────────
  /**
   * Transport GAS → Logger.log nativo.
   * En Vercel se reemplaza esta función por console.log / winston / pino.
   * @param {string} formatted — mensaje ya formateado
   */
  function _transport(formatted) {
    Logger.log(formatted);
  }

  // ── Formateador de mensaje ───────────────────────────────────────────────
  /**
   * @param {string} level   — 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
   * @param {string} module  — módulo que origina el log ('HCM', 'EAM', etc.)
   * @param {string} message — mensaje principal
   * @param {any}    [ctx]   — contexto adicional (objeto, Error, string)
   * @returns {string}
   */
  function _format(level, module, message, ctx) {
    const ts      = new Date().toISOString();
    const prefix  = '[' + ts + '] [' + level.padEnd(5) + '] [' + module + ']';
    let   ctxStr  = '';

    if (ctx !== undefined && ctx !== null) {
      if (ctx instanceof Error) {
        ctxStr = ' | Error: ' + ctx.message;
        if (ctx.stack) ctxStr += '\n' + ctx.stack;
      } else if (typeof ctx === 'object') {
        try { ctxStr = ' | ' + JSON.stringify(ctx); } catch (e) { ctxStr = ' | [no serializable]'; }
      } else {
        ctxStr = ' | ' + String(ctx);
      }
    }

    return prefix + ' ' + message + ctxStr;
  }

  // ── Core write ───────────────────────────────────────────────────────────
  function _write(level, levelStr, module, message, ctx) {
    if (level < _getMinLevel()) return; // silenciar por nivel
    _transport(_format(levelStr, module, message, ctx));
  }

  // ── API Pública ──────────────────────────────────────────────────────────
  return {

    /**
     * Log de diagnóstico técnico. Solo visible en modo DEBUG.
     * @param {string} module
     * @param {string} message
     * @param {any}    [ctx]
     */
    debug: function(module, message, ctx) {
      _write(LEVELS.DEBUG, 'DEBUG', module, message, ctx);
    },

    /**
     * Log informativo estándar. Flujo normal del sistema.
     * @param {string} module
     * @param {string} message
     * @param {any}    [ctx]
     */
    info: function(module, message, ctx) {
      _write(LEVELS.INFO, 'INFO', module, message, ctx);
    },

    /**
     * Log de advertencia. Algo inesperado pero no crítico.
     * @param {string} module
     * @param {string} message
     * @param {any}    [ctx]
     */
    warn: function(module, message, ctx) {
      _write(LEVELS.WARN, 'WARN ', module, message, ctx);
    },

    /**
     * Log de error. Fallo que requiere atención.
     * @param {string} module
     * @param {string} message
     * @param {any}    [ctx] — preferiblemente un objeto Error
     */
    error: function(module, message, ctx) {
      _write(LEVELS.ERROR, 'ERROR', module, message, ctx);
    },

    /**
     * Retorna los niveles disponibles (para diagnóstico / UI).
     * @returns {string[]}
     */
    getLevels: function() {
      return Object.keys(LEVELS).filter(function(k) { return k !== 'NONE'; });
    },

    /**
     * Retorna el nivel mínimo activo actualmente.
     * @returns {string}
     */
    getActiveLevel: function() {
      const min = _getMinLevel();
      return Object.keys(LEVELS).find(function(k) { return LEVELS[k] === min; }) || 'INFO';
    },
  };

})();
