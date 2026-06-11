const EmailService = {
  /**
   * Envía un correo electrónico.
   * Usa MailApp (no GmailApp) para no requerir permiso de lectura de Gmail.
   *
   * @param {string}  to       - Destinatario
   * @param {string}  subject  - Asunto
   * @param {string}  body     - Cuerpo en texto plano (fallback)
   * @param {string}  [htmlBody] - Cuerpo HTML opcional (se muestra si el cliente lo soporta)
   */
  send: function(to, subject, body, htmlBody) {
    Logger.log('[EmailService] Enviando a: ' + to + ' | Asunto: ' + subject);
    var options = { name: Config.ERP_NAME };
    if (htmlBody) options.htmlBody = htmlBody;
    MailApp.sendEmail(to, subject, body, options);
    return true;
  }
};
