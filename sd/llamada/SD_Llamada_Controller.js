/**
 * SD_Llamada_Controller
 * Capa de Adaptador: Controlador de interfaz para Llamadas.
 */

function abrirFormLlamada() {
  const html = HtmlService.createTemplateFromFile('sd/llamada/SD_FormLlamada')
    .evaluate()
    .setWidth(500)
    .setHeight(540);
  SpreadsheetApp.getUi().showModalDialog(html, '📞 Registrar Llamada');
}

function apiGetCatalogosLlamada() {
  try {
    // Obtener Leads no cerrados (ej. Nuevos, Contactados, Interesados, Agendados)
    const leads = LeadRepo.findAll().filter(l => l.estado !== 'INVALIDO' && l.estado !== 'NO_INTERESADO');
    
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

function apiGuardarLlamada(formData) {
  try {
    return LlamadaUseCases.registrar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}

function apiGetLlamadas() {
  try {
    const list = LlamadaRepo.findAll();
    return list.map(l => LlamadaDTO.toResponse(l));
  } catch (err) {
    return [];
  }
}
