/**
 * SD_Schema
 * Definición del esquema de base de datos física para el módulo de Ventas y Distribución (SD / Call Center).
 */
const SD_Schema = {
  Campanas: {
    pk: 'id_campana',
    columns: ['id_campana', 'nombre', 'fecha_inicio', 'fecha_fin', 'objetivo_citas', 'estado', 'created_at', 'created_by'],
  },
  Leads: {
    pk: 'id_lead',
    columns: [
      'id_lead', 'id_bp',
      'nombre_completo', 'telefono', 'email',
      'tipo_tdc', 'banco_emisor', 'id_campana',
      'estado', 'fuente', 'notas',
      'created_at', 'updated_at', 'created_by'
    ],
    // id_bp → BP_MASTER: referencia suave cross-módulo
    fk: { id_campana: 'Campanas' }
  },
  Llamadas: {
    pk: 'id_llamada',
    columns: [
      'id_llamada',
      'id_lead',
      'id_empleado',
      'fecha_hora',
      'duracion_seg',
      'resultado',
      'notas',
      'created_at',
      'created_by'
    ],
    fk: {
      id_lead: 'Leads',
      id_empleado: 'Empleados'
    }
  },
  Citas: {
    pk: 'id_cita',
    columns: [
      'id_cita',
      'id_lead',
      'id_empleado_agendo',
      'restaurante',
      'fecha_cita',
      'hora_cita',
      'num_acompanantes',
      'asistio',
      'resultado_venta',
      'monto_venta',          // Monto de la venta en la moneda de la empresa
      'id_membresia_vendida',
      'id_empresa_emisora',   // FK -> CAT_Empresas (WorldClass o Rapivisa)
      'notas',
      'created_at',
      'updated_at',
      'created_by'
    ],
    fk: {
      id_lead: 'Leads',
      id_empleado_agendo: 'Empleados',
      id_empresa_emisora: 'CAT_Empresas'
    }
  }
};
