const WhatsAppService = {
  sendMessage: function(phone, text, templateName = null, templateParams = {}) {
    Logger.log(`[WhatsAppService] Enviando mensaje a ${phone}. Plantilla: ${templateName || 'Ninguna'}`);
    return true;
  }
};
