/**
 * SD_Cita_Repository
 * Capa de Persistencia: Repositorio de Citas VIP.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: Joins de Leads y Empleados resueltos en memoria.
 */
const CitaRepo = new class extends BaseRepository {
  constructor() {
    super('Citas', (raw) => CitaEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_cita:              id,
      id_lead:              entity.id_lead,
      id_empleado_agendo:   entity.id_empleado_agendo,
      restaurante:          entity.restaurante,
      fecha_cita:           entity.fecha_cita,
      hora_cita:            entity.hora_cita,
      num_acompanantes:     entity.num_acompanantes,
      asistio:              entity.asistio,
      resultado_venta:      entity.resultado_venta,
      id_membresia_vendida: entity.id_membresia_vendida || '',
      notas:                entity.notas,
      created_at:           now,
      updated_at:           now,
      created_by:           user
    };
  }

  /** Retorna todas las citas resolviendo nombres de Lead y Empleado en memoria */
  findAll() {
    const list      = DataAdapter.findAll(this.tableName);
    const leads     = DataAdapter.findAll('Leads');
    const empleados = DataAdapter.findAll('Empleados');
    const leadMap   = {};
    const empMap    = {};
    leads.forEach(function(l)    { leadMap[l.id_lead]       = l.nombre_completo; });
    empleados.forEach(function(e){ empMap[e.id_empleado]    = e.nombre_completo; });
    return list.map(function(r) {
      r.lead           = leadMap[r.id_lead]           || 'No encontrado';
      r.empleado_agendo = empMap[r.id_empleado_agendo] || 'No encontrado';
      return CitaEntity.create(r);
    });
  }

  /** Actualiza el resultado de una cita (asistencia / venta) */
  actualizarResultado(id, asistio, resultado) {
    return this.update(id, { asistio: asistio, resultado_venta: resultado });
  }
}();
