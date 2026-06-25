/**
 * MM_Equipo_Entity
 * Capa de Dominio: Entidad inmutable para representar un equipo (hardware).
 */
const EquipoEntity = {
  create: function(props) {
    return Object.freeze({
      id_equipo:              props.id_equipo || null,
      codigo_interno:         props.codigo_interno || null,
      id_tipo:                props.id_tipo,
      tipo:                   props.tipo || '',
      id_marca:               props.id_marca,
      marca:                  props.marca || '',
      modelo:                 props.modelo,
      serial:                 props.serial,
      id_empresa:             props.id_empresa,
      empresa:                props.empresa || '',
      id_sucursal:            props.id_sucursal || null,
      sucursal:               props.sucursal || '',
      id_estado:              props.id_estado,
      estado:                 props.estado || '',
      fecha_compra:           props.fecha_compra ? new Date(props.fecha_compra) : null,
      garantia_hasta:         props.garantia_hasta ? new Date(props.garantia_hasta) : null,
      valor_compra:           props.valor_compra !== undefined && props.valor_compra !== null ? parseFloat(props.valor_compra) : null,
      link_factura:           props.link_factura || '',
      link_foto:              props.link_foto || '',
      observaciones:          props.observaciones || ''
    });
  }
};
