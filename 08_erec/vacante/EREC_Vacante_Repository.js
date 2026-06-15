/**
 * EREC_Vacante_Repository
 * Persistencia de Vacantes. Extiende BaseRepository.
 */
const VacanteRepo = new class extends BaseRepository {
  constructor() {
    super('EREC_Vacantes', (raw) => VacanteEntity.create(raw));
  }

  buildRecord(id, entity, now, user) {
    return {
      id_vacante:         id,
      codigo:             Utils.generarCodigo('EREC', id),
      titulo:             entity.titulo,
      descripcion:        entity.descripcion        || '',
      requisitos:         entity.requisitos         || '',
      id_empresa:         entity.id_empresa         || '',
      id_departamento:    entity.id_departamento    || '',
      id_rol_destino:     entity.id_rol_destino     || '',
      plazas_disponibles: entity.plazas_disponibles || 1,
      plazas_cubiertas:   0,
      fecha_apertura:     entity.fecha_apertura     || now,
      fecha_cierre:       entity.fecha_cierre       || '',
      estado:             entity.estado             || 'BORRADOR',
      created_at:         now,
      updated_at:         now,
      created_by:         user,
    };
  }

  findAbiertas() {
    return this.findByField('estado', 'ABIERTA');
  }

  findByEmpresa(idEmpresa) {
    return this.findByField('id_empresa', idEmpresa);
  }

  actualizarEstado(id, nuevoEstado) {
    return this.update(id, { estado: nuevoEstado });
  }

  incrementarCubiertas(id) {
    const vacante = this.findById(id);
    if (!vacante) return false;
    const nuevas = (parseInt(vacante.plazas_cubiertas) || 0) + 1;
    const estado = nuevas >= vacante.plazas_disponibles ? 'CERRADA' : 'EN_PROCESO';
    return this.update(id, { plazas_cubiertas: nuevas, estado: estado });
  }
}();


/**
 * EREC_Postulante_Repository
 * Persistencia de candidatos EREC (desacoplado de RRHH_Postulantes).
 */
const ErecPostulanteRepo = new class extends BaseRepository {
  constructor() {
    super('EREC_Postulantes', (raw) => raw);
  }

  buildRecord(id, entity, now, user) {
    return {
      id_postulante_erec: id,
      id_vacante:         entity.id_vacante          || '',
      nombre_completo:    entity.nombre_completo,
      documento_identidad:entity.documento_identidad || '',
      telefono:           entity.telefono            || '',
      email:              entity.email               || '',
      link_cv:            entity.link_cv             || '',
      fuente:             entity.fuente              || 'LINK_PUBLICO',
      etapa_actual:       'POSTULADO',
      puntaje:            0,
      notas_candidato:    entity.notas               || '',
      fecha_postulacion:  now,
      created_at:         now,
      updated_at:         now,
      created_by:         user,
    };
  }

  findByVacante(idVacante) {
    return this.findByField('id_vacante', idVacante);
  }

  findByEmail(email) {
    return this.findByField('email', String(email).toLowerCase().trim());
  }

  findByEtapa(etapa) {
    return this.findByField('etapa_actual', etapa);
  }

  avanzarEtapa(id, nuevaEtapa) {
    return this.update(id, { etapa_actual: nuevaEtapa });
  }
}();


/**
 * EREC_Link_Repository
 * Persistencia de links de postulación (reemplaza PostulantesTokens de RRHH).
 */
const ErecLinkRepo = new class extends BaseRepository {
  constructor() {
    super('EREC_LinksPostulacion', (raw) => raw);
  }

  buildRecord(id, entity, now, user) {
    return {
      id_link:        id,
      token:          entity.token,
      link_url:       entity.link_url       || '',
      modo:           entity.modo           || 'PUBLICO',
      id_vacante:     entity.id_vacante     || '',
      email_destino:  entity.email_destino  || '',
      nombre_destino: entity.nombre_destino || '',
      creado_por:     user,
      creado_at:      now,
      expira_at:      entity.expira_at      || '',
      estado:         'PENDIENTE',
      usado_at:       '',
    };
  }

  findByToken(token) {
    const results = this.findByField('token', String(token));
    return results.length > 0 ? results[0] : null;
  }

  marcarUsado(token) {
    const link = this.findByToken(token);
    if (!link) return false;
    return this.update(link.id_link, {
      estado:   'USADO',
      usado_at: new Date(),
    });
  }
}();
