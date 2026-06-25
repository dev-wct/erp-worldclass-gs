/**
 * RRHH_Empleado_Controller
 * Capa de Adaptador: Controlador de interfaz para Empleados.
 * Usa safeExecute() para garantizar respuestas uniformes sin try/catch repetidos.
 */

function abrirFormEmpleado() {
  const html = HtmlService.createTemplateFromFile('07_hcm/empleado/RRHH_FormEmpleado')
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
      sucursales:    DataAdapter.findAll('CAT_Sucursales',    { activo: true }),
      unidades:      DataAdapter.findAll('CAT_UnidadesOrganizativas', { activo: true }),
      roles:         DataAdapter.findAll('CAT_Roles',         { activo: true }),
      paises:        DataAdapter.findAll('CAT_Paises'),
      empleados:     EmpleadoRepo.findAll()
    };
  }, 'RRHH.Empleado.getCatalogos');
}

function apiGetEmpleados() {
  return safeExecute(function() {
    return EmpleadoRepo.findAll();
  }, 'RRHH.Empleado.getEmpleados');
}

function apiGuardarEmpleado(formData) {
  return safeExecute(function() {
    return EmpleadoUseCases.contratar(formData);
  }, 'RRHH.Empleado.guardar');
}

function apiActualizarEmpleado(id, formData) {
  return safeExecute(function() {
    return EmpleadoUseCases.actualizar(id, formData);
  }, 'RRHH.Empleado.actualizar');
}

function apiDarBajaEmpleado(id, fechaSalida) {
  return safeExecute(function() {
    return EmpleadoUseCases.darBaja(id, fechaSalida);
  }, 'RRHH.Empleado.darBaja');
}
