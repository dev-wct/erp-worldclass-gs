/**
 * MM_Asignacion_Controller
 * Capa de Adaptadores: Controlador global para Asignaciones de Equipo/Chip.
 */

/** Abre el formulario modal de nueva asignación */
function abrirFormAsignacion() {
  const html = HtmlService.createTemplateFromFile('mm/asignacion/MM_FormAsignacion')
    .evaluate()
    .setWidth(560)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Nueva Asignación de Equipo / Chip');
}

/** Obtiene todos los catálogos necesarios para el formulario de asignación */
function apiGetCatalogosAsignacion() {
  try {
    // Empleados activos
    const empleados = DataAdapter.findAll('Empleados', { activo: true });

    // Equipos en bodega (id_estado = 2) disponibles para asignar
    const equiposBodega = DataAdapter.findAll('Equipos', { id_estado: 2 });
    
    // Chips en bodega (id_estado = 2) disponibles para asignar
    const chipsBodega = DataAdapter.findAll('Chips', { id_estado: 2 });

    // Departamentos y empresas para filtros cascada
    const departamentos = DataAdapter.findAll('CAT_Departamentos', { activo: true });
    const empresas = DataAdapter.findAll('CAT_Empresas', { activo: true });

    return {
      empleados:    empleados,
      equipos:      equiposBodega,
      chips:        chipsBodega,
      departamentos: departamentos,
      empresas:     empresas
    };
  } catch (e) {
    Logger.log("Error en apiGetCatalogosAsignacion: " + e.message);
    return { empleados: [], equipos: [], chips: [], departamentos: [], empresas: [] };
  }
}

/** Recibe los datos del formulario y crea la solicitud de asignación */
function apiGuardarAsignacion(formData) {
  try {
    return AsignacionUseCases.crearSolicitud(formData);
  } catch (err) {
    Logger.log("Error en apiGuardarAsignacion: " + err.message);
    return { ok: false, errores: [err.message] };
  }
}
