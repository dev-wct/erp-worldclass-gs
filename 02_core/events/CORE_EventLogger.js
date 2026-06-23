/**
 * CORE_EventLogger
 * ─────────────────────────────────────────────────────────────────────────
 * Persiste cada evento despachado en la hoja 'LOG_Eventos'.
 *
 * PROPÓSITO:
 *  - Auditoría completa: qué pasó, cuándo, quién lo disparó, con qué datos.
 *  - Diagnóstico: detectar handlers fallidos, eventos frecuentes, etc.
 *  - Anti Vendor Locking: la firma del método log() es portable.
 *    En Vercel/Supabase, solo se cambia la implementación interna.
 *
 * ESTRUCTURA DE LA HOJA 'LOG_Eventos':
 *  | eventId | timestamp | eventType | source | payload | handlersRun | errores | estado |
 *
 * POLÍTICA DE ERRORES:
 *  El logger nunca lanza excepciones. Si falla, solo loguea en Logger.log.
 *  Un error de logging jamás debe interrumpir el flujo de negocio.
 * ─────────────────────────────────────────────────────────────────────────
 */
const EventLogger = (() => {

  /** Nombre de la hoja de log en Google Sheets */
  const SHEET_NAME = 'LOG_Eventos';

  /** Cabeceras de la tabla de log */
  const HEADERS = [
    'event_id',
    'timestamp',
    'event_type',
    'source',
    'payload_json',
    'handlers_run',
    'errores',
    'estado',
  ];

  // ── Helpers privados ────────────────────────────────────────────────────

  /**
   * Obtiene o crea la hoja de log.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  function _getOrCreateSheet() {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Cabeceras
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      // Formato de cabecera
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setBackground('#1a73e8')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      // Ancho de columnas
      sheet.setColumnWidth(1, 200);  // event_id
      sheet.setColumnWidth(2, 180);  // timestamp
      sheet.setColumnWidth(3, 180);  // event_type
      sheet.setColumnWidth(4, 80);   // source
      sheet.setColumnWidth(5, 400);  // payload_json
      sheet.setColumnWidth(6, 100);  // handlers_run
      sheet.setColumnWidth(7, 200);  // errores
      sheet.setColumnWidth(8, 80);   // estado
      // Congelar cabecera
      sheet.setFrozenRows(1);
      Logger.log('[EventLogger] Hoja "' + SHEET_NAME + '" creada.');
    }

    return sheet;
  }

  /**
   * Serializa un objeto a JSON de forma segura.
   * @param {any} obj
   * @returns {string}
   */
  function _toJson(obj) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return '{"_error": "No serializable"}';
    }
  }

  // ── API Pública ──────────────────────────────────────────────────────────

  return {

    /**
     * Registra un evento en la hoja de log.
     * Nunca lanza excepción — falla silenciosamente con Logger.log.
     *
     * @param {object}   context      — EventContext del EventBus
     * @param {number}   handlersRun  — cantidad de handlers ejecutados
     * @param {string[]} errors       — lista de errores de handlers
     */
    log: function(context, handlersRun, errors) {
      try {
        const sheet  = _getOrCreateSheet();
        const estado = (errors && errors.length > 0) ? 'PARCIAL' : 'OK';
        const row    = [
          context.eventId,
          context.timestamp,
          context.eventType,
          context.source,
          _toJson(context.payload),
          handlersRun,
          (errors && errors.length > 0) ? errors.join(' | ') : '',
          estado,
        ];
        sheet.appendRow(row);
      } catch (e) {
        Logger.log('[EventLogger] No se pudo escribir el log: ' + e.message);
      }
    },

    /**
     * Retorna los últimos N eventos logueados (para diagnóstico en UI).
     * @param {number} [limit=50]
     * @returns {object[]}
     */
    getRecent: function(limit) {
      try {
        const n     = limit || 50;
        const sheet = _getOrCreateSheet();
        const last  = sheet.getLastRow();
        if (last <= 1) return [];

        const startRow = Math.max(2, last - n + 1);
        const numRows  = last - startRow + 1;
        const data     = sheet.getRange(startRow, 1, numRows, HEADERS.length).getValues();

        return data.map(function(row) {
          const obj = {};
          HEADERS.forEach(function(h, i) { obj[h] = row[i]; });
          return obj;
        }).reverse(); // más reciente primero
      } catch (e) {
        Logger.log('[EventLogger] No se pudieron obtener eventos recientes: ' + e.message);
        return [];
      }
    },

    /**
     * Retorna el nombre de la hoja de log (para referencias externas).
     * @returns {string}
     */
    getSheetName: function() {
      return SHEET_NAME;
    },

  };

})();
