/**
 * CORE_SystemAdmin_Controller
 * ============================================================
 * Capa de Adaptador: Controlador de interfaz para Administración del Sistema.
 * Administra parámetros globales del ERP usando Script Properties de Google Apps Script.
 */

// Parámetros por defecto para el sistema
const SYSTEM_CONFIG_DEFAULTS = {
  ERP_NAME: 'WorldClass ERP',
  ERP_LOGO_URL: '',
  SUPPORT_EMAIL: 'soporte@worldclass.com',
  LICENSE_KEY: 'DEMO-FREE-LIC-2026',
  LICENSE_EXPIRATION: '2026-12-31',
  BACKUP_ENABLED: 'true',
  BACKUP_FREQUENCY: 'DIARIO',
  BACKUP_FOLDER_ID: '',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASS: '',
  GEMINI_API_KEY: '',
  GEMINI_MODEL: 'gemini-1.5-flash',
  MAINTENANCE_BANNER_ACTIVE: 'false',
  MAINTENANCE_BANNER_MSG: 'El sistema estará fuera de servicio por mantenimiento programado.',
  MAINTENANCE_BANNER_SEVERITY: 'warning'
};

/**
 * Obtiene la configuración del sistema (Tenant Config) combinando con los valores por defecto.
 */
function apiGetSystemConfig() {
  return safeExecute(function() {
    var props = PropertiesService.getScriptProperties().getProperties() || {};
    var config = {};
    Object.keys(SYSTEM_CONFIG_DEFAULTS).forEach(function(key) {
      config[key] = props[key] !== undefined ? props[key] : SYSTEM_CONFIG_DEFAULTS[key];
    });
    return { ok: true, data: config };
  }, 'SystemAdmin.getSystemConfig');
}

/**
 * Guarda los parámetros globales del ERP.
 */
function apiSaveSystemConfig(payload) {
  return safeExecute(function() {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload inválido para configuración.');
    }
    
    // Filtrar y sanitizar parámetros válidos
    var toSave = {};
    Object.keys(SYSTEM_CONFIG_DEFAULTS).forEach(function(key) {
      if (payload[key] !== undefined) {
        toSave[key] = String(payload[key]).trim();
      }
    });
    
    PropertiesService.getScriptProperties().setProperties(toSave);
    
    // Loguear la acción
    Logger.log("[SystemAdmin] Configuración global del sistema actualizada.");
    return { ok: true, mensaje: '✔ Configuración del sistema guardada con éxito.' };
  }, 'SystemAdmin.saveSystemConfig');
}

/**
 * Realiza una copia de seguridad instantánea del archivo de Google Sheet.
 */
function apiRunInstantBackup() {
  return safeExecute(function() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("No se pudo obtener el archivo de cálculo activo.");
    
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    
    var props = PropertiesService.getScriptProperties().getProperties() || {};
    var folderId = props.BACKUP_FOLDER_ID;
    
    var folder;
    if (folderId && folderId.trim()) {
      try {
        folder = DriveApp.getFolderById(folderId.trim());
      } catch(e) {
        Logger.log("Carpeta de backup configurada no encontrada, usando valor por defecto: " + e.message);
      }
    }
    
    if (!folder) {
      // Usar la carpeta contenedora del archivo activo por defecto
      var parents = file.getParents();
      if (parents.hasNext()) {
        folder = parents.next();
      } else {
        folder = DriveApp.getRootFolder();
      }
    }
    
    var timestamp = new Date().toLocaleDateString('es-EC', { year:'numeric', month:'2-digit', day:'2-digit' }).replace(/\//g, '-') + 
                    '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    var backupName = ss.getName() + " [BACKUP] " + timestamp;
    
    var backupFile = file.makeCopy(backupName, folder);
    
    return { 
      ok: true, 
      mensaje: '✔ Copia de seguridad instantánea creada con éxito.',
      backupName: backupName,
      backupUrl: backupFile.getUrl()
    };
  }, 'SystemAdmin.runInstantBackup');
}

/**
 * Obtiene métricas de diagnóstico del ERP (hojas de cálculo y sus filas).
 */
function apiGetSystemDiagnostics() {
  return safeExecute(function() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var totalSheets = 0;
    var rowsCount = {};
    if (ss) {
      var sheets = ss.getSheets();
      totalSheets = sheets.length;
      sheets.forEach(function(s) {
        rowsCount[s.getName()] = s.getLastRow();
      });
    }
    
    var userEmail = 'admin@worldclass.com';
    try {
      userEmail = Session.getActiveUser().getEmail() || userEmail;
    } catch(e) {}
    
    return {
      ok: true,
      data: {
        spreadsheetName: ss ? ss.getName() : 'No conectado',
        totalSheets: totalSheets,
        rowsCount: rowsCount,
        version: '4.0.0',
        userEmail: userEmail,
        timestamp: new Date().toLocaleDateString('es-EC', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
      }
    };
  }, 'SystemAdmin.getSystemDiagnostics');
}
