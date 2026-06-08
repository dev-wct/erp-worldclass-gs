/**
 * FICO_Pago_Repository
 * Capa de Persistencia: Gestión de datos de Pagos de Nómina en Sheets.
 */
const PagoRepo = {
  TABLE: 'Pagos_Nomina',

  insert: function(entity, user) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_pago:      nextId,
      id_empleado:  entity.id_empleado,
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

    DataAdapter.insert(this.TABLE, record);
    return record;
  },

  findById: function(id) {
    const raw = DataAdapter.findById(this.TABLE, id);
    if (!raw) return null;

    if (raw.id_empleado) {
      const emp = DataAdapter.findById('Empleados', raw.id_empleado);
      raw.empleado = emp ? emp.nombre_completo : 'No encontrado';
    }

    return PagoEntity.create(raw);
  },

  findByEmpleadoPeriodo: function(idEmpleado, anio, quincena) {
    const all = DataAdapter.findAll(this.TABLE, { 
      id_empleado: parseInt(idEmpleado, 10), 
      anio: parseInt(anio, 10), 
      quincena: parseInt(quincena, 10) 
    });
    return all.map(r => PagoEntity.create(r));
  },

  findAll: function() {
    const list = DataAdapter.findAll(this.TABLE);
    
    // Cache de nombres de empleados
    const empleados = DataAdapter.findAll('Empleados');
    const empMap = {};
    empleados.forEach(e => { empMap[e.id_empleado] = e.nombre_completo; });

    return list.map(r => {
      r.empleado = empMap[r.id_empleado] || 'No encontrado';
      return PagoEntity.create(r);
    });
  }
};
