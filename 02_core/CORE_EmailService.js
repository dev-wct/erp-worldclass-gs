const EmailService = {
  send: function(to, subject, body, htmlBody = null) {
    Logger.log(`[EmailService] Enviando correo a: ${to} | Asunto: ${subject}`);
    const options = {};
    if (htmlBody) options.htmlBody = htmlBody;
    // MailApp.sendEmail(to, subject, body, options);
    return true;
  }
};
