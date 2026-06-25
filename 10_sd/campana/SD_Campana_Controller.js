/**
 * SD_Campana_Controller
 * Capa de Adaptador: Controlador de interfaz para Campañas.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormCampana() {
  const html = HtmlService.createTemplateFromFile('10_sd/campana/SD_FormCampana')
    .evaluate()
    .setWidth(500)
    .setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, '📞 Registrar Nueva Campaña');
}

function apiGuardarCampana(formData) {
  return safeExecute(function() {
    return CampanaUseCases.registrar(formData);
  }, 'SD.Campana.guardar');
}

function apiGetCampanas() {
  return safeExecute(function() {
    return CampanaRepo.findAll().map(function(c) { return CampanaDTO.toResponse(c); });
  }, 'SD.Campana.getAll');
}
