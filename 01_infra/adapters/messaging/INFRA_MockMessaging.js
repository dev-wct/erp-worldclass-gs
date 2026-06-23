/**
 * INFRA_MockMessaging
 * ─────────────────────────────────────────────────────────────────────────
 * Provider simulado para el canal MESSAGING.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockMessagingProvider = {
  getName: function() { return 'MOCK_MESSAGING'; },

  sendWhatsApp: function(phone, message, template, params) {
    Logger_ERP.debug('INFRA', '[WHATSAPP SIMULADO] Phone: ' + phone + ' | Message: ' + message);
    return true;
  }
};
