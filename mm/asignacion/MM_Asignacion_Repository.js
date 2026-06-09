/**
 * MM_Asignacion_Repository
 * Capa de Persistencia: Repositorio de Asignaciones de Equipo/Chip.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 *
 * Anti-Vendor Locking: Resolución de nombres de Empleado, Equipo y Chip
 * realizada en memoria, sin fórmulas ni referencias a columnas físicas de Sheets.
 */
const AsignacionRepo = new class extends BaseRepository {
  constructor() {
    super('Asignaciones', (raw) => AsignacionEntity.create(raw));
  }

  /**
   * Construye el registro plano a persistir.
   * Resuelve en memoria los datos descriptivos cruzados de Empleado, Equipo y Chip.
   */
  buildRecord(id, entity, now, user) {
    const empleado = entity.id_empleado ? DataAdapter.findById('Empleados', entity.id_empleado) : null;
    const equipo   = entity.id_equipo   ? DataAdapter.findById('Equipos',   entity.id_equipo)   : null;
    const chip     = entity.id_chip     ? DataAdapter.findById('Chips',     entity.id_chip)     : null;

    return {
      id_asignacion:    id,
      id_equipo:        entity.id_equipo        || '',
      codigo_equipo:    equipo   ? equipo.codigo_interno   : '',
      id_chip:          entity.id_chip          || '',
      codigo_chip:      chip     ? chip.codigo_interno     : '',
      id_empleado:      entity.id_empleado,
      empleado:         empleado ? empleado.nombre_completo : '',
      id_empresa:       empleado ? empleado.id_empresa      : '',
      empresa:          empleado ? (DataAdapter.findById('CAT_Empresas', empleado.id_empresa) || {}).nombre || '' : '',
      id_departamento:  empleado ? empleado.id_departamento : '',
      departamento:     empleado ? (DataAdapter.findById('CAT_Departamentos', empleado.id_departamento) || {}).nombre || '' : '',
      estado_flujo:     'PENDIENTE',
      fecha_asignacion: entity.fecha_asignacion,
      fecha_devolucion: '',
      activo:           true,
      link_acta:        entity.link_acta || '',
      notas:            entity.notas     || '',
      created_at:       now,
      approved_by:      '',
      approved_at:      '',
      created_by:       user
    };
  }

  /** Cierra una asignación activa (devolución del activo) */
  cerrar(id, fechaDevolucion) {
    return this.update(id, {
      activo:           false,
      fecha_devolucion: new Date(fechaDevolucion)
    });
  }

  /** Aprueba una asignación pendiente (flujo de autorización) */
  aprobar(id, approvedBy) {
    return this.update(id, {
      estado_flujo: 'APROBADO',
      approved_by:  approvedBy,
      approved_at:  DataAdapter.now()
    });
  }

  /** Rechaza una asignación pendiente */
  rechazar(id, rejectedBy) {
    return this.update(id, {
      estado_flujo: 'RECHAZADO',
      approved_by:  rejectedBy,
      approved_at:  DataAdapter.now()
    });
  }
}();
