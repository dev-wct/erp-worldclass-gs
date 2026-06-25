/**
 * RRHH_Postulante_Controller
 * ─────────────────────────────────────────────────────────────────────────
 * MODOS DE POSTULACIÓN:
 *
 *  MODO A — Link individual (token personal)
 *   Reclutador genera link para un candidato específico → le llega email personal
 *   → formulario muestra su nombre → token se marca USADO al enviar (1 solo uso)
 *
 *  MODO B — Link público (landing page / redes sociales)
 *   Reclutador genera link público asociado a una campaña → lo publica donde quiera
 *   → cualquier persona puede postularse → sin límite de usos, sin expiración por uso
 *
 *  En ambos modos el formulario HTML es el mismo (RRHH_FormPostulante.html).
 *  doGet detecta el modo por el parámetro ?token= (individual) o ?campana= (público).
 * ─────────────────────────────────────────────────────────────────────────
 */

// ─── WEB APP ──────────────────────────────────────────────────────────────────

/**
 * GET — El candidato abre el link.
 * Dos rutas:
 *   ?token=UUID   → modo individual, valida token
 *   ?campana=ID   → modo público, solo valida que la campaña exista y esté activa
 *   (nada)        → link público sin campaña (formulario abierto)
 */
/**
 * @deprecated — Este doGet fue reemplazado por CORE_AppRouter.doGet().
 * Renombrado para evitar conflicto. El formulario legacy de RRHH Postulantes
 * ya fue reemplazado por el módulo EREC (_erecDoGetPublico).
 * Mantener por compatibilidad — no eliminar hasta migración completa.
 */
function _rrhhDoGetPostulanteLegacy(e) {
  var params   = (e && e.parameter) ? e.parameter : {};
  var token    = params.token    || '';
  var idCampana = params.campana || '';

  // ── Modo Individual ──
  if (token) {
    var validacion = PostulanteTokenService.validar(token);
    if (!validacion.valido) {
      return _paginaError('Link inválido o expirado', validacion.razon);
    }
    return _renderForm({
      token:         token,
      modo:          'INDIVIDUAL',
      idCampana:     validacion.id_campana || '',
      nombreCandidato: validacion.nombre_destino || '',
    });
  }

  // ── Modo Público ──
  return _renderForm({
    token:         '',
    modo:          'PUBLICO',
    idCampana:     idCampana,
    nombreCandidato: '',
  });
}

/**
 * POST — El candidato envía el formulario.
 * GAS Web App recibe form nativo (application/x-www-form-urlencoded) en e.parameter.
 * Es el método más confiable en GAS — sin dependencias de fetch ni CORS.
 */
/** @deprecated — reemplazado por _erecDoPostPublico en EREC_Vacante_Controller.js */
function _rrhhDoPostPostulanteLegacy(e) {

  // Prioridad 1: JSON en el body (fetch moderno)
  try {
    if (e && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }
  } catch(err) { /* continuar con fallback */ }

  // Prioridad 2: form nativo urlencoded
  if (!params.nombre_completo && e && e.parameter) {
    params = e.parameter;
  }

  var token     = String(params.token     || '').trim();
  var modo      = String(params.modo      || 'PUBLICO').trim();
  var idCampana = String(params.id_campana || '').trim();

  // Validación según modo
  if (modo === 'INDIVIDUAL') {
    if (!token) return _jsonResponse({ ok: false, errores: ['Token requerido.'] });
    var validacion = PostulanteTokenService.validar(token);
    if (!validacion.valido) return _jsonResponse({ ok: false, errores: [validacion.razon] });
    if (!idCampana) idCampana = String(validacion.id_campana || '');
  }

  // Construir DTO, registrar y responder
  var dto = PostulanteDTO.fromWebApp(params, token);
  if (idCampana) dto.id_campana = idCampana;

  // Subir CV a Drive si viene adjunto como base64
  if (params.cv_base64 && params.cv_nombre) {
    try {
      // Resolver el label del documento de identidad según el país de la empresa
      var labelDoc = 'ID';
      try {
        if (idCampana) {
          var campana = DataAdapter.findById('Campanas', idCampana);
          if (campana) {
            // Campañas no tienen empresa directa — usar empresa 1 como default
            // TODO: agregar id_empresa a Campanas en próxima iteración
          }
        }
        labelDoc = Customizing.getFallback().label_documento;
      } catch(e) {}

      var cvLink = DriveService.subirCVPostulante(
        params.cv_base64,
        params.cv_nombre,
        params.cv_mime || 'application/octet-stream',
        dto.nombre_completo,
        dto.dpi,
        labelDoc
      );
      dto.link_cv = cvLink;
    } catch(driveErr) {
      Logger.log('[doPost] Falló subida de CV: ' + driveErr.message);
      // No bloquea el registro — el CV se puede solicitar después
    }
  }

  var resultado = PostulanteUseCases.registrar(dto);

  if (resultado.ok && modo === 'INDIVIDUAL' && token) {
    PostulanteTokenService.marcarUsado(token);
  }

  Logger.log('[doPost] resultado: ' + JSON.stringify(resultado));
  return _jsonResponse(resultado);
}


