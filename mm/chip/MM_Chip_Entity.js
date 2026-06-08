/**
 * MM_Chip_Entity
 * Capa de Dominio: Entidad inmutable para representar un chip SIM (Línea Telefónica).
 */
const ChipEntity = {
  create: function(props) {
    return Object.freeze({
      id_chip:                props.id_chip || null,
      codigo_interno:         props.codigo_interno || null,
      numero:                 props.numero,
      id_operadora:           props.id_operadora,
      operadora:              props.operadora || '',
      plan:                   props.plan || '',
      costo_mensual:          props.costo_mensual !== undefined && props.costo_mensual !== null ? parseFloat(props.costo_mensual) : 0,
      id_empresa:             props.id_empresa,
      empresa:                props.empresa || '',
      id_estado:              props.id_estado,
      estado:                 props.estado || '',
      fecha_activacion:       props.fecha_activacion ? new Date(props.fecha_activacion) : null,
      observaciones:          props.observaciones || ''
    });
  }
};
