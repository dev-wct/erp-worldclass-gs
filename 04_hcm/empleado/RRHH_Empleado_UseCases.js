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
      EventBus.publish('EmployeeCreated', {
        id_empleado: saved.id_empleado,
        nombre: saved.nombre_completo,
        email: saved.email,
        cargo: dto.id_departamento || 'No especificado'
      });
    } catch(err) {
      Logger_ERP.error('HCM', 'Fallo al publicar EmployeeCreated', err);
    }

    return {
      ok:      true,
      data:    EmpleadoDTO.toResponse(saved),
      mensaje: saved.nombre_completo + ' registrado con éxito (ID: ' + saved.id_empleado + ').',
    };
  },

  actualizar: function(id, rawFormData) {
    const dto = EmpleadoDTO.fromForm(rawFormData);
    const v = EmpleadoValidator.validarCreacion(dto);
    if (!v.valido) return { ok: false, errores: v.errores };

    if (!EmpleadoService.validarRelacionEmpresaDepartamento(dto.id_empresa, dto.id_departmento || dto.id_departamento)) {
      return { ok: false, errores: ['El departamento no pertenece a la empresa seleccionada.'] };
    }

    if (dto.email) {
      const existe = EmpleadoRepo.findByEmail(dto.email);
      if (existe.length > 0 && existe[0].id_empleado != id) {
        return { ok: false, errores: ['Email ya registrado en otro colaborador.'] };
      }
    }

    const ex = EmpleadoRepo.findById(id);
    if (!ex) return { ok: false, errores: ['El colaborador no existe.'] };

    EmpleadoRepo.update(id, {
      nombre_completo: dto.nombre_completo,
      dpi:             dto.dpi,
      email:           dto.email,
      telefono:        dto.telefono,
      id_departamento: dto.id_departamento,
      id_empresa:      dto.id_empresa,
      id_sucursal:     dto.id_sucursal,
      id_unidad:       dto.id_unidad,
      tipo_contrato:   dto.tipo_contrato,
      fecha_ingreso:   dto.fecha_ingreso || ex.fecha_ingreso
    });

    try {
      if (ex.id_bp) {
        const labelDoc = Customizing.getLabelDocumento(dto.id_empresa);
        DataAdapter.update('BP_MASTER', ex.id_bp, {
          nombre:            dto.nombre_completo,
          email:             dto.email    || '',
          telefono:          dto.telefono || '',
          tipo_documento:    labelDoc.toUpperCase().replace(/\s+/g, '_'),
          numero_documento:  dto.dpi || dto.email
        });
      }
    } catch(bpErr) {
      Logger.log('[EmpleadoUseCases] BP no actualizado (no bloquea): ' + bpErr.message);
    }

    return {
      ok:      true,
      mensaje: dto.nombre_completo + ' actualizado con éxito.',
    };
  },

  darBaja: function(id, fechaSalida) {
    const ex = EmpleadoRepo.findById(id);
    if (!ex) return { ok: false, errores: ['El colaborador no existe.'] };

    EmpleadoRepo.desactivar(id, fechaSalida || DataAdapter.now());

    try {
      EventBus.publish('EmployeeTerminated', {
        id_empleado: id,
        nombre: ex.nombre_completo
      });
    } catch(err) {
      Logger_ERP.error('HCM', 'Fallo al publicar EmployeeTerminated', err);
    }

    return {
      ok: true,
      mensaje: ex.nombre_completo + ' ha sido dado de baja con éxito.'
    };
  }
};
