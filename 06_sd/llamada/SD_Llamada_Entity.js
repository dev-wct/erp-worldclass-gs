/**
 * SD_Llamada_Entity
 * Capa de Dominio: Entidad inmutable para representar una llamada de Call Center.
 */
const LlamadaEntity = {
  create: function(props) {
    return Object.freeze({
      id_llamada:   props.id_llamada || null,
      id_lead:       props.id_lead ? parseInt(props.id_lead, 10) : null,
      lead:          props.lead || '',
      id_empleado:   props.id_empleado ? parseInt(props.id_empleado, 10) : null,
      empleado:      props.empleado || '',
      fecha_hora:    props.fecha_hora ? new Date(props.fecha_hora) : new Date(),
      duracion_seg:  props.duracion_seg !== undefined && props.duracion_seg !== null ? parseInt(props.duracion_seg, 10) : 0,
      resultado:     props.resultado || 'PENDIENTE',
      notas:         props.notas || ''
    });
  }
};
