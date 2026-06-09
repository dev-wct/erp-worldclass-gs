/**
 * INFRA_ErrorHandler
 * ============================================================
 * Capa de Infraestructura: Manejador Universal de Errores del ERP.
 *
 * Propósito:
 *  - Clasificar y procesar TODOS los errores del sistema de forma centralizada.
 *  - Garantizar que el cliente (AppSheet / formulario) SIEMPRE reciba una
 *    respuesta con estructura uniforme, independientemente del origen del error.
 *  - Separar los errores de negocio (mostrables al usuario) de los errores
 *    técnicos (que deben loguearse internamente y ocultarse al usuario).
 *  - Eliminar bloques try/catch dispersos en cada controlador.
 *
 * Estructura de respuesta garantizada (equivalente a SY-SUBRC en SAP ABAP):
 *  {
 *    ok:    false,
 *    error: {
 *      tipo:     'VALIDATION' | 'BUSINESS' | 'INFRASTRUCTURE' | 'FATAL',
 *      codigo:   'ERR_XXX',
 *      mensaje:  'Texto legible para el usuario final.',
 *      detalles: ['Detalle 1', 'Detalle 2']   // Solo en errores de validación
 *    }
 *  }
 *
 * Paradigmas aplicados:
 *  - POO   : Jerarquía de clases de error (AppError → ValidationError / BusinessError / etc.)
 *  - LISP  : safeExecute() como función de orden superior (Higher-Order Function)
 *            que envuelve cualquier acción y captura errores automáticamente.
 *  - COBOL : Registro de error estructurado y estandarizado (código + tipo + mensaje).
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// JERARQUÍA DE CLASES DE ERROR (Enfoque POO)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AppError — Clase base de todos los errores controlados del sistema.
 * Extiende Error nativo para preservar el stack trace.
 */
class AppError extends Error {
  /**
   * @param {string}   mensaje  - Mensaje legible para el usuario o desarrollador.
   * @param {string}   tipo     - Categoría del error: VALIDATION | BUSINESS | INFRASTRUCTURE | FATAL
   * @param {string}   codigo   - Código único del error (ej. 'ERR_VALIDATION', 'ERR_DUPLICATE').
   * @param {string[]} detalles - Lista de mensajes de detalle (útil en errores de validación).
   */
  constructor(mensaje, tipo, codigo, detalles) {
    super(mensaje);
    this.name     = this.constructor.name;
    this.tipo     = tipo     || 'FATAL';
    this.codigo   = codigo   || 'ERR_GENERIC';
    this.detalles = detalles || [];
  }
}

/**
 * ValidationError — Error causado por datos inválidos o incompletos enviados por el usuario.
 * Es seguro mostrarlo al usuario final con todos sus detalles.
 * Equivalente SAP: RAISE EXCEPTION TYPE cx_sy_parameter_error.
 */
class ValidationError extends AppError {
  /**
   * @param {string}   mensaje  - Resumen del problema de validación.
   * @param {string[]} detalles - Lista de campos o reglas que fallaron.
   */
  constructor(mensaje, detalles) {
    super(mensaje, 'VALIDATION', 'ERR_VALIDATION', detalles || []);
  }
}

/**
 * BusinessError — Error causado por una regla de negocio que impide la operación.
 * Ejemplo: "El empleado ya tiene nómina registrada en esta quincena."
 * Es seguro mostrarlo al usuario final.
 * Equivalente SAP: RAISE EXCEPTION TYPE cx_bapi_error.
 */
class BusinessError extends AppError {
  /**
   * @param {string} mensaje - Descripción clara de la regla de negocio violada.
   * @param {string} codigo  - Código de error de negocio (ej. 'ERR_DUPLICATE_NOMINA').
   */
  constructor(mensaje, codigo) {
    super(mensaje, 'BUSINESS', codigo || 'ERR_BUSINESS', []);
  }
}

/**
 * InfrastructureError — Error causado por un fallo técnico del sistema.
 * Ejemplos: cuota de Sheets excedida, timeout de Drive, fallo de red.
 * NO se expone al usuario final. Se loguea internamente.
 * Equivalente SAP: RAISE EXCEPTION TYPE cx_sy_dyn_call_error.
 */
