/**
 * MM_Equipo_Repository
 * Capa de Infraestructura: Repositorio para persistir Equipos en la base de datos de Sheets.
 */
const EquipoRepo = {
  T: 'Equipos',

  /** Inserta un nuevo equipo inyectando fórmulas dinámicas para resolución de catálogos */
  insert: function(entity, user) {
    const id = DataAdapter.getNextId(this.T);
    const code = EquipoService.generarCodigoInterno(id);
    
    // Obtener la fila física destino para inyectar fórmulas XLOOKUP dinámicas
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(this.T);
    const nextRow = sh ? sh.getLastRow() + 1 : 2;

    const rec = {
      id_equipo:      id,
      codigo_interno: code,
      id_tipo:        entity.id_tipo,
      tipo:           `=IFERROR(XLOOKUP(C${nextRow}, CAT_TiposEquipo!A:A, CAT_TiposEquipo!B:B, ""), "")`,
      id_marca:       entity.id_marca,
      marca:          `=IFERROR(XLOOKUP(E${nextRow}, CAT_Marcas!A:A, CAT_Marcas!B:B, ""), "")`,
      modelo:         entity.modelo,
      serial:         entity.serial,
      id_empresa:     entity.id_empresa,
      empresa:        `=IFERROR(XLOOKUP(I${nextRow}, CAT_Empresas!A:A, CAT_Empresas!B:B, ""), "")`,
      id_estado:      entity.id_estado,
      estado:         `=IFERROR(XLOOKUP(K${nextRow}, CAT_Estados!A:A, CAT_Estados!B:B, ""), "")`,
      fecha_compra:   entity.fecha_compra,
      garantia_hasta: entity.garantia_hasta,
      valor_compra:   entity.valor_compra,
      link_factura:   entity.link_factura,
      link_foto:      entity.link_foto,
      observaciones:  entity.observaciones,
      created_at:     DataAdapter.now(),
      updated_at:     DataAdapter.now(),
      created_by:     user
    };

    DataAdapter.insert(this.T, rec);
    return rec;
  },

  /** Busca un equipo por número de serie (serial) */
  findBySerial: function(serial) {
    const cleanSerial = String(serial).trim().toUpperCase();
    const results = DataAdapter.findByField(this.T, 'serial', cleanSerial);
    return results.length > 0 ? results[0] : null;
  },

  /** Retorna todos los equipos disponibles en bodega (id_estado = 2) */
  findDisponiblesEnBodega: function() {
    return DataAdapter.findByField(this.T, 'id_estado', 2);
  },

  /** Actualiza el estado de un equipo */
  actualizarEstado: function(id, idEstado) {
    return DataAdapter.update(this.T, id, {
      id_estado: idEstado,
      updated_at: DataAdapter.now()
    });
  }
};
