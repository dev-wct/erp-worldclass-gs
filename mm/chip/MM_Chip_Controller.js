/**
 * MM_Chip_Controller
 * Capa de Adaptadores: Controlador global para exponer APIs de Chips SIM hacia el frontend (HTML modal).
 */

/** Abre el cuadro de diálogo modal para registrar un Chip SIM */
function abrirFormChip() {
  const html = HtmlService.createTemplateFromFile('mm/chip/MM_FormChip')
    .evaluate()
    .setWidth(520)
    .setHeight(460)
    .setTitle('📱 Registrar Chip SIM (Línea)');
  SpreadsheetApp.getUi().showModalDialog(html, '📱 Registrar Chip SIM (Línea)');
}

/** Obtiene los listados de catálogos requeridos para llenar los dropdowns del formulario de Chips */
function apiGetCatalogosChip() {
  try {
    return {
      operadoras: DataAdapter.findAll('CAT_Operadoras', { activo: true }),
      empresas:   DataAdapter.findAll('CAT_Empresas', { activo: true }),
      estados:    DataAdapter.findAll('CAT_Estados', { activo: true }),
      nextId:     DataAdapter.getNextId('Chips')
    };
  } catch (e) {
    Logger.log("Error en apiGetCatalogosChip: " + e.message);
    return { operadoras: [], empresas: [], estados: [], nextId: 1 };
  }
}

/** Recibe los datos del formulario, los valida y registra el Chip SIM */
function apiGuardarChip(formData) {
  try {
    return ChipUseCases.registrar(formData);
  } catch (err) {
    Logger.log("Error en apiGuardarChip: " + err.message);
    return { ok: false, errores: [err.message] };
  }
}
