/**
 * INFRA_GmailProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Provider para el canal EMAIL usando Google Workspace (Gmail).
 * Implementa la interfaz esperada por AdapterFactory para 'email'.
 * ─────────────────────────────────────────────────────────────────────────
 */
const GmailProvider = {
  getName: function() { return 'GMAIL'; },

  /**
   * Envía email usando MailApp (no requiere permiso de lectura de Gmail).
   */
  sendEmail: function(to, subject, body, htmlBody) {
    try {
      const options = { name: Config.ERP_NAME };
      if (htmlBody) options.htmlBody = htmlBody;
      MailApp.sendEmail(to, subject, body, options);
      Logger_ERP.info('INFRA', 'Email enviado a: ' + to);
      return true;
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error al enviar email', e);
      return false;
    }
  }
};
