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
/**
 * _erecDoGetPublico
 * Formulario público de candidatos — llamado por CORE_AppRouter.doGet()
 * cuando llegan parámetros ?vacante= o ?token=
 * NO definir doGet() aquí — el único doGet() del proyecto está en CORE_AppRouter.js
 */
function _erecDoGetPublico(e) {
  var params    = (e && e.parameter) ? e.parameter : {};
  var idVacante = params.vacante || '';
  var token     = params.token   || '';

  var link = null;
  // Validar token si existe (tanto individual como público)
  if (token) {
    link = ErecLinkRepo.findByToken(token);
    if (!link) return _erecPaginaError('Link inválido', 'Este link no es válido.');
    if (link.modo === 'INDIVIDUAL' && link.estado === 'USADO') {
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

  var ctxEmp = Customizing.getContextoEmpresa(vacante.id_empresa);
  var tpl = HtmlService.createTemplateFromFile('09_erec/vacante/EREC_FormPostulante');
  tpl.erpName         = Config.ERP_NAME;
  tpl.token           = token;
  tpl.modo            = link ? link.modo : 'PUBLICO';
  tpl.idVacante       = String(idVacante);
  tpl.vacanteData     = JSON.stringify(VacanteDTO.toPublic(vacante));
  tpl.labelDocumento  = labelDoc;
  tpl.codigoIso       = ctxEmp.codigo_iso;
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
/**
 * _erecDoPostPublico
 * Recibe el formulario de postulación del candidato — llamado por CORE_AppRouter.doPost()
 */
function _erecDoPostPublico(e) {
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
  var idVacante = String(params.id_vacante || '').trim();
  var link      = token ? ErecLinkRepo.findByToken(token) : null;

  // Validar token si existe
  if (token) {
    if (!link) {
      return _erecPaginaError('Link inválido', 'Este link no es válido.');
    }
    if (link.modo === 'INDIVIDUAL' && link.estado === 'USADO') {
      return _erecPaginaError('Token inválido o expirado', 'Este link ya no es válido o ya fue utilizado.');
    }
    if (new Date() > new Date(link.expira_at)) {
      return _erecPaginaError('Token inválido o expirado', 'Este link ha expirado. Contacta al reclutador.');
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
    fuente:              (link && link.modo === 'INDIVIDUAL') ? 'TOKEN_INDIVIDUAL' : 'LINK_PUBLICO',
  };

  var resultado = ErecPostulanteUseCases.registrar(dto);
  Logger.log('[EREC doPost] resultado: ' + JSON.stringify(resultado));

  // Marcar token como usado si fue exitoso y el link es individual
  if (resultado.ok && link && link.modo === 'INDIVIDUAL') {
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
  // Modal dialog con dimensiones de aplicación web real.
  // En desktop (laptop/PC) esto se ve como una ventana flotante profesional,
  // sin nada que delate que es una hoja de cálculo por detrás.
  var html = HtmlService.createTemplateFromFile('09_erec/vacante/EREC_FormVacante')
    .evaluate()
    .setWidth(760)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

function apiRegistrarPostulante(payload) {
  return safeExecute(function() {
    var token     = String(payload.token      || '').trim();
    var idVacante = String(payload.id_vacante || '').trim();
    var link      = token ? ErecLinkRepo.findByToken(token) : null;

    // Validar token si existe
    if (token) {
      if (!link) {
        return { ok: false, errores: ['Token inválido.'] };
      }
      if (link.modo === 'INDIVIDUAL' && link.estado === 'USADO') {
        return { ok: false, errores: ['Este link ya fue utilizado y es de uso único.'] };
      }
      if (new Date() > new Date(link.expira_at)) {
        return { ok: false, errores: ['Este link ha expirado.'] };
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
      fuente:              (link && link.modo === 'INDIVIDUAL') ? 'TOKEN_INDIVIDUAL' : 'LINK_PUBLICO',
    };

    var resultado = ErecPostulanteUseCases.registrar(dto);

    if (resultado.ok && link && link.modo === 'INDIVIDUAL') {
      ErecLinkRepo.marcarUsado(token);
    }

    Logger.log('[EREC apiRegistrarPostulante] ' + JSON.stringify(resultado));
    return resultado;
  }, 'EREC.registrarPostulante');
}

function apiGetVacantesAbiertas() {
  return safeExecute(function() {
    var vacantes = VacanteRepo.findAbiertas();
    return { ok: true, vacantes: DataAdapter.sanitize(vacantes) };
  }, 'EREC.getVacantesAbiertas');
}

function apiGetLinksPostulacion() {
  return safeExecute(function() {
    var links = DataAdapter.findAll('EREC_LinksPostulacion') || [];
    return { ok: true, links: DataAdapter.sanitize(links) };
  }, 'EREC.getLinksPostulacion');
}

function apiGetCatalogosVacante() {  return safeExecute(function() {
    var empresas      = DataAdapter.findAll('CAT_Empresas')      || [];
    var departamentos = DataAdapter.findAll('CAT_Departamentos') || [];
    var roles         = DataAdapter.findAll('CAT_Roles')         || [];

    var ss = Utils.getActiveSpreadsheet();
    var shEmp = ss ? ss.getSheetByName('CAT_Empresas') : null;
    var shDep = ss ? ss.getSheetByName('CAT_Departamentos') : null;
    var headersEmp = shEmp ? shEmp.getRange(1, 1, 1, shEmp.getLastColumn()).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
    var headersDep = shDep ? shDep.getRange(1, 1, 1, shDep.getLastColumn()).getValues()[0].map(function(h) { return String(h).trim(); }) : [];

    Logger.log('[EREC] apiGetCatalogosVacante → emp=' + empresas.length +
               ' dep=' + departamentos.length + ' roles=' + roles.length);

    return {
      ok: true,
      empresas: empresas,
      departamentos: departamentos,
      roles: roles,
      headersEmp: headersEmp,
      headersDep: headersDep
    };
  }, 'EREC.getCatalogosVacante');
}

function apiCrearVacante(formData) {
  return safeExecute(function() {
    var result = VacanteUseCases.crear(VacanteDTO.fromForm(formData));
    return DataAdapter.sanitize(result);
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


// ─── DIAGNÓSTICO (ejecutar desde el editor GAS con el botón Run) ──────────────

/**
 * diagnosticarCatalogosEREC
 * ─────────────────────────────────────────────────────────────────────────
 * Muestra en un alert exactamente qué hay en CAT_Empresas, CAT_Departamentos
 * y CAT_Roles: si la hoja existe, cuántas filas tiene, los headers reales
 * y el tipo + valor de cada celda en la primera fila de datos.
 *
 * Ejecutar: Abre el editor de Apps Script → selecciona esta función → Run.
 * ─────────────────────────────────────────────────────────────────────────
 */
function diagnosticarTemplate() {
  try {
    var tpl = HtmlService.createTemplateFromFile('09_erec/vacante/EREC_FormVacante');
    tpl.APP_PAGE     = 'vacante';
    tpl.APP_USER     = 'test@test.com';
    tpl.APP_VERSION  = '4.0.0';
    tpl.APP_ERP_NAME = 'ERP Test';
    tpl.SHELL_MODE   = 'standalone';
    tpl.SHELL_MODULE = 'E-Recruiting';
    tpl.SHELL_USER   = 'test@test.com';
    var output = tpl.evaluate().getContent();
    Logger.log('LONGITUD: ' + output.length);
    Logger.log('PRIMEROS 500: ' + output.substring(0, 500));
    Logger.log('ULTIMOS 200: ' + output.substring(output.length - 200));
    SpreadsheetApp.getUi().alert('OK', 'Longitud: ' + output.length + '\n\nInicio:\n' + output.substring(0, 300), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {
    SpreadsheetApp.getUi().alert('ERROR', e.message + '\n\n' + e.stack, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function diagnosticarCatalogosEREC() {
  var ss  = Utils.getActiveSpreadsheet();
  var msg = '=== DIAGNÓSTICO CATÁLOGOS EREC ===\n\n';

  var tablas = ['CAT_Empresas', 'CAT_Departamentos', 'CAT_Roles'];

  tablas.forEach(function(tabla) {
    var sh = ss ? ss.getSheetByName(tabla) : null;

    if (!sh) {
      msg += '[❌] ' + tabla + ': HOJA NO ENCONTRADA\n\n';
      return;
    }

    var totalFilas = sh.getLastRow();
    msg += '[📋] ' + tabla + ' → ' + totalFilas + ' fila(s) total\n';

    if (totalFilas < 1) {
      msg += '   Sin filas (ni cabecera)\n\n';
      return;
    }

    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    msg += '   Headers: ' + headers.join(' | ') + '\n';

    if (totalFilas < 2) {
      msg += '   Sin filas de datos (solo cabecera)\n\n';
      return;
    }

    var primerRow = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0];
    msg += '   Fila 2 (datos + tipo):\n';
    primerRow.forEach(function(val, i) {
      var tipo = Object.prototype.toString.call(val);
      msg += '     ' + (headers[i] || 'col' + i) + ' = '
           + JSON.stringify(val) + '  [' + tipo + ']\n';
    });
    msg += '\n';
  });

  // También muestra el resultado real de DataAdapter para confirmar
  msg += '--- DataAdapter.findAll (sin filtro) ---\n';
  try {
    var emp  = DataAdapter.findAll('CAT_Empresas')      || [];
    var dep  = DataAdapter.findAll('CAT_Departamentos') || [];
    var rol  = DataAdapter.findAll('CAT_Roles')         || [];
    msg += 'CAT_Empresas      → ' + emp.length  + ' registro(s)\n';
    msg += 'CAT_Departamentos → ' + dep.length  + ' registro(s)\n';
    msg += 'CAT_Roles         → ' + rol.length  + ' registro(s)\n';
    if (emp.length > 0)  msg += 'Primer empresa:  ' + JSON.stringify(emp[0])  + '\n';
    if (dep.length > 0)  msg += 'Primer depto:    ' + JSON.stringify(dep[0])  + '\n';
    if (rol.length > 0)  msg += 'Primer rol:      ' + JSON.stringify(rol[0])  + '\n';
  } catch(e) {
    msg += 'ERROR en DataAdapter: ' + e.message + '\n';
  }

  // ── NUEVO: probar apiGetCatalogosVacante directamente ──────────────
  msg += '\n--- apiGetCatalogosVacante() directo ---\n';
  try {
    var resultado = apiGetCatalogosVacante();
    msg += 'Tipo retornado: ' + typeof resultado + '\n';
    msg += 'Es null: ' + (resultado === null) + '\n';
    msg += 'Es undefined: ' + (resultado === undefined) + '\n';
    if (resultado) {
      msg += 'ok: ' + resultado.ok + '\n';
      msg += 'empresas.length: ' + (resultado.empresas ? resultado.empresas.length : 'undefined') + '\n';
      msg += 'Raw JSON: ' + JSON.stringify(resultado).substring(0, 300) + '\n';
    }
  } catch(e) {
    msg += 'EXCEPCIÓN al llamar apiGetCatalogosVacante: ' + e.message + '\n';
    msg += 'Stack: ' + e.stack + '\n';
  }

  Logger.log(msg);
  SpreadsheetApp.getUi().alert('Diagnóstico EREC — Catálogos', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
