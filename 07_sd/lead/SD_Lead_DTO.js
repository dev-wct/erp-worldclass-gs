/**
 * SD_Lead_DTO
 * Capa de Dominio: DTO para estructurar y normalizar datos de un Lead.
 */
const LeadDTO = {
  fromForm: function(rawForm) {
    return {
      nombre_completo: rawForm.nombre_completo ? String(rawForm.nombre_completo).trim() : '',
      telefono:        rawForm.telefono ? String(rawForm.telefono).trim() : '',
      email:           rawForm.email ? String(rawForm.email).trim().toLowerCase() : '',
      tipo_tdc:        rawForm.tipo_tdc ? String(rawForm.tipo_tdc).trim().toUpperCase() : 'NINGUNA',
      banco_emisor:    rawForm.banco_emisor ? String(rawForm.banco_emisor).trim().toUpperCase() : 'NINGUNO',
      id_campana:      rawForm.id_campana ? parseInt(rawForm.id_campana, 10) : null,
      estado:          rawForm.estado || 'NUEVO',
      fuente:          rawForm.fuente ? String(rawForm.fuente).trim().toUpperCase() : 'DESCONOCIDA',
      notas:           rawForm.notas ? String(rawForm.notas).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id_lead:         entity.id_lead,
      nombre_completo: entity.nombre_completo,
      telefono:        entity.telefono,
      email:           entity.email,
      tipo_tdc:        entity.tipo_tdc,
      banco_emisor:    entity.banco_emisor,
      id_campana:      entity.id_campana,
      campana:         entity.campana,
      estado:          entity.estado,
      fuente:          entity.fuente,
      notas:           entity.notas
    };
  }
};
