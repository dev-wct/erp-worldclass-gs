/**
 * RRHH_Postulante_Repository
 * Capa de Persistencia: Repositorio de Candidatos al Call Center.
 * Extiende BaseRepository — solo define buildRecord y métodos específicos.
 */
const PostulanteRepo = new class extends BaseRepository {
  constructor() {
    super('Postulantes', (raw) => PostulanteEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_postulante:     id,
      nombre_completo:   entity.nombre_completo,
      dpi:               entity.dpi               || '',
      telefono:          entity.telefono,
      email:             entity.email             || '',
      fuente:            entity.fuente            || 'FORMULARIO_PUBLICO',
      fecha_postulacion: now,
      estado:            entity.estado            || 'POSTULADO',
      notas:             entity.notes             || '',
      created_at:        now,
      created_by:        user,
    };
  }

  /** Busca postulantes por estado (POSTULADO, ENTREVISTA, ACEPTADO, RECHAZADO) */
  findByEstado(estado) {
    return this.findByField('estado', String(estado).toUpperCase());
  }

  /** Busca un postulante por email — para evitar duplicados */
  findByEmail(email) {
    return this.findByField('email', String(email).trim().toLowerCase());
  }

  /** Busca un postulante por teléfono — alternativa a email */
  findByTelefono(telefono) {
    return this.findByField('telefono', String(telefono).trim());
  }

  /** Actualiza el estado del proceso de selección */
  actualizarEstado(id, nuevoEstado) {
    return this.update(id, { estado: String(nuevoEstado).toUpperCase() });
  }
}();
