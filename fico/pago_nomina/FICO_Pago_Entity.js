/**
 * FICO_Pago_Entity
 * Capa de Dominio: Entidad inmutable para representar un Pago de Nómina.
 */
const PagoEntity = {
  create: function(props) {
    return Object.freeze({
      id_pago:      props.id_pago || null,
      id_empleado:  props.id_empleado ? parseInt(props.id_empleado, 10) : null,
      empleado:     props.empleado || '',
      anio:         props.anio ? parseInt(props.anio, 10) : new Date().getFullYear(),
      quincena:     props.quincena ? parseInt(props.quincena, 10) : 1, // 1 o 2
      sueldo_base:  props.sueldo_base !== undefined && props.sueldo_base !== null ? parseFloat(props.sueldo_base) : 0,
      comisiones:   props.comisiones !== undefined && props.comisiones !== null ? parseFloat(props.comisiones) : 0,
      bonos:        props.bonos !== undefined && props.bonos !== null ? parseFloat(props.bonos) : 0,
      deducciones:  props.deducciones !== undefined && props.deducciones !== null ? parseFloat(props.deducciones) : 0,
      total_neto:   props.total_neto !== undefined && props.total_neto !== null ? parseFloat(props.total_neto) : 0,
      pagado:       props.pagado !== undefined ? Boolean(props.pagado) : false,
      fecha_pago:   props.fecha_pago ? new Date(props.fecha_pago) : null,
      metodo_pago:  props.metodo_pago || 'TRANSFERENCIA'
    });
  }
};
