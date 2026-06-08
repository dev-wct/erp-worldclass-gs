/**
 * SD_Llamada_Repository
 * Capa de Persistencia: Gestión de datos de Llamadas en Sheets.
 */
const LlamadaRepo = {
  TABLE: 'Llamadas',

  insert: function(entity, user) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_llamada:   nextId,
      id_lead:      entity.id_lead,
      id_empleado:  entity.id_empleado,
      fecha_hora:   entity.fecha_hora || now,
      duracion_seg: entity.duracion_seg,
      resultado:    entity.resultado,
      notas:        entity.notas,
      created_at:   now,
      created_by:   user
    };

    DataAdapter.insert(this.TABLE, record);
    return record;
  },

  findById: function(id) {
    const raw = DataAdapter.findById(this.TABLE, id);
    if (!raw) return null;

    if (raw.id_lead) {
      const lead = DataAdapter.findById('Leads', raw.id_lead);
      raw.lead = lead ? lead.nombre_completo : 'No encontrado';
    }
    if (raw.id_empleado) {
      const emp = DataAdapter.findById('Empleados', raw.id_empleado);
      raw.empleado = emp ? emp.nombre_completo : 'No encontrado';
    }

    return LlamadaEntity.create(raw);
  },

  findAll: function() {
    const list = DataAdapter.findAll(this.TABLE);
    
    // Cache de nombres
    const leads = DataAdapter.findAll('Leads');
    const leadMap = {};
    leads.forEach(l => { leadMap[l.id_lead] = l.nombre_completo; });

    const empleados = DataAdapter.findAll('Empleados');
    const empMap = {};
    empleados.forEach(e => { empMap[e.id_empleado] = e.nombre_completo; });

    return list.map(r => {
      r.lead = leadMap[r.id_lead] || 'No encontrado';
      r.empleado = empMap[r.id_empleado] || 'No encontrado';
      return LlamadaEntity.create(r);
    });
  }
};
