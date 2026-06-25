/**
 * MM_Chip_DTO
 * Capa de Aplicación: Transfiere y normaliza datos de un chip SIM.
 */
const ChipDTO = {
  fromForm: function(raw) {
    return {
      numero:           raw.numero ? String(raw.numero).trim() : '',
      id_operadora:     raw.id_operadora ? Number(raw.id_operadora) : null,
      plan:             raw.plan ? String(raw.plan).trim() : '',
      costo_mensual:    raw.costo_mensual !== undefined && raw.costo_mensual !== "" && raw.costo_mensual !== null ? Number(raw.costo_mensual) : 0,
      id_empresa:       raw.id_empresa ? Number(raw.id_empresa) : null,
      id_estado:        raw.id_estado ? Number(raw.id_estado) : null,
      fecha_activacion: raw.fecha_activacion || null,
      observaciones:    raw.observaciones ? String(raw.observaciones).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id:             entity.id_chip,
      codigo:         entity.codigo_interno,
      numero:         entity.numero,
      operadora:      entity.operadora,
      plan:           entity.plan,
      costo_mensual:  entity.costo_mensual,
      empresa:        entity.empresa,
      estado:         entity.estado
    };
  }
};
