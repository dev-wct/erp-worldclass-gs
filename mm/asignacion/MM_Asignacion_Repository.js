/**
 * MM_Asignacion_Repository
 * Capa de Infraestructura: Repositorio para persistir Asignaciones.
 */
const AsignacionRepo = {
  T: 'Asignaciones',

  insert: function(entity, user) {
    const id = DataAdapter.getNextId(this.T);
    const now = DataAdapter.now();

    // Resolver nombres descriptivos para las columnas de texto
    const empleado = entity.id_empleado ? DataAdapter.findById('Empleados', entity.id_empleado) : null;
    const equipo = entity.id_equipo ? DataAdapter.findById('Equipos', entity.id_equipo) : null;
    const chip = entity.id_chip ? DataAdapter.findById('Chips', entity.id_chip) : null;

    const rec = {
      id_asignacion:    id,
      id_equipo:        entity.id_equipo || '',
      codigo_equipo:    equipo ? equipo.codigo_interno : '',
      id_chip:          entity.id_chip || '',
      codigo_chip:      chip ? chip.codigo_interno : '',
      id_empleado:      entity.id_empleado,
      empleado:         empleado ? empleado.nombre_completo : '',
      id_empresa:       empleado ? empleado.id_empresa : '',
      empresa:          empleado ? empleado.id_empresa : '',
      id_departamento:  empleado ? empleado.id_departamento : '',
      departamento:     empleado ? empleado.id_departamento : '',
      estado_flujo:     'PENDIENTE',
      fecha_asignacion: entity.fecha_asignacion,
      fecha_devolucion: '',
      activo:           true,
      link_acta:        entity.link_acta,
      notas:            entity.notas,
      created_at:       now,
      approved_by:      '',
      approved_at:      '',
      created_by:       user
    };

    DataAdapter.insert(this.T, rec);
    return rec;
  },

  /** Cierra una asignación activa (devolución) */
  cerrar: function(id, fechaDevolucion) {
    return DataAdapter.update(this.T, id, {
      activo: false,
      fecha_devolucion: new Date(fechaDevolucion)
    });
  },

  /** Aprueba una asignación pendiente */
  aprobar: function(id, approvedBy) {
    return DataAdapter.update(this.T, id, {
      estado_flujo: 'APROBADO',
      approved_by:  approvedBy,
      approved_at:  DataAdapter.now()
    });
  }
};
