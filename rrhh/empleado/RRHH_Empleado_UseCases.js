const EmpleadoUseCases = {
  contratar: function(rawFormData) {
    const dto = EmpleadoDTO.fromForm(rawFormData);
    const v = EmpleadoValidator.validarCreacion(dto);
    if (!v.valido) return { ok: false, errores: v.errores };

    if (!EmpleadoService.validarRelacionEmpresaDepartamento(dto.id_empresa, dto.id_departamento)) {
      return { ok: false, errores: ['El departamento no pertenece a la empresa seleccionada.'] };
    }

    if (dto.email) {
      const existe = EmpleadoRepo.findByEmail(dto.email);
      if (existe.length > 0) return { ok: false, errores: ['Email ya registrado.'] };
    }

    const entity = EmpleadoEntity.create(dto);
    const user  = DataAdapter.getCurrentUser();
    const saved = EmpleadoRepo.insert(entity, user);

    try {
      EmailService.send(saved.email, "¡Bienvenido a WorldClass!", `Hola ${saved.nombre_completo}, tu registro está completo.`);
      WhatsAppService.sendMessage(saved.telefono, `Hola ${saved.nombre_completo}, bienvenido! ID: ${saved.id_empleado}`);
    } catch(err) {
      Logger.log("Fallaron las notificaciones iniciales: " + err.message);
    }

    return {
      ok:      true,
      data:    EmpleadoDTO.toResponse(saved),
      mensaje: saved.nombre_completo + ' registrado con éxito (ID: ' + saved.id_empleado + ').',
    };
  }
};
