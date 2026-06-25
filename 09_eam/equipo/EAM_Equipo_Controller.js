/**
 * MM_Equipo_Controller
 * Capa de Adaptadores: Controlador para Equipos Informáticos.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormEquipo() {
  const html = HtmlService.createTemplateFromFile('09_eam/equipo/EAM_FormEquipo')
    .evaluate()
    .setWidth(520)
    .setHeight(560)
    .setTitle('💻 Registrar Equipo Informático');
  SpreadsheetApp.getUi().showModalDialog(html, '💻 Registrar Equipo Informático');
}

function apiGetCatalogosEquipo() {
  return safeExecute(function() {
    return {
      tipos:      DataAdapter.findAll('CAT_TiposEquipo', { activo: true }),
      marcas:     DataAdapter.findAll('CAT_Marcas',      { activo: true }),
      empresas:   DataAdapter.findAll('CAT_Empresas',    { activo: true }),
      sucursales: DataAdapter.findAll('CAT_Sucursales',    { activo: true }),
      estados:    DataAdapter.findAll('CAT_Estados',     { activo: true }),
      nextId:     DataAdapter.getNextId('Equipos')
    };
  }, 'MM.Equipo.getCatalogos');
}

function apiGuardarEquipo(formData) {
  return safeExecute(function() {
    return EquipoUseCases.registrar(formData);
  }, 'MM.Equipo.guardar');
}
