/**
 * CORE_EventBus
 * ─────────────────────────────────────────────────────────────────────────
 * Capa de Infraestructura: Despachador central de eventos del ERP.
 *
 * PRINCIPIOS:
 *  - Cero acoplamiento: los módulos solo publican o escuchan. Nunca se llaman.
 *  - Anti Vendor Locking: el bus no sabe nada de Gmail, WhatsApp, Sheets, etc.
 *  - Single Responsibility: solo despacha. No notifica, no loguea, no valida.
 *  - Los handlers se registran en CORE_EventRegistry (único punto de verdad).
 *
 * CICLO DE VIDA DE UN EVENTO:
 *  1. Módulo llama → EventBus.publish('NombreEvento', payload)
 *  2. EventBus consulta EventRegistry → obtiene lista de handlers
 *  3. EventBus ejecuta cada handler con el EventContext
 *  4. EventBus delega registro a EventLogger
 *
 * CONTEXTO DE EVENTO (EventContext):
 *  {
 *    eventId   : string  — UUID único del evento
 *    eventType : string  — nombre del evento ('CandidateHired', etc.)
 *    timestamp : string  — ISO 8601
 *    source    : string  — módulo que publicó ('HCM', 'EREC', etc.)
 *    payload   : object  — datos del evento (libre)
 *    meta      : object  — metadata adicional (userId, sessionId, etc.)
 *  }
 * ─────────────────────────────────────────────────────────────────────────
 */
const EventBus = (() => {

  // ── Helpers privados ────────────────────────────────────────────────────

  /**
   * Genera un ID único para el evento.
   * No usa crypto (no disponible en GAS), usa timestamp + random.
   * @returns {string}
   */
  function _generateEventId() {
    return 'EVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Construye el EventContext estandarizado.
   * @param {string} eventType
   * @param {object} payload
   * @param {object} options
   * @returns {object}
   */
  function _buildContext(eventType, payload, options) {
    return Object.freeze({
      eventId   : _generateEventId(),
      eventType : eventType,
      timestamp : new Date().toISOString(),
      source    : (options && options.source) ? options.source : 'UNKNOWN',
      payload   : payload   || {},
      meta      : (options && options.meta) ? options.meta : {},
    });
  }

  /**
   * Ejecuta un handler de forma segura (try/catch individual).
   * Un handler que falla NO detiene la cadena de handlers.
   * @param {Function} handler
   * @param {object}   context
   * @returns {{ success: boolean, error: string|null }}
   */
  function _safeExecute(handler, context) {
    try {
      handler(context);
      return { success: true, error: null };
    } catch (e) {
      const msg = '[EventBus] Handler falló para "' + context.eventType + '": ' + e.message;
      Logger.log(msg);
      return { success: false, error: e.message };
    }
  }

  // ── API Pública ──────────────────────────────────────────────────────────

  return {

    /**
     * Publica un evento. Ejecuta todos los handlers registrados.
     *
     * @param {string} eventType — nombre del evento (debe existir en EventCatalog)
     * @param {object} payload   — datos del evento
     * @param {object} [options] — { source: 'MODULO', meta: {} }
     * @returns {{ eventId: string, handlersRun: number, errors: string[] }}
     *
     * @example
     *   EventBus.publish('CandidateHired', { id_bp: 'BP-001', cargo: 'Asesor' }, { source: 'EREC' });
     */
    publish: function(eventType, payload, options) {
      // 1. Validar que el evento existe en el catálogo
      if (!EventCatalog.isValid(eventType)) {
        const msg = '[EventBus] Evento desconocido: "' + eventType + '". Agrégalo a CORE_EventCatalog.js';
        Logger.log(msg);
        throw new Error(msg);
      }

      // 2. Construir contexto inmutable
      const context = _buildContext(eventType, payload, options);
      Logger.log('[EventBus] Publicando: ' + eventType + ' | ID: ' + context.eventId);

      // 3. Obtener handlers del Registry
      const handlers = EventRegistry.getHandlers(eventType);
      const errors   = [];

      // 4. Ejecutar cada handler de forma aislada
      handlers.forEach(function(handler) {
        const result = _safeExecute(handler, context);
        if (!result.success) errors.push(result.error);
      });

      // 5. Loguear en Sheet (siempre, incluso si hubo errores parciales)
      try {
        EventLogger.log(context, handlers.length, errors);
      } catch (logErr) {
        Logger.log('[EventBus] No se pudo loguear el evento: ' + logErr.message);
      }

      Logger.log('[EventBus] Completado: ' + eventType + ' | Handlers: ' + handlers.length + ' | Errores: ' + errors.length);

      return {
        eventId     : context.eventId,
        handlersRun : handlers.length,
        errors      : errors,
      };
    },

    /**
     * Publica un evento sin lanzar excepción si el tipo no existe en catálogo.
     * Útil para eventos opcionales / de diagnóstico.
     * @param {string} eventType
     * @param {object} payload
     * @param {object} [options]
     */
    publishSafe: function(eventType, payload, options) {
      try {
        return EventBus.publish(eventType, payload, options);
      } catch (e) {
        Logger.log('[EventBus.publishSafe] Ignorando error: ' + e.message);
        return { eventId: null, handlersRun: 0, errors: [e.message] };
      }
    },

  };

})();
