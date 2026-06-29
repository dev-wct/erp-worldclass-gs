/**
 * CORE_Gateway
 * ─────────────────────────────────────────────────────────────────────────
 * Adaptador isomórfico: capa delgada entre los Controllers del ERP y el
 * transporte de red (GAS hoy → Hono/Vercel/Supabase mañana).
 *
 * REGLA DE ORO:
 *  Los Controllers NO cambian. Solo este archivo cambia cuando se migra
 *  el backend. El front usa ERP.Gateway.call() con la misma firma siempre.
 *
 * Contrato de respuesta unificado (igual para GAS y Hono):
 *  { ok: true,  data: any,      mensaje: string }
 *  { ok: false, errores: string[], mensaje: string }
 *
 * En producción GAS: safeExecute() en cada Controller ya garantiza este
 * contrato. Gateway solo registra y re-lanza para trazabilidad.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Envuelve la ejecución de un caso de uso en un contexto de Gateway,
 * añadiendo trazabilidad sin romper el contrato de safeExecute.
 *
 * Uso típico en Controller:
 *   const apiGuardarLead = (data) => Gateway_route('SD.Lead.guardar', data, (d) => {
 *     return LeadUseCases.registrar(d);
 *   });
 *
 * @param {string}   route   — Nombre de la ruta (para logs y trazabilidad)
 * @param {any}      payload — Datos recibidos del front
 * @param {Function} handler — Función que ejecuta el caso de uso
 * @returns {{ ok: boolean, data?: any, errores?: string[], mensaje: string }}
 */
const Gateway_route = (route, payload, handler) => {
  return safeExecute(() => handler(payload), route);
};

/**
 * Normaliza cualquier respuesta de un UseCase al contrato estándar.
 * Útil para casos donde el UseCase retorna datos sin envolver.
 *
 * @param {any} result  — Resultado crudo del UseCase
 * @param {string} [mensaje]
 * @returns {{ ok: boolean, data: any, mensaje: string }}
 */
const Gateway_normalize = (result, mensaje) => {
  if (result && typeof result === 'object' && 'ok' in result) {
    return result; // Ya viene en contrato estándar
  }
  return { ok: true, data: result, mensaje: mensaje || 'OK' };
};

/**
 * Construye una respuesta de error estándar desde cualquier excepción.
 * Centraliza el formateo de errores para GAS y para futura API REST.
 *
 * @param {Error|string} err
 * @param {string}       route
 * @returns {{ ok: false, errores: string[], mensaje: string }}
 */
const Gateway_buildError = (err, route) => {
  const msg = (err && err.message) ? err.message : String(err);
  ErrorHandler.log(`[Gateway] ${route} → ${msg}`);
  return { ok: false, errores: [msg], mensaje: `Error en ${route}` };
};
