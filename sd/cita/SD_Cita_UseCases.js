/**
 * SD_Cita_UseCases
 * Capa de Aplicación: Casos de uso de Citas.
 */
const CitaUseCases = {
  registrar: function(rawForm) {
    const dto = CitaDTO.fromForm(rawForm);

    const validacion = CitaValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Verificar existencia del Lead
    const lead = DataAdapter.findById('Leads', dto.id_lead);
    if (!lead) {
      return { ok: false, errores: ['El lead especificado no existe en el sistema.'] };
    }

    // Verificar existencia del Empleado (agente)
    const empleado = DataAdapter.findById('Empleados', dto.id_empleado_agendo);
    if (!empleado) {
      return { ok: false, errores: ['El empleado especificado no existe en el sistema.'] };
    }

    const entidad = CitaEntity.create(dto);
    const user = DataAdapter.getCurrentUser();
    const saved = CitaRepo.insert(entidad, user);

    // Actualizar estado del Lead a CITA_AGENDADA
    if (lead.estado !== 'CITA_AGENDADA') {
      LeadRepo.actualizarEstado(dto.id_lead, 'CITA_AGENDADA');
    }

    return {
      ok: true,
      data: CitaDTO.toResponse(saved),
      mensaje: 'Cita agendada exitosamente para el ' + saved.fecha_cita.toISOString().split('T')[0] + ' en ' + saved.restaurante + '.'
    };
  }
};
