/**
 * MM_Chip_Repository
 * Capa de Persistencia: Repositorio de Chips SIM.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking CRÍTICO:
 *   Se eliminaron las fórmulas XLOOKUP inyectadas directamente en celdas de Sheets
 *   (ej: `=IFERROR(XLOOKUP(D${nextRow}, CAT_Operadoras!A:A, ...))`)
 *   que acoplaban el código a la estructura física de columnas de Google Sheets.
 *
 *   La resolución de catálogos (operadora, empresa, estado) ahora se hace
 *   en memoria (JavaScript puro) dentro del método buildRecord,
 *   manteniendo la base de datos limpia con valores planos y portables.
 */
const ChipRepo = new class extends BaseRepository {
  constructor() {
    super('Chips', (raw) => ChipEntity.create(raw));
  }

  /**
   * Construye el registro plano a persistir.
   * Resuelve los nombres de catálogos en memoria (Anti-Vendor Locking).
   */
  buildRecord(id, entity, now, user) {
    // Resolución de catálogos en memoria (sin XLOOKUP, sin acoplamiento a columnas físicas)
    const operadora = entity.id_operadora
      ? DataAdapter.findById('CAT_Operadoras', entity.id_operadora) : null;
    const empresa = entity.id_empresa
      ? DataAdapter.findById('CAT_Empresas', entity.id_empresa) : null;
    const estado = entity.id_estado
      ? DataAdapter.findById('CAT_Estados', entity.id_estado) : null;

    return {
      id_chip:          id,
      codigo_interno:   ChipService.generarCodigoInterno(id),
      numero:           entity.numero,
      id_operadora:     entity.id_operadora,
      operadora:        operadora ? operadora.nombre : '',
      plan:             entity.plan,
      costo_mensual:    entity.costo_mensual,
      id_empresa:       entity.id_empresa,
      empresa:          empresa  ? empresa.nombre  : '',
      id_estado:        entity.id_estado,
      estado:           estado   ? estado.nombre   : '',
      fecha_activacion: entity.fecha_activacion,
      observaciones:    entity.observaciones,
      created_at:       now,
      updated_at:       now,
      created_by:       user
    };
  }

  /** Busca un chip por número telefónico */
  findByNumero(numero) {
    const results = this.findByField('numero', String(numero).trim());
    return results.length > 0 ? results[0] : null;
  }

  /** Retorna chips disponibles en bodega (estado id=2) */
  findDisponiblesEnBodega() {
    return this.findByField('id_estado', 2);
  }

  /** Actualiza el estado de un chip */
  actualizarEstado(id, idEstado) {
    const estado = idEstado ? DataAdapter.findById('CAT_Estados', idEstado) : null;
    return this.update(id, {
      id_estado: idEstado,
      estado:    estado ? estado.nombre : ''
    });
  }
}();
