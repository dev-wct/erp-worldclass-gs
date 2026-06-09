/**
 * FICO_Pago_Repository
 * Capa de Persistencia: Repositorio de Pagos de Nómina (Dispersión Financiera).
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: Resolución del nombre del empleado realizada en
 * memoria, sin fórmulas ni referencias a columnas físicas de Sheets.
 */
const PagoRepo = new class extends BaseRepository {
  constructor() {
    super('Pagos_Nomina', (raw) => PagoEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    // Resolver nombre del empleado en memoria
    const empleado = entity.id_empleado
      ? DataAdapter.findById('Empleados', entity.id_empleado) : null;

    return {
      id_pago:      id,
      id_empleado:  entity.id_empleado,
      empleado:     empleado ? empleado.nombre_completo : '',
      anio:         entity.anio,
      quincena:     entity.quincena,
      sueldo_base:  entity.sueldo_base,
      comisiones:   entity.comisiones,
      bonos:        entity.bonos,
      deducciones:  entity.deducciones,
      total_neto:   entity.total_neto,
      pagado:       entity.pagado,
      fecha_pago:   entity.fecha_pago || '',
      metodo_pago:  entity.metodo_pago,
      created_at:   now,
      created_by:   user
    };
  }

  /** Retorna todos los pagos resolviendo nombre del empleado en memoria */
  findAll() {
    const list      = DataAdapter.findAll(this.tableName);
    const empleados = DataAdapter.findAll('Empleados');
    const empMap    = {};
    empleados.forEach(function(e) { empMap[e.id_empleado] = e.nombre_completo; });
    return list.map(function(r) {
      r.empleado = empMap[r.id_empleado] || 'No encontrado';
      return PagoEntity.create(r);
    });
  }

  /** Verifica si ya existe un pago para un empleado en un período de quincena */
  findByEmpleadoPeriodo(idEmpleado, anio, quincena) {
    return DataAdapter.findAll(this.tableName, {
      id_empleado: parseInt(idEmpleado, 10),
      anio:        parseInt(anio, 10),
      quincena:    parseInt(quincena, 10)
    }).map(this._toEntity);
  }
}();
