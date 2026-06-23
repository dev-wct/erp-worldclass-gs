/**
 * INFRA_GMeetProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Provider para el canal MEETING usando Google Meet.
 * Requiere crear un evento en Calendar para generar el link de Meet.
 * ─────────────────────────────────────────────────────────────────────────
 */
const GMeetProvider = {
  getName: function() { return 'GMEET'; },

  createMeeting: function(title, startTime, endTime, guests) {
    try {
      // Nota: En GAS nativo, para generar link de Meet se necesita Advanced Calendar Service
      // activado. Aquí un stub de la lógica:
      Logger_ERP.info('INFRA', 'Generando link de Google Meet para: ' + title);
      // Simulación por falta de Advanced Service en este snippet:
      return 'https://meet.google.com/mock-link';
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error creando Google Meet', e);
      return null;
    }
  }
};
