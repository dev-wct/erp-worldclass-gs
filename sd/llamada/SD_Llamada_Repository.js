/**
 * SD_Llamada_Repository
 * Capa de Persistencia: Repositorio de Llamadas del Call Center.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: Joins de Leads y Empleados resueltos en memoria.
 */
const LlamadaRepo = new class extends BaseRepository {
  constructor() {
    super('Llamadas', (raw) => LlamadaEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_llamada:   id,
      id_lead:      entity.id_lead,
      id_empleado:  entity.id_empleado,
      fecha_hora:   entity.fecha_hora || now,
      duracion_seg: entity.duracion_seg,
      resultado:    entity.resultado,
      notas:        entity.notas,
      created_at:   now,
      created_by:   user
    };
  }

  /** Retorna todas las llamadas resolviendo nombres de Lead y Empleado en memoria */
  findAll() {
    const list      = DataAdapter.findAll(this.tableName);
    const leads     = DataAdapter.findAll('Leads');
    const empleados = DataAdapter.findAll('Empleados');
    const leadMap   = {};
    const empMap    = {};
    leads.forEach(function(l)    { leadMap[l.id_lead]    = l.nombre_completo; });
    empleados.forEach(function(e){ empMap[e.id_empleado] = e.nombre_completo; });
    return list.map(function(r) {
      r.lead     = leadMap[r.id_lead]    || 'No encontrado';
      r.empleado = empMap[r.id_empleado] || 'No encontrado';
      return LlamadaEntity.create(r);
    });
  }

  /** Retorna todas las llamadas de un lead específico */
  findByLead(idLead) {
    return this.findByField('id_lead', parseInt(idLead, 10));
  }
}();
