/**
 * SD_Lead_Controller
 * Capa de Adaptador: Controlador de interfaz para Leads.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormLead() {
  const html = HtmlService.createTemplateFromFile('07_sd/lead/SD_FormLead')
    .evaluate()
    .setWidth(520)
    .setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, '👤 Registrar Nuevo Lead');
}

function apiGetCatalogosLead() {
  return safeExecute(function() {
    const campanas = CampanaRepo.findAll().filter(function(c) { return c.estado === 'ACTIVA'; });
    return {
      campanas: campanas.map(function(c) { return { id: c.id_campana, nombre: c.nombre }; })
    };
  }, 'SD.Lead.getCatalogos');
}

function apiGuardarLead(formData) {
  return safeExecute(function() {
    return LeadUseCases.registrar(formData);
  }, 'SD.Lead.guardar');
}

function apiGetLeads() {
  return safeExecute(function() {
    return LeadRepo.findAll().map(function(l) { return LeadDTO.toResponse(l); });
  }, 'SD.Lead.getAll');
}
