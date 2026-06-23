/**
 * CORE_EventRegistry
 * ─────────────────────────────────────────────────────────────────────────
 * Registro central de handlers de eventos del ERP WorldClass.
 *
 * PROPÓSITO:
 *  - Único punto de configuración: aquí se declara quién escucha qué.
 *  - Los módulos NO se registran a sí mismos. Solo este archivo lo hace.
 *  - Desacoplado: un módulo no sabe que otros módulos existen.
 *
 * PATRÓN:
 *  EventRegistry.on('CandidateHired', HCM_onCandidateHired)
 *  EventRegistry.on('CandidateHired', FICO_onCandidateHired)
 *
 * CONVENCIÓN DE HANDLERS:
 *  - Nombre: {MODULO}_on{EventType}  (ej: HCM_onCandidateHired)
 *  - Los handlers viven en cada módulo: MODULO_EventHandlers.js
 *  - Firma: function(context) { ... }  donde context es el EventContext
 *
 * ORDEN DE CARGA EN GAS:
 *  Este archivo DEBE cargarse DESPUÉS de todos los handlers individuales.
 *  El nombre empieza con CORE_ (no ZZ_) para mantener claridad semántica,
 *  pero clasp lo carga en orden alfabético. Los handlers de módulo usan
 *  nombre HH_, SD_, etc. que cargan ANTES que este archivo.
 *
 *  Si un handler no está definido aún, se registra como null y se ignora.
 * ─────────────────────────────────────────────────────────────────────────
 */
