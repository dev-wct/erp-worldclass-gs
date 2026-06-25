/**
 * MM_Equipo_DTO
 * Capa de Aplicación: Transfiere y normaliza datos de un equipo.
 */
const EquipoDTO = {
  fromForm: function(raw) {
    return {
      id_tipo:        raw.id_tipo ? Number(raw.id_tipo) : null,
      id_marca:       raw.id_marca ? Number(raw.id_marca) : null,
      modelo:         raw.modelo ? String(raw.modelo).trim() : '',
      serial:         raw.serial ? String(raw.serial).trim().toUpperCase() : '',
      id_empresa:     raw.id_empresa ? Number(raw.id_empresa) : null,
      id_sucursal:    raw.id_sucursal ? Number(raw.id_sucursal) : null,
      id_estado:      raw.id_estado ? Number(raw.id_estado) : null,
      fecha_compra:   raw.fecha_compra || null,
      garantia_hasta: raw.garantia_hasta || null,
      valor_compra:   raw.valor_compra !== undefined && raw.valor_compra !== "" && raw.valor_compra !== null ? Number(raw.valor_compra) : null,
      link_factura:   raw.link_factura ? String(raw.link_factura).trim() : '',
      link_foto:      raw.link_foto ? String(raw.link_foto).trim() : '',
      observaciones:  raw.observaciones ? String(raw.observaciones).trim() : ''
    };
  },

  toResponse: function(entity) {
    return {
      id:             entity.id_equipo,
      codigo:         entity.codigo_interno,
      marca:          entity.marca,
      modelo:         entity.modelo,
      serial:         entity.serial,
      empresa:        entity.empresa,
      estado:         entity.estado
    };
  }
};