// ─── SERVICIO DE TOKENS ───────────────────────────────────────────────────────

var PostulanteTokenService = (function() {
  var SHEET_NAME  = 'PostulantesTokens';
  var EXPIRY_DAYS = 7;

  // Índices (base 1 para getRange, base 0 para array getValue)
  var COL = {
    id_token:        1,
    token:           2,
    link_postulacion:3,
    modo:            4,
    id_campana:      5,
    email_destino:   6,
    nombre_destino:  7,
    creado_por:      8,
    creado_at:       9,
    expira_at:       10,
    estado:          11,
    usado_at:        12,
  };

  function _getSheet() {
    return Utils.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  }

  function _getWebAppUrl() {
    try {
      return PropertiesService.getScriptProperties().getProperty('WEBAPP_URL') || '';
    } catch(e) { return ''; }
  }

  function _nextId(sh) {
    var last = sh.getLastRow();
    if (last <= 1) return 1;
    var val = sh.getRange(last, COL.id_token).getValue();
    return (parseInt(val) || 0) + 1;
  }

  /**
   * Genera un token INDIVIDUAL para un candidato específico.
   */
  function generar(emailDestino, nombreDestino, idCampana) {
    var sh = _getSheet();
    if (!sh) throw new Error('Tabla PostulantesTokens no existe. Ejecuta Sincronizar RRHH primero.');

    var token  = Utilities.getUuid();
    var ahora  = new Date();
    var expira = new Date(ahora.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    var webAppUrl = _getWebAppUrl();
    var link = webAppUrl ? (webAppUrl + '?token=' + token) : '';

    var creadoPor = '';
    try { creadoPor = Session.getActiveUser().getEmail(); } catch(e) {}

    sh.appendRow([
      _nextId(sh), token, link, 'INDIVIDUAL', idCampana || '',
      emailDestino, nombreDestino, creadoPor,
      ahora, expira, 'PENDIENTE', '',
    ]);

    var linkMostrar = link || '(Configura WEBAPP_URL) token=' + token;

    // Email al candidato con HTML elegante
    try {
      var htmlEmail =
        '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">' +
        '<h2 style="color:#1d2d3d;margin:0 0 8px;">Hola ' + (nombreDestino || 'candidato') + ' 👋</h2>' +
        '<p style="color:#515f6e;line-height:1.6;">Te invitamos a completar tu proceso de postulación en <strong>' + Config.ERP_NAME + '</strong>.</p>' +
        '<div style="margin:24px 0;text-align:center;">' +
        '<a href="' + linkMostrar + '" style="background:#0a6ed1;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Completar mi Postulación →</a>' +
        '</div>' +
        '<p style="color:#888;font-size:12px;">Este link es válido por ' + EXPIRY_DAYS + ' días y es de uso único.<br>' +
        'Si no solicitaste esto, ignora este mensaje.</p>' +
        '<hr style="border:none;border-top:1px solid #eee;margin:20px 0;">' +
        '<p style="color:#aaa;font-size:11px;">— Equipo de Reclutamiento, ' + Config.ERP_NAME + '</p>' +
        '</div>';

      EmailService.send(
        emailDestino,
        'Completa tu postulación — ' + Config.ERP_NAME,
        'Hola ' + (nombreDestino || '') + ', completa tu postulación: ' + linkMostrar,
        htmlEmail
      );
    } catch(emailErr) {
      Logger.log('[Token] Email falló: ' + emailErr.message);
    }

    return { ok: true, token: token, link: linkMostrar };
  }

  /**
   * Genera un link PÚBLICO asociado a una campaña.
   * Sin expiración por uso — puede ser usado por múltiples personas.
   */
  function generarPublico(idCampana, nombreCampana) {
    var sh = _getSheet();
    if (!sh) throw new Error('Tabla PostulantesTokens no existe. Ejecuta Sincronizar RRHH primero.');

    // Para link público usamos un token fijo que identifica la campaña
    var token = 'pub_' + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
    var webAppUrl = _getWebAppUrl();
    var link = webAppUrl ? (webAppUrl + '?campana=' + (idCampana || '') + '&src=' + token) : '';

    var creadoPor = '';
    try { creadoPor = Session.getActiveUser().getEmail(); } catch(e) {}

    var ahora = new Date();
    sh.appendRow([
      _nextId(sh), token, link, 'PUBLICO', idCampana || '',
      '', nombreCampana || 'Link Público', creadoPor,
      ahora, new Date(ahora.getTime() + 365 * 24 * 60 * 60 * 1000), // expira en 1 año
      'PENDIENTE', '',
    ]);

    return { ok: true, token: token, link: link || '(Configura WEBAPP_URL)' };
  }

  /**
   * Valida un token INDIVIDUAL.
   */
  function validar(token) {
    if (!token) return { valido: false, razon: 'Token no proporcionado.' };
    var sh = _getSheet();
    if (!sh) return { valido: false, razon: 'Sistema en mantenimiento.' };

    var data  = sh.getDataRange().getValues();
    var ahora = new Date();

    for (var i = 1; i < data.length; i++) {
      var fila = data[i];
      if (String(fila[COL.token - 1]) !== String(token)) continue;

      var estado = String(fila[COL.estado - 1]).toUpperCase();
      if (estado === 'USADO') {
        return { valido: false, razon: 'Este link ya fue utilizado. Solo puede usarse una vez.' };
      }
      var expira = new Date(fila[COL.expira_at - 1]);
      if (ahora > expira) {
        return { valido: false, razon: 'Este link expiró. Contacta al reclutador para recibir uno nuevo.' };
      }
      return {
        valido:         true,
        fila:           i + 1,
        nombre_destino: fila[COL.nombre_destino - 1],
        email_destino:  fila[COL.email_destino  - 1],
        id_campana:     fila[COL.id_campana     - 1],
      };
    }
    return { valido: false, razon: 'Link no encontrado o inválido.' };
  }

  function marcarUsado(token) {
    var sh   = _getSheet();
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.token - 1]) === String(token)) {
        sh.getRange(i + 1, COL.estado).setValue('USADO');
        sh.getRange(i + 1, COL.usado_at).setValue(new Date());
        return;
      }
    }
  }

  return { generar: generar, generarPublico: generarPublico, validar: validar, marcarUsado: marcarUsado };
})();


