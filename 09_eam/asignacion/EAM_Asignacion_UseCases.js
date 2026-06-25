/**
 * MM_Asignacion_UseCases
 * Capa de Aplicación: Orquesta los casos de uso relativos a Asignaciones.
 */
const AsignacionUseCases = {

  /** Crea una nueva solicitud de asignación (estado PENDIENTE) */
  crearSolicitud: function(rawFormData) {
    // 1. DTO
    const dto = AsignacionDTO.fromForm(rawFormData);

    // 2. Validator
    const v = AsignacionValidator.validarCreacion(dto);
    if (!v.valido) return { ok: false, errores: v.errores };

    // 3. Service: verificar disponibilidad
    if (dto.id_equipo && !AsignacionService.equipoDisponible(dto.id_equipo)) {
      return { ok: false, errores: ['El equipo seleccionado ya tiene una asignación activa vigente.'] };
    }
    if (dto.id_chip && !AsignacionService.chipDisponible(dto.id_chip)) {
      return { ok: false, errores: ['El chip SIM seleccionado ya tiene una asignación activa vigente.'] };
    }

    // 4. Verificar que el empleado existe y está activo
    const empleado = DataAdapter.findById('Empleados', dto.id_empleado);
    if (!empleado) return { ok: false, errores: ['Empleado no encontrado en el sistema.'] };
    if (!empleado.activo) return { ok: false, errores: ['No se puede asignar a un empleado inactivo.'] };

    // 5. Entity (El documento nace bloqueado)
    dto.estado_flujo = 'PENDIENTE_APROBACION';
    const entity = AsignacionEntity.create(dto);

    // 6. Repository: persistir
    const user = DataAdapter.getCurrentUser();
    const saved = AsignacionRepo.insert(entity, user);

    // 7. Event Trigger: Enviar a la bandeja de IT_ADMIN para liberación
    try {
      WorkflowEngine.start('EAM_ASIGNACION_EQUIPO', saved.id_asignacion, dto);
    } catch(err) {
      Logger_ERP.error('EAM', 'Fallo al iniciar workflow', err);
    }

    return {
      ok: true,
      data: AsignacionDTO.toResponse(saved),
      mensaje: `Solicitud #${saved.id_asignacion} creada y enviada a aprobación. (Estado: PENDIENTE)`
    };
  }
};
