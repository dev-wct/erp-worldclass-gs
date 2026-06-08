/**
 * FICO_Pago_DTO
 * Capa de Dominio: DTO para normalizar y estructurar datos de un Pago de Nómina.
 */
const PagoDTO = {
  fromForm: function(rawForm) {
    const sueldo = rawForm.sueldo_base !== undefined && rawForm.sueldo_base !== '' ? parseFloat(rawForm.sueldo_base) : 0;
    const comisiones = rawForm.comisiones !== undefined && rawForm.comisiones !== '' ? parseFloat(rawForm.comisiones) : 0;
    const bonos = rawForm.bonos !== undefined && rawForm.bonos !== '' ? parseFloat(rawForm.bonos) : 0;
    const deducciones = rawForm.deducciones !== undefined && rawForm.deducciones !== '' ? parseFloat(rawForm.deducciones) : 0;
    const total = sueldo + comisiones + bonos - deducciones;

    return {
      id_empleado:  rawForm.id_empleado ? parseInt(rawForm.id_empleado, 10) : null,
      anio:         rawForm.anio ? parseInt(rawForm.anio, 10) : new Date().getFullYear(),
      quincena:     rawForm.quincena ? parseInt(rawForm.quincena, 10) : 1,
      sueldo_base:  sueldo,
      comisiones:   comisiones,
      bonos:        bonos,
      deducciones:  deducciones,
      total_neto:   total,
      pagado:       rawForm.pagado === true || rawForm.pagado === 'true',
      fecha_pago:   rawForm.fecha_pago || null,
      metodo_pago:  rawForm.metodo_pago ? String(rawForm.metodo_pago).trim().toUpperCase() : 'TRANSFERENCIA'
    };
  },

  toResponse: function(entity) {
    return {
      id_pago:      entity.id_pago,
      id_empleado:  entity.id_empleado,
      empleado:     entity.empleado,
      anio:         entity.anio,
      quincena:     entity.quincena,
      sueldo_base:  entity.sueldo_base,
      comisiones:   entity.comisiones,
      bonos:        entity.bonos,
      deducciones:  entity.deducciones,
      total_neto:   entity.total_neto,
      pagado:       entity.pagado,
      fecha_pago:   entity.fecha_pago ? entity.fecha_pago.toISOString().split('T')[0] : null,
      metodo_pago:  entity.metodo_pago
    };
  }
};
