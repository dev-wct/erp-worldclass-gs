/**
 * EREC_Vacante_UseCases
 * ─────────────────────────────────────────────────────────────────────────
 * Orquestador de lógica de negocio del módulo E-Recruiting.
 *
 * Paradigmas:
 *  LISP  : Pipeline funcional — cada caso de uso es una función pura
 *          que recibe un DTO y retorna un resultado sin efectos secundarios
 *          ocultos.
 *  COBOL : Cada operación trabaja sobre un "registro" bien definido y auditado.
 *  POO   : Consume los repositorios sin acoplarse a su implementación.
 * ─────────────────────────────────────────────────────────────────────────
 */
const VacanteUseCases = {

  /**
   * Crea una nueva vacante de reclutamiento.
   */
  crear: function(dto) {
    const validacion = VacanteValidator.validarCreacion(dto);
    if (!validacion.valido) return { ok: false, errores: validacion.errores };

    const entity = VacanteEntity.create(dto);
    const user   = DataAdapter.getCurrentUser();
    const saved  = VacanteRepo.insert(entity, user);

    return {
      ok:      true,
      data:    VacanteDTO.toResponse(saved),
      mensaje: 'Vacante ' + saved.codigo + ' creada exitosamente.',
    };
  },

  /**
   * Cambia el estado de una vacante (BORRADOR → ABIERTA → etc.)
   */
  cambiarEstado: function(idVacante, nuevoEstado) {
    const vacante = VacanteRepo.findById(idVacante);
    if (!vacante) return { ok: false, errores: ['Vacante no encontrada: ' + idVacante] };

    const validacion = VacanteValidator.validarCambioEstado(vacante.estado, nuevoEstado);
    if (!validacion.valido) return { ok: false, errores: validacion.errores };

    VacanteRepo.actualizarEstado(idVacante, nuevoEstado);
    return { ok: true, mensaje: 'Estado actualizado a ' + nuevoEstado + '.' };
  },

  /**
   * Lista todas las vacantes abiertas — usado por el formulario público
   * para mostrar las posiciones disponibles.
   */
  listarAbiertas: function() {
    return VacanteRepo.findAbiertas().map(VacanteDTO.toPublic);
  },

  /**
   * Genera un link de postulación para una vacante.
   * MODO INDIVIDUAL: token personal para un candidato específico.
   * MODO PUBLICO: link abierto para publicar donde se quiera.
   */
  generarLink: function(idVacante, modo, emailDestino, nombreDestino) {
    const vacante = VacanteRepo.findById(idVacante);
    if (!vacante) return { ok: false, errores: ['Vacante no encontrada.'] };
    if (vacante.estado !== 'ABIERTA' && vacante.estado !== 'EN_PROCESO') {
      return { ok: false, errores: ['Solo se pueden generar links para vacantes ABIERTAS o EN_PROCESO.'] };
    }

    var webAppUrl = '';
    try {
      webAppUrl = PropertiesService.getScriptProperties().getProperty('WEBAPP_URL') || '';
    } catch(e) {}

    var token = Utilities.getUuid();
    var ahora = new Date();
    var expira = modo === 'INDIVIDUAL'
      ? new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)   // 7 días
      : new Date(ahora.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 año

    // El link incluye la vacante para que el formulario cargue el contexto correcto
    var linkUrl = webAppUrl
      ? (webAppUrl + '?vacante=' + idVacante + '&token=' + token)
      : '';

    var user = DataAdapter.getCurrentUser();
    ErecLinkRepo.insert({
      token:          token,
      link_url:       linkUrl,
      modo:           modo || 'PUBLICO',
      id_vacante:     idVacante,
      email_destino:  emailDestino  || '',
      nombre_destino: nombreDestino || '',
      expira_at:      expira,
    }, user);

    // Email al candidato solo en modo INDIVIDUAL
    if (modo === 'INDIVIDUAL' && emailDestino && linkUrl) {
      try {
        var htmlEmail =
          '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">' +
          '<h2 style="color:#1d2d3d;margin:0 0 8px;">Hola ' + (nombreDestino || 'candidato') + ' 👋</h2>' +
          '<p style="color:#515f6e;line-height:1.6;">Te invitamos a postularte para la posición de ' +
          '<strong>' + vacante.titulo + '</strong> en ' + Config.ERP_NAME + '.</p>' +
          '<div style="margin:24px 0;text-align:center;">' +
          '<a href="' + linkUrl + '" style="background:#0a6ed1;color:#fff;padding:14px 28px;' +
          'border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Ver Vacante y Postularme →</a>' +
          '</div>' +
          '<p style="color:#888;font-size:12px;">Este link es válido por 7 días y es de uso único.</p>' +
          '<hr style="border:none;border-top:1px solid #eee;margin:20px 0;">' +
          '<p style="color:#aaa;font-size:11px;">— Equipo de Reclutamiento, ' + Config.ERP_NAME + '</p>' +
          '</div>';

        EmailService.send(
          emailDestino,
          'Invitación a postularte — ' + vacante.titulo + ' | ' + Config.ERP_NAME,
          'Hola ' + (nombreDestino || '') + ', te invitamos a postularte: ' + linkUrl,
          htmlEmail
        );
      } catch(emailErr) {
        Logger.log('[EREC] Email falló: ' + emailErr.message);
      }
    }

    return { ok: true, token: token, link: linkUrl || '(Configura WEBAPP_URL)' };
  },

};


