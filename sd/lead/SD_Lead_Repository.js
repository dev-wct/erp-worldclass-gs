/**
 * SD_Lead_Repository
 * Capa de Persistencia: Gestión de datos de Leads en Sheets.
 */
const LeadRepo = {
  TABLE: 'Leads',

  insert: function(entity, user) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_lead:         nextId,
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

    DataAdapter.insert(this.TABLE, record);
    return record;
  },

  findById: function(id) {
    const raw = DataAdapter.findById(this.TABLE, id);
    if (!raw) return null;
    
    // Resolver nombre de la campaña
    if (raw.id_campana) {
      const camp = DataAdapter.findById('Campanas', raw.id_campana);
      raw.campana = camp ? camp.nombre : 'No encontrada';
    }
    
    return LeadEntity.create(raw);
  },

  findByTelefono: function(tel) {
    const list = DataAdapter.findByField(this.TABLE, 'telefono', tel);
    return list.map(r => {
      if (r.id_campana) {
        const camp = DataAdapter.findById('Campanas', r.id_campana);
        r.campana = camp ? camp.nombre : 'No encontrada';
      }
      return LeadEntity.create(r);
    });
  },

  findAll: function() {
    const list = DataAdapter.findAll(this.TABLE);
    // Resolver nombres de campaña en lote para eficiencia
    const campanas = DataAdapter.findAll('Campanas');
    const campMap = {};
    campanas.forEach(c => { campMap[c.id_campana] = c.nombre; });

    return list.map(r => {
      r.campana = campMap[r.id_campana] || 'No encontrada';
      return LeadEntity.create(r);
    });
  },

  actualizarEstado: function(idLead, nuevoEstado) {
    return DataAdapter.update(this.TABLE, idLead, {
      estado: nuevoEstado,
      updated_at: DataAdapter.now()
    });
  }
};
