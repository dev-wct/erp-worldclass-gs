/**
 * INFRA_MockMeeting
 * ─────────────────────────────────────────────────────────────────────────
 * Provider simulado para el canal MEETING.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MockMeetingProvider = {
  getName: function() { return 'MOCK_MEETING'; },

  createMeeting: function(title, startTime, endTime, guests) {
    Logger_ERP.debug('INFRA', '[MEETING SIMULADO] Reunion: ' + title);
    return 'https://meet.mock.com/123';
  }
};
