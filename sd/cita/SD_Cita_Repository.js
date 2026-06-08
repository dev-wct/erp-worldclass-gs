/**
 * SD_Cita_Repository
 * Capa de Persistencia: Gestión de datos de Citas en Sheets.
 */
const CitaRepo = {
  TABLE: 'Citas',

  insert: function(entity, user) {
    const nextId = DataAdapter.getNextId(this.TABLE);
    const now = DataAdapter.now();

    const record = {
      id_cita:              nextId,
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
    if (raw.id_empleado_agendo) {
      const emp = DataAdapter.findById('Empleados', raw.id_empleado_agendo);
      raw.empleado_agendo = emp ? emp.nombre_completo : 'No encontrado';
    }

    return CitaEntity.create(raw);
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
      r.empleado_agendo = empMap[r.id_empleado_agendo] || 'No encontrado';
      return CitaEntity.create(r);
    });
  }
};
