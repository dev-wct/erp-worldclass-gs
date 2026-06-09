/**
 * SD_Lead_Repository
 * Capa de Persistencia: Repositorio de Leads.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: La resolución de la campaña asociada se hace en
 * memoria (JavaScript), no con fórmulas de Sheets.
 */
const LeadRepo = new class extends BaseRepository {
  constructor() {
    super('Leads', (raw) => LeadEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_lead:         id,
      nombre_completo: entity.nombre_completo,
      telefono:        entity.telefono,
      email:           entity.email,
      tipo_tdc:        entity.tipo_tdc,
      banco_emisor:    entity.banco_emisor,
      id_campana:      entity.id_campana,
      estado:          entity.estado,
      fuente:          entity.fuente,
      notas:           entity.notas,
      created_at:      now,
      updated_at:      now,
      created_by:      user
    };
  }

  /** Retorna todos los leads resolviendo el nombre de campaña en memoria */
  findAll() {
    const list     = DataAdapter.findAll(this.tableName);
    const campanas = DataAdapter.findAll('Campanas');
    const campMap  = {};
    campanas.forEach(function(c) { campMap[c.id_campana] = c.nombre; });
    return list.map(function(r) {
      r.campana = campMap[r.id_campana] || 'No encontrada';
      return LeadEntity.create(r);
    });
  }

  /** Busca leads por número de teléfono */
  findByTelefono(tel) {
    return DataAdapter.findByField(this.tableName, 'telefono', String(tel).trim())
      .map(this._toEntity);
  }

  /** Cambia el estado de un lead */
  actualizarEstado(id, nuevoEstado) {
    return this.update(id, { estado: nuevoEstado });
  }
}();
