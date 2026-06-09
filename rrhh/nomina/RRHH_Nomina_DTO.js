/**
 * RRHH_Nomina_DTO
 * Capa de Dominio: DTO para normalizar y estructurar datos de cálculo de nómina.
 */
const NominaDTO = {
  fromForm: function(rawForm) {
    const sueldo = rawForm.sueldo_base !== undefined && rawForm.sueldo_base !== '' ? parseFloat(rawForm.sueldo_base) : 0;
    const comisiones = rawForm.comisiones !== undefined && rawForm.comisiones !== '' ? parseFloat(rawForm.comisiones) : 0;
    const bonos = rawForm.bonos !== undefined && rawForm.bonos !== '' ? parseFloat(rawForm.bonos) : 0;
    const deducciones = rawForm.deducciones !== undefined && rawForm.deducciones !== '' ? parseFloat(rawForm.deducciones) : 0;

    return {
      id_empleado:  rawForm.id_empleado ? parseInt(rawForm.id_empleado, 10) : null,
      anio:         rawForm.anio ? parseInt(rawForm.anio, 10) : new Date().getFullYear(),
      quincena:     rawForm.quincena ? parseInt(rawForm.quincena, 10) : 1,
      sueldo_base:  sueldo,
      comisiones:   comisiones,
      bonos:        bonos,
      deducciones:  deducciones,
      metodo_pago:  rawForm.metodo_pago ? String(rawForm.metodo_pago).trim().toUpperCase() : 'TRANSFERENCIA',
      pagado:       rawForm.pagado === true || rawForm.pagado === 'true',
      fecha_pago:   rawForm.fecha_pago || null
    };
  }
};
