/**
 * SD_Llamada_Controller
 * Capa de Adaptador: Controlador de interfaz para Llamadas.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormLlamada() {
  const html = HtmlService.createTemplateFromFile('10_sd/llamada/SD_FormLlamada')
    .evaluate()
    .setWidth(500)
    .setHeight(540);
  SpreadsheetApp.getUi().showModalDialog(html, '📞 Registrar Llamada');
}

function apiGetCatalogosLlamada() {
  return safeExecute(function() {
    const leads = LeadRepo.findAll().filter(function(l) {
      return l.estado !== 'INVALIDO' && l.estado !== 'NO_INTERESADO';
    });
    const empleados = DataAdapter.findAll('Empleados', { activo: true });
    return {
      leads:     leads.map(function(l) {
        return { id: l.id_lead, nombre: l.nombre_completo + ' (' + l.telefono + ')' };
      }),
      empleados: empleados.map(function(e) {
        return { id: e.id_empleado, nombre: e.nombre_completo };
      })
    };
  }, 'SD.Llamada.getCatalogos');
}

function apiGuardarLlamada(formData) {
  return safeExecute(function() {
    return LlamadaUseCases.registrar(formData);
  }, 'SD.Llamada.guardar');
}

function apiGetLlamadas() {
  return safeExecute(function() {
    return LlamadaRepo.findAll().map(function(l) { return LlamadaDTO.toResponse(l); });
  }, 'SD.Llamada.getAll');
}
