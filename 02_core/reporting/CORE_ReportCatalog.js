/**
 * CORE_ReportCatalog
 * ============================================================
 * Catálogo central de metadatos para reportes (Enfoque Fiori Elements).
 * Define columnas, tipos de datos y el origen (dataSource) de cada reporte.
 * NO CONTIENE LÓGICA DE NEGOCIO, solo configuración.
 */

const ReportCatalog = {

  // Reporte 1: Ventas y Rendimiento Comercial (SD)
  'SD_VENTAS': {
    id: 'SD_VENTAS',
    modulo: 'SD',
    titulo: 'Reporte Consolidado de Ventas',
    descripcion: 'Análisis de ventas cerradas, montos y asesores comerciales.',
    icono: 'trending-up',
    dataSource: 'apiGetReporteVentasSD', // Función backend que provee los datos
    roles: ['ADMIN', 'SD_USER'], // Seguridad (próxima fase)
    columnas: [
      { title: "ID Cita", field: "id_cita", type: "string", headerFilter: "input", width: 120 },
      { title: "Fecha Venta", field: "fecha_cita", type: "date", headerFilter: "input", width: 150 },
      { title: "Cliente (Lead)", field: "nombre_lead", type: "string", headerFilter: "input", width: 200 },
      { title: "Asesor (Agente)", field: "nombre_agente", type: "string", headerFilter: "input", width: 200 },
      { title: "Monto", field: "monto_venta", type: "currency", bottomCalc: "sum", width: 150 },
      { title: "Comentarios", field: "comentarios", type: "string", headerFilter: "input", width: 300 }
    ]
  },

  // (Aquí se irán agregando 'EREC_RECLUTAMIENTO', 'EAM_INVENTARIO', etc.)

  /**
   * Obtiene la configuración de un reporte por su ID.
   */
  get: function(reportId) {
    const report = this[reportId];
    if (!report) throw new BusinessError(`El reporte con ID '${reportId}' no existe en el catálogo.`);
    return report;
  },

  /**
   * Obtiene la lista de todos los reportes disponibles para el menú.
   */
  getAll: function() {
    return Object.keys(this)
      .filter(k => typeof this[k] === 'object' && this[k].id)
      .map(k => this[k]);
  }
};
