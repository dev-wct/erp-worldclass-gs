/**
 * INFRA_AdapterFactory
 * ─────────────────────────────────────────────────────────────────────────
 * Fábrica central de Adapters (Patrón SAP Communication System / Integration Layer).
 *
 * PROPÓSITO:
 *  - Decide QUÉ proveedor específico resuelve CADA canal de comunicación.
 *  - Los canales son: EMAIL, MESSAGING, CALENDAR, CHAT, MEETING.
 *  - Se lee desde PropertiesService para permitir cambiar proveedores en caliente
 *    (ej: pasar de Gmail a SendGrid) sin tocar lógica de negocio.
 * ─────────────────────────────────────────────────────────────────────────
 */
const AdapterFactory = (() => {

  let _cache = null;
  let _storageCache = null;

  function _instantiateStorage() {
    let configStorage = 'GOOGLE_DRIVE';
    try {
      configStorage = PropertiesService.getScriptProperties().getProperty('PROVIDER_STORAGE') || 'GOOGLE_DRIVE';
    } catch(e) {}

    let provider;
    if (configStorage === 'GOOGLE_DRIVE') provider = GDriveFileProvider;
    else if (configStorage === 'MOCK') provider = MockFileProvider;
    else provider = GDriveFileProvider;

    Logger_ERP.info('INFRA', 'FileStorageAdapter inicializado con config: ' + configStorage);
    return provider;
  }

  function _getProviderConfig() {
    try {
      const props = PropertiesService.getScriptProperties();
      return {
        email:     props.getProperty('PROVIDER_EMAIL')     || 'GMAIL',
        messaging: props.getProperty('PROVIDER_MESSAGING') || 'WHATSAPP',
        calendar:  props.getProperty('PROVIDER_CALENDAR')  || 'GCALENDAR',
        chat:      props.getProperty('PROVIDER_CHAT')      || 'GCHAT',
        meeting:   props.getProperty('PROVIDER_MEETING')   || 'GMEET',
      };
    } catch(e) {
      // Fallback si no hay GAS context
      return { email: 'GMAIL', messaging: 'WHATSAPP', calendar: 'GCALENDAR', chat: 'GCHAT', meeting: 'GMEET' };
    }
  }

  function _instantiate() {
    const config = _getProviderConfig();
    
    // Resolvemos el provider para Email
    let emailProvider;
    if (config.email === 'GMAIL') emailProvider = GmailProvider;
    else if (config.email === 'MOCK') emailProvider = MockEmailProvider;
    else emailProvider = GmailProvider;

    // Resolvemos el provider para Messaging
    let msgProvider;
    if (config.messaging === 'WHATSAPP') msgProvider = WhatsAppProvider;
    else if (config.messaging === 'MOCK') msgProvider = MockMessagingProvider;
    else msgProvider = WhatsAppProvider;

    // Resolvemos el provider para Calendar
    let calProvider;
    if (config.calendar === 'GCALENDAR') calProvider = GCalendarProvider;
    else if (config.calendar === 'MOCK') calProvider = MockCalendarProvider;
    else calProvider = GCalendarProvider;

    // Resolvemos el provider para Chat
    let chatProvider;
    if (config.chat === 'GCHAT') chatProvider = GChatProvider;
    else if (config.chat === 'MOCK') chatProvider = MockChatProvider;
    else chatProvider = GChatProvider;

    // Resolvemos el provider para Meeting
    let meetProvider;
    if (config.meeting === 'GMEET') meetProvider = GMeetProvider;
    else if (config.meeting === 'MOCK') meetProvider = MockMeetingProvider;
    else meetProvider = GMeetProvider;

    Logger_ERP.info('INFRA', 'AdapterFactory inicializado con config: ' + JSON.stringify(config));

    // El objeto devuelto implementa la interfaz requerida delegando a los providers específicos
    return {
      getName: function() { return 'AdapterFactory_Aggregate'; },
      
      // Delegado a EmailProvider
      sendEmail: function(to, subject, body, htmlBody) {
        return emailProvider.sendEmail(to, subject, body, htmlBody);
      },
      
      // Delegado a MessagingProvider
      sendWhatsApp: function(phone, message, template, params) {
        return msgProvider.sendWhatsApp(phone, message, template, params);
      },

      // Delegado a CalendarProvider
      createEvent: function(title, startTime, endTime, guests, description) {
        return calProvider.createEvent(title, startTime, endTime, guests, description);
      },

      // Delegado a ChatProvider
      sendChatMessage: function(webhookUrl, message) {
        return chatProvider.sendMessage(webhookUrl, message);
      },

      // Delegado a MeetingProvider
      createMeeting: function(title, startTime, endTime, guests) {
        return meetProvider.createMeeting(title, startTime, endTime, guests);
      }
    };
  }

  // ── API Pública ──────────────────────────────────────────────────────────
  return {
    getNotificationAdapter: function() {
      if (!_cache) _cache = _instantiate();
      return _cache;
    },

    getFileStorageAdapter: function() {
      if (!_storageCache) _storageCache = _instantiateStorage();
      return _storageCache;
    },
    
    clearCache: function() {
      _cache = null;
      _storageCache = null;
      Logger_ERP.info('INFRA', 'AdapterFactory cache limpiado.');
    },

    getActiveAdapterName: function() {
      return 'Aggregate (Email/Msg/Cal/Chat/Meet/Storage)';
    }
  };

})();
