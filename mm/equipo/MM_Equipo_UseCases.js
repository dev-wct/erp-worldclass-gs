/**
 * MM_Equipo_UseCases
 * Capa de Aplicación: Orquesta los casos de uso relativos a Equipos.
 */
const EquipoUseCases = {

  /** Registra un nuevo equipo en el inventario */
  registrar: function(rawFormData) {
    // 1. DTO: Normalizar y sanitizar entrada
    const dto = EquipoDTO.fromForm(rawFormData);

    // 2. Validator: Validaciones sintácticas y de negocio
    const validation = EquipoValidator.validarCreacion(dto);
    if (!validation.valido) {
      return { ok: false, errores: validation.errores };
    }

    // 3. Repository: Verificar unicidad del número de serie
    const existe = EquipoRepo.findBySerial(dto.serial);
    if (existe) {
      return { ok: false, errores: [`El número de serie '${dto.serial}' ya está registrado bajo el código '${existe.codigo_interno}'.`] };
    }

    // 4. Entity: Crear objeto de dominio inmutable
    const entity = EquipoEntity.create(dto);

    // 5. Repository: Guardar en base de datos
    const user = DataAdapter.getCurrentUser();
    const saved = EquipoRepo.insert(entity, user);

    return {
      ok: true,
      data: EquipoDTO.toResponse(saved),
      mensaje: `Equipo registrado exitosamente con el código único: ${saved.codigo_interno}`
    };
  }
};