class InfrastructureError extends AppError {
  /**
   * @param {string} mensaje - Mensaje técnico (solo para logs internos).
   */
  constructor(mensaje) {
    super(mensaje, 'INFRASTRUCTURE', 'ERR_INFRASTRUCTURE', []);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESADOR CENTRAL DE ERRORES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ErrorHandler — Procesador central que evalúa, clasifica y formatea cualquier
 * error capturado en el sistema, garantizando una respuesta uniforme al cliente.
 */
const ErrorHandler = {

  /**
   * Procesa un error capturado y devuelve una respuesta estructurada segura.
   *
   * Flujo de clasificación:
   *  1. ValidationError → Exponer detalles al usuario (datos inválidos).
   *  2. BusinessError   → Exponer mensaje al usuario (regla de negocio).
   *  3. InfrastructureError → Loggear internamente, mensaje genérico al usuario.
   *  4. Error desconocido   → Loggear internamente, mensaje genérico al usuario.
   *
   * @param {Error}  err     - El error capturado (puede ser AppError o Error nativo).
   * @param {string} context - Contexto de la operación para el log (ej. 'Lead.registrar').
   * @returns {{ ok: false, error: object }}
   */
  process: function(err, context) {
    const ctx = context || 'desconocido';

    // ── Errores de Validación (seguros para el usuario) ──────────────────────
    if (err instanceof ValidationError) {
      Logger.log('[VALIDATION_ERROR] Contexto: ' + ctx + ' | ' + err.message);
      return {
        ok: false,
        error: {
          tipo:     err.tipo,
          codigo:   err.codigo,
          mensaje:  err.message,
          detalles: err.detalles
        }
      };
    }

    // ── Errores de Negocio (seguros para el usuario) ──────────────────────────
    if (err instanceof BusinessError) {
      Logger.log('[BUSINESS_ERROR] Contexto: ' + ctx + ' | ' + err.message);
      return {
        ok: false,
        error: {
          tipo:     err.tipo,
          codigo:   err.codigo,
          mensaje:  err.message,
          detalles: []
        }
      };
    }

    // ── Errores de Infraestructura (solo log, mensaje genérico al usuario) ────
    if (err instanceof InfrastructureError) {
      Logger.log('[INFRA_ERROR] Contexto: ' + ctx + ' | ' + (err.stack || err.message));
      return {
        ok: false,
        error: {
          tipo:     'INFRASTRUCTURE',
          codigo:   'ERR_INFRASTRUCTURE',
          mensaje:  'Ha ocurrido un error en los servicios del sistema. Intente nuevamente.',
          detalles: []
        }
      };
    }

    // ── Error Fatal / Inesperado (solo log, mensaje genérico al usuario) ──────
    Logger.log('[FATAL_ERROR] Contexto: ' + ctx + ' | ' + (err.stack || err.message));
    return {
      ok: false,
      error: {
        tipo:     'FATAL',
        codigo:   'ERR_FATAL',
        mensaje:  'Error interno inesperado del servidor. Contacte al administrador del sistema.',
        detalles: []
      }
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN DE ORDEN SUPERIOR — safeExecute (Enfoque LISP / Funcional)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * safeExecute — Decorador funcional de ejecución segura.
 *
 * Envuelve cualquier función de negocio en un bloque de captura de errores
 * centralizado, eliminando la necesidad de escribir try/catch en cada controlador.
 *
 * Inspirado en el patrón LISP de funciones de orden superior y el patrón
 * Railway-Oriented Programming (vía de éxito y vía de error separadas).
 *
 * Uso en controladores:
 *   // Antes (repetitivo en cada controlador):
 *   function apiGuardarLead(formData) {
 *     try {
 *       return LeadUseCases.registrar(formData);
 *     } catch (err) {
 *       return { ok: false, errores: [err.message] };
 *     }
 *   }
 *
 *   // Después (limpio, desacoplado):
 *   function apiGuardarLead(formData) {
 *     return safeExecute(function() { return LeadUseCases.registrar(formData); }, 'Lead.registrar');
 *   }
 *
 * @param {Function} action  - Función de negocio a ejecutar de forma segura.
 * @param {string}   context - Contexto descriptivo para los logs del sistema.
 * @returns {object}         - El resultado de action() o una respuesta de error estructurada.
 */
function safeExecute(action, context) {
  try {
    return action();
  } catch (err) {
    return ErrorHandler.process(err, context || 'sin_contexto');
  }
}
