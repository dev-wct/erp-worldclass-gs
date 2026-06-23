/**
 * SD_Reporting_Controller
 * Capa de Adaptador: Expone las funciones de dataSource para el Motor de Reportes.
 */

function apiGetReporteVentasSD(filters) {
  Logger.log("[SD_Reporting] Ejecutando cruce de datos para Reporte de Ventas...");
  
  // 1. Obtener datos crudos
  const citas = DataAdapter.findAll("Citas", { resultado_venta: 'VENTA' }); // Solo ventas cerradas
  const leads = DataAdapter.findAll("Leads");
  const empleados = DataAdapter.findAll("Empleados");

  // 2. Optimización: Crear diccionarios (HashMaps) O(1) para evitar anidamiento O(N^2)
  const leadsMap = {};
  leads.forEach(l => { leadsMap[l.id_lead] = l.nombre_completo; });

  const empMap = {};
  empleados.forEach(e => { empMap[e.id_empleado] = e.nombre_completo; });

  // 3. Cruzar datos (Joins en memoria)
  const reportData = citas.map(cita => {
    return {
      id_cita: cita.id_cita,
      fecha_cita: cita.fecha,
      nombre_lead: leadsMap[cita.id_lead] || 'Desconocido',
      nombre_agente: empMap[cita.id_agente] || 'Desconocido',
      monto_venta: cita.monto_venta || 0,
      comentarios: cita.comentarios || ''
    };
  });

  return reportData;
}
