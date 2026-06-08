const EmpleadoRepo = {
  T: 'Empleados',

  insert: function(entity, user) {
    const id  = DataAdapter.getNextId(this.T);
    const now = DataAdapter.now();
    const rec = Object.assign({}, entity, {
      id_empleado: id,
      created_at:  now,
      updated_at:  now,
      created_by:  user,
    });
    DataAdapter.insert(this.T, rec);
    return rec;
  },

  findByEmail: function(email) {
    return DataAdapter.findByField(this.T, 'email', email);
  },

  desactivar: function(id, fechaSalida) {
    return DataAdapter.update(this.T, id, {
      activo:      false,
      fecha_salida: new Date(fechaSalida),
      updated_at:   DataAdapter.now(),
    });
  },
};
