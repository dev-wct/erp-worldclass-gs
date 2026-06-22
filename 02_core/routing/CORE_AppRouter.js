/**
 * CORE_AppRouter
 * ─────────────────────────────────────────────────────────────────────────
 * Router central de la Web App ERP WorldClass.
 *
 * ARQUITECTURA:
 *   Un único doGet() enruta todas las peticiones del ERP interno.
 *   El doGet() de EREC (09_erec) maneja los links públicos de candidatos.
 *   Son el MISMO deployment de GAS — se diferencian por parámetros:
 *
 *   ?page=launchpad          → Launchpad principal (default)
 *   ?page=vacante            → Formulario Nueva Vacante
 *   ?page=empleado           → Formulario Registrar Empleado
 *   ?page=lead               → Formulario Registrar Lead
 *   ?page=campana            → Formulario Nueva Campaña
 *   ?page=llamada            → Formulario Registrar Llamada
 *   ?page=cita               → Formulario Agendar Cita
 *   ?page=equipo             → Formulario Registrar Equipo
 *   ?page=chip               → Formulario Registrar Chip
 *   ?page=asignacion         → Formulario Asignación de Activos
 *   ?page=nomina             → Formulario Pago de Nómina
 *
 *   ?vacante=ID&token=TOKEN  → Formulario público candidato (EREC legacy)
 *   ?vacante=ID              → Formulario público sin token (EREC legacy)
 *
 * SEGURIDAD:
 *   Las páginas internas (?page=*) requieren que el usuario esté
 *   autenticado con una cuenta Google del dominio autorizado.
 *   Los links públicos (?vacante=*) son accesibles sin autenticación.
 *
 * ANTI VENDOR LOCK-IN:
 *   Cuando se migre a Hono/Vercel, este archivo se convierte en un
 *   router Express/Hono con las mismas rutas — sin cambiar los formularios.
 * ─────────────────────────────────────────────────────────────────────────
 */

var GLOBAL_CONTEXT = {};

/**
 * Mapa de rutas: page → archivo HTML del template.
 * Agregar nuevas páginas aquí — sin tocar más código.
 */
var APP_ROUTES = {
  'launchpad':    '02_core/ui/CORE_Launchpad',
  'vacante':      '09_erec/vacante/EREC_FormVacante',
  'generar-link': '09_erec/vacante/EREC_FormGenerarLink',
  'ver-links':    '09_erec/vacante/EREC_FormVerLinks',
  'empleado':     '04_hcm/empleado/RRHH_FormEmpleado',
  'lead':         '07_sd/lead/SD_FormLead',
  'campana':      '07_sd/campana/SD_FormCampana',
  'llamada':      '07_sd/llamada/SD_FormLlamada',
  'cita':         '07_sd/cita/SD_FormCita',
  'equipo':       '06_eam/equipo/EAM_FormEquipo',
  'chip':         '06_eam/chip/EAM_FormChip',
  'asignacion':   '06_eam/asignacion/EAM_FormAsignacion',
  'nomina':       '08_fico/pago_nomina/FICO_FormPago',
  'configuracion':'02_core/ui/CORE_Configuracion',
};

/**
 * Títulos de página para el <title> del browser.
 */
var APP_TITLES = {
  'launchpad':    'ERP WorldClass — Launchpad',
  'vacante':      'Nueva Vacante — E-Recruiting',
  'generar-link': 'Generar Link — E-Recruiting',
  'ver-links':    'Links de Postulación — E-Recruiting',
  'empleado':     'Registrar Empleado — HCM',
  'lead':         'Registrar Lead — SD',
  'campana':      'Nueva Campaña — SD',
  'llamada':      'Registrar Llamada — SD',
  'cita':         'Agendar Cita — SD',
  'equipo':       'Registrar Equipo — EAM',
  'chip':         'Registrar Chip — EAM',
  'asignacion':   'Asignación de Activos — EAM',
  'nomina':       'Pago de Nómina — FICO',
  'configuracion':'Configuración Global — ERP WorldClass',
};

