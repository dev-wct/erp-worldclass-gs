/**
 * SD_Campana_Repository
 * Capa de Persistencia: Acceso a datos para Campañas.
 */
const CampanaRepo = {
  TABLE: 'Campanas',

  insert: function(entity, user) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_campana:     nextId,
      nombre:         entity.nombre,
      fecha_inicio:   entity.fecha_inicio,
      fecha_fin:      entity.fecha_fin,
      objetivo_citas: entity.objetivo_citas,
      estado:         entity.estado,
      created_at:     now,
      created_by:     user
    };

    DataAdapter.insert(this.TABLE, record);
    return record;
  },

  findById: function(id) {
    const raw = DataAdapter.findById(this.TABLE, id);
    if (!raw) return null;
    return CampanaEntity.create(raw);
  },

  findAll: function() {
    const list = DataAdapter.findAll(this.TABLE);
    return list.map(r => CampanaEntity.create(r));
  },

  findActivas: function() {
    const list = DataAdapter.findAll(this.TABLE, { estado: 'ACTIVA' });
    return list.map(r => CampanaEntity.create(r));
  }
};
