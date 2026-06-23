/**
 * CORE_EventCatalog
 * ─────────────────────────────────────────────────────────────────────────
 * Catálogo oficial de todos los eventos del ERP WorldClass.
 *
 * PROPÓSITO:
 *  - Único punto de verdad: si un evento no está aquí, no existe.
 *  - Previene errores de tipeo en nombres de eventos (typos).
 *  - Sirve como documentación viva del sistema.
 *  - Facilita la migración futura (Vercel/Hono solo lee este catálogo).
 *
 * CONVENCIÓN DE NOMBRES:
 *  Formato: PascalCase — Entidad + Verbo en pasado
 *  Ejemplos: LeadCreated, EmployeeHired, EquipmentAssigned
 *
 * MÓDULOS:
 *  SD   — Sales & Distribution (CRM / Call Center)
 *  EREC — E-Recruiting
 *  HCM  — Human Capital Management
 *  EAM  — Enterprise Asset Management
 *  FICO — Finance & Controlling
 *  MDM  — Master Data Management
 * ─────────────────────────────────────────────────────────────────────────
 */
const EventCatalog = (() => {

  /**
   * Mapa de eventos registrados.
   * Cada evento tiene: description, source (módulo dueño), listeners sugeridos.
   * @type {Object.<string, { description: string, owner: string, listeners: string[] }>}
   */
  const EVENTS = Object.freeze({

    // ── SD — Sales & Distribution ─────────────────────────────────────────
    'LeadCreated': {
      description : 'Un nuevo lead fue registrado en el CRM.',
      owner       : 'SD',
      listeners   : ['SD', 'NOTIFY'],
    },
    'LeadStatusChanged': {
      description : 'El estado de un lead cambió (ej: NUEVO → CONTACTADO).',
      owner       : 'SD',
      listeners   : ['SD', 'NOTIFY'],
    },
    'LeadConverted': {
      description : 'Un lead fue marcado como convertido / cliente.',
      owner       : 'SD',
      listeners   : ['EREC', 'NOTIFY'],
    },
    'AppointmentScheduled': {
      description : 'Se agendó una cita con un lead o cliente.',
      owner       : 'SD',
      listeners   : ['NOTIFY'],
    },
    'AppointmentCompleted': {
      description : 'Una cita fue marcada como completada.',
      owner       : 'SD',
      listeners   : ['SD', 'NOTIFY'],
    },
    'CallLogged': {
      description : 'Se registró una llamada en el sistema.',
      owner       : 'SD',
      listeners   : ['SD'],
    },

    // ── EREC — E-Recruiting ───────────────────────────────────────────────
    'CandidateApplied': {
      description : 'Un postulante aplicó a una vacante.',
      owner       : 'EREC',
      listeners   : ['NOTIFY'],
    },
    'CandidateStatusChanged': {
      description : 'El estado de un postulante cambió.',
      owner       : 'EREC',
      listeners   : ['EREC', 'NOTIFY'],
    },
    'CandidateHired': {
      description : 'Un postulante fue contratado formalmente.',
      owner       : 'EREC',
      listeners   : ['HCM', 'FICO', 'EAM', 'NOTIFY'],
    },
    'CandidateRejected': {
      description : 'Un postulante fue rechazado en el proceso.',
      owner       : 'EREC',
      listeners   : ['NOTIFY'],
    },

    // ── HCM — Human Capital Management ───────────────────────────────────
    'EmployeeCreated': {
      description : 'Un nuevo empleado fue registrado en el sistema.',
      owner       : 'HCM',
      listeners   : ['EAM', 'FICO', 'NOTIFY'],
    },
    'EmployeeOnboarded': {
      description : 'El onboarding de un empleado fue completado.',
      owner       : 'HCM',
      listeners   : ['EAM', 'NOTIFY'],
    },
    'EmployeeStatusChanged': {
      description : 'El estado de un empleado cambió (activo, licencia, etc.).',
      owner       : 'HCM',
      listeners   : ['EAM', 'FICO', 'NOTIFY'],
    },
    'EmployeeTerminated': {
      description : 'Un empleado fue dado de baja del sistema.',
      owner       : 'HCM',
      listeners   : ['EAM', 'FICO', 'NOTIFY'],
    },

    // ── EAM — Enterprise Asset Management ────────────────────────────────
    'EquipmentCreated': {
      description : 'Un nuevo equipo fue registrado en el inventario.',
      owner       : 'EAM',
      listeners   : ['NOTIFY'],
    },
    'EquipmentAssigned': {
      description : 'Un equipo fue asignado a un empleado.',
      owner       : 'EAM',
      listeners   : ['HCM', 'FICO', 'NOTIFY'],
    },
    'EquipmentReturned': {
      description : 'Un empleado devolvió un equipo.',
      owner       : 'EAM',
      listeners   : ['HCM', 'FICO', 'NOTIFY'],
    },
    'EquipmentStatusChanged': {
      description : 'El estado de un equipo cambió (activo, reparación, baja).',
      owner       : 'EAM',
      listeners   : ['NOTIFY'],
    },
    'ChipAssigned': {
      description : 'Un chip fue asignado a un empleado.',
      owner       : 'EAM',
      listeners   : ['HCM', 'FICO', 'NOTIFY'],
    },
    'ChipReturned': {
      description : 'Un chip fue devuelto.',
      owner       : 'EAM',
      listeners   : ['HCM', 'FICO', 'NOTIFY'],
    },

    // ── FICO — Finance & Controlling ──────────────────────────────────────
    'PayrollProcessed': {
      description : 'La nómina de un período fue procesada.',
      owner       : 'FICO',
      listeners   : ['HCM', 'NOTIFY'],
    },
    'PaymentRegistered': {
      description : 'Se registró un pago (nómina, costo de chip, etc.).',
      owner       : 'FICO',
      listeners   : ['NOTIFY'],
    },

    // ── MDM — Master Data Management ──────────────────────────────────────
    'CompanyCreated': {
      description : 'Una nueva empresa fue registrada en el sistema.',
      owner       : 'MDM',
      listeners   : ['NOTIFY'],
    },
    'BusinessPartnerCreated': {
      description : 'Un nuevo Business Partner fue registrado.',
      owner       : 'MDM',
      listeners   : ['NOTIFY'],
    },

  });

  // ── API Pública ──────────────────────────────────────────────────────────

  return {

    /**
     * Verifica si un nombre de evento existe en el catálogo.
     * @param {string} eventType
     * @returns {boolean}
     */
    isValid: function(eventType) {
      return Object.prototype.hasOwnProperty.call(EVENTS, eventType);
    },

    /**
     * Retorna la definición de un evento.
     * @param {string} eventType
     * @returns {{ description: string, owner: string, listeners: string[] } | null}
     */
    get: function(eventType) {
      return EVENTS[eventType] || null;
    },

    /**
     * Retorna todos los eventos registrados (para diagnóstico / UI).
     * @returns {string[]}
     */
    listAll: function() {
      return Object.keys(EVENTS);
    },

    /**
     * Retorna eventos filtrados por módulo dueño.
     * @param {string} owner — 'SD', 'HCM', 'EREC', etc.
     * @returns {string[]}
     */
    listByOwner: function(owner) {
      return Object.keys(EVENTS).filter(function(key) {
        return EVENTS[key].owner === owner;
      });
    },

  };

})();
