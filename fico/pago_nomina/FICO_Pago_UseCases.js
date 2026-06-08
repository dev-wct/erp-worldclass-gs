/**
 * FICO_Pago_UseCases
 * Capa de Aplicación: Casos de uso para pagos y nóminas.
 */
const PagoUseCases = {
  registrar: function(rawForm) {
    const dto = PagoDTO.fromForm(rawForm);

    const validacion = PagoValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Validar si ya existe nómina para ese empleado en esa quincena y año
    const existentes = PagoRepo.findByEmpleadoPeriodo(dto.id_empleado, dto.anio, dto.quincena);
    if (existentes.length > 0) {
      return {
        ok: false,
        errores: ['Ya se registró el pago de nómina para este empleado en la Quincena ' + dto.quincena + ' del año ' + dto.anio + '.']
      };
    }

    const entidad = PagoEntity.create(dto);
    const user = DataAdapter.getCurrentUser();
    const saved = PagoRepo.insert(entidad, user);

    return {
      ok: true,
      data: PagoDTO.toResponse(saved),
      mensaje: 'Pago de nómina registrado exitosamente para ' + saved.empleado + ' (ID Pago: ' + saved.id_pago + ').'
    };
  },

  /**
   * Calcula las comisiones devengadas por un agente (empleado) en una quincena y mes específicos.
   * Regla: Q500 por cada cita del agente que tenga resultado de venta "VENTA" o "VENTA_CERRADA".
   */
  calcularComisiones: function(idEmpleado, anio, mes, quincena) {
    try {
      const citas = DataAdapter.findAll('Citas', { id_empleado_agendo: parseInt(idEmpleado, 10) });
      
      // Filtrar por período
      const citasFiltradas = citas.filter(c => {
        if (!c.fecha_cita) return false;
        
        const f = new Date(c.fecha_cita);
        const esAnio = f.getFullYear() === parseInt(anio, 10);
        const esMes = f.getMonth() === parseInt(mes, 10); // 0-11
        
        if (!esAnio || !esMes) return false;

        const dia = f.getDate();
        if (parseInt(quincena, 10) === 1) {
          return dia >= 1 && dia <= 15;
        } else {
          return dia >= 16 && dia <= 31;
        }
      });

      // Contar ventas efectivas
      const ventas = citasFiltradas.filter(c => {
        const res = String(c.resultado_venta).toUpperCase();
        return res === 'VENTA' || res === 'VENTA_CERRADA';
      });

      const comisionPorVenta = 500; // Q500 por venta concretada
      const totalComisiones = ventas.length * comisionPorVenta;

      return {
        ok: true,
        ventas_concretadas: ventas.length,
        total_comisiones: totalComisiones,
        detalle_citas: ventas.map(v => 'ID Cita: ' + v.id_cita + ' - ' + v.restaurante)
      };
    } catch (err) {
      return { ok: false, ventas_concretadas: 0, total_comisiones: 0, errores: [err.message] };
    }
  }
};
