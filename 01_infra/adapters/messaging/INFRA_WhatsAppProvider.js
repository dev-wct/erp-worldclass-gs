/**
 * INFRA_WhatsAppProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Provider para el canal MESSAGING usando WhatsApp (Twilio/API).
 * ─────────────────────────────────────────────────────────────────────────
 */
const WhatsAppProvider = {
  getName: function() { return 'WHATSAPP'; },

  sendWhatsApp: function(phone, message, template, params) {
    try {
      if (typeof WhatsAppService !== 'undefined' && WhatsAppService.sendMessage) {
        return WhatsAppService.sendMessage(phone, message, template || null, params || {});
      }
      Logger_ERP.warn('INFRA', 'WhatsAppService no disponible.');
      return false;
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error en sendWhatsApp', e);
      return false;
    }
  }
};
