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
 *
 * SINGLE SOURCE OF TRUTH:
 *   Las rutas, títulos y menú se definen en:
 *     00_portal/config/PORTAL_Routes.json
 *   Este archivo lee ese JSON para evitar duplicación.
 *
 * CODE STYLE: ES6+ (const/let, arrow functions, template literals)
 * ─────────────────────────────────────────────────────────────────────────
 */

let GLOBAL_CONTEXT = {};

// Security module (server-side)
// Si SecurityServer no está disponible, usar fallback local
const _escapeHtml = (str) => {
  if (typeof SecurityServer !== 'undefined') {
    return SecurityServer.escapeHtml(str);
  }
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Carga la configuración centralizada de rutas desde JSON.
 * Single Source of Truth: 00_portal/config/PORTAL_Routes.json
 */
const _loadRoutesConfig = () => {
  try {
    const json = HtmlService.createHtmlOutputFromFile('00_portal/config/PORTAL_Routes.json').getContent();
    return JSON.parse(json);
  } catch (e) {
    Logger.log(`[AppRouter] Error cargando PORTAL_Routes.json: ${e.message}`);
    return { routes: {}, menu: [] };
  }
};

/** Obtiene el mapa de rutas page → archivo */
const _getRoutes = () => {
  const config = _loadRoutesConfig();
  const routes = {};
  Object.keys(config.routes).forEach((page) => {
    routes[page] = config.routes[page].file;
  });
  return routes;
};

/** Obtiene el mapa de títulos page → título */
const _getTitles = () => {
  const config = _loadRoutesConfig();
  const titles = {};
  Object.keys(config.routes).forEach((page) => {
    titles[page] = config.routes[page].title;
  });
  return titles;
};

/** Obtiene el label del módulo para el breadcrumb del shellbar */
const _getModuleLabel = (page) => {
  const config = _loadRoutesConfig();
  const route = config.routes[page];
  return route ? route.module : '';
};

/**
 * doGet — Punto de entrada único de la Web App ERP.
 *
 * GAS solo permite un doGet() por proyecto. Este archivo debe ser
 * el ÚNICO que define doGet(). El doGet() del módulo EREC fue
 * renombrado a _erecDoGetPublico() y se llama desde aquí.
 */
const doGet = (e) => {
  const params = (e && e.parameter) ? e.parameter : {};

  if (params.test === 'logs') {
    try {
      const ss = Utils.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('SYS_DEBUG_LOG');
      if (!sheet) return HtmlService.createHtmlOutput('No logs sheet found.');
      const data = sheet.getDataRange().getValues();
      let html = '<!DOCTYPE html><html><head><title>System Logs</title><style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;}pre{white-space:pre-wrap;background:#f5f5f5;padding:8px;border-radius:4px;}</style></head><body><h1>System Logs</h1><table border="1"><thead><tr><th>Timestamp</th><th>Message</th><th>Stack</th></tr></thead><tbody>';
      for (let i = data.length - 1; i >= 1; i--) {
        html += `<tr><td>${data[i][0]}</td><td><strong>${data[i][1]}</strong></td><td><pre>${data[i][2]}</pre></td></tr>`;
      }
      html += '</tbody></table></body></html>';
      return HtmlService.createHtmlOutput(html);
    } catch (err) {
      return HtmlService.createHtmlOutput(`Error reading logs: ${err.message}`);
    }
  }

  if (params.test === 'clear') {
    try {
      const ss = Utils.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('SYS_DEBUG_LOG');
      if (sheet) ss.deleteSheet(sheet);
      return HtmlService.createHtmlOutput('Logs cleared.');
    } catch (err) {
      return HtmlService.createHtmlOutput(`Error clearing logs: ${err.message}`);
    }
  }

  if (params.test === 'true') {
    try {
      const res = include('00_portal/ui/PORTAL_Head');
      return HtmlService.createHtmlOutput(`Success: ${res}`);
    } catch (err) {
      writeLog('doGet test error', `${err.message}\n${err.stack}`);
      return HtmlService.createHtmlOutput(`Error: ${err.message}<br><pre>${err.stack}</pre>`);
    }
  }

  // LOG de diagnóstico — ver en Apps Script > Ejecuciones
  Logger.log(`[AppRouter.doGet] params: ${JSON.stringify(params)}`);

  // ── Rutas públicas de candidatos EREC ────────────────────────────
  if (params.vacante || params.token) {
    Logger.log('[AppRouter.doGet] → ruta pública EREC');
    return _erecDoGetPublico(e);
  }

  // ── Rutas internas del ERP ────────────────────────────────────────
  const page = (params.page || 'launchpad').toLowerCase().trim();
  Logger.log(`[AppRouter.doGet] → página interna: ${page}`);
  const APP_ROUTES = _getRoutes();
  const file = APP_ROUTES[page];

  if (!file) {
    return _appPaginaError(
      'Página no encontrada',
      `La ruta "${_escapeHtml(page)}" no existe en el ERP.`,
      '?page=launchpad'
    );
  }

  try {
    const user = _getUser();
    const tpl = HtmlService.createTemplateFromFile(file);

    // Determinar modo debug (prioridad: URL param > global Config)
    let isDebug = (typeof Config !== 'undefined') ? Config.DEBUG_MODE : false;
    if (params.debug === 'true') isDebug = true;
    if (params.debug === 'false') isDebug = false;

    // Poblar contexto global compartido para llamadas include()
    GLOBAL_CONTEXT = {
      APP_PAGE: page,
      APP_USER: user,
      APP_VERSION: (typeof Config !== 'undefined') ? Config.VERSION : '—',
      APP_ERP_VERSION: (typeof Config !== 'undefined') ? Config.VERSION : '—',
      APP_ERP_NAME: (typeof Config !== 'undefined') ? Config.ERP_NAME : 'ERP',
      APP_ERP_LOGO_URL: (typeof Config !== 'undefined') ? Config.ERP_LOGO_URL : '',
      APP_MAINTENANCE_BANNER_ACTIVE: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_ACTIVE : false,
      APP_MAINTENANCE_BANNER_MSG: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_MSG : '',
      APP_MAINTENANCE_BANNER_SEVERITY: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_SEVERITY : 'warning',
      APP_PARAMS: params,
      SHELL_MODE: 'standalone',
      SHELL_MODULE: _getModuleLabel(page),
      SHELL_USER: user,
      SHELL_FULL_HEIGHT: ['inbox', 'report_viewer', 'analytics'].includes(page),
      APP_DEBUG: isDebug
    };

    // Copiar variables al template principal
    Object.keys(GLOBAL_CONTEXT).forEach((k) => {
      tpl[k] = GLOBAL_CONTEXT[k];
    });

    const output = tpl.evaluate();
    Logger.log(`[AppRouter] Template evaluado OK: ${file}`);

    const APP_TITLES = _getTitles();
    return output
      .setTitle((APP_TITLES[page] || 'ERP'))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    Logger.log(`[AppRouter] ERROR evaluando template "${file}": ${err.message} | stack: ${err.stack}`);
    writeLog(`doGet evaluation error: ${file}`, `${err.message}\n${err.stack}`);
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
      `<p style="color:#515f6e;font-size:13px;margin-bottom:12px;">Archivo: <code>${file}</code></p>` +
      `<pre>${err.message}</pre>` +
      '<a href="?page=launchpad">← Volver al Launchpad</a>' +
      '</div></body></html>'
    ).setTitle('Error — ERP')
     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
};

// ─── Helpers privados ─────────────────────────────────────────────────────

/** Obtiene el email del usuario autenticado con fallback seguro */
const _getUser = () => {
  try {
    const email = Session.getActiveUser().getEmail();
    if (email && email.length > 0) return email;
    return Session.getEffectiveUser().getEmail();
  } catch (e) {
    return '';
  }
};

/**
 * Página de error genérica para el router.
 * No depende de ningún template para evitar recursión.
 */
const _appPaginaError = (titulo, mensaje, backUrl) => {
  const html =
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
    `<h2>${titulo}</h2>` +
    `<p>${mensaje}</p>` +
    (backUrl ? `<a href="${backUrl}">← Volver al Launchpad</a>` : '') +
    '</div></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle(`Error — ${Config.ERP_NAME}`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
};

/**
 * Expone la URL del Web App para que otros módulos puedan
 * construir links absolutos (ej. links de postulación en EREC).
 * @returns {string} URL base del Web App o '' si no está configurada
 */
const getWebAppUrl = () => {
  try {
    return PropertiesService.getScriptProperties()
      .getProperty('WEBAPP_URL') || ScriptApp.getService().getUrl();
  } catch (e) {
    return '';
  }
};

/**
 * doPost — Recibe el formulario público de candidatos EREC.
 * Solo las rutas públicas usan POST (formulario nativo HTML de postulación).
 * Las rutas internas usan google.script.run (no POST).
 */
const doPost = (e) => _erecDoPostPublico(e);

/**
 * Registra un error de sistema en la hoja de cálculo SYS_DEBUG_LOG para diagnóstico remoto.
 */
const writeLog = (message, stack) => {
  try {
    const ss = Utils.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('SYS_DEBUG_LOG');
    if (!sheet) {
      sheet = ss.insertSheet('SYS_DEBUG_LOG');
      sheet.appendRow(['Timestamp', 'Message', 'Stack']);
    }
    sheet.appendRow([new Date(), message, stack || '']);
  } catch (e) {
    Logger.log(`Fallo writeLog: ${e.message}`);
  }
};

/**
 * Retorna el contenido HTML evaluado de una vista para el enrutador SPA.
 * IMPORTANTE: Esta función NO usa safeExecute para mantener control total
 * del sobre de respuesta { ok, data } que espera el cliente SPA.
 * @param {string} page
 * @returns {{ok:boolean, data:string}|{ok:boolean, mensaje:string}}
 */
const apiGetPageHtml = (page) => {
  try {
    const user = _getUser();
    const userClean = user ? user.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous';

    const APP_ROUTES = _getRoutes();
    const file = APP_ROUTES[page];
    if (!file) {
      Logger.log(`[AppRouter.apiGetPageHtml] Página no encontrada: ${page}`);
      return { ok: false, mensaje: `Página no encontrada: ${page}` };
    }

    const version = (typeof Config !== 'undefined') ? Config.VERSION.replace(/\./g, '_') : '4_0_0';
    const cacheKey = `spa_view_${version}_${userClean}_${page}`;

    // Corregir enlaces dinámicamente para desarrollo vs producción
    const isDev = (typeof Config !== 'undefined') ? Config.DEBUG_MODE : false;

    // Determinar si estamos en modo debug
    const isDebug = (typeof Config !== 'undefined') ? Config.DEBUG_MODE : false;

    // Capa 1: Servidor - Recuperar de caché si no es modo debug
    if (!isDebug) {
      try {
        const cachedHtml = CacheService_ERP.get(cacheKey);
        if (cachedHtml && typeof cachedHtml === 'string' && cachedHtml.length > 10) {
          Logger.log(`[AppRouter] Cache HIT para: ${page} (${cachedHtml.length} chars)`);
          return { ok: true, data: cachedHtml };
        }
      } catch (cacheErr) {
        Logger.log(`[AppRouter] Error leyendo caché para ${page}: ${cacheErr.message}`);
      }
    }

    Logger.log(`[AppRouter] Evaluando template: ${file}`);
    const tpl = HtmlService.createTemplateFromFile(file);

    // Poblar contexto global dinámico para que sub-plantillas tengan acceso a las variables
    GLOBAL_CONTEXT = {
      APP_PAGE: page,
      APP_USER: user,
      APP_VERSION: (typeof Config !== 'undefined') ? Config.VERSION : '—',
      APP_ERP_VERSION: (typeof Config !== 'undefined') ? Config.VERSION : '—',
      APP_ERP_NAME: (typeof Config !== 'undefined') ? Config.ERP_NAME : 'ERP',
      APP_ERP_LOGO_URL: (typeof Config !== 'undefined') ? Config.ERP_LOGO_URL : '',
      APP_MAINTENANCE_BANNER_ACTIVE: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_ACTIVE : false,
      APP_MAINTENANCE_BANNER_MSG: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_MSG : '',
      APP_MAINTENANCE_BANNER_SEVERITY: (typeof Config !== 'undefined') ? Config.MAINTENANCE_BANNER_SEVERITY : 'warning',
      APP_PARAMS: {},
      SHELL_MODE: 'spa',
      SHELL_MODULE: _getModuleLabel(page),
      SHELL_USER: user,
      SHELL_FULL_HEIGHT: ['inbox', 'report_viewer', 'analytics'].includes(page),
      APP_DEBUG: isDebug
    };

    // Copiar variables de contexto al template principal
    Object.keys(GLOBAL_CONTEXT).forEach((k) => {
      tpl[k] = GLOBAL_CONTEXT[k];
    });

    const html = tpl.evaluate().getContent();
    Logger.log(`[AppRouter] Template OK: ${file} | tamaño: ${html.length} chars`);

    // Guardar en la caché por 2 horas para cargas rápidas
    if (!isDebug) {
      try {
        CacheService_ERP.put(cacheKey, html, 7200);
      } catch (cacheWriteErr) {
        Logger.log(`[AppRouter] No se pudo guardar en caché: ${cacheWriteErr.message}`);
      }
    }

    return { ok: true, data: html };

  } catch (err) {
    Logger.log(`[AppRouter.apiGetPageHtml] ERROR para "${page}": ${err.message} | ${err.stack}`);
    writeLog(`apiGetPageHtml error: ${page}`, `${err.message}\n${err.stack}`);
    return { ok: false, mensaje: err.message || 'Error al cargar la vista.' };
  }
};
