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
        errores: ['El número telefónico ' + dto.telefono + ' ya está registrado bajo el Lead: ' + existentes[0].nombre_completo + '.']
      };
    }

    const entidad = LeadEntity.create(dto);
    const user    = DataAdapter.getCurrentUser();
    const saved   = LeadRepo.insert(entidad, user);

    // Registrar Business Partner automáticamente (PERSONA_FISICA, rol: CLIENTE)
    try {
      const id_bp = BPService.registrar({
        tipo_bp:          'PERSONA_FISICA',
        tipo_documento:   'CEDULA',          // genérico — el lead no siempre tiene doc
        numero_documento: dto.telefono,      // teléfono como identificador provisional
        nombre:           dto.nombre_completo,
        email:            dto.email,
        telefono:         dto.telefono,
      }, 'CLIENTE', 'SD', saved.id_lead);

      DataAdapter.update('Leads', saved.id_lead, { id_bp: id_bp });
    } catch(bpErr) {
      Logger.log('[LeadUseCases] BP no creado (no bloquea): ' + bpErr.message);
    }

    return {
      ok:      true,
      data:    LeadDTO.toResponse(saved),
      mensaje: 'Lead "' + saved.nombre_completo + '" registrado exitosamente (ID: ' + saved.id_lead + ').',
    };
  }
};
