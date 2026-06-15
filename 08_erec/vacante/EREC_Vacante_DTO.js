/**
 * EREC_Vacante_DTO
 * Adaptador de entrada/salida para Vacantes.
 * El resto del sistema no sabe si los datos vienen de un form interno,
 * una API REST o AppSheet — solo recibe el DTO normalizado.
 */
const VacanteDTO = {

  /**
   * Normaliza datos crudos del formulario interno (HtmlService).
   */
  fromForm: function(raw) {
    return {
      titulo:             String(raw.titulo             || '').trim(),
      descripcion:        String(raw.descripcion        || '').trim(),
      requisitos:         String(raw.requisitos         || '').trim(),
      id_empresa:         raw.id_empresa                || null,
      id_departamento:    raw.id_departamento           || null,
      id_rol_destino:     raw.id_rol_destino            || null,
      plazas_disponibles: parseInt(raw.plazas_disponibles) || 1,
      fecha_apertura:     String(raw.fecha_apertura     || '').trim(),
      fecha_cierre:       String(raw.fecha_cierre       || '').trim(),
      estado:             String(raw.estado             || 'BORRADOR').trim().toUpperCase(),
    };
  },

  /**
   * Respuesta pública de una vacante (para el formulario de postulación).
   * Solo expone lo que el candidato necesita ver.
   */
  toPublic: function(entity) {
    return {
      id_vacante:         entity.id_vacante,
      codigo:             entity.codigo,
      titulo:             entity.titulo,
      descripcion:        entity.descripcion,
      requisitos:         entity.requisitos,
      fecha_cierre:       entity.fecha_cierre,
      plazas_disponibles: entity.plazas_disponibles,
    };
  },

  /**
   * Respuesta completa para el panel interno del reclutador.
   */
  toResponse: function(entity) {
    return {
      id_vacante:          entity.id_vacante,
      codigo:              entity.codigo,
      titulo:              entity.titulo,
      descripcion:         entity.descripcion,
      requisitos:          entity.requisitos,
      id_empresa:          entity.id_empresa,
      id_departamento:     entity.id_departamento,
      id_rol_destino:      entity.id_rol_destino,
      plazas_disponibles:  entity.plazas_disponibles,
      plazas_cubiertas:    entity.plazas_cubiertas,
      fecha_apertura:      entity.fecha_apertura,
      fecha_cierre:        entity.fecha_cierre,
      estado:              entity.estado,
    };
  },
};
