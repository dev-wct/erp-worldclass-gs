/**
 * RRHH_Empleado_Controller
 * Capa de Adaptador: Controlador de interfaz para Empleados.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormEmpleado() {
  const html = HtmlService.createTemplateFromFile('rrhh/empleado/RRHH_FormEmpleado')
    .evaluate()
    .setWidth(520)
    .setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, '👤 Registrar Empleado');
}

function apiGetCatalogosEmpleado() {
  return safeExecute(function() {
    return {
      empresas:      DataAdapter.findAll('CAT_Empresas',      { activo: true }),
      departamentos: DataAdapter.findAll('CAT_Departamentos', { activo: true }),
      roles:         DataAdapter.findAll('CAT_Roles',         { activo: true })
    };
  }, 'RRHH.Empleado.getCatalogos');
}

function apiGuardarEmpleado(formData) {
  return safeExecute(function() {
    return EmpleadoUseCases.contratar(formData);
  }, 'RRHH.Empleado.guardar');
}
