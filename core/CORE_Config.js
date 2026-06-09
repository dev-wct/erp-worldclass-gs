const Config = (() => {
  let name = 'ERP WorldClass Travel';
  try {
    const prop = PropertiesService.getScriptProperties().getProperty('ERP_NAME');
    if (prop) {
      name = prop;
    } else {
      const ss = Utils.getActiveSpreadsheet();
      if (ss) {
        const ssName = ss.getName();
        // Limpiar sufijos comunes como [PRODUCTION], [DEV], - DEV, - PROD, etc.
        name = ssName.replace(/\s*[\[\-]\s*(PRODUCTION|PROD|DEV|DEVELOPMENT)\]?\s*/i, '').trim();
        if (!name) name = 'ERP WorldClass Travel';
      }
    }
  } catch (e) {
    // Contexto sin SpreadsheetApp activo o sin PropertiesService
  }

  return Object.freeze({
    VERSION: '4.0.0',
    ERP_NAME: name,
    STORAGE_PROVIDER: 'GOOGLE_DRIVE',

    COLORS: {
      CORE: { primary: '#2C3E50', header: '#1A252F' },
      RRHH: { primary: '#784212', header: '#5B3210' },
      MM:   { primary: '#1A5276', header: '#154360' },
      SD:   { primary: '#7D3C98', header: '#6C3483' },
      FICO: { primary: '#145A32', header: '#0E4526' },
    },

    ESTADOS: {
      FLUJO:       ['PENDIENTE','APROBADO','RECHAZADO'],
      POSTULANTE:  ['POSTULADO','ENTREVISTA','PRUEBA','ACEPTADO','RECHAZADO'],
      ONBOARDING:  ['PENDIENTE','EN_PROCESO','COMPLETADO'],
      LEAD:        ['NUEVO','CONTACTADO','INTERESADO','CITA_AGENDADA','NO_INTERESADO','INVALIDO'],
      CITA:        ['AGENDADA','CONFIRMADA','ASISTIO','NO_ASISTIO','VENTA_CERRADA','CANCELADA'],
      BAJA:        ['RENUNCIA','DESPIDO','FIN_CONTRATO','ABANDONO'],
      EQUIPO:      ['ACTIVO','EN_BODEGA','EN_REPARACION','DADO_DE_BAJA','EXTRAVIADO'],
    },
  });
})();