/**
 * ErecPostulanteUseCases
 * Orquesta el proceso de postulación y el avance del pipeline.
 */
const ErecPostulanteUseCases = {

  ETAPAS: ['POSTULADO', 'REVISION', 'ENTREVISTA', 'PRUEBA', 'OFERTA', 'CONTRATADO', 'DESCARTADO'],

  /**
   * Registra un candidato en una vacante.
   * Llamado desde doPost de la Web App pública.
   */
  registrar: function(dto) {
    // Validar que la vacante existe y está abierta
    const vacante = VacanteRepo.findById(dto.id_vacante);
    if (!vacante) {
      return { ok: false, errores: ['La vacante a la que intentas postularte no existe o fue cerrada.'] };
    }
    if (vacante.estado !== 'ABIERTA' && vacante.estado !== 'EN_PROCESO') {
      return { ok: false, errores: ['Esta vacante ya no está recibiendo postulaciones.'] };
    }

    // Deduplicar por email en la misma vacante
    if (dto.email) {
      const existentes = ErecPostulanteRepo.findByEmail(dto.email)
        .filter(p => String(p.id_vacante) === String(dto.id_vacante));
      if (existentes.length > 0) {
        return { ok: false, errores: ['Ya tienes una postulación activa para esta vacante con ese email.'] };
    }
    }

    const user  = DataAdapter.getCurrentUser();
    const saved = ErecPostulanteRepo.insert(dto, user);

    // Registrar Business Partner automáticamente (PERSONA_FISICA, rol: POSTULANTE)
    try {
      const empresa  = VacanteRepo.findById(dto.id_vacante);
      const idEmpresa = empresa ? empresa.id_empresa : null;
      const labelDoc = idEmpresa ? Customizing.getLabelDocumento(idEmpresa) : 'CEDULA';

      const id_bp = BPService.registrar({
        tipo_bp:          'PERSONA_FISICA',
        tipo_documento:   labelDoc.toUpperCase().replace(/\s+/g, '_'),
        numero_documento: dto.documento_identidad || dto.email,
        nombre:           dto.nombre_completo,
        email:            dto.email,
        telefono:         dto.telefono,
      }, 'POSTULANTE', 'EREC', saved.id_postulante_erec);

      DataAdapter.update('EREC_Postulantes', saved.id_postulante_erec, { id_bp: id_bp });
    } catch(bpErr) {
      Logger.log('[ErecPostulanteUseCases] BP no creado (no bloquea): ' + bpErr.message);
    }

    // Actualizar estado de la vacante a EN_PROCESO si estaba ABIERTA
    if (vacante.estado === 'ABIERTA') {
      VacanteRepo.actualizarEstado(dto.id_vacante, 'EN_PROCESO');
    }

    // Email de confirmación al candidato
    try {
      if (saved.email) {
        EmailService.send(
          saved.email,
          '¡Tu postulación fue recibida! — ' + vacante.titulo,
          'Hola ' + saved.nombre_completo + ', hemos recibido tu postulación para ' +
          vacante.titulo + '. Nos pondremos en contacto pronto.'
        );
      }
    } catch(e) {
      Logger.log('[EREC] Email confirmación falló: ' + e.message);
    }

    return {
      ok:      true,
      data:    { id_postulante_erec: saved.id_postulante_erec },
      mensaje: '¡Postulación recibida exitosamente! Bienvenido/a ' + saved.nombre_completo + '.',
    };
  },

  /**
   * Avanza la etapa del candidato en el pipeline.
   * Cuando llega a CONTRATADO, crea el Empleado en RRHH automáticamente.
   */
  avanzarEtapa: function(idPostulante, nuevaEtapa) {
    if (!this.ETAPAS.includes(nuevaEtapa)) {
      return { ok: false, errores: ['Etapa no válida: ' + nuevaEtapa] };
    }

    const postulante = ErecPostulanteRepo.findById(idPostulante);
    if (!postulante) return { ok: false, errores: ['Candidato no encontrado.'] };

    ErecPostulanteRepo.avanzarEtapa(idPostulante, nuevaEtapa);

    // Si llega a CONTRATADO → crear Empleado en RRHH automáticamente
    if (nuevaEtapa === 'CONTRATADO') {
      return this._convertirAEmpleado(postulante);
    }

    return { ok: true, mensaje: 'Candidato avanzado a etapa: ' + nuevaEtapa };
  },

  /**
   * Convierte un postulante CONTRATADO en un Empleado de RRHH.
   * Un solo click — no hay re-ingreso de datos.
   */
  _convertirAEmpleado: function(postulante) {
    try {
      const vacante = VacanteRepo.findById(postulante.id_vacante);

      const dtoEmpleado = {
        id_postulante_erec: postulante.id_postulante_erec, // trazabilidad origen EREC
        nombre_completo:    postulante.nombre_completo,
        dpi:                postulante.documento_identidad,
        email:              postulante.email,
        telefono:           postulante.telefono,
        id_empresa:         vacante ? vacante.id_empresa      : '',
        id_departamento:    vacante ? vacante.id_departamento : '',
        id_rol:             vacante ? vacante.id_rol_destino  : '',
        tipo_contrato:      'TIEMPO_COMPLETO',
        fecha_ingreso:      new Date(),
      };

      const resultado = EmpleadoUseCases.contratar(dtoEmpleado);

      if (resultado.ok && vacante) {
        VacanteRepo.incrementarCubiertas(vacante.id_vacante);
      }

      return {
        ok:      resultado.ok,
        mensaje: resultado.ok
          ? '✔ ' + postulante.nombre_completo + ' fue contratado y su expediente fue creado en RRHH.'
          : 'Avanzado a CONTRATADO pero falló la creación del expediente: ' + (resultado.errores || []).join(', '),
        data: resultado.data || null,
      };
    } catch(e) {
      Logger.log('[EREC] Error al convertir a empleado: ' + e.message);
      return {
        ok:      false,
        errores: ['Avanzado a CONTRATADO pero falló la creación del expediente: ' + e.message],
      };
    }
  },

  /**
   * Obtiene el pipeline completo de una vacante con conteos por etapa.
   */
  getPipelineVacante: function(idVacante) {
    const postulantes = ErecPostulanteRepo.findByVacante(idVacante);
    const pipeline = {};
    ErecPostulanteUseCases.ETAPAS.forEach(e => { pipeline[e] = 0; });
    postulantes.forEach(p => {
      if (pipeline[p.etapa_actual] !== undefined) pipeline[p.etapa_actual]++;
    });
    return {
      total:     postulantes.length,
      por_etapa: pipeline,
      candidatos: postulantes,
    };
  },
};
