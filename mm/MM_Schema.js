/**
 * MM_Schema
 * Definición del esquema de base de datos física para el módulo de Materiales (MM).
 * Contiene catálogos específicos de inventario y tablas transaccionales con llaves foráneas.
 */
const MM_Schema = {
  CAT_TiposEquipo: {
    pk: 'id_tipo',
    columns: ['id_tipo', 'nombre', 'categoria', 'activo'],
  },
  CAT_Marcas: {
    pk: 'id_marca',
    columns: ['id_marca', 'nombre', 'activo'],
  },
  CAT_Operadoras: {
    pk: 'id_operadora',
    columns: ['id_operadora', 'nombre', 'pais', 'activo'],
  },
  CAT_Estados: {
    pk: 'id_estado',
    columns: ['id_estado', 'nombre', 'aplica_a', 'es_activo', 'activo'],
  },
  Equipos: {
    pk: 'id_equipo',
    columns: [
      'id_equipo',
      'codigo_interno',
      'id_tipo',
      'tipo',
      'id_marca',
      'marca',
      'modelo',
      'serial',
      'id_empresa',
      'empresa',
      'id_estado',
      'estado',
      'fecha_compra',
      'garantia_hasta',
      'valor_compra',
      'link_factura',
      'link_foto',
      'observaciones',
      'created_at',
      'updated_at',
      'created_by'
    ],
    fk: {
      id_tipo: 'CAT_TiposEquipo',
      id_marca: 'CAT_Marcas',
      id_empresa: 'CAT_Empresas', // Relación con el CORE
      id_estado: 'CAT_Estados',
    }
  },
  Chips: {
    pk: 'id_chip',
    columns: [
      'id_chip',
      'codigo_interno',
      'numero',
      'id_operadora',
      'operadora',
      'plan',
      'costo_mensual',
      'id_empresa',
      'empresa',
      'id_estado',
      'estado',
      'fecha_activacion',
      'observaciones',
      'created_at',
      'updated_at',
      'created_by'
    ],
    fk: {
      id_operadora: 'CAT_Operadoras',
      id_empresa: 'CAT_Empresas', // Relación con el CORE
      id_estado: 'CAT_Estados',
    }
  },
  Asignaciones: {
    pk: 'id_asignacion',
    columns: [
      'id_asignacion',
      'id_equipo',
      'codigo_equipo',
      'id_chip',
      'codigo_chip',
      'id_empleado',
      'empleado',
      'id_empresa',
      'empresa',
      'id_departamento',
      'departamento',
      'estado_flujo',
      'fecha_asignacion',
      'fecha_devolucion',
      'activo',
      'link_acta',
      'notas',
      'created_at',
      'approved_by',
      'approved_at',
      'created_by'
    ],
    fk: {
      id_equipo: 'Equipos',
      id_chip: 'Chips',
      id_empleado: 'Empleados', // Relación con el módulo de RRHH
    }
  }
};
