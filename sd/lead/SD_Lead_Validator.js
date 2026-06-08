/**
 * SD_Lead_Validator
 * Capa de Dominio: Validador de reglas de negocio para Leads.
 */
const LeadValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.nombre_completo || dto.nombre_completo.length < 3) {
      e.push('El nombre completo es obligatorio y debe tener al menos 3 caracteres.');
    }
    
    if (!dto.telefono) {
      e.push('El número de teléfono es obligatorio.');
    } else {
      const digitos = dto.telefono.replace(/\D/g, '');
      if (digitos.length < 8) {
        e.push('El teléfono debe tener un mínimo de 8 dígitos numéricos.');
      }
    }

    if (dto.email && !Utils.esEmailValido(dto.email)) {
      e.push('El correo electrónico no tiene un formato válido.');
    }

    if (!dto.id_campana) {
      e.push('La campaña asociada es obligatoria.');
    }

    if (!dto.fuente) {
      e.push('La fuente del lead es obligatoria.');
    }

    return { valido: e.length === 0, errores: e };
  }
};