/**
 * doGet — Punto de entrada único de la Web App ERP.
 *
 * GAS solo permite un doGet() por proyecto. Este archivo debe ser
 * el ÚNICO que define doGet(). El doGet() del módulo EREC fue
 * renombrado a _erecDoGetPublico() y se llama desde aquí.
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  if (params.test === 'logs') {
    try {
      var ss = Utils.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('SYS_DEBUG_LOG');
      if (!sheet) return HtmlService.createHtmlOutput('No logs sheet found.');
      var data = sheet.getDataRange().getValues();
      var html = '<!DOCTYPE html><html><head><title>System Logs</title><style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;}pre{white-space:pre-wrap;background:#f5f5f5;padding:8px;border-radius:4px;}</style></head><body><h1>System Logs</h1><table border="1"><thead><tr><th>Timestamp</th><th>Message</th><th>Stack</th></tr></thead><tbody>';
      for (var i = data.length - 1; i >= 1; i--) {
        html += '<tr><td>' + data[i][0] + '</td><td><strong>' + data[i][1] + '</strong></td><td><pre>' + data[i][2] + '</pre></td></tr>';
      }
      html += '</tbody></table></body></html>';
      return HtmlService.createHtmlOutput(html);
    } catch(err) {
      return HtmlService.createHtmlOutput('Error reading logs: ' + err.message);
    }
  }

  if (params.test === 'clear') {
    try {
      var ss = Utils.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('SYS_DEBUG_LOG');
      if (sheet) {
        ss.deleteSheet(sheet);
      }
      return HtmlService.createHtmlOutput('Logs cleared.');
    } catch(err) {
      return HtmlService.createHtmlOutput('Error clearing logs: ' + err.message);
    }
  }

  if (params.test === 'true') {
    try {
      var res = include('02_core/ui/CORE_Head');
      return HtmlService.createHtmlOutput('Success: ' + res);
    } catch(err) {
      writeLog('doGet test error', err.message + '\n' + err.stack);
      return HtmlService.createHtmlOutput('Error: ' + err.message + '<br><pre>' + err.stack + '</pre>');
    }
  }

  // LOG de diagnóstico — ver en Apps Script > Ejecuciones
  Logger.log('[AppRouter.doGet] params: ' + JSON.stringify(params));

  // ── Rutas públicas de candidatos EREC ────────────────────────────
  if (params.vacante || params.token) {
    Logger.log('[AppRouter.doGet] → ruta pública EREC');
    return _erecDoGetPublico(e);
  }

  // ── Rutas internas del ERP ────────────────────────────────────────
  var page = (params.page || 'launchpad').toLowerCase().trim();
  Logger.log('[AppRouter.doGet] → página interna: ' + page);
  var file  = APP_ROUTES[page];

  if (!file) {
    return _appPaginaError(
      'Página no encontrada',
      'La ruta "' + page + '" no existe en el ERP.',
      '?page=launchpad'
    );
  }

  try {
    var user    = _getUser();
    var tpl     = HtmlService.createTemplateFromFile(file);

    // Determinar modo debug (prioridad: URL param > global Config)
    var isDebug = (typeof Config !== 'undefined') ? Config.DEBUG_MODE : false;
    if (params.debug === 'true')  isDebug = true;
    if (params.debug === 'false') isDebug = false;

    // Poblar contexto global compartido para llamadas include()
    GLOBAL_CONTEXT = {
      APP_PAGE:      page,
      APP_USER:      user,
      APP_VERSION:   (typeof Config !== 'undefined') ? Config.VERSION  : '—',
      APP_ERP_NAME:  (typeof Config !== 'undefined') ? Config.ERP_NAME : 'ERP',
      APP_PARAMS:    params,
      SHELL_MODE:    'standalone',
      SHELL_MODULE:  _getModuleLabel(page),
      SHELL_USER:    user,
      APP_DEBUG:     isDebug
    };

    // Copiar variables al template principal
    Object.keys(GLOBAL_CONTEXT).forEach(function(k) {
      tpl[k] = GLOBAL_CONTEXT[k];
    });

    var output = tpl.evaluate();
    Logger.log('[AppRouter] Template evaluado OK: ' + file);

    return output
      .setTitle((APP_TITLES[page] || 'ERP'))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch(err) {
    Logger.log('[AppRouter] ERROR evaluando template "' + file + '": ' + err.message + ' | stack: ' + err.stack);
    writeLog('doGet evaluation error: ' + file, err.message + '\n' + err.stack);
    // Página de error sin dependencias externas
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;' +
      'justify-content:center;min-height:100vh;margin:0;background:#f5f6f7;}' +
      '.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;width:90%;' +
      'box-shadow:0 4px 24px rgba(0,0,0,.08);}' +
      'h2{color:#bb0000;margin:0 0 10px;font-size:18px;}' +
      'pre{background:#fdf2f2;padding:12px;border-radius:6px;font-size:12px;' +
      'color:#900000;overflow-x:auto;white-space:pre-wrap;word-break:break-word;}' +
      'a{display:inline-block;margin-top:16px;padding:9px 20px;background:#0a6ed1;' +
      'color:#fff;border-radius:6px;text-decoration:none;font-size:14px;}' +
      '</style></head><body><div class="card">' +
      '<h2>⚠️ Error al cargar la página</h2>' +
      '<p style="color:#515f6e;font-size:13px;margin-bottom:12px;">Archivo: <code>' + file + '</code></p>' +
      '<pre>' + err.message + '</pre>' +
      '<a href="?page=launchpad">← Volver al Launchpad</a>' +
      '</div></body></html>'
    ).setTitle('Error — ERP')
     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// ─── Helpers privados ─────────────────────────────────────────────────────

/** Obtiene el email del usuario autenticado con fallback seguro */
function _getUser() {
  try {
    var email = Session.getActiveUser().getEmail();
    if (email && email.length > 0) return email;
    return Session.getEffectiveUser().getEmail();
  } catch(e) {
    return '';
  }
}

