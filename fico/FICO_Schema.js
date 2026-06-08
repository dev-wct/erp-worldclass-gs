/**
 * FICO_Schema
 * Definición del esquema de base de datos física para el módulo Financiero (FICO).
 */
const FICO_Schema = {
  Pagos_Nomina: {
    pk: 'id_pago',
    columns: [
      'id_pago',
      'id_empleado',
      'anio',
      'quincena',
      'sueldo_base',
      'comisiones',
      'bonos',
      'deducciones',
      'total_neto',
      'pagado',
      'fecha_pago',
      'metodo_pago',
      'created_at',
      'created_by'
    ],
    fk: {
      id_empleado: 'Empleados'
    }
  },
  Costos_Chips: {
    pk: 'id_costo',
    columns: [
      'id_costo',
      'id_chip',
      'anio',
      'mes',
      'monto',
      'pagado',
      'observaciones',
      'created_at'
    ],
    fk: {
      id_chip: 'Chips'
    }
  }
};
