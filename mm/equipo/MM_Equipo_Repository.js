/**
 * MM_Equipo_Repository
 * Capa de Persistencia: Repositorio de Equipos Informáticos.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking CRÍTICO:
 *   Se eliminaron las fórmulas XLOOKUP inyectadas directamente en celdas de Sheets
 *   (ej: `=IFERROR(XLOOKUP(C${nextRow}, CAT_TiposEquipo!A:A, ...))`)
 *   que acoplaban el código a la estructura física de columnas de Google Sheets.
 *
 *   La resolución de catálogos (tipo, marca, empresa, estado) ahora se hace
 *   en memoria (JavaScript puro) dentro del método buildRecord,
 *   manteniendo la base de datos limpia con valores planos y portables.
 */
const EquipoRepo = new class extends BaseRepository {
  constructor() {
    super('Equipos', (raw) => EquipoEntity.create(raw));
  }

  /**
   * Construye el registro plano a persistir.
   * Resuelve los nombres de catálogos en memoria (Anti-Vendor Locking).
   */
  buildRecord(id, entity, now, user) {
    // Resolución de catálogos en memoria (sin XLOOKUP, sin acoplamiento a columnas físicas)
    const tipo    = entity.id_tipo    ? DataAdapter.findById('CAT_TiposEquipo', entity.id_tipo)    : null;
    const marca   = entity.id_marca   ? DataAdapter.findById('CAT_Marcas',      entity.id_marca)   : null;
    const empresa = entity.id_empresa ? DataAdapter.findById('CAT_Empresas',    entity.id_empresa) : null;
    const estado  = entity.id_estado  ? DataAdapter.findById('CAT_Estados',     entity.id_estado)  : null;

    return {
      id_equipo:      id,
      codigo_interno: EquipoService.generarCodigoInterno(id),
      id_tipo:        entity.id_tipo,
      tipo:           tipo    ? tipo.nombre    : '',
      id_marca:       entity.id_marca,
      marca:          marca   ? marca.nombre   : '',
      modelo:         entity.modelo,
      serial:         entity.serial ? String(entity.serial).trim().toUpperCase() : '',
      id_empresa:     entity.id_empresa,
      empresa:        empresa ? empresa.nombre  : '',
      id_estado:      entity.id_estado,
      estado:         estado  ? estado.nombre   : '',
      fecha_compra:   entity.fecha_compra,
      garantia_hasta: entity.garantia_hasta,
      valor_compra:   entity.valor_compra,
      link_factura:   entity.link_factura   || '',
      link_foto:      entity.link_foto      || '',
      observaciones:  entity.observaciones  || '',
      created_at:     now,
      updated_at:     now,
      created_by:     user
    };
  }

  /** Busca un equipo por número de serie */
  findBySerial(serial) {
    const clean   = String(serial).trim().toUpperCase();
    const results = this.findByField('serial', clean);
    return results.length > 0 ? results[0] : null;
  }

  /** Retorna equipos disponibles en bodega (id_estado = 2) */
  findDisponiblesEnBodega() {
    return this.findByField('id_estado', 2);
  }

  /** Actualiza el estado de un equipo */
  actualizarEstado(id, idEstado) {
    const estado = idEstado ? DataAdapter.findById('CAT_Estados', idEstado) : null;
    return this.update(id, {
      id_estado: idEstado,
      estado:    estado ? estado.nombre : ''
    });
  }
}();