/** Retorna el label del módulo para el breadcrumb del shellbar */
function _getModuleLabel(page) {
  var labels = {
    'launchpad':    '',
    'vacante':      'E-Recruiting',
    'generar-link': 'E-Recruiting',
    'ver-links':    'E-Recruiting',
    'empleado':     'HCM',
    'lead':         'SD',
    'campana':      'SD',
    'llamada':      'SD',
    'cita':         'SD',
    'equipo':       'EAM',
    'chip':         'EAM',
    'asignacion':   'EAM',
    'nomina':       'FICO',
    'configuracion':'Configuración',
  };
  return labels[page] || '';
}

/**
 * Página de error genérica para el router.
 * No depende de ningún template para evitar recursión.
 */
function _appPaginaError(titulo, mensaje, backUrl) {
  var html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">' +
    '<style>' +
    'body{font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;' +
    'justify-content:center;min-height:100vh;margin:0;background:#f5f6f7;}' +
    '.card{background:#fff;border-radius:12px;padding:40px;max-width:440px;width:90%;' +
    'text-align:center;box-shadow:0 4px 24px rgba(29,45,61,.08);}' +
    '.code{font-size:48px;margin-bottom:16px;}' +
    'h2{color:#1d2d3d;margin:0 0 12px;font-size:20px;}' +
    'p{color:#515f6e;line-height:1.6;margin:0 0 20px;font-size:14px;}' +
    'a{display:inline-block;padding:10px 24px;background:#0a6ed1;color:#fff;' +
    'border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;}' +
    '</style></head>' +
    '<body><div class="card">' +
    '<div class="code">⚠️</div>' +
    '<h2>' + titulo + '</h2>' +
    '<p>' + mensaje + '</p>' +
    (backUrl ? '<a href="' + backUrl + '">← Volver al Launchpad</a>' : '') +
    '</div></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('Error — ' + Config.ERP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Expone la URL del Web App para que otros módulos puedan
 * construir links absolutos (ej. links de postulación en EREC).
 * @returns {string} URL base del Web App o '' si no está configurada
 */
function getWebAppUrl() {
  try {
    return PropertiesService.getScriptProperties()
      .getProperty('WEBAPP_URL') || ScriptApp.getService().getUrl();
  } catch(e) {
    return '';
  }
}

/**
 * doPost — Recibe el formulario público de candidatos EREC.
 * Solo las rutas públicas usan POST (formulario nativo HTML de postulación).
 * Las rutas internas usan google.script.run (no POST).
 */
function doPost(e) {
  return _erecDoPostPublico(e);
}

/**
 * Registra un error de sistema en la hoja de cálculo SYS_DEBUG_LOG para diagnóstico remoto.
 */
function writeLog(message, stack) {
  try {
    var ss = Utils.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('SYS_DEBUG_LOG');
    if (!sheet) {
      sheet = ss.insertSheet('SYS_DEBUG_LOG');
      sheet.appendRow(['Timestamp', 'Message', 'Stack']);
    }
    sheet.appendRow([new Date(), message, stack || '']);
  } catch(e) {
    Logger.log('Fallo writeLog: ' + e.message);
  }
}
