/**
 * MM_Chip_Controller
 * Capa de Adaptadores: Controlador para Chips SIM.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormChip() {
  const html = HtmlService.createTemplateFromFile('05_mm/chip/MM_FormChip')
    .evaluate()
    .setWidth(520)
    .setHeight(460)
    .setTitle('📱 Registrar Chip SIM (Línea)');
  SpreadsheetApp.getUi().showModalDialog(html, '📱 Registrar Chip SIM (Línea)');
}

function apiGetCatalogosChip() {
  return safeExecute(function() {
    return {
      operadoras: DataAdapter.findAll('CAT_Operadoras', { activo: true }),
      empresas:   DataAdapter.findAll('CAT_Empresas',   { activo: true }),
      estados:    DataAdapter.findAll('CAT_Estados',    { activo: true }),
      nextId:     DataAdapter.getNextId('Chips')
    };
  }, 'MM.Chip.getCatalogos');
}

function apiGuardarChip(formData) {
  return safeExecute(function() {
    return ChipUseCases.registrar(formData);
  }, 'MM.Chip.guardar');
}
