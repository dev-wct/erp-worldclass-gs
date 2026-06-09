/**
 * SD_Campana_UseCases
 * Capa de Aplicación: Orquestador de casos de uso para Campañas.
 */
const CampanaUseCases = {
  registrar: function(rawForm) {
    const dto = CampanaDTO.fromForm(rawForm);

    const validacion = CampanaValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    const entidad = CampanaEntity.create(dto);
    const user = DataAdapter.getCurrentUser();
    const saved = CampanaRepo.insert(entidad, user);

    return {
      ok: true,
      data: CampanaDTO.toResponse(saved),
      mensaje: 'Campaña "' + saved.nombre + '" registrada exitosamente (ID: ' + saved.id_campana + ').'
    };
  }
};
