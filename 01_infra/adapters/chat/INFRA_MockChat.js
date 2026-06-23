/**
 * INFRA_MockChat
 * ─────────────────────────────────────────────────────────────────────────
 * Provider simulado para el canal CHAT.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockChatProvider = {
  getName: function() { return 'MOCK_CHAT'; },

  sendMessage: function(webhookUrl, message) {
    Logger_ERP.debug('INFRA', '[CHAT SIMULADO] Mensaje: ' + message);
    return true;
  }
};
