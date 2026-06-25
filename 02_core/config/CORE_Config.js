/**
 * CORE_Config
 * ─────────────────────────────────────────────────────────────────────────
 * Archivo de configuración global del ERP.
 *
 * IMPORTANTE — CERO DEPENDENCIAS:
 *  Este archivo NO importa ni llama a ningún otro módulo del ERP (ni Utils,
 *  ni DataAdapter, ni nada). Usa únicamente las APIs nativas de Google Apps
 *  Script (SpreadsheetApp, PropertiesService).
 *
 *  Esto garantiza que Config puede cargarse de forma segura en CUALQUIER
 *  orden de archivos, sin importar la carga alfabética de clasp.
 *
 * Resolución del nombre del ERP (por prioridad):
 *  1. Script Property "ERP_NAME"  → para instalaciones independientes (SaaS).
 *  2. Nombre del archivo de la Sheet activa → para scripts vinculados.
 *  3. Fallback hardcoded              → si corre fuera de GAS (tests locales).
 * ─────────────────────────────────────────────────────────────────────────
 */
const Config = (() => {
  let name = 'ERP WorldClass Travel';
  let logoUrl = '';
  let maintenanceActive = 'false';
  let maintenanceMsg = '';
  let maintenanceSeverity = 'warning';
  try {
    const propLogo = PropertiesService.getScriptProperties().getProperty('ERP_LOGO_URL');
    if (propLogo && propLogo.trim()) {
      logoUrl = propLogo.trim();
    }
    const propActive = PropertiesService.getScriptProperties().getProperty('MAINTENANCE_BANNER_ACTIVE');
    if (propActive) {
      maintenanceActive = propActive.trim();
    }
    const propMsg = PropertiesService.getScriptProperties().getProperty('MAINTENANCE_BANNER_MSG');
    if (propMsg) {
      maintenanceMsg = propMsg.trim();
    }
    const propSeverity = PropertiesService.getScriptProperties().getProperty('MAINTENANCE_BANNER_SEVERITY');
    if (propSeverity) {
      maintenanceSeverity = propSeverity.trim();
    }
  } catch(e) {}

  try {
    // Prioridad 1: Script Property (instalación independiente / SaaS)
    const prop = PropertiesService.getScriptProperties().getProperty('ERP_NAME');
    if (prop && prop.trim()) {
      name = prop.trim();
    } else {
      // Prioridad 2: Nombre del archivo de la Sheet vinculada
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        const raw = ss.getName();
        // Eliminar sufijos de entorno: [PRODUCTION], [DEV], - PROD, - DEV, etc.
        const cleaned = raw.replace(/\s*[\[\-]\s*(PRODUCTION|PROD|DEV|DEVELOPMENT)\]?\s*/i, '').trim();
        if (cleaned) name = cleaned;
      }
    }
  } catch (e) {
    // Prioridad 3: Fallback — contexto sin GAS activo (tests locales, etc.)
  }

  return Object.freeze({
    VERSION:          '4.0.0',
    ERP_NAME:         name,
    ERP_LOGO_URL:     logoUrl,
    MAINTENANCE_BANNER_ACTIVE:   maintenanceActive === 'true',
    MAINTENANCE_BANNER_MSG:      maintenanceMsg,
    MAINTENANCE_BANNER_SEVERITY: maintenanceSeverity,
    STORAGE_PROVIDER: 'GOOGLE_DRIVE',
    DEBUG_MODE: (() => {
      try {
        return PropertiesService.getScriptProperties().getProperty('DEBUG_MODE') === 'true';
      } catch (e) {
        return false;
      }
    })(),

    COLORS: {
      CORE: { primary: '#2C3E50', header: '#1A252F' },
      RRHH: { primary: '#784212', header: '#5B3210' },
      MM:   { primary: '#1A5276', header: '#154360' },
      SD:   { primary: '#7D3C98', header: '#6C3483' },
      FICO: { primary: '#145A32', header: '#0E4526' },
    },

    ESTADOS: {
      FLUJO:      ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
      POSTULANTE: ['POSTULADO', 'ENTREVISTA', 'PRUEBA', 'ACEPTADO', 'RECHAZADO'],
      ONBOARDING: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'],
      LEAD:       ['NUEVO', 'CONTACTADO', 'INTERESADO', 'CITA_AGENDADA', 'NO_INTERESADO', 'INVALIDO'],
      CITA:       ['AGENDADA', 'CONFIRMADA', 'ASISTIO', 'NO_ASISTIO', 'VENTA_CERRADA', 'CANCELADA'],
      BAJA:       ['RENUNCIA', 'DESPIDO', 'FIN_CONTRATO', 'ABANDONO'],
      EQUIPO:     ['ACTIVO', 'EN_BODEGA', 'EN_REPARACION', 'DADO_DE_BAJA', 'EXTRAVIADO'],
    },
  });
})();
