/**
 * SD_Lead_Controller
 * Capa de Adaptador: Controlador de interfaz para Leads.
 */

function abrirFormLead() {
  const html = HtmlService.createTemplateFromFile('sd/lead/SD_FormLead')
    .evaluate()
    .setWidth(520)
    .setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, '👤 Registrar Nuevo Lead');
}

function apiGetCatalogosLead() {
  try {
    const campanas = CampanaRepo.findAll().filter(c => c.estado === 'ACTIVA');
    return {
      campanas: campanas.map(c => ({ id: c.id_campana, nombre: c.nombre }))
    };
  } catch (err) {
    return { campanas: [] };
  }
}

function apiGuardarLead(formData) {
  try {
    return LeadUseCases.registrar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}

function apiGetLeads() {
  try {
    const list = LeadRepo.findAll();
    return list.map(l => LeadDTO.toResponse(l));
  } catch (err) {
    return [];
  }
}
