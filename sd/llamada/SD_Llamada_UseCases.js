/**
 * SD_Llamada_UseCases
 * Capa de Aplicación: Casos de uso de Llamadas.
 */
const LlamadaUseCases = {
  registrar: function(rawForm) {
    const dto = LlamadaDTO.fromForm(rawForm);

    const validacion = LlamadaValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Verificar existencia del Lead
    const lead = DataAdapter.findById('Leads', dto.id_lead);
    if (!lead) {
      return { ok: false, errores: ['El lead especificado no existe en el sistema.'] };
    }

    // Verificar existencia del Empleado (agente)
    const empleado = DataAdapter.findById('Empleados', dto.id_empleado);
    if (!empleado) {
      return { ok: false, errores: ['El empleado especificado no existe en el sistema.'] };
    }

    const entidad = LlamadaEntity.create(dto);
    const user = DataAdapter.getCurrentUser();
    const saved = LlamadaRepo.insert(entidad, user);

    // Mapear resultado a estado del Lead
    let nuevoEstadoLead = lead.estado;
    const resUpper = dto.resultado.toUpperCase();

    if (resUpper.includes('CITA') || resUpper.includes('AGENDADA') || resUpper === 'CITA AGENDADA') {
      nuevoEstadoLead = 'CITA_AGENDADA';
    } else if (resUpper.includes('INTERESADO') && !resUpper.includes('NO')) {
      nuevoEstadoLead = 'INTERESADO';
    } else if (resUpper.includes('NO INTERESADO') || resUpper === 'RECHAZADO') {
      nuevoEstadoLead = 'NO_INTERESADO';
    } else if (resUpper.includes('CONTACTADO')) {
      nuevoEstadoLead = 'CONTACTADO';
    } else if (resUpper.includes('INVALIDO') || resUpper.includes('EQUIVOCADO')) {
      nuevoEstadoLead = 'INVALIDO';
    }

    // Actualizar Lead
    if (nuevoEstadoLead !== lead.estado) {
      LeadRepo.actualizarEstado(dto.id_lead, nuevoEstadoLead);
    }

    return {
      ok: true,
      data: LlamadaDTO.toResponse(saved),
      mensaje: 'Llamada registrada y estado del Lead actualizado a "' + nuevoEstadoLead + '".'
    };
  }
};
