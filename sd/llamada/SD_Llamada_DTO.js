/**
 * SD_Llamada_DTO
 * Capa de Dominio: DTO para normalizar y estructurar datos de una llamada.
 */
const LlamadaDTO = {
  fromForm: function(rawForm) {
    return {
      id_lead:      rawForm.id_lead ? parseInt(rawForm.id_lead, 10) : null,
      id_empleado:  rawForm.id_empleado ? parseInt(rawForm.id_empleado, 10) : null,
      fecha_hora:   rawForm.fecha_hora || null,
      duracion_seg: rawForm.duracion_seg !== undefined && rawForm.duracion_seg !== '' ? parseInt(rawForm.duracion_seg, 10) : 0,
      resultado:    rawForm.resultado ? String(rawForm.resultado).trim().toUpperCase() : 'PENDIENTE',
      notas:        rawForm.notas ? String(rawForm.notas).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id_llamada:   entity.id_llamada,
      id_lead:      entity.id_lead,
      lead:         entity.lead,
      id_empleado:  entity.id_empleado,
      empleado:     entity.empleado,
      fecha_hora:   entity.fecha_hora ? entity.fecha_hora.toISOString() : null,
      duracion_seg: entity.duracion_seg,
      resultado:    entity.resultado,
      notas:        entity.notas
    };
  }
};
