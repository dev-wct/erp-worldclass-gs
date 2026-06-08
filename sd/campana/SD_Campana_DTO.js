/**
 * SD_Campana_DTO
 * Capa de Dominio: DTO para normalizar y estructurar los datos de Campaña.
 */
const CampanaDTO = {
  fromForm: function(rawForm) {
    return {
      nombre:         rawForm.nombre ? String(rawForm.nombre).trim() : '',
      fecha_inicio:   rawForm.fecha_inicio || null,
      fecha_fin:      rawForm.fecha_fin || null,
      objetivo_citas: rawForm.objetivo_citas !== undefined && rawForm.objetivo_citas !== '' ? parseInt(rawForm.objetivo_citas, 10) : 0,
      estado:         rawForm.estado || 'PLANIFICADA'
    };
  },

  toResponse: function(entity) {
    return {
      id_campana:     entity.id_campana,
      nombre:         entity.nombre,
      fecha_inicio:   entity.fecha_inicio ? entity.fecha_inicio.toISOString().split('T')[0] : null,
      fecha_fin:      entity.fecha_fin ? entity.fecha_fin.toISOString().split('T')[0] : null,
      objetivo_citas: entity.objetivo_citas,
      estado:         entity.estado
    };
  }
};
