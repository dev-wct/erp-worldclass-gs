/**
 * FICO_CostoChip_Repository
 * Capa de Persistencia: Gestión de costos de Chips en Sheets.
 */
const CostoChipRepo = {
  TABLE: 'Costos_Chips',

  insert: function(entity) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_costo:      nextId,
      id_chip:       entity.id_chip,
      anio:          entity.anio,
      mes:           entity.mes,
      monto:         entity.monto,
      pagado:        entity.pagado,
      observaciones: entity.observaciones,
      created_at:    now
    };

    DataAdapter.insert(this.TABLE, record);
    return record;
  },

  findById: function(id) {
    const raw = DataAdapter.findById(this.TABLE, id);
    if (!raw) return null;

    if (raw.id_chip) {
      const chip = DataAdapter.findById('Chips', raw.id_chip);
      raw.codigo_chip = chip ? chip.codigo_interno : '';
      raw.numero_chip = chip ? chip.numero : '';
    }

    return CostoChipEntity.create(raw);
  },

  findAll: function() {
    const list = DataAdapter.findAll(this.TABLE);
    
    // Cache de datos del chip
    const chips = DataAdapter.findAll('Chips');
    const chipMap = {};
    chips.forEach(c => { 
      chipMap[c.id_chip] = { codigo: c.codigo_interno, numero: c.numero };
    });

    return list.map(r => {
      const data = chipMap[r.id_chip] || { codigo: '', numero: '' };
      r.codigo_chip = data.codigo;
      r.numero_chip = data.numero;
      return CostoChipEntity.create(r);
    });
  }
};
