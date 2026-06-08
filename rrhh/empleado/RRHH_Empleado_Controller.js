function abrirFormEmpleado() {
  const html = HtmlService.createTemplateFromFile('rrhh/empleado/RRHH_FormEmpleado')
    .evaluate()
    .setWidth(520).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, '👤 Registrar Empleado');
}

function apiGetCatalogosEmpleado() {
  return {
    empresas:      DataAdapter.findAll('CAT_Empresas', { activo: true }),
    departamentos: DataAdapter.findAll('CAT_Departamentos', { activo: true }),
    roles:         DataAdapter.findAll('CAT_Roles', { activo: true }),
  };
}

function apiGuardarEmpleado(formData) {
  try {
    return EmpleadoUseCases.contratar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}
