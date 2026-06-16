/**
 * EREC_Vacante_Controller
 * ─────────────────────────────────────────────────────────────────────────
 * Punto de entrada para el módulo E-Recruiting.
 *
 * doGet / doPost del módulo EREC reemplazan los del antiguo RRHH_Postulante.
 * El formulario público ahora es consciente de la vacante a la que aplica.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ─── WEB APP (formulario público) ────────────────────────────────────────────

/**
 * GET — Candidato abre el link de postulación.
 * Parámetros aceptados:
 *   ?vacante=ID&token=UUID  → modo individual (token validado)
 *   ?vacante=ID             → modo público (cualquiera puede postular)
 */
function doGet(e) {
  var params    = (e && e.parameter) ? e.parameter : {};
  var idVacante = params.vacante || '';
  var token     = params.token   || '';

  // Validar token individual si existe
  if (token) {
    var link = ErecLinkRepo.findByToken(token);
    if (!link) return _erecPaginaError('Link inválido', 'Este link no es válido.');
    if (link.estado === 'USADO') {
      return _erecPaginaError('Link ya utilizado', 'Este link fue utilizado anteriormente. Solo puede usarse una vez.');
    }
    if (new Date() > new Date(link.expira_at)) {
      return _erecPaginaError('Link expirado', 'Este link ha expirado. Contacta al reclutador para recibir uno nuevo.');
    }
    if (!idVacante) idVacante = String(link.id_vacante || '');
  }

  if (!idVacante) {
    return _erecPaginaError('Link incompleto', 'Este link no especifica una posición vacante.');
  }

  // Cargar datos de la vacante para el formulario
  var vacante = VacanteRepo.findById(idVacante);
  if (!vacante) return _erecPaginaError('Vacante no encontrada', 'La posición a la que intentas postularte no existe.');
  if (vacante.estado !== 'ABIERTA' && vacante.estado !== 'EN_PROCESO') {
    return _erecPaginaError('Vacante cerrada', 'Esta posición ya no está recibiendo postulaciones.');
  }

  // Resolver label del documento según el país de la empresa
  var labelDoc = Customizing.getLabelDocumento(vacante.id_empresa);

  var tpl = HtmlService.createTemplateFromFile('09_erec/vacante/EREC_FormPostulante');
  tpl.erpName         = Config.ERP_NAME;
  tpl.token           = token;
  tpl.modo            = token ? 'INDIVIDUAL' : 'PUBLICO';
  tpl.idVacante       = String(idVacante);
  tpl.vacanteData     = JSON.stringify(VacanteDTO.toPublic(vacante));
  tpl.labelDocumento  = labelDoc;
  // Reusar el objeto link ya validado — evita un segundo read a la Sheet
  tpl.nombreCandidato = (token && link) ? (link.nombre_destino || '') : '';

  return tpl.evaluate()
    .setTitle(vacante.titulo + ' — ' + Config.ERP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * POST — Candidato envía el formulario completado.
 * Usa form nativo (application/x-www-form-urlencoded) via e.parameter.
 * Retorna una página HTML de resultado — el browser la muestra directamente.
 */
function doPost(e) {
  var params = {};

  // e.parameter funciona para form nativo urlencoded
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    params = e.parameter;
  }
  // Fallback: JSON body (llamadas programáticas / fetch)
  else if (e && e.postData && e.postData.contents) {
    try { params = JSON.parse(e.postData.contents); } catch(err) {}
  }

  Logger.log('[EREC doPost] params recibidos: ' + JSON.stringify(Object.keys(params)));
  Logger.log('[EREC doPost] postData type: ' + (e && e.postData ? e.postData.type : 'none'));
  Logger.log('[EREC doPost] raw e.parameter: ' + JSON.stringify(e ? e.parameter : null));

  var token     = String(params.token      || '').trim();
  var modo      = String(params.modo       || 'PUBLICO').trim();
  var idVacante = String(params.id_vacante || '').trim();

  // Validar token en modo individual
  if (modo === 'INDIVIDUAL' && token) {
    var link = ErecLinkRepo.findByToken(token);
    if (!link || link.estado === 'USADO' || new Date() > new Date(link.expira_at)) {
      return _erecPaginaError('Token inválido o expirado', 'Este link ya no es válido. Contacta al reclutador.');
    }
  }

  // Subir CV si viene adjunto como Base64
  var linkCv = '';
  if (params.cv_base64 && params.cv_nombre) {
    try {
      var vacante    = VacanteRepo.findById(idVacante);
      var labelDoc   = vacante ? Customizing.getLabelDocumento(vacante.id_empresa) : 'ID';
      var codVacante = vacante ? vacante.codigo : '';
      linkCv = DriveService.subirCVPostulante(
        params.cv_base64,
        params.cv_nombre,
        params.cv_mime || 'application/octet-stream',
        params.nombre_completo,
        params.documento_identidad,
        labelDoc,
        codVacante
      );
      Logger.log('[EREC doPost] CV subido a Drive: ' + linkCv);
    } catch(driveErr) {
      Logger.log('[EREC doPost] Falló subida de CV (no bloquea): ' + driveErr.message);
    }
  }

  // Construir DTO y registrar postulante
  var dto = {
    id_vacante:          idVacante,
    nombre_completo:     String(params.nombre_completo      || '').trim(),
    documento_identidad: String(params.documento_identidad  || '').trim(),
    telefono:            String(params.telefono             || '').trim(),
    email:               String(params.email                || '').trim().toLowerCase(),
    notas:               String(params.notas                || '').trim(),
    link_cv:             linkCv,
    fuente:              modo === 'INDIVIDUAL' ? 'TOKEN_INDIVIDUAL' : 'LINK_PUBLICO',
  };

  var resultado = ErecPostulanteUseCases.registrar(dto);
  Logger.log('[EREC doPost] resultado: ' + JSON.stringify(resultado));

  // Marcar token como usado si fue exitoso
  if (resultado.ok && modo === 'INDIVIDUAL' && token) {
    ErecLinkRepo.marcarUsado(token);
  }

  // Retornar página HTML de resultado (form nativo no puede recibir JSON)
  if (resultado.ok) {
    return _erecPaginaExito(
      resultado.mensaje || '¡Postulación recibida!',
      dto.nombre_completo
    );
  } else {
    var errMsg = resultado.errores ? resultado.errores.join(' ') : 'Error al procesar tu postulación.';
    return _erecPaginaError('No pudimos procesar tu postulación', errMsg);
  }
}


// ─── APIs INTERNAS (menú del ERP) ────────────────────────────────────────────

function abrirFormVacante() {
  var html = HtmlService.createTemplateFromFile('09_erec/vacante/EREC_FormVacante')
    .evaluate()
    .setWidth(620)
    .setHeight(680);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Nueva Vacante de Reclutamiento');
}

function apiRegistrarPostulante(payload) {
  return safeExecute(function() {
    var token     = String(payload.token      || '').trim();
    var modo      = String(payload.modo       || 'PUBLICO').trim();
    var idVacante = String(payload.id_vacante || '').trim();

    // Validar token en modo individual
    if (modo === 'INDIVIDUAL' && token) {
      var link = ErecLinkRepo.findByToken(token);
      if (!link || link.estado === 'USADO' || new Date() > new Date(link.expira_at)) {
        return { ok: false, errores: ['Token inválido o expirado.'] };
      }
    }

    // Subir CV si viene adjunto como Base64
    var linkCv = '';
    if (payload.cv_base64 && payload.cv_nombre) {
      try {
        var vacante    = VacanteRepo.findById(idVacante);
        var labelDoc   = vacante ? Customizing.getLabelDocumento(vacante.id_empresa) : 'ID';
        var codVacante = vacante ? vacante.codigo : '';
        linkCv = DriveService.subirCVPostulante(
          payload.cv_base64,
          payload.cv_nombre,
          payload.cv_mime || 'application/octet-stream',
          payload.nombre_completo,
          payload.documento_identidad,
          labelDoc,
          codVacante
        );
        Logger.log('[EREC apiRegistrarPostulante] CV subido: ' + linkCv);
      } catch(driveErr) {
        Logger.log('[EREC apiRegistrarPostulante] CV falló (no bloquea): ' + driveErr.message);
      }
    }

    var dto = {
      id_vacante:          idVacante,
      nombre_completo:     String(payload.nombre_completo      || '').trim(),
      documento_identidad: String(payload.documento_identidad  || '').trim(),
      telefono:            String(payload.telefono             || '').trim(),
      email:               String(payload.email                || '').trim().toLowerCase(),
      notas:               String(payload.notas                || '').trim(),
      link_cv:             linkCv,
      fuente:              modo === 'INDIVIDUAL' ? 'TOKEN_INDIVIDUAL' : 'LINK_PUBLICO',
    };

    var resultado = ErecPostulanteUseCases.registrar(dto);

    if (resultado.ok && modo === 'INDIVIDUAL' && token) {
      ErecLinkRepo.marcarUsado(token);
    }

    Logger.log('[EREC apiRegistrarPostulante] ' + JSON.stringify(resultado));
    return resultado;
  }, 'EREC.registrarPostulante');
}

function apiGetCatalogosVacante() {
  try {
    // Diagnóstico: verificar que la Sheet es accesible
    var ss = Utils.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('[apiGetCatalogosVacante] ERROR: getActiveSpreadsheet retornó null');
      return { ok: false, empresas: [], departamentos: [], roles: [], error: 'Sheet no accesible' };
    }
    Logger.log('[apiGetCatalogosVacante] Sheet OK: ' + ss.getName());

    var shEmp = ss.getSheetByName('CAT_Empresas');
    Logger.log('[apiGetCatalogosVacante] CAT_Empresas sheet: ' + (shEmp ? 'OK filas=' + shEmp.getLastRow() : 'NULL'));

    var empresas      = DataAdapter.findAll('CAT_Empresas')      || [];
    var departamentos = DataAdapter.findAll('CAT_Departamentos') || [];
    var roles         = DataAdapter.findAll('CAT_Roles')         || [];

    Logger.log('[apiGetCatalogosVacante] resultados: emp=' + empresas.length + ' dep=' + departamentos.length + ' roles=' + roles.length);

    return { ok: true, empresas: empresas, departamentos: departamentos, roles: roles };
  } catch(e) {
    Logger.log('[apiGetCatalogosVacante ERROR] ' + e.message + ' | stack: ' + e.stack);
    return { ok: false, empresas: [], departamentos: [], roles: [], error: e.message };
  }
}