// ─── APIs INTERNAS ────────────────────────────────────────────────────────────

function abrirDialogoGenerarLink() {
  // Cargar campañas activas para el selector
  var campanas = [];
  try {
    campanas = DataAdapter.findAll('Campanas', { estado: 'ACTIVA' });
  } catch(e) {}

  var opcionesCampana = '<option value="">— Sin campaña —</option>' +
    campanas.map(function(c) {
      return '<option value="' + c.id_campana + '">' + c.nombre + '</option>';
    }).join('');

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8">' +
    '<style>body{font-family:system-ui,sans-serif;padding:20px;font-size:14px;}' +
    'label{display:block;margin-top:12px;font-weight:500;color:#515f6e;}' +
    'input,select{width:100%;padding:8px 10px;margin-top:4px;border:1px solid #d9d9d9;border-radius:4px;font-size:14px;box-sizing:border-box;}' +
    '.tabs{display:flex;gap:8px;margin-bottom:16px;}' +
    '.tab{flex:1;padding:8px;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;text-align:center;font-size:13px;background:#f5f6f7;}' +
    '.tab.active{background:#0a6ed1;color:#fff;border-color:#0a6ed1;}' +
    'button{margin-top:16px;padding:10px 20px;background:#0a6ed1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;width:100%;}' +
    'button:disabled{opacity:0.6;}' +
    '#msg{margin-top:12px;padding:10px;border-radius:4px;display:none;word-break:break-all;line-height:1.5;}' +
    '.ok{background:#eef7f2;color:#107e3e;border-left:4px solid #107e3e;}' +
    '.err{background:#fdf2f2;color:#bb0000;border-left:4px solid #bb0000;}' +
    '</style></head><body>' +
    '<h3 style="margin:0 0 12px;font-size:16px;">🔗 Generar Link de Postulación</h3>' +
    '<div class="tabs">' +
    '<div class="tab active" id="tabInd" onclick="setModo(\'INDIVIDUAL\')">👤 Individual</div>' +
    '<div class="tab" id="tabPub" onclick="setModo(\'PUBLICO\')">🌐 Público / Landing</div>' +
    '</div>' +
    '<div id="panelInd">' +
    '<label>Nombre del Candidato</label><input type="text" id="nombre" placeholder="Ej. María García">' +
    '<label>Email del Candidato</label><input type="email" id="email" placeholder="maria@mail.com">' +
    '<label>Campaña (opcional)</label><select id="campanaInd">' + opcionesCampana + '</select>' +
    '</div>' +
    '<div id="panelPub" style="display:none;">' +
    '<label>Campaña asociada</label><select id="campanaPub">' + opcionesCampana + '</select>' +
    '<p style="color:#888;font-size:12px;margin-top:8px;">Este link puede publicarse en redes, landing page o enviarse a múltiples personas.</p>' +
    '</div>' +
    '<button id="btn" onclick="generar()">Generar Link</button>' +
    '<div id="msg"></div>' +
    '<script>' +
    'var modo="INDIVIDUAL";' +
    'function setModo(m){' +
    '  modo=m;' +
    '  document.getElementById("tabInd").className="tab"+(m==="INDIVIDUAL"?" active":"");' +
    '  document.getElementById("tabPub").className="tab"+(m==="PUBLICO"?" active":"");' +
    '  document.getElementById("panelInd").style.display=m==="INDIVIDUAL"?"block":"none";' +
    '  document.getElementById("panelPub").style.display=m==="PUBLICO"?"block":"none";' +
    '}' +
    'function generar(){' +
    '  var btn=document.getElementById("btn");' +
    '  btn.disabled=true;btn.textContent="Generando...";' +
    '  if(modo==="INDIVIDUAL"){' +
    '    var nombre=document.getElementById("nombre").value.trim();' +
    '    var email=document.getElementById("email").value.trim();' +
    '    var campana=document.getElementById("campanaInd").value;' +
    '    if(!nombre||!email){showMsg("err","Nombre y email son requeridos.");btn.disabled=false;btn.textContent="Generar Link";return;}' +
    '    google.script.run.withSuccessHandler(onResult).withFailureHandler(onErr).apiGenerarLinkPostulante(nombre,email,campana);' +
    '  } else {' +
    '    var campana=document.getElementById("campanaPub").value;' +
    '    google.script.run.withSuccessHandler(onResult).withFailureHandler(onErr).apiGenerarLinkPublicoPostulante(campana);' +
    '  }' +
    '}' +
    'function onResult(r){' +
    '  document.getElementById("btn").disabled=false;document.getElementById("btn").textContent="Generar Link";' +
    '  if(r.ok){showMsg("ok","✔ Link generado"+(modo==="INDIVIDUAL"?" y enviado por email":"")+":\\n\\n"+r.link);}' +
    '  else{showMsg("err",r.error||"Error.");}' +
    '}' +
    'function onErr(e){document.getElementById("btn").disabled=false;document.getElementById("btn").textContent="Generar Link";showMsg("err","Error: "+e.message);}' +
    'function showMsg(t,x){var el=document.getElementById("msg");el.className=t;el.innerText=x;el.style.display="block";}' +
    '<\/script></body></html>'
  ).setWidth(440).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Generar Link de Postulación');
}

