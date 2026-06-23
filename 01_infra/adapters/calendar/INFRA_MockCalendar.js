/**
 * INFRA_MockCalendar
 * ─────────────────────────────────────────────────────────────────────────
 * Provider simulado para el canal CALENDAR.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockCalendarProvider = {
  getName: function() { return 'MOCK_CALENDAR'; },

  createEvent: function(title, startTime, endTime, guests, description) {
    Logger_ERP.debug('INFRA', '[CALENDAR SIMULADO] Evento: ' + title);
    return 'mock-event-id';
  }
};
