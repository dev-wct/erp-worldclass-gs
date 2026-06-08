/**
 * MM_Equipo_Controller
 * Capa de Adaptadores: Controlador global para exponer APIs de Equipos hacia el frontend (HTML modal).
 */

/** Abre el cuadro de diálogo modal para registrar un equipo */
function abrirFormEquipo() {
  const html = HtmlService.createTemplateFromFile('mm/equipo/MM_FormEquipo')
    .evaluate()
    .setWidth(520)
    .setHeight(560)
    .setTitle('💻 Registrar Equipo Informático');
  SpreadsheetApp.getUi().showModalDialog(html, '💻 Registrar Equipo Informático');
}

/** Obtiene los listados de catálogos requeridos para llenar los dropdowns del formulario */
function apiGetCatalogosEquipo() {
  try {
    return {
      tipos:    DataAdapter.findAll('CAT_TiposEquipo', { activo: true }),
      marcas:   DataAdapter.findAll('CAT_Marcas', { activo: true }),
      empresas: DataAdapter.findAll('CAT_Empresas', { activo: true }),
      estados:  DataAdapter.findAll('CAT_Estados', { activo: true }),
      nextId:   DataAdapter.getNextId('Equipos')
    };
  } catch (e) {
    Logger.log("Error en apiGetCatalogosEquipo: " + e.message);
    return { tipos: [], marcas: [], empresas: [], estados: [], nextId: 1 };
  }
}

/** Recibe los datos del formulario, los valida y registra el equipo */
function apiGuardarEquipo(formData) {
  try {
    return EquipoUseCases.registrar(formData);
  } catch (err) {
    Logger.log("Error en apiGuardarEquipo: " + err.message);
    return { ok: false, errores: [err.message] };
  }
}
