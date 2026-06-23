/**
 * CORE_Analytics_Controller
 * Capa de Presentación: Extrae y consolida datos para el Dashboard Gerencial (Fase 8).
 */

function apiGetDashboardData() {
  return safeExecute(() => {
    Logger.log("Recopilando datos para el Dashboard Gerencial...");
    
    // 1. Visión 360° (Tarjetas Rápidas)
    const leads = DataAdapter.findAll("Leads");
    const citas = DataAdapter.findAll("Citas");
    
    let leadsNuevos = 0, leadsContactados = 0, leadsInteresados = 0, leadsCitas = 0;
    leads.forEach(l => {
      if (l.estado === 'NUEVO') leadsNuevos++;
      if (l.estado === 'CONTACTADO') leadsContactados++;
      if (l.estado === 'INTERESADO') leadsInteresados++;
      if (l.estado === 'CITA_AGENDADA') leadsCitas++;
    });

    let ventasCerradas = 0;
    citas.forEach(c => {
      if (c.resultado_venta === 'VENTA') ventasCerradas++;
    });

    // 2. Datos de EAM (Activos)
    const equipos = DataAdapter.findAll("Equipos");
    let eqAsignados = 0, eqBodega = 0, eqReparacion = 0;
    equipos.forEach(eq => {
      if (eq.estado === 'Activo') eqAsignados++;
      if (eq.estado === 'En bodega') eqBodega++;
      if (eq.estado === 'En reparación') eqReparacion++;
    });

    // 3. Datos de HCM (Recursos Humanos)
    const empleados = DataAdapter.findAll("Empleados");
    let empleadosActivos = 0;
    empleados.forEach(e => {
      if (e.activo) empleadosActivos++;
    });

    // 4. Datos EREC (Contrataciones)
    const postulantes = DataAdapter.findAll("EREC_Postulantes");
    let postNuevos = 0, postEntrevista = 0, postPrueba = 0;
    postulantes.forEach(p => {
      if (p.etapa_actual === 'POSTULADO') postNuevos++;
      if (p.etapa_actual === 'ENTREVISTA') postEntrevista++;
      if (p.etapa_actual === 'PRUEBA') postPrueba++;
    });

    return {
      kpis: {
        totalLeads: leads.length,
        totalVentas: ventasCerradas,
        totalEmpleados: empleadosActivos,
        totalEquipos: equipos.length
      },
      charts: {
        funnelVentas: [
          { x: 'Leads Nuevos', y: leadsNuevos || leads.length },
          { x: 'Contactados', y: leadsContactados + leadsInteresados + leadsCitas + ventasCerradas },
          { x: 'Citas', y: leadsCitas + ventasCerradas },
          { x: 'Ventas Cerradas', y: ventasCerradas }
        ],
        equiposDoughnut: [
          { name: 'Asignados', value: eqAsignados },
          { name: 'En Bodega', value: eqBodega },
          { name: 'En Reparación', value: eqReparacion }
        ],
        funnelRRHH: [
          { x: 'Postulados', y: postulantes.length },
          { x: 'En Entrevista', y: postEntrevista + postPrueba },
          { x: 'En Prueba', y: postPrueba }
        ]
      }
    };
  });
}
