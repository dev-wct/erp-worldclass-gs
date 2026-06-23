/**
 * CORE_NotificationService
 * ─────────────────────────────────────────────────────────────────────────
 * Capa de abstracción para notificaciones del ERP WorldClass.
 *
 * PROPÓSITO (Anti Vendor Locking):
 *  Los módulos del ERP NUNCA llaman directamente a Gmail, WhatsApp, Twilio,
 *  SendGrid, etc. Siempre hablan con NotificationService.
 *
 *  Si mañana se migra de Gmail → SendGrid:
 *    Solo se cambia el Adapter activo en AdapterFactory.
 *    Ningún módulo de negocio se toca.
 *
 * CANALES SOPORTADOS:
 *  - EMAIL  : correo electrónico
 *  - WHATSAPP: mensajes de WhatsApp
 *  (extensible a SMS, Push, Slack, Teams, etc.)
 *
 * CONTRATO DE ADAPTADORES:
 *  Todo adapter debe implementar:
 *    sendEmail(to, subject, body, htmlBody)  → boolean
 *    sendWhatsApp(phone, message, template)  → boolean
 *  Si un adapter no soporta un canal, lanza NotImplementedError.
 *
 * USO:
 *  NotificationService.sendEmail({
 *    to      : 'juan@empresa.com',
 *    subject : 'Bienvenido al equipo',
 *    body    : 'Tu ingreso ha sido registrado...',
 *    htmlBody: '<h1>Bienvenido...</h1>',
 *  });
 *
 *  NotificationService.sendWhatsApp({
 *    phone   : '+50212345678',
 *    message : 'Tienes una cita mañana a las 10am.',
 *  });
 * ─────────────────────────────────────────────────────────────────────────
 */
const NotificationService = (() => {

  // ── Helpers privados ────────────────────────────────────────────────────

  /**
   * Obtiene el adapter activo desde AdapterFactory.
   * @returns {object} — adapter con métodos sendEmail / sendWhatsApp
   */
  function _getAdapter() {
    return AdapterFactory.getNotificationAdapter();
  }

  /**
   * Valida que los campos requeridos estén presentes.
   * @param {object} params
   * @param {string[]} required
   * @throws {Error} si falta algún campo
   */
  function _validate(params, required) {
    required.forEach(function(field) {
      if (!params[field]) {
        throw new Error('[NotificationService] Campo requerido faltante: "' + field + '"');
      }
    });
  }

  // ── API Pública ──────────────────────────────────────────────────────────

  return {

    /**
     * Envía un correo electrónico.
     *
     * @param {object} params
     * @param {string}  params.to       — destinatario
     * @param {string}  params.subject  — asunto
     * @param {string}  params.body     — cuerpo texto plano (requerido como fallback)
     * @param {string}  [params.htmlBody] — cuerpo HTML opcional
     * @returns {boolean}
     */
    sendEmail: function(params) {
      try {
        _validate(params, ['to', 'subject', 'body']);
        const adapter = _getAdapter();
        Logger.log('[NotificationService] EMAIL → ' + params.to + ' | ' + params.subject);
        return adapter.sendEmail(params.to, params.subject, params.body, params.htmlBody || null);
      } catch (e) {
        Logger.log('[NotificationService] Error en sendEmail: ' + e.message);
        return false;
      }
    },

    /**
     * Envía un mensaje de WhatsApp.
     *
     * @param {object} params
     * @param {string}  params.phone    — número en formato internacional (+502...)
     * @param {string}  params.message  — texto del mensaje
     * @param {string}  [params.template] — nombre de plantilla (si aplica)
     * @param {object}  [params.templateParams] — parámetros de la plantilla
     * @returns {boolean}
     */
    sendWhatsApp: function(params) {
      try {
        _validate(params, ['phone', 'message']);
        const adapter = _getAdapter();
        Logger.log('[NotificationService] WHATSAPP → ' + params.phone);
        return adapter.sendWhatsApp(
          params.phone,
          params.message,
          params.template       || null,
          params.templateParams || {}
        );
      } catch (e) {
        Logger.log('[NotificationService] Error en sendWhatsApp: ' + e.message);
        return false;
      }
    },

    /**
     * Envía por todos los canales disponibles para un destinatario.
     * Útil para notificaciones críticas.
     *
     * @param {object} params
     * @param {string}  params.email    — email del destinatario
     * @param {string}  params.phone    — teléfono del destinatario
     * @param {string}  params.subject  — asunto (para email)
     * @param {string}  params.message  — mensaje (para todos los canales)
     * @param {string}  [params.htmlBody] — cuerpo HTML para email
     * @returns {{ email: boolean, whatsapp: boolean }}
     */
    sendAll: function(params) {
      const results = { email: false, whatsapp: false };

      if (params.email && params.subject && params.message) {
        results.email = NotificationService.sendEmail({
          to      : params.email,
          subject : params.subject,
          body    : params.message,
          htmlBody: params.htmlBody || null,
        });
      }

      if (params.phone && params.message) {
        results.whatsapp = NotificationService.sendWhatsApp({
          phone  : params.phone,
          message: params.message,
        });
      }

      return results;
    },

    /**
     * Retorna el nombre del adapter activo (para diagnóstico).
     * @returns {string}
     */
    getAdapterName: function() {
      try {
        return AdapterFactory.getNotificationAdapter().getName();
      } catch (e) {
        return 'UNKNOWN';
      }
    },

  };

})();
