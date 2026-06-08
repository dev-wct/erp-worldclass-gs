const Config = Object.freeze({
  VERSION: '4.0.0',
  ERP_NAME: 'ERP WorldClass Travel',
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
