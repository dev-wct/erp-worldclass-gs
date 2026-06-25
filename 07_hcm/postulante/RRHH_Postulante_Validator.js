/**
 * RRHH_Postulante_Validator
 * Capa de Dominio: Validador de negocio para candidatos al Call Center.
 */
const PostulanteValidator = {
  validarCreacion: function(dto) {
    // Configurar validador regional (usará la empresa por defecto 1)
    SharedValidator.configure();
    // 1. Validaciones sintácticas e isomórficas con SharedValidator
    const formatRes = SharedValidator.validate(dto, {
      nombre_completo: ['required'],
      telefono:        ['required', 'telefono'],
      email:           ['email'],
      dpi:             ['dpi']
    });

    const e = Object.values(formatRes.errors);

    // 2. Reglas de negocio locales
    if (dto.nombre_completo && dto.nombre_completo.trim().length < 3) {
      e.push('El nombre completo es obligatorio (mínimo 3 caracteres).');
    }

    const fuentesValidas = [
      'FACEBOOK', 'INSTAGRAM', 'REFERIDO', 'LINKEDIN',
      'COMPUTRABAJO', 'GOOGLE_FORM', 'FORMULARIO_INTERNO',
      'WEB_APP_TOKEN', 'WEB_APP_PUBLICO', 'OTRO'
    ];
    if (dto.fuente && !fuentesValidas.includes(dto.fuente.toUpperCase())) {
      e.push('La fuente de reclutamiento no es válida.');
    }

    return { valido: e.length === 0, errores: e };
  },
};

