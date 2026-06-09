/**
 * SD_Lead_UseCases
 * Capa de Aplicación: Orquestador de procesos de Leads.
 */
const LeadUseCases = {
  registrar: function(rawForm) {
    const dto = LeadDTO.fromForm(rawForm);

    const validacion = LeadValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Validar duplicado por teléfono
    const existentes = LeadRepo.findByTelefono(dto.telefono);
    if (existentes.length > 0) {
      return { 
        ok: false, 
        errores: ['El número telefónico ' + dto.telefono + ' ya está registrado en el sistema bajo el Lead: ' + existentes[0].nombre_completo + '.'] 
      };
    }

    const entidad = LeadEntity.create(dto);
    const user = DataAdapter.getCurrentUser();
    const saved = LeadRepo.insert(entidad, user);

    return {
      ok: true,
      data: LeadDTO.toResponse(saved),
      mensaje: 'Lead "' + saved.nombre_completo + '" registrado exitosamente (ID: ' + saved.id_lead + ').'
    };
  }
};
