/**
 * INFRA_GCalendarProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Provider para el canal CALENDAR usando Google Calendar.
 * ─────────────────────────────────────────────────────────────────────────
 */
const GCalendarProvider = {
  getName: function() { return 'GCALENDAR'; },

  createEvent: function(title, startTime, endTime, guests, description) {
    try {
      const cal = CalendarApp.getDefaultCalendar();
      const event = cal.createEvent(title, new Date(startTime), new Date(endTime), {
        description: description,
        guests: guests.join(',')
      });
      Logger_ERP.info('INFRA', 'Evento de calendario creado: ' + title);
      return event.getId();
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error creando evento de calendario', e);
      return null;
    }
  }
};
