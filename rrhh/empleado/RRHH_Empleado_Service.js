const EmpleadoService = {
  calcularAntiguedad: function(empleado) {
    if (!empleado.fecha_ingreso) return 0;
    return Utils.diasEntre(new Date(empleado.fecha_ingreso), new Date());
  },

  enPeriodoPrueba: function(empleado) {
    return this.calcularAntiguedad(empleado) < 60;
  },

  esElegibleParaComision: function(empleado) {
    return empleado.activo
        && !this.enPeriodoPrueba(empleado)
        && empleado.tipo_contrato !== 'TEMPORAL';
  },

  validarRelacionEmpresaDepartamento: function(idEmpresa, idDepartamento) {
    const deptos = DataAdapter.findByField('CAT_Departamentos', 'id_empresa', idEmpresa);
    return deptos.some(d => d.id_departamento == idDepartamento);
  },
};
