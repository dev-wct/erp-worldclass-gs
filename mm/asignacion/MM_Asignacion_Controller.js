/**
 * MM_Asignacion_Controller
 * Capa de Adaptadores: Controlador para Asignaciones de Equipo/Chip.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormAsignacion() {
  const html = HtmlService.createTemplateFromFile('mm/asignacion/MM_FormAsignacion')
    .evaluate()
    .setWidth(560)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Nueva Asignación de Equipo / Chip');
}

function apiGetCatalogosAsignacion() {
  return safeExecute(function() {
    return {
      empleados:     DataAdapter.findAll('Empleados',        { activo: true }),
      equipos:       DataAdapter.findAll('Equipos',          { id_estado: 2 }),
      chips:         DataAdapter.findAll('Chips',            { id_estado: 2 }),
      departamentos: DataAdapter.findAll('CAT_Departamentos',{ activo: true }),
      empresas:      DataAdapter.findAll('CAT_Empresas',     { activo: true })
    };
  }, 'MM.Asignacion.getCatalogos');
}

function apiGuardarAsignacion(formData) {
  return safeExecute(function() {
    return AsignacionUseCases.crearSolicitud(formData);
  }, 'MM.Asignacion.guardar');
}
