/**
 * SD_Campana_Controller
 * Capa de Adaptador: Controlador de interfaz para Campañas.
 */

function abrirFormCampana() {
  const html = HtmlService.createTemplateFromFile('sd/campana/SD_FormCampana')
    .evaluate()
    .setWidth(500)
    .setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, '📞 Registrar Nueva Campaña');
}

function apiGuardarCampana(formData) {
  try {
    return CampanaUseCases.registrar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}

function apiGetCampanas() {
  try {
    const list = CampanaRepo.findAll();
    return list.map(c => CampanaDTO.toResponse(c));
  } catch (err) {
    return [];
  }
}
