/**
 * SD_Cita_Controller
 * Capa de Adaptador: Controlador de interfaz para Citas.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormCita() {
  const html = HtmlService.createTemplateFromFile('sd/cita/SD_FormCita')
    .evaluate()
    .setWidth(500)
    .setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Nueva Cita Agendada');
}

function apiGetCatalogosCita() {
  return safeExecute(function() {
    const leads = LeadRepo.findAll().filter(function(l) {
      return l.estado !== 'INVALIDO' && l.estado !== 'NO_INTERESADO' && l.estado !== 'CITA_AGENDADA';
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
  }, 'SD.Cita.getCatalogos');
}

function apiGuardarCita(formData) {
  return safeExecute(function() {
    return CitaUseCases.registrar(formData);
  }, 'SD.Cita.guardar');
}

function apiGetCitas() {
  return safeExecute(function() {
    return CitaRepo.findAll().map(function(c) { return CitaDTO.toResponse(c); });
  }, 'SD.Cita.getAll');
}