function apiCrearVacante(formData) {
  return safeExecute(function() {
    return VacanteUseCases.crear(VacanteDTO.fromForm(formData));
  }, 'EREC.crearVacante');
}

function apiCambiarEstadoVacante(idVacante, nuevoEstado) {
  return safeExecute(function() {
    return VacanteUseCases.cambiarEstado(idVacante, nuevoEstado);
  }, 'EREC.cambiarEstado');
}

function apiGenerarLinkVacante(idVacante, modo, emailDestino, nombreDestino) {
  return safeExecute(function() {
    return VacanteUseCases.generarLink(idVacante, modo, emailDestino, nombreDestino);
  }, 'EREC.generarLink');
}

function apiGetPipelineVacante(idVacante) {
  return safeExecute(function() {
    return ErecPostulanteUseCases.getPipelineVacante(idVacante);
  }, 'EREC.getPipeline');
}

function apiAvanzarEtapaPostulante(idPostulante, nuevaEtapa) {
  return safeExecute(function() {
    return ErecPostulanteUseCases.avanzarEtapa(idPostulante, nuevaEtapa);
  }, 'EREC.avanzarEtapa');
}

function apiRegistrarEntrevista(formData) {
  return safeExecute(function() {
    return ErecEntrevistaUseCases.registrar(formData);
  }, 'EREC.registrarEntrevista');
}

