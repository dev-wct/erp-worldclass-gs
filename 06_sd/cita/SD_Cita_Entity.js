/**
 * SD_Cita_Entity
 * Capa de Dominio: Entidad inmutable para representar una Cita agendada en un restaurante.
 */
const CitaEntity = {
  create: function(props) {
    return Object.freeze({
      id_cita:              props.id_cita || null,
      id_lead:              props.id_lead ? parseInt(props.id_lead, 10) : null,
      lead:                 props.lead || '',
      id_empleado_agendo:   props.id_empleado_agendo ? parseInt(props.id_empleado_agendo, 10) : null,
      empleado_agendo:      props.empleado_agendo || '',
      restaurante:          props.restaurante,
      fecha_cita:           props.fecha_cita ? new Date(props.fecha_cita) : null,
      hora_cita:            props.hora_cita || '',
      num_acompanantes:     props.num_acompanantes !== undefined && props.num_acompanantes !== null ? parseInt(props.num_acompanantes, 10) : 0,
      asistio:              props.asistio || 'PENDIENTE',
      resultado_venta:      props.resultado_venta || 'PENDIENTE',
      id_membresia_vendida: props.id_membresia_vendida ? parseInt(props.id_membresia_vendida, 10) : null,
      notas:                props.notas || ''
    });
  }
};
