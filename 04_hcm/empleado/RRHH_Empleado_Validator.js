const EmpleadoValidator = {
  validarCreacion: function(dto) {
    // Configurar validador regional según la empresa
    if (dto.id_empresa) {
      SharedValidator.configure(dto.id_empresa);
    }
    // 1. Validaciones de formato sintácticas e isomórficas
    const formatRes = SharedValidator.validate(dto, {
      nombre_completo: ['required'],
      email:           ['email'],
      dpi:             ['required', 'dpi'],
      id_departamento: ['required'],
      id_empresa:      ['required']
    });

    const errores = Object.values(formatRes.errors);

    // 2. Regla de negocio local: longitud mínima del nombre
    if (dto.nombre_completo && dto.nombre_completo.trim().length < 3) {
      errores.push('Nombre completo obligatorio (mín. 3 caracteres).');
    }

    // 3. Regla semántica del servidor: validar integridad relacional en la Base de Datos
    if (formatRes.isValid) {
      const depto = DataAdapter.findById("CAT_Departamentos", dto.id_departamento);
      if (!depto) {
        errores.push("El departamento seleccionado no existe en el sistema.");
      }

      const empresa = DataAdapter.findById("CAT_Empresas", dto.id_empresa);
      if (!empresa) {
        errores.push("La empresa seleccionada no existe en el sistema.");
      }
    }

    return { valido: errores.length === 0, errores: errores };
  },
};