const EventRegistry = (() => {

  /**
   * Mapa interno: eventType → [ handler, handler, ... ]
   * @type {Object.<string, Function[]>}
   */
  const _registry = {};

  // ── Helpers privados ────────────────────────────────────────────────────

  /**
   * Registra un handler de forma segura.
   * Si el handler es null/undefined (módulo no implementado aún), lo ignora.
   * @param {string}   eventType
   * @param {Function} handler
   */
  function _register(eventType, handler) {
    if (typeof handler !== 'function') {
      Logger.log('[EventRegistry] Handler ignorado para "' + eventType + '": no es una función. ¿El módulo está implementado?');
      return;
    }
    if (!_registry[eventType]) {
      _registry[eventType] = [];
    }
    _registry[eventType].push(handler);
  }

  // ── Inicialización del registro ─────────────────────────────────────────
  // Único lugar donde se declaran TODOS los listeners del sistema.
  // Agregar una línea aquí = conectar dos módulos. Sin tocar ninguno de los dos.

  function _init() {

    // ─── CandidateHired ────────────────────────────────────────────────
    // Cuando EREC contrata → HCM crea empleado, FICO abre nómina, EAM pre-asigna, se notifica
    _register('CandidateHired', typeof HCM_onCandidateHired  !== 'undefined' ? HCM_onCandidateHired  : null);
    _register('CandidateHired', typeof FICO_onCandidateHired !== 'undefined' ? FICO_onCandidateHired : null);
    _register('CandidateHired', typeof NOTIFY_onCandidateHired !== 'undefined' ? NOTIFY_onCandidateHired : null);

    // ─── CandidateApplied ──────────────────────────────────────────────
    _register('CandidateApplied', typeof NOTIFY_onCandidateApplied !== 'undefined' ? NOTIFY_onCandidateApplied : null);

    // ─── CandidateRejected ─────────────────────────────────────────────
    _register('CandidateRejected', typeof NOTIFY_onCandidateRejected !== 'undefined' ? NOTIFY_onCandidateRejected : null);

    // ─── CandidateStatusChanged ────────────────────────────────────────
    _register('CandidateStatusChanged', typeof NOTIFY_onCandidateStatusChanged !== 'undefined' ? NOTIFY_onCandidateStatusChanged : null);

    // ─── EmployeeCreated ───────────────────────────────────────────────
    _register('EmployeeCreated', typeof EAM_onEmployeeCreated  !== 'undefined' ? EAM_onEmployeeCreated  : null);
    _register('EmployeeCreated', typeof NOTIFY_onEmployeeCreated !== 'undefined' ? NOTIFY_onEmployeeCreated : null);

    // ─── EmployeeOnboarded ─────────────────────────────────────────────
    _register('EmployeeOnboarded', typeof EAM_onEmployeeOnboarded   !== 'undefined' ? EAM_onEmployeeOnboarded   : null);
    _register('EmployeeOnboarded', typeof NOTIFY_onEmployeeOnboarded !== 'undefined' ? NOTIFY_onEmployeeOnboarded : null);

    // ─── EmployeeTerminated ────────────────────────────────────────────
    _register('EmployeeTerminated', typeof EAM_onEmployeeTerminated   !== 'undefined' ? EAM_onEmployeeTerminated   : null);
    _register('EmployeeTerminated', typeof FICO_onEmployeeTerminated  !== 'undefined' ? FICO_onEmployeeTerminated  : null);
    _register('EmployeeTerminated', typeof NOTIFY_onEmployeeTerminated !== 'undefined' ? NOTIFY_onEmployeeTerminated : null);

    // ─── EquipmentAssigned ─────────────────────────────────────────────
    _register('EquipmentAssigned', typeof HCM_onEquipmentAssigned   !== 'undefined' ? HCM_onEquipmentAssigned   : null);
    _register('EquipmentAssigned', typeof FICO_onEquipmentAssigned  !== 'undefined' ? FICO_onEquipmentAssigned  : null);
    _register('EquipmentAssigned', typeof NOTIFY_onEquipmentAssigned !== 'undefined' ? NOTIFY_onEquipmentAssigned : null);

    // ─── EquipmentReturned ─────────────────────────────────────────────
    _register('EquipmentReturned', typeof NOTIFY_onEquipmentReturned !== 'undefined' ? NOTIFY_onEquipmentReturned : null);

    // ─── ChipAssigned ─────────────────────────────────────────────────
    _register('ChipAssigned', typeof FICO_onChipAssigned   !== 'undefined' ? FICO_onChipAssigned   : null);
    _register('ChipAssigned', typeof NOTIFY_onChipAssigned !== 'undefined' ? NOTIFY_onChipAssigned : null);

    // ─── ChipReturned ─────────────────────────────────────────────────
    _register('ChipReturned', typeof NOTIFY_onChipReturned !== 'undefined' ? NOTIFY_onChipReturned : null);

    // ─── LeadCreated ───────────────────────────────────────────────────
    _register('LeadCreated', typeof NOTIFY_onLeadCreated !== 'undefined' ? NOTIFY_onLeadCreated : null);

    // ─── LeadConverted ─────────────────────────────────────────────────
    _register('LeadConverted', typeof NOTIFY_onLeadConverted !== 'undefined' ? NOTIFY_onLeadConverted : null);

    // ─── AppointmentScheduled ──────────────────────────────────────────
    _register('AppointmentScheduled', typeof NOTIFY_onAppointmentScheduled !== 'undefined' ? NOTIFY_onAppointmentScheduled : null);

    // ─── PayrollProcessed ──────────────────────────────────────────────
    _register('PayrollProcessed', typeof HCM_onPayrollProcessed    !== 'undefined' ? HCM_onPayrollProcessed    : null);
    _register('PayrollProcessed', typeof NOTIFY_onPayrollProcessed !== 'undefined' ? NOTIFY_onPayrollProcessed : null);

    // ─── Workflow Events ───────────────────────────────────────────────
    _register('Workflow_EAM_ASIGNACION_Aprobado', typeof EAM_onAsignacionAprobada !== 'undefined' ? EAM_onAsignacionAprobada : null);
    _register('Workflow_EAM_ASIGNACION_Rechazado', typeof EAM_onAsignacionRechazada !== 'undefined' ? EAM_onAsignacionRechazada : null);

    Logger.log('[EventRegistry] Inicializado. Eventos registrados: ' + Object.keys(_registry).length);
  }

  // Ejecutar inicialización al cargar el archivo
  _init();

  // ── API Pública ──────────────────────────────────────────────────────────

  return {

    /**
     * Retorna los handlers registrados para un tipo de evento.
     * @param {string} eventType
     * @returns {Function[]}
     */
    getHandlers: function(eventType) {
      return _registry[eventType] || [];
    },

    /**
     * Retorna un resumen del registro (para diagnóstico).
     * @returns {Object.<string, number>} — { eventType: handlerCount }
     */
    getSummary: function() {
      const summary = {};
      Object.keys(_registry).forEach(function(key) {
        summary[key] = _registry[key].length;
      });
      return summary;
    },

    /**
     * Lista todos los eventos que tienen al menos un handler registrado.
     * @returns {string[]}
     */
    getActiveEvents: function() {
      return Object.keys(_registry).filter(function(key) {
        return _registry[key].length > 0;
      });
    },

  };

})();
