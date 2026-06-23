/**
 * CORE_ReportEngine
 * ============================================================
 * Capa de Presentación / Controlador para el módulo de reportes.
 * Expone la configuración (metadata) y ejecuta los UseCases dinámicamente.
 */

/**
 * Obtiene el listado de reportes disponibles para mostrar en el menú (Explorador).
 */
function apiGetReportCatalog() {
  return safeExecute(() => {
    Logger.log("Obteniendo catálogo de reportes...");
    return ReportCatalog.getAll();
  }, 'ReportEngine.getCatalog');
}

/**
 * Obtiene la configuración de columnas (metadata) de un reporte específico.
 */
function apiGetReportMetadata(reportId) {
  return safeExecute(() => {
    Logger.log(`Obteniendo metadata para reporte: ${reportId}`);
    return ReportCatalog.get(reportId);
  }, 'ReportEngine.getMetadata');
}

/**
 * Endpoint unificado que ejecuta el dataSource correspondiente al reporte.
 * Recibe filtros (ej. fechas) para prevenir el "Over-fetching".
 */
function apiExecuteReport(reportId, filters) {
  return safeExecute(() => {
    Logger.log(`Ejecutando reporte: ${reportId} con filtros: ${JSON.stringify(filters)}`);
    
    // 1. Obtener configuración
    const config = ReportCatalog.get(reportId);
    
    // 2. Validar que exista la función dataSource globalmente
    if (typeof this[config.dataSource] !== 'function') {
      throw new InfrastructureError(`El DataSource '${config.dataSource}' no está implementado en el backend.`);
    }
    
    // 3. Ejecutar la función (inyección dinámica)
    const data = this[config.dataSource](filters);
    
    return data;
  }, 'ReportEngine.executeReport');
}
