/**
 * FICO_CostoChip_Repository
 * Capa de Persistencia: Repositorio de Costos Mensuales de Chips SIM.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: Resolución del código y número del chip
 * realizada en memoria, sin fórmulas ni referencias a columnas físicas de Sheets.
 */
const CostoChipRepo = new class extends BaseRepository {
  constructor() {
    super('Costos_Chips', (raw) => CostoChipEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    // Resolver datos del chip en memoria
    const chip = entity.id_chip
      ? DataAdapter.findById('Chips', entity.id_chip) : null;

    return {
      id_costo:      id,
      id_chip:       entity.id_chip,
      codigo_chip:   chip ? chip.codigo_interno : '',
      numero_chip:   chip ? chip.numero         : '',
      anio:          entity.anio,
      mes:           entity.mes,
      monto:         entity.monto,
      pagado:        entity.pagado || false,
      observaciones: entity.observaciones || '',
      created_at:    now
    };
  }

  /** Retorna todos los costos resolviendo datos del chip en memoria */
  findAll() {
    const list    = DataAdapter.findAll(this.tableName);
    const chips   = DataAdapter.findAll('Chips');
    const chipMap = {};
    chips.forEach(function(c) {
      chipMap[c.id_chip] = { codigo: c.codigo_interno, numero: c.numero };
    });
    return list.map(function(r) {
      const data   = chipMap[r.id_chip] || { codigo: '', numero: '' };
      r.codigo_chip = data.codigo;
      r.numero_chip = data.numero;
      return CostoChipEntity.create(r);
    });
  }

  /** Retorna todos los costos de un chip específico */
  findByChip(idChip) {
    return this.findByField('id_chip', parseInt(idChip, 10));
  }

  /** Retorna costos de un período específico (año + mes) */
  findByPeriodo(anio, mes) {
    return DataAdapter.findAll(this.tableName, {
      anio: parseInt(anio, 10),
      mes:  parseInt(mes,  10)
    }).map(this._toEntity);
  }

  /** Marca un costo como pagado */
  marcarPagado(id) {
    return this.update(id, { pagado: true });
  }
}();
