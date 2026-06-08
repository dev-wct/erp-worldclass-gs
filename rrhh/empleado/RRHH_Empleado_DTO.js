const EmpleadoDTO = {
  fromForm: function(raw) {
    return {
      nombre_completo: String(raw.nombre_completo || '').trim(),
      dpi:             String(raw.dpi || '').trim(),
      email:           String(raw.email || '').trim().toLowerCase(),
      telefono:        String(raw.telefono || '').trim(),
      id_departamento: Number(raw.id_departamento),
      id_empresa:      Number(raw.id_empresa),
      id_rol:          raw.id_rol ? Number(raw.id_rol) : null,
      activo:          true,
      fecha_ingreso:   raw.fecha_ingreso || null,
      tipo_contrato:   raw.tipo_contrato || 'PLANILLA',
    };
  },

  toResponse: function(entity) {
    return {
      id:     entity.id_empleado,
      nombre: entity.nombre_completo,
      email:  entity.email,
      activo: entity.activo,
    };
  },
};
