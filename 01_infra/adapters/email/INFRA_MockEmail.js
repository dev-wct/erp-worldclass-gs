/**
 * INFRA_MockEmail
 * ─────────────────────────────────────────────────────────────────────────
 * Provider simulado para el canal EMAIL (dev/tests).
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockEmailProvider = {
  getName: function() { return 'MOCK_EMAIL'; },

  sendEmail: function(to, subject, body, htmlBody) {
    Logger_ERP.debug('INFRA', '[EMAIL SIMULADO] To: ' + to + ' | Subject: ' + subject);
    return true;
  }
};
