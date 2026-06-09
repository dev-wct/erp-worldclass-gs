const RRHH_Schema = {
  Postulantes: {
    pk: 'id_postulante',
    columns: ['id_postulante','nombre_completo','dpi','telefono','email',
              'fuente','fecha_postulacion','estado','notas',
              'created_at','created_by'],
  },
  Empleados: {
    pk: 'id_empleado',
    columns: ['id_empleado','id_postulante','nombre_completo','dpi',
              'email','telefono','id_departamento','id_empresa','id_rol',
              'activo','fecha_ingreso','fecha_salida','tipo_contrato',
              'created_at','updated_at','created_by'],
    fk: {
      id_postulante:   'Postulantes',
      id_departamento: 'CAT_Departamentos',
      id_empresa:      'CAT_Empresas',
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
