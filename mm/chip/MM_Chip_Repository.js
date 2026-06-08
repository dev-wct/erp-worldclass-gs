/**
 * MM_Chip_Repository
 * Capa de Infraestructura: Repositorio para persistir Chips SIM en la base de datos de Sheets.
 */
const ChipRepo = {
  T: 'Chips',

  /** Inserta un nuevo chip SIM inyectando fórmulas dinámicas para resolución de catálogos */
  insert: function(entity, user) {
    const id = DataAdapter.getNextId(this.T);
    const code = ChipService.generarCodigoInterno(id);
    
    // Obtener la fila física destino para inyectar fórmulas XLOOKUP dinámicas
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(this.T);
    const nextRow = sh ? sh.getLastRow() + 1 : 2;

    const rec = {
      id_chip:          id,
      codigo_interno:   code,
      numero:           entity.numero,
      id_operadora:     entity.id_operadora,
      operadora:        `=IFERROR(XLOOKUP(D${nextRow}, CAT_Operadoras!A:A, CAT_Operadoras!B:B, ""), "")`,
      plan:             entity.plan,
      costo_mensual:    entity.costo_mensual,
      id_empresa:       entity.id_empresa,
      empresa:          `=IFERROR(XLOOKUP(H${nextRow}, CAT_Empresas!A:A, CAT_Empresas!B:B, ""), "")`,
      id_estado:        entity.id_estado,
      estado:           `=IFERROR(XLOOKUP(J${nextRow}, CAT_Estados!A:A, CAT_Estados!B:B, ""), "")`,
      fecha_activacion: entity.fecha_activacion,
      observaciones:    entity.observaciones,
      created_at:       DataAdapter.now(),
      updated_at:       DataAdapter.now(),
      created_by:       user
    };

    DataAdapter.insert(this.T, rec);
    return rec;
  },

  /** Busca un chip SIM por número telefónico */
  findByNumero: function(numero) {
    const results = DataAdapter.findByField(this.T, 'numero', String(numero).trim());
    return results.length > 0 ? results[0] : null;
  },

  /** Retorna todos los chips disponibles en bodega (id_estado = 2) */
  findDisponiblesEnBodega: function() {
    return DataAdapter.findByField(this.T, 'id_estado', 2);
  },

  /** Actualiza el estado de un chip SIM */
  actualizarEstado: function(id, idEstado) {
    return DataAdapter.update(this.T, id, {
      id_estado: idEstado,
      updated_at: DataAdapter.now()
    });
  }
};
