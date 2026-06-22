/**
 * EREC — Entrypoint
 * Registra el submenú del módulo E-Recruiting en el menú principal del ERP.
 * Se fusiona con onOpen() del entrypoint raíz en tiempo de compilación GAS.
 */

function apiMigrarEREC() {
  return safeExecute(function() {
    EREC_Setup.syncAndSeed();
    return { ok: true, mensaje: '✔ EREC sincronizado correctamente.' };
  }, 'apiMigrarEREC');
}

/**
 * Muestra los links generados para todas las vacantes.
 * Reemplaza abrirDialogoLinksActivos del módulo RRHH legacy.
 */
function abrirDialogoVerLinksEREC() {
  var sh = Utils.getActiveSpreadsheet().getSheetByName('EREC_LinksPostulacion');
  if (!sh || sh.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('Sin links', 'No hay links generados aún. Crea una vacante primero.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var data    = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues()
    : [];

  var idxToken    = headers.indexOf('token');
  var idxLink     = headers.indexOf('link_url');
  var idxModo     = headers.indexOf('modo');
  var idxVacante  = headers.indexOf('id_vacante');
  var idxNombre   = headers.indexOf('nombre_destino');
  var idxEmail    = headers.indexOf('email_destino');
  var idxExpira   = headers.indexOf('expira_at');
  var idxEstado   = headers.indexOf('estado');

  var ahora = new Date();
  var rows  = data.map(function(fila, i) {
    var estado = String(fila[idxEstado] || '').toUpperCase();
    var expira = new Date(fila[idxExpira]);
    if (estado === 'PENDIENTE' && ahora > expira) {
      sh.getRange(i + 2, idxEstado + 1).setValue('EXPIRADO');
      estado = 'EXPIRADO';
    }
    var color   = estado === 'PENDIENTE' ? '#107e3e' : (estado === 'USADO' ? '#515f6e' : '#bb0000');
    var modoTag = fila[idxModo] === 'PUBLICO'
      ? '<span style="background:#e8f4fd;color:#0a6ed1;padding:1px 6px;border-radius:3px;font-size:10px;">PÚBLICO</span>'
      : '<span style="background:#f3f0fd;color:#7d3c98;padding:1px 6px;border-radius:3px;font-size:10px;">INDIV.</span>';
    var link = fila[idxLink] || '';
    var linkHtml = (link && estado !== 'EXPIRADO')
      ? '<a href="' + link + '" target="_blank" style="word-break:break-all;font-size:10px;">' + link + '</a>'
      : '<span style="color:#ccc;font-size:10px;">' + (link || '(sin URL)') + '</span>';
    var candidato = (fila[idxNombre] || fila[idxEmail])
      ? (fila[idxNombre] || '') + (fila[idxEmail] ? '<br><span style="color:#888;font-size:10px;">' + fila[idxEmail] + '</span>' : '')
      : 'Público';

    return '<tr style="border-bottom:1px solid #f0f0f0;">' +
      '<td style="padding:7px 5px;font-weight:500;">' + candidato + '</td>' +
      '<td style="padding:7px 5px;">' + modoTag + '</td>' +
      '<td style="padding:7px 5px;font-size:10px;">' + (fila[idxVacante] || '—') + '</td>' +
      '<td style="padding:7px 5px;">' + linkHtml + '</td>' +
      '<td style="padding:7px 5px;font-size:10px;white-space:nowrap;">' + (expira instanceof Date && !isNaN(expira) ? expira.toLocaleDateString('es-GT') : '—') + '</td>' +
      '<td style="padding:7px 5px;"><b style="color:' + color + ';font-size:10px;">' + estado + '</b></td>' +
      '</tr>';
  }).join('');

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>body{font-family:system-ui,sans-serif;font-size:13px;padding:14px;margin:0;}' +
    'table{width:100%;border-collapse:collapse;}' +
    'th{text-align:left;padding:5px;border-bottom:2px solid #d9d9d9;color:#515f6e;font-size:10px;text-transform:uppercase;}</style></head>' +
    '<body><h3 style="margin:0 0 10px;font-size:14px;">🔗 Links de Postulación — E-Recruiting</h3>' +
    '<table><thead><tr><th>Candidato</th><th>Modo</th><th>Vacante</th><th>Link</th><th>Expira</th><th>Estado</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +
    '<p style="margin-top:8px;color:#aaa;font-size:10px;">Click en el link para abrirlo o copiarlo.</p>' +
    '</body></html>'
  ).setWidth(860).setHeight(460);

  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Links de Postulación EREC');
}
