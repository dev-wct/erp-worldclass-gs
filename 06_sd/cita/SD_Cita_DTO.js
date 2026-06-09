/**
 * SD_Cita_DTO
 * Capa de Dominio: DTO para normalizar y estructurar datos de una Cita.
 */
const CitaDTO = {
  fromForm: function(rawForm) {
    return {
      id_lead:              rawForm.id_lead ? parseInt(rawForm.id_lead, 10) : null,
      id_empleado_agendo:   rawForm.id_empleado_agendo ? parseInt(rawForm.id_empleado_agendo, 10) : null,
      restaurante:          rawForm.restaurante ? String(rawForm.restaurante).trim() : '',
      fecha_cita:           rawForm.fecha_cita || null,
      hora_cita:            rawForm.hora_cita ? String(rawForm.hora_cita).trim() : '',
      num_acompanantes:     rawForm.num_acompanantes !== undefined && rawForm.num_acompanantes !== '' ? parseInt(rawForm.num_acompanantes, 10) : 0,
      asistio:              rawForm.asistio || 'PENDIENTE',
      resultado_venta:      rawForm.resultado_venta || 'PENDIENTE',
      id_membresia_vendida: rawForm.id_membresia_vendida ? parseInt(rawForm.id_membresia_vendida, 10) : null,
      notas:                rawForm.notas ? String(rawForm.notas).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id_cita:              entity.id_cita,
      id_lead:              entity.id_lead,
      lead:                 entity.lead,
      id_empleado_agendo:   entity.id_empleado_agendo,
      empleado_agendo:      entity.empleado_agendo,
      restaurante:          entity.restaurante,
      fecha_cita:           entity.fecha_cita ? entity.fecha_cita.toISOString().split('T')[0] : null,
      hora_cita:            entity.hora_cita,
      num_acompanantes:     entity.num_acompanantes,
      asistio:              entity.asistio,
      resultado_venta:      entity.resultado_venta,
      id_membresia_vendida: entity.id_membresia_vendida,
      notas:                entity.notas
    };
  }
};
