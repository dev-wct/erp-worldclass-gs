const RRHH_Schema = {
  Postulantes: {
    pk: 'id_postulante',
    columns: ['id_postulante','id_bp','nombre_completo','dpi','telefono','email',
              'fuente','id_campana','fecha_postulacion','estado','notas',
              'link_cv','created_at','created_by'],
    // id_bp → BP_MASTER: referencia suave cross-módulo
  },
  PostulantesTokens: {
    pk: 'id_token',
    columns: [
      'id_token',
      'token',
      'link_postulacion',
      'modo',            // INDIVIDUAL (token personal) | PUBLICO (link abierto)
      'id_campana',      // Campaña asociada al link (opcional)
      'email_destino',
      'nombre_destino',
      'creado_por',
      'creado_at',
      'expira_at',
      'estado',          // PENDIENTE | USADO | EXPIRADO
      'usado_at',
    ],
  },
  Empleados: {
    pk: 'id_empleado',
    columns: ['id_empleado','id_bp','id_postulante_erec','nombre_completo','dpi',
              'email','telefono','id_departamento','id_empresa','id_sucursal','id_unidad','id_rol',
              'activo','fecha_ingreso','fecha_salida','tipo_contrato',
              'created_at','updated_at','created_by'],
    fk: {
      // id_bp → BP_MASTER: referencia suave cross-módulo
      id_departamento: 'CAT_Departamentos',
      id_empresa:      'CAT_Empresas',
      id_sucursal:     'CAT_Sucursales',            // referencia suave cross-módulo (MDM)
      id_unidad:       'CAT_UnidadesOrganizativas',  // referencia suave cross-módulo (MDM)
      id_rol:          'CAT_Roles',
    },
  },
  Onboarding: {
    pk: 'id_onboarding',
    columns: ['id_onboarding','id_empleado',
              'contrato_firmado','capacitacion','examen',
              'fecha_inicio','fecha_fin','estado',
              'created_at','updated_at'],
    fk: { id_empleado: 'Empleados' },
  },
  Bajas: {
    pk: 'id_baja',
    columns: ['id_baja','id_empleado','motivo','tipo_baja','fecha_baja',
              'liquidacion_pagada','equipos_devueltos','notas',
              'created_at','created_by'],
    fk: { id_empleado: 'Empleados' },
  },
};
