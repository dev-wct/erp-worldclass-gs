/**
 * RRHH_Empleado_Repository
 * Capa de Persistencia: Repositorio de Empleados.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 */
const EmpleadoRepo = new class extends BaseRepository {
  constructor() {
    super('Empleados', (raw) => EmpleadoEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return Object.assign({}, entity, {
      id_empleado: id,
      created_at:  now,
      updated_at:  now,
      created_by:  user
    });
  }

  /** Busca un empleado por dirección de correo electrónico */
  findByEmail(email) {
    return this.findByField('email', String(email).trim().toLowerCase());
  }

  /** Desactiva un empleado (baja laboral) */
  desactivar(id, fechaSalida) {
    return this.update(id, {
      activo:       false,
      fecha_salida: new Date(fechaSalida)
    });
  }
}();
