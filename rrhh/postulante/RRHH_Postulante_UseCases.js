/**
 * RRHH_Postulante_UseCases
 * Capa de Aplicación: Orquestador de lógica de negocio para candidatos.
 *
 * Responsabilidades:
 *  - Recibir un DTO ya normalizado.
 *  - Aplicar reglas de negocio (deduplicación por email/teléfono).
 *  - Persistir el candidato y enviar notificación de confirmación.
 *
 * Anti-Vendor Locking:
 *  - No sabe si los datos vienen de un Google Form, HtmlService o AppSheet.
 *  - Solo trabaja con el DTO normalizado que recibe.
 *
 * Paradigmas:
 *  - LISP  : Pipeline funcional (DTO → Validación → Dedup → Persistencia → Notificación).
 *  - COBOL : Cada candidato es un "registro de postulante" inmutable y auditado.
 *  - POO   : Consume PostulanteRepo y PostulanteEntity sin acoplarse a su implementación.
 */
const PostulanteUseCases = {

  /**
   * Registra un nuevo candidato en el sistema.
   * Puede ser llamado desde el formulario interno o desde el webhook de Google Forms.
   *
   * @param {object} dto - DTO ya normalizado por PostulanteDTO.fromForm() o fromGoogleFormEvent().
   * @returns {{ ok: boolean, data: object, mensaje: string }}
   */
  registrar: function(dto) {
    // Paso 1: Validar reglas de negocio
    const validacion = PostulanteValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Paso 2: Deduplicación — evitar registrar el mismo candidato dos veces
    if (dto.email) {
      const existeEmail = PostulanteRepo.findByEmail(dto.email);
      if (existeEmail.length > 0) {
        return {
          ok:      false,
          errores: ['Ya existe un candidato registrado con ese correo electrónico.']
        };
      }
    }

    if (dto.telefono) {
      const existeTel = PostulanteRepo.findByTelefono(dto.telefono);
      if (existeTel.length > 0) {
        return {
          ok:      false,
          errores: ['Ya existe un candidato registrado con ese número de teléfono.']
        };
      }
    }

    // Paso 3: Crear entidad inmutable y persistir
    const entity  = PostulanteEntity.create(dto);
    const user    = DataAdapter.getCurrentUser();
    const saved   = PostulanteRepo.insert(entity, user);

    // Paso 4: Notificación de confirmación (no bloquea si falla)
    try {
      if (saved.email) {
        EmailService.send(
          saved.email,
          '¡Recibimos tu solicitud en ' + Config.ERP_NAME + '!',
          'Hola ' + saved.nombre_completo + ', hemos recibido tu postulación. ' +
          'Nos pondremos en contacto contigo pronto. ¡Gracias por tu interés!'
        );
      }
    } catch (err) {
      Logger.log('[Postulante] Falló la notificación de confirmación: ' + err.message);
    }

    return {
      ok:      true,
      data:    PostulanteDTO.toResponse(saved),
      mensaje: '¡Postulación recibida exitosamente! Bienvenido/a ' + saved.nombre_completo + '.',
    };
  },

  /**
   * Devuelve todos los candidatos en un estado específico del proceso de selección.
   * @param {string} estado - POSTULADO | ENTREVISTA | PRUEBA | ACEPTADO | RECHAZADO
   */
  listarPorEstado: function(estado) {
    return PostulanteRepo.findByEstado(estado).map(PostulanteDTO.toResponse);
  },

  /**
   * Avanza el estado del proceso de selección de un candidato.
   * @param {number} id         - ID del candidato.
   * @param {string} nuevoEstado - Nuevo estado del proceso.
   */
  avanzarEstado: function(id, nuevoEstado) {
    const estadosValidos = ['POSTULADO', 'ENTREVISTA', 'PRUEBA', 'ACEPTADO', 'RECHAZADO'];
    if (!estadosValidos.includes(String(nuevoEstado).toUpperCase())) {
      return { ok: false, errores: ['Estado de selección no válido: ' + nuevoEstado] };
    }
    const actualizado = PostulanteRepo.actualizarEstado(id, nuevoEstado);
    return actualizado
      ? { ok: true, mensaje: 'Estado actualizado a ' + nuevoEstado + '.' }
      : { ok: false, errores: ['No se encontró el candidato con ID: ' + id] };
  },
};
