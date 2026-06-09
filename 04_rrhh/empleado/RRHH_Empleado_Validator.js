const EmpleadoValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.nombre_completo || dto.nombre_completo.length < 3)
      e.push('Nombre completo obligatorio (mín. 3 caracteres).');
    if (dto.email && !Utils.esEmailValido(dto.email))
      e.push('Formato de email inválido.');
    if (!dto.id_departamento)
      e.push('Departamento obligatorio.');
    if (!dto.id_empresa)
      e.push('Empresa obligatoria.');
    return { valido: e.length === 0, errores: e };
  },
};
