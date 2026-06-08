/**
 * MM_Asignacion_Entity
 * Capa de Dominio: Entidad inmutable para representar una asignación de equipo/chip a un empleado.
 */
const AsignacionEntity = {
  create: function(props) {
    return Object.freeze({
      id_asignacion:    props.id_asignacion || null,
      id_equipo:        props.id_equipo || null,
      codigo_equipo:    props.codigo_equipo || '',
      id_chip:          props.id_chip || null,
      codigo_chip:      props.codigo_chip || '',
      id_empleado:      props.id_empleado,
      empleado:         props.empleado || '',
      id_empresa:       props.id_empresa,
      empresa:          props.empresa || '',
      id_departamento:  props.id_departamento,
      departamento:     props.departamento || '',
      estado_flujo:     props.estado_flujo || 'PENDIENTE',
      fecha_asignacion: props.fecha_asignacion ? new Date(props.fecha_asignacion) : new Date(),
      fecha_devolucion: props.fecha_devolucion ? new Date(props.fecha_devolucion) : null,
      activo:           props.activo !== undefined ? props.activo : true,
      link_acta:        props.link_acta || '',
      notas:            props.notas || ''
    });
  }
};
