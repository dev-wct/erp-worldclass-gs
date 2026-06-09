/**
 * MM_Chip_UseCases
 * Capa de Aplicación: Orquesta los casos de uso relativos a Chips SIM.
 */
const ChipUseCases = {

  /** Registra un nuevo chip SIM en el inventario */
  registrar: function(rawFormData) {
    // 1. DTO: Normalizar y sanitizar entrada
    const dto = ChipDTO.fromForm(rawFormData);

    // 2. Validator: Validaciones sintácticas y de negocio
    const validation = ChipValidator.validarCreacion(dto);
    if (!validation.valido) {
      return { ok: false, errores: validation.errores };
    }

    // 3. Repository: Verificar unicidad del número telefónico
    const existe = ChipRepo.findByNumero(dto.numero);
    if (existe) {
      return { ok: false, errores: [`El número telefónico '${dto.numero}' ya está registrado bajo el código '${existe.codigo_interno}'.`] };
    }

    // 4. Entity: Crear objeto de dominio inmutable
    const entity = ChipEntity.create(dto);

    // 5. Repository: Guardar en base de datos
    const user = DataAdapter.getCurrentUser();
    const saved = ChipRepo.insert(entity, user);

    return {
      ok: true,
      data: ChipDTO.toResponse(saved),
      mensaje: `Chip SIM registrado exitosamente con el código único: ${saved.codigo_interno}`
    };
  }
};
