/**
 * INFRA_GChatProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Provider para el canal CHAT usando Google Chat (Webhooks).
 * ─────────────────────────────────────────────────────────────────────────
 */
const GChatProvider = {
  getName: function() { return 'GCHAT'; },

  sendMessage: function(webhookUrl, message) {
    try {
      const payload = JSON.stringify({ text: message });
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: payload
      };
      UrlFetchApp.fetch(webhookUrl, options);
      Logger_ERP.info('INFRA', 'Mensaje enviado a Google Chat');
      return true;
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error enviando mensaje a Google Chat', e);
      return false;
    }
  }
};
