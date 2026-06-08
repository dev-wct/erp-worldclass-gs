/**
 * FICO_CostoChip_Entity
 * Capa de Dominio: Entidad inmutable para representar un costo mensual de Chip SIM.
 */
const CostoChipEntity = {
  create: function(props) {
    return Object.freeze({
      id_costo:      props.id_costo || null,
      id_chip:       props.id_chip ? parseInt(props.id_chip, 10) : null,
      codigo_chip:   props.codigo_chip || '',
      numero_chip:   props.numero_chip || '',
      anio:          props.anio ? parseInt(props.anio, 10) : new Date().getFullYear(),
      mes:           props.mes ? parseInt(props.mes, 10) : new Date().getMonth() + 1,
      monto:         props.monto !== undefined && props.monto !== null ? parseFloat(props.monto) : 0,
      pagado:        props.pagado !== undefined ? Boolean(props.pagado) : false,
      observaciones: props.observaciones || ''
    });
  }
};
