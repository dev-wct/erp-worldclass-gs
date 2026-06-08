/**
 * FICO_Pago_Controller
 * Capa de Adaptador: Controlador de interfaz para pagos de nómina.
 */

function abrirFormPagoNomina() {
  const html = HtmlService.createTemplateFromFile('fico/pago_nomina/FICO_FormPago')
    .evaluate()
    .setWidth(520)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '💵 Registro de Pago de Nómina');
}

function apiGetCatalogosPagoNomina() {
  try {
    const empleados = DataAdapter.findAll('Empleados', { activo: true });
    return {
      empleados: empleados.map(e => ({ id: e.id_empleado, nombre: e.nombre_completo }))
    };
  } catch (err) {
    return { empleados: [] };
  }
}

function apiCalcularComisionAgente(idEmpleado, anio, mes, quincena) {
  try {
    return PagoUseCases.calcularComisiones(idEmpleado, anio, mes, quincena);
  } catch (err) {
    return { ok: false, total_comisiones: 0, ventas_concretadas: 0, errores: [err.message] };
  }
}

function apiGuardarPagoNomina(formData) {
  try {
    return PagoUseCases.registrar(formData);
  } catch (err) {
    return { ok: false, errores: [err.message] };
  }
}

function apiGetPagos() {
  try {
    const list = PagoRepo.findAll();
    return list.map(p => PagoDTO.toResponse(p));
  } catch (err) {
    return [];
  }
}
