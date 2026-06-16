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
    const user   = DataAdapter.getCurrentUser();
    const saved  = EmpleadoRepo.insert(entity, user);

    // Registrar Business Partner automáticamente (PERSONA_FISICA, rol: EMPLEADO)
    // Si viene de EREC (dto.id_bp ya existe), reutiliza ese BP y solo agrega el rol
    try {
      const labelDoc = Customizing.getLabelDocumento(dto.id_empresa);
      const id_bp = BPService.registrar({
        tipo_bp:          'PERSONA_FISICA',
        tipo_documento:   labelDoc.toUpperCase().replace(/\s+/g, '_'),
        numero_documento: dto.dpi || dto.email,
        nombre:           dto.nombre_completo,
        email:            dto.email    || '',
        telefono:         dto.telefono || '',
      }, 'EMPLEADO', 'HCM', saved.id_empleado);

      DataAdapter.update('Empleados', saved.id_empleado, { id_bp: id_bp });
    } catch(bpErr) {
      Logger.log('[EmpleadoUseCases] BP no creado (no bloquea): ' + bpErr.message);
    }

    try {
      EmailService.send(saved.email, '¡Bienvenido a ' + Config.ERP_NAME + '!',
        'Hola ' + saved.nombre_completo + ', tu registro está completo.');
      WhatsAppService.sendMessage(saved.telefono,
        'Hola ' + saved.nombre_completo + ', bienvenido! ID: ' + saved.id_empleado);
    } catch(err) {
      Logger.log('Fallaron las notificaciones iniciales: ' + err.message);
    }

    return {
      ok:      true,
      data:    EmpleadoDTO.toResponse(saved),
      mensaje: saved.nombre_completo + ' registrado con éxito (ID: ' + saved.id_empleado + ').',
    };
  }
};
