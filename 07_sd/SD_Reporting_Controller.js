/**
 * SD_Reporting_Controller
 * Capa de Adaptador: Expone las funciones de dataSource para el Motor de Reportes.
 */

function apiGetReporteVentasSD(filters) {
  Logger.log("[SD_Reporting] Ejecutando cruce de datos para Reporte de Ventas...");
  
  // 1. Obtener TODAS las ventas cerradas
  var todasLasCitas = DataAdapter.findAll("Citas", { resultado_venta: 'VENTA' }) || [];
  
  // 2. Filtro de empresa en memoria (backward-compatible).
  //    Si el registro no tiene id_empresa_emisora, se muestra en todas las empresas
  //    (compatibilidad con datos sembrados antes de agregar la columna).
  var citas;
  if (filters && filters.id_empresa && filters.id_empresa !== 'ALL') {
    var idEmpFiltro = Number(filters.id_empresa);
    citas = todasLasCitas.filter(function(c) {
      var ie = c.id_empresa_emisora;
      // Si el campo está vacío/nulo → incluir (backwards compat)
      if (ie === undefined || ie === null || ie === '') return true;
      return Number(ie) === idEmpFiltro;
    });
  } else {
    citas = todasLasCitas;
  }

  Logger.log("[SD_Reporting] Citas encontradas: " + citas.length);

  const leads = DataAdapter.findAll("Leads") || [];
  const empleados = DataAdapter.findAll("Empleados") || [];
  const empresas = DataAdapter.findAll("CAT_Empresas") || [];

  // 3. Optimización: Diccionarios O(1) con normalización de claves
  const leadsMap = {};
  leads.forEach(function(l) {
    if (l.id_lead !== undefined && l.id_lead !== null) {
      var k = String(l.id_lead).trim();
      if (k.endsWith('.0')) k = k.substring(0, k.length - 2);
      leadsMap[k] = l.nombre_completo;
    }
  });

  const empMap = {};
  empleados.forEach(function(e) {
    if (e.id_empleado !== undefined && e.id_empleado !== null) {
      var k = String(e.id_empleado).trim();
      if (k.endsWith('.0')) k = k.substring(0, k.length - 2);
      empMap[k] = e.nombre_completo;
    }
  });

  const empresasMap = {};
  empresas.forEach(function(e) {
    if (e.id_empresa !== undefined && e.id_empresa !== null) {
      var k = String(e.id_empresa).trim();
      if (k.endsWith('.0')) k = k.substring(0, k.length - 2);
      empresasMap[k] = e.nombre;
    }
  });

  // 4. Cruzar datos
  const reportData = citas.map(function(cita) {
    var leadKey = cita.id_lead !== undefined && cita.id_lead !== null ? String(cita.id_lead).trim() : '';
    if (leadKey.endsWith('.0')) leadKey = leadKey.substring(0, leadKey.length - 2);

    var agentKey = cita.id_empleado_agendo !== undefined && cita.id_empleado_agendo !== null ? String(cita.id_empleado_agendo).trim() : '';
    if (agentKey.endsWith('.0')) agentKey = agentKey.substring(0, agentKey.length - 2);

    var empresaKey = cita.id_empresa_emisora !== undefined && cita.id_empresa_emisora !== null ? String(cita.id_empresa_emisora).trim() : '';
    if (empresaKey.endsWith('.0')) empresaKey = empresaKey.substring(0, empresaKey.length - 2);

    return {
      id_cita:       cita.id_cita,
      fecha_cita:    cita.fecha_cita || cita.fecha || '',
      nombre_empresa: empresasMap[empresaKey] || 'WorldClass Travel S. A.',
      nombre_lead:   leadsMap[leadKey]  || 'Desconocido',
      nombre_agente: empMap[agentKey]  || 'Desconocido',
      monto_venta:   Number(cita.monto_venta)         || 0,
      comentarios:   cita.comentarios || cita.notas   || ''
    };
  });

  return reportData;
}
