/**
 * RRHH_Postulante_Validator
 * Capa de Dominio: Validador de negocio para candidatos al Call Center.
 */
const PostulanteValidator = {
  validarCreacion: function(dto) {
    const e = [];

    if (!dto.nombre_completo || dto.nombre_completo.length < 3)
      e.push('El nombre completo es obligatorio (mínimo 3 caracteres).');

    if (!dto.telefono || dto.telefono.length < 7)
      e.push('El teléfono es obligatorio (mínimo 7 dígitos).');

    if (dto.email && !Utils.esEmailValido(dto.email))
      e.push('El formato del correo electrónico no es válido.');

    if (dto.dpi && dto.dpi.length > 0 && !/^\d{13}$/.test(dto.dpi.replace(/\s/g, '')))
      e.push('El DPI debe tener exactamente 13 dígitos numéricos.');

    const fuentesValidas = [
      'FACEBOOK', 'INSTAGRAM', 'REFERIDO', 'LINKEDIN',
      'COMPUTRABAJO', 'GOOGLE_FORM', 'FORMULARIO_INTERNO', 'OTRO'
    ];
    if (dto.fuente && !fuentesValidas.includes(dto.fuente.toUpperCase()))
      e.push('La fuente de reclutamiento no es válida.');

    return { valido: e.length === 0, errores: e };
  },
};
