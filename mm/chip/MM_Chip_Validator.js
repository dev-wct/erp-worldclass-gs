/**
 * MM_Chip_Validator
 * Capa de Dominio: Validador de negocio y sintaxis para Chips SIM (Líneas).
 */
const ChipValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.numero) e.push('El número telefónico es obligatorio.');
    
    // Validar formato del número telefónico (mínimo 8 dígitos)
    const digitos = dto.numero.replace(/\D/g, '');
    if (digitos.length < 8) {
      e.push('El número telefónico debe contener un mínimo de 8 dígitos numéricos.');
    }
    
    if (!dto.id_operadora) e.push('La operadora telefónica es obligatoria.');
    if (dto.costo_mensual === null || isNaN(dto.costo_mensual) || dto.costo_mensual < 0) {
      e.push('El costo mensual debe ser un número positivo.');
    }
    if (!dto.id_empresa) e.push('La empresa propietaria es obligatoria.');
    if (!dto.id_estado) e.push('El estado del chip es obligatorio.');
    
    if (dto.fecha_activacion) {
      const fActivacion = new Date(dto.fecha_activacion);
      if (isNaN(fActivacion.getTime())) {
        e.push('La fecha de activación no es válida.');
      }
    }

    return { valido: e.length === 0, errores: e };
  }
};
