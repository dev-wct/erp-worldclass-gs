/**
 * FICO_Pago_Controller
 * Capa de Adaptador: Punto de entrada para operaciones de dispersión de nómina.
 *
 * TODOS los endpoints usan safeExecute() del INFRA_ErrorHandler para garantizar
 * respuestas uniformes al cliente sin bloques try/catch repetidos.
 */

function abrirFormPagoNomina() {
  const html = HtmlService.createTemplateFromFile('08_fico/pago_nomina/FICO_FormPago')
    .evaluate()
    .setWidth(520)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '💵 Registro de Pago de Nómina');
}

function apiGetCatalogosPagoNomina() {
  return safeExecute(function() {
    const empleados = DataAdapter.findAll('Empleados', { activo: true });
    return {
      empleados: empleados.map(function(e) {
        return { id: e.id_empleado, nombre: e.nombre_completo };
      })
    };
  }, 'FICO.getCatalogos');
}

function apiCalcularComisionAgente(idEmpleado, anio, mes, quincena) {
  return safeExecute(function() {
    return NominaUseCases.calcularComisiones(idEmpleado, anio, mes, quincena);
  }, 'FICO.calcularComision');
}

function apiGuardarPagoNomina(formData) {
  return safeExecute(function() {
    return PagoUseCases.registrar(formData);
  }, 'FICO.guardarPago');
}

function apiGetPagos() {
  return safeExecute(function() {
    return PagoRepo.findAll().map(function(p) { return PagoDTO.toResponse(p); });
  }, 'FICO.getPagos');
}
