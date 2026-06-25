/**
 * SD_Lead_Validator
 * Capa de Dominio: Validador de reglas de negocio para Leads.
 */
const LeadValidator = {
  validarCreacion: function(dto) {
    // 1. Validaciones sintácticas e isomórficas con SharedValidator
    const formatRes = SharedValidator.validate(dto, {
      nombre_completo: ['required'],
      telefono:        ['required', 'telefono'],
      email:           ['email'],
      id_campana:      ['required'],
      fuente:          ['required']
    });

    const e = Object.values(formatRes.errors);

    // 2. Reglas de negocio locales
    if (dto.nombre_completo && dto.nombre_completo.trim().length < 3) {
      e.push('El nombre completo es obligatorio y debe tener al menos 3 caracteres.');
    }

    return { valido: e.length === 0, errores: e };
  }
};
