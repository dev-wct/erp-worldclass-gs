/**
 * SD_Campana_Repository
 * Capa de Persistencia: Repositorio de Campañas.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 */
const CampanaRepo = new class extends BaseRepository {
  constructor() {
    super('Campanas', (raw) => CampanaEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_campana:     id,
      nombre:         entity.nombre,
      fecha_inicio:   entity.fecha_inicio,
      fecha_fin:      entity.fecha_fin,
      objetivo_citas: entity.objetivo_citas,
      estado:         entity.estado,
      created_at:     now,
      created_by:     user
    };
  }

  /** Retorna únicamente campañas con estado ACTIVA */
  findActivas() {
    return DataAdapter.findAll(this.tableName, { estado: 'ACTIVA' })
      .map(this._toEntity);
  }
}();
