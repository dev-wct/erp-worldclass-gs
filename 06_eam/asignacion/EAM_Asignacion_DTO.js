/**
 * MM_Asignacion_DTO
 * Capa de Aplicación: Transfiere y normaliza datos de una asignación.
 */
const AsignacionDTO = {
  fromForm: function(raw) {
    return {
      id_empleado:      raw.id_empleado ? Number(raw.id_empleado) : null,
      id_equipo:        raw.id_equipo ? Number(raw.id_equipo) : null,
      id_chip:          raw.id_chip ? Number(raw.id_chip) : null,
      fecha_asignacion: raw.fecha_asignacion || null,
      link_acta:        raw.link_acta ? String(raw.link_acta).trim() : '',
      notas:            raw.notas ? String(raw.notas).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id:               entity.id_asignacion,
      empleado:         entity.empleado,
      codigo_equipo:    entity.codigo_equipo,
      codigo_chip:      entity.codigo_chip,
      estado:           entity.estado_flujo,
      fecha_asignacion: entity.fecha_asignacion
    };
  }
};