function apiGenerarLinkPostulante(nombreDestino, emailDestino, idCampana) {
  return safeExecute(function() {
    if (!emailDestino || !nombreDestino) return { ok: false, error: 'Nombre y email requeridos.' };
    return PostulanteTokenService.generar(emailDestino.trim(), nombreDestino.trim(), idCampana || '');
  }, 'RRHH.generarLinkPostulante');
}

function apiGenerarLinkPublicoPostulante(idCampana) {
  return safeExecute(function() {
    var nombreCampana = '';
    try {
      if (idCampana) {
        var camp = DataAdapter.findById('Campanas', idCampana);
        if (camp) nombreCampana = camp.nombre;
      }
    } catch(e) {}
    return PostulanteTokenService.generarPublico(idCampana || '', nombreCampana);
  }, 'RRHH.generarLinkPublico');
}

function abrirDialogoLinksActivos() {
  var sh = Utils.getActiveSpreadsheet().getSheetByName('PostulantesTokens');
  if (!sh || sh.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('Sin links', 'No hay links generados aún.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var data  = sh.getDataRange().getValues();
  var ahora = new Date();
  var filas = [];

  // cols (0-based): 0=id,1=token,2=link,3=modo,4=campana,5=email,6=nombre,7=creadoPor,8=creadoAt,9=expiraAt,10=estado,11=usadoAt
  for (var i = 1; i < data.length; i++) {
    var f      = data[i];
    var estado = String(f[10]).toUpperCase();
    var expira = new Date(f[9]);
    if (estado === 'PENDIENTE' && ahora > expira) {
      sh.getRange(i + 1, 11).setValue('EXPIRADO');
      estado = 'EXPIRADO';
    }
    filas.push({ nombre: f[6]||'—', email: f[5]||'—', modo: f[3]||'—',
                 link: f[2]||'', expira: expira instanceof Date && !isNaN(expira) ? expira.toLocaleDateString('es-GT') : '—',
                 estado: estado });
  }

  var rows = filas.map(function(f) {
    var color = f.estado==='PENDIENTE'?'#107e3e':(f.estado==='USADO'?'#515f6e':'#bb0000');
    var modoTag = f.modo==='PUBLICO' ? '<span style="background:#e8f4fd;color:#0a6ed1;padding:1px 5px;border-radius:3px;font-size:10px;">PÚBLICO</span>'
                                     : '<span style="background:#f3f0fd;color:#7d3c98;padding:1px 5px;border-radius:3px;font-size:10px;">INDIV.</span>';
    var linkHtml = (f.link && f.estado!=='EXPIRADO')
      ? '<a href="'+f.link+'" target="_blank" style="word-break:break-all;font-size:10px;">'+f.link+'</a>'
      : '<span style="color:#ccc;font-size:10px;">'+(f.link||'(sin URL)')+'</span>';
    return '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:7px 5px;font-weight:500;">'+f.nombre+'<br><span style="color:#888;font-size:10px;">'+f.email+'</span></td>' +
      '<td style="padding:7px 5px;">'+modoTag+'</td><td style="padding:7px 5px;">'+linkHtml+'</td>' +
      '<td style="padding:7px 5px;font-size:10px;white-space:nowrap;">'+f.expira+'</td>' +
      '<td style="padding:7px 5px;"><b style="color:'+color+';font-size:10px;">'+f.estado+'</b></td></tr>';
  }).join('');

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>body{font-family:system-ui,sans-serif;font-size:13px;padding:14px;margin:0;}table{width:100%;border-collapse:collapse;}' +
    'th{text-align:left;padding:5px;border-bottom:2px solid #d9d9d9;color:#515f6e;font-size:10px;text-transform:uppercase;}</style></head>' +
    '<body><h3 style="margin:0 0 10px;font-size:14px;">🔗 Links de Postulación</h3>' +
    '<table><thead><tr><th>Candidato/Campaña</th><th>Modo</th><th>Link</th><th>Expira</th><th>Estado</th></tr></thead>' +
    '<tbody>'+rows+'</tbody></table>' +
    '<p style="margin-top:8px;color:#aaa;font-size:10px;">Click en el link para abrirlo o copiarlo.</p>' +
    '</body></html>'
  ).setWidth(780).setHeight(440);

  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Links de Postulación');
}

function apiGetPostulantesPorEstado(estado) {
  return safeExecute(function() {
    return PostulanteUseCases.listarPorEstado(estado || 'POSTULADO');
  }, 'RRHH.getPostulantes');
}

function apiAvanzarEstadoPostulante(id, nuevoEstado) {
  return safeExecute(function() {
    return PostulanteUseCases.avanzarEstado(id, nuevoEstado);
  }, 'RRHH.avanzarEstado');
}

function apiGuardarPostulante(formData) {
  return safeExecute(function() {
    return PostulanteUseCases.registrar(PostulanteDTO.fromForm(formData));
  }, 'RRHH.guardarPostulante');
}

function abrirFormPostulante() {
  abrirDialogoGenerarLink();
}


// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _renderForm(ctx) {
  var tpl = HtmlService.createTemplateFromFile('07_hcm/postulante/RRHH_FormPostulante');
  tpl.token           = ctx.token           || '';
  tpl.modo            = ctx.modo            || 'PUBLICO';
  tpl.idCampana       = ctx.idCampana       || '';
  tpl.nombreCandidato = ctx.nombreCandidato || '';
  tpl.erpName         = Config.ERP_NAME;

  // Resolver label del documento según contexto de la campaña/empresa
  // Si no hay contexto suficiente, usar fallback neutro
  var labelDoc = Customizing.getFallback().label_documento;
  try {
    if (ctx.idEmpresa) {
      labelDoc = Customizing.getLabelDocumento(ctx.idEmpresa);
    }
  } catch(e) {}
  tpl.labelDocumento = labelDoc;

  return tpl.evaluate()
    .setTitle('Postulación — ' + Config.ERP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _paginaError(titulo, mensaje) {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f6f7;}' +
    '.card{background:#fff;border-radius:8px;padding:40px;max-width:400px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.08);}' +
    'h2{color:#bb0000;margin:0 0 12px;}p{color:#515f6e;line-height:1.6;}</style></head>' +
    '<body><div class="card"><h2>⚠️ ' + titulo + '</h2><p>' + mensaje + '</p></div></body></html>'
  ).setTitle('Error — Postulación');
}

function _jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── LEGACY ───────────────────────────────────────────────────────────────────

/** @deprecated — mantenido por compatibilidad con instalaciones que usaban Google Forms */
function onPostulanteFormSubmit(e) {
  return safeExecute(function() {
    return PostulanteUseCases.registrar(PostulanteDTO.fromGoogleFormEvent(e));
  }, 'RRHH.onPostulanteFormSubmit');
}

function instalarTriggerPostulante() {
  SpreadsheetApp.getUi().alert('Flujo Actualizado',
    'Ya no se usa Google Forms.\nUsa HCM > 🔗 Generar Link de Postulación.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}
