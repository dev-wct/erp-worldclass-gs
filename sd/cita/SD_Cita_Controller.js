/**
 * SD_Cita_Controller
 * Capa de Adaptador: Controlador de interfaz para Citas.
 */

function abrirFormCita() {
  const html = HtmlService.createTemplateFromFile('sd/cita/SD_FormCita')
    .evaluate()
    .setWidth(500)
    .setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Nueva Cita Agendada');
}

function apiGetCatalogosCita() {
  try {
    // Obtener Leads con estado CONTACTADO o INTERESADO o NUEVO
    const leads = LeadRepo.findAll().filter(l => l.estado !== 'INVALIDO' && l.estado !== 'NO_INTERESADO' && l.estado !== 'CITA_AGENDADA');
    
    // Obtener Empleados activos
    const empleados = DataAdapter.findAll('Empleados', { activo: true });

    return {
      leads: leads.map(l => ({ id: l.id_lead, nombre: l.nombre_completo + ' (' + l.telefono + ')' })),
      empleados: empleados.map(e => ({ id: e.id_empleado, nombre: e.nombre_completo }))
    };
  } catch (err) {
    return { leads: [], empleados: [] };
  }
}

function apiGuardarCita(formData) {
  try {
    return CitaUseCases.registrar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}

function apiGetCitas() {
  try {
    const list = CitaRepo.findAll();
    return list.map(c => CitaDTO.toResponse(c));
  } catch (err) {
    return [];
  }
}