function apiGetHistorialEntrevistas(idPostulante) {
  return safeExecute(function() {
    return ErecEntrevistaUseCases.getHistorial(idPostulante);
  }, 'EREC.getHistorial');
}

function abrirDialogoLinksVacante() {
  var vacantes = VacanteRepo.findAbiertas();
  if (vacantes.length === 0) {
    SpreadsheetApp.getUi().alert('Sin vacantes', 'No hay vacantes abiertas. Crea una primero.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var opcionesVacante = vacantes.map(function(v) {
    return '<option value="' + v.id_vacante + '">' + v.codigo + ' — ' + v.titulo + '</option>';
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
    '.err{background:#fdf2f2;color:#bb0000;border-left:4px solid #bb0000;}</style></head><body>' +
    '<h3 style="margin:0 0 12px;font-size:16px;">🔗 Generar Link de Postulación</h3>' +
    '<label>Vacante</label><select id="vacante">' + opcionesVacante + '</select>' +
    '<div class="tabs" style="margin-top:16px;">' +
    '<div class="tab active" id="tabInd" onclick="setModo(\'INDIVIDUAL\')">👤 Individual</div>' +
    '<div class="tab" id="tabPub" onclick="setModo(\'PUBLICO\')">🌐 Público</div></div>' +
    '<div id="panelInd">' +
    '<label>Nombre del Candidato</label><input type="text" id="nombre" placeholder="María García">' +
    '<label>Email del Candidato</label><input type="email" id="email" placeholder="maria@mail.com">' +
    '</div>' +
    '<div id="panelPub" style="display:none;"><p style="color:#888;font-size:12px;margin-top:8px;">Link abierto para publicar en redes o landing page.</p></div>' +
    '<button id="btn" onclick="generar()">Generar Link</button>' +
    '<div id="msg"></div>' +
    '<script>var modo="INDIVIDUAL";' +
    'function setModo(m){modo=m;' +
    'document.getElementById("tabInd").className="tab"+(m==="INDIVIDUAL"?" active":"");' +
    'document.getElementById("tabPub").className="tab"+(m==="PUBLICO"?" active":"");' +
    'document.getElementById("panelInd").style.display=m==="INDIVIDUAL"?"block":"none";' +
    'document.getElementById("panelPub").style.display=m==="PUBLICO"?"block":"none";}' +
    'function generar(){var btn=document.getElementById("btn");btn.disabled=true;btn.textContent="Generando...";' +
    'var idVacante=document.getElementById("vacante").value;' +
    'var nombre=modo==="INDIVIDUAL"?document.getElementById("nombre").value.trim():"";' +
    'var email=modo==="INDIVIDUAL"?document.getElementById("email").value.trim():"";' +
    'if(modo==="INDIVIDUAL"&&(!nombre||!email)){showMsg("err","Nombre y email son requeridos.");btn.disabled=false;btn.textContent="Generar Link";return;}' +
    'google.script.run.withSuccessHandler(function(r){btn.disabled=false;btn.textContent="Generar Link";' +
    'if(r.ok){showMsg("ok","✔ Link generado"+(modo==="INDIVIDUAL"?" y enviado por email":"")+":\\n\\n"+r.link);}' +
    'else{showMsg("err",(r.errores||[r.error]).join("\\n"));}})' +
    '.withFailureHandler(function(e){btn.disabled=false;btn.textContent="Generar Link";showMsg("err","Error: "+e.message);})' +
    '.apiGenerarLinkVacante(idVacante,modo,email,nombre);}' +
    'function showMsg(t,x){var el=document.getElementById("msg");el.className=t;el.innerText=x;el.style.display="block";}<\/script>' +
    '</body></html>'
  ).setWidth(440).setHeight(440);

  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Generar Link de Postulación');
}


// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _erecPaginaExito(mensaje, nombre) {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;' +
    'min-height:100vh;margin:0;background:#f5f6f7;}' +
    '.card{background:#fff;border-radius:8px;padding:40px;max-width:440px;text-align:center;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.08);}' +
    '.icon{font-size:56px;margin-bottom:16px;}' +
    'h2{color:#107e3e;margin:0 0 12px;}p{color:#515f6e;line-height:1.6;}</style></head>' +
    '<body><div class="card">' +
    '<div class="icon">🎉</div>' +
    '<h2>¡Postulación Recibida!</h2>' +
    '<p>' + (mensaje || 'Hemos recibido tu información correctamente.') + '</p>' +
    '<p style="margin-top:16px;font-size:13px;">Pronto nos pondremos en contacto contigo.</p>' +
    '</div></body></html>'
  ).setTitle('Postulación Enviada — ' + Config.ERP_NAME);
}

function _erecPaginaError(titulo, mensaje) {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;' +
    'min-height:100vh;margin:0;background:#f5f6f7;}' +
    '.card{background:#fff;border-radius:8px;padding:40px;max-width:420px;text-align:center;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.08);}' +
    'h2{color:#bb0000;margin:0 0 12px;}p{color:#515f6e;line-height:1.6;}</style></head>' +
    '<body><div class="card"><h2>⚠️ ' + titulo + '</h2><p>' + mensaje + '</p></div></body></html>'
  ).setTitle('Error — ' + Config.ERP_NAME);
}

function _erecJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
