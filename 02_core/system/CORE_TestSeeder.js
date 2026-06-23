/**
 * CORE_TestSeeder
 * Capa de Infraestructura: Generador de datos transaccionales realistas para pruebas integrales del ERP.
 * Genera 20 registros vinculados de forma lógica en todos los módulos (HCM, MM, SD, FICO).
 */
const CORE_TestSeeder = {
  
  clearTestTables: function() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;

    const tablesToClear = [
      "Postulantes", "Empleados", "Equipos", "Chips", "Asignaciones", 
      "Campanas", "Leads", "Llamadas", "Citas", "Pagos_Nomina", 
      "Costos_Chips", "EREC_Vacantes", "EREC_Postulantes", 
      "EREC_EntrevistasNotas", "EREC_LinksPostulacion", "BP_Roles"
    ];

    tablesToClear.forEach(tableName => {
      const sh = ss.getSheetByName(tableName);
      if (sh && sh.getLastRow() > 1) {
        sh.deleteRows(2, sh.getLastRow() - 1);
        Logger.log("[TestSeeder] Tabla limpia: " + tableName);
      }
    });

    // Limpiar BP_MASTER (preservar sólo ID 1 e ID 2 que son las empresas del holding)
    const bpSh = ss.getSheetByName("BP_MASTER");
    if (bpSh && bpSh.getLastRow() > 3) {
      bpSh.deleteRows(4, bpSh.getLastRow() - 3);
      Logger.log("[TestSeeder] BP_MASTER limpio (preservando empresas)");
    }
  },

  runSeed: function() {
    const ui = SpreadsheetApp.getUi();
    const confirm = ui.alert(
      "Confirmación de Inicialización de Pruebas",
      "¿Desea generar 20 registros consistentes de prueba en todas las tablas transaccionales del ERP? Esto limpiará los datos de prueba anteriores y los volverá a sembrar de forma limpia.",
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      ui.alert("Acción cancelada", "No se modificaron los datos.", ui.ButtonSet.OK);
      return;
    }

    try {
      // 1. Asegurar catálogos base inicializados
      MDM_Setup.seedCatalogs();
      EAM_Setup.seedCatalogs();

      // 2. Limpiar registros de prueba anteriores para evitar duplicados y "verguero"
      this.clearTestTables();

      const user = DataAdapter.getCurrentUser();

      // Resolver catálogos de empresas en memoria
      const empresasList = DataAdapter.findAll("CAT_Empresas");
      const companyMap = {};
      empresasList.forEach(c => { companyMap[c.id_empresa] = c.nombre; });
      const defaultCompanyId   = empresasList.length > 0 ? empresasList[0].id_empresa : 1;
      const defaultCompanyName = empresasList.length > 0 ? empresasList[0].nombre : "WorldClass Travel";

      // --- SEMBRAR BUSINESS PARTNERS (personas físicas de prueba) ---
      Logger.log("Sembrando Business Partners...");
      const bpNombres = [
        "Alejandro Gómez","Beatriz Estrada","Carlos Lemus","Diana Flores","Eduardo Reyes",
        "Gabriela Ortiz","Héctor Maldonado","Irene Morales","Jorge Cabrera","Karen Santos",
        "Luis Fuentes","María Argueta","Néstor Paredes","Olga Castillo","Pedro Méndez",
        "Ramiro Aldana","Sofía Cruz","Tomás Sandoval","Ursula Mérida","Víctor Juárez",
        "Francisco Ruiz","Gabriela Soto","Humberto Paz","Isabel Méndez","Julio Estrada",
        "Laura Calderón","Mauricio Vega","Natalia Roldán","Oscar Lemus","Patricia Girón",
      ];

      const bpIds = {};  // nombre → id_bp
      const bpRecords = [];
      bpNombres.forEach(function(nombre, i) {
        const docNum = '300000' + String(i + 1).padStart(4, '0');
        bpRecords.push({
          tipo_bp:          'PERSONA_FISICA',
          tipo_documento:   'DPI',
          numero_documento: docNum,
          nombre:           nombre,
          email:            nombre.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@test.com',
          telefono:         '5555' + String(1000 + i),
          activo:            true,
          created_at:        new Date(),
          created_by:        user,
        });
      });
      
      DataAdapter.insertBatch("BP_MASTER", bpRecords);
      bpRecords.forEach(bp => {
        bpIds[bp.nombre] = bp.id_bp;
      });

      // --- SEMBRAR 20 POSTULANTES (HCM legacy) ---
      Logger.log("Sembrando Postulantes...");
      const postulantesNombres = bpNombres.slice(0, 20);
      const fuentes    = ["FACEBOOK","INSTAGRAM","REFERIDO","LINKEDIN","COMPUTRABAJO"];
      const estadosPost = ["POSTULADO","ENTREVISTA","PRUEBA","ACEPTADO","RECHAZADO"];
      const postulantesRecords = [];

      for (let i = 0; i < 20; i++) {
        const nombre = postulantesNombres[i];
        postulantesRecords.push({
          id_bp:             bpIds[nombre] || '',
          nombre_completo:   nombre,
          dpi:               '300000' + String(i + 1).padStart(4, '0'),
          telefono:          '5555' + String(1000 + i),
          email:             nombre.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@mail.com',
          fuente:            fuentes[i % fuentes.length],
          fecha_postulacion: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
          estado:            i < 12 ? 'ACEPTADO' : estadosPost[i % estadosPost.length],
          notas:             'Perfil con interés en Call Center.',
          created_at:        new Date(),
          created_by:        user,
        });
      }
      DataAdapter.insertBatch("Postulantes", postulantesRecords);

      // --- SEMBRAR 20 EMPLEADOS ---
      Logger.log("Sembrando Empleados...");
      const departamentos  = [1, 2, 3, 4];
      const empresas       = [1, 2];
      const roles          = [1, 2, 3];
      const empleadosRecords = [];

      for (let i = 0; i < 20; i++) {
        const nombre        = postulantesNombres[i];
        const empIdEmpresa  = empresas[i % empresas.length];
        const empCompanyName = companyMap[empIdEmpresa] || "worldclasstravel";
        const emailDomain   = empCompanyName.toLowerCase().replace('erp','').trim().replace(/\s+/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'') + '.com';

        const empIdSucursal = empIdEmpresa === 1 ? (i % 2 === 0 ? 1 : 2) : (i % 2 === 0 ? 3 : 4);
        const empIdUnidad   = empIdEmpresa === 1 ? (i % 3 + 1) : (i % 2 === 0 ? 4 : 5);

        empleadosRecords.push({
          id_bp:          bpIds[nombre] || '',
          id_postulante_erec: '',
          nombre_completo: nombre,
          dpi: "2000" + String(20000 + i),
          email: nombre.toLowerCase().replace(" ", ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@" + emailDomain,
          telefono: "4444" + String(2000 + i),
          id_departamento: departamentos[i % departamentos.length],
          id_empresa: empIdEmpresa,
          id_sucursal: empIdSucursal,
          id_unidad: empIdUnidad,
          id_rol: roles[i % roles.length],
          activo: i < 18,
          fecha_ingreso: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000),
          fecha_salida: i >= 18 ? new Date() : "",
          tipo_contrato: i % 2 === 0 ? "PLANILLA" : "SERVICIOS",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Empleados", empleadosRecords);

      // --- SEMBRAR 20 EQUIPOS ---
      Logger.log("Sembrando Equipos en Bodega...");
      const marcas = [1, 2, 3, 4, 5];
      const tipos = [1, 2, 3];
      const estadosEq = [1, 2, 3];
      const equiposRecords = [];
      
      for (let i = 0; i < 20; i++) {
        const eqIdSucursal = i % 2 === 0 ? 1 : 2;
        const eqSucursalName = eqIdSucursal === 1 ? "Sucursal Quito Principal" : "Sucursal Guayaquil Urdesa";

        equiposRecords.push({
          codigo_interno: "EQ-" + String(i + 1).padStart(4, '0'),
          id_tipo: tipos[i % tipos.length],
          tipo: ["Laptop", "Celular", "Tablet"][i % tipos.length],
          id_marca: marcas[i % marcas.length],
          marca: ["Dell", "HP", "Lenovo", "Apple", "Samsung"][i % marcas.length],
          modelo: "ProBook " + i,
          serial: "SN-" + String(9999 + i),
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_sucursal: eqIdSucursal,
          sucursal: eqSucursalName,
          id_estado: estadosEq[i % estadosEq.length],
          estado: ["Activo", "En bodega", "En reparación"][i % estadosEq.length],
          fecha_compra: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          garantia_hasta: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          valor_compra: 4500 + (i * 100),
          link_factura: "https://drive.google.com/factura_" + (i + 1),
          link_foto: "https://drive.google.com/foto_" + (i + 1),
          observaciones: "Equipo en excelente estado.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Equipos", equiposRecords);

      // --- SEMBRAR 20 CHIPS SIM ---
      Logger.log("Sembrando Chips SIM...");
      const operadoras = [1, 2, 3];
      const chipsRecords = [];
      
      for (let i = 0; i < 20; i++) {
        chipsRecords.push({
          codigo_interno: "SIM-" + String(i + 1).padStart(4, '0'),
          numero: "3000" + String(9000 + i),
          id_operadora: operadoras[i % operadoras.length],
          operadora: ["Claro", "Movistar", "Tigo"][i % operadoras.length],
          plan: "Plan Corporativo Ilimitado " + i,
          costo_mensual: 199.00 + (i * 10),
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_estado: i % 2 === 0 ? 1 : 2,
          estado: i % 2 === 0 ? "Activo" : "En bodega",
          fecha_activacion: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          observaciones: "SIM corporativa.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Chips", chipsRecords);

      // --- SEMBRAR 10 ASIGNACIONES ---
      Logger.log("Sembrando Asignaciones...");
      const asignacionesRecords = [];
      for (let i = 0; i < 10; i++) {
        asignacionesRecords.push({
          id_equipo: i + 1,
          codigo_equipo: "EQ-" + String(i + 1).padStart(4, '0'),
          id_chip: i + 1,
          codigo_chip: "SIM-" + String(i + 1).padStart(4, '0'),
          id_empleado: i + 1,
          empleado: postulantesNombres[i],
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_departamento: 2,
          departamento: "Ventas",
          estado_flujo: "APROBADO",
          fecha_asignacion: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
          fecha_devolucion: "",
          activo: true,
          link_acta: "https://drive.google.com/acta_" + (i + 1),
          notas: "Asignación inicial para Call Center.",
          created_at: new Date(),
          approved_by: user,
          approved_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Asignaciones", asignacionesRecords);

      // --- SEMBRAR 3 CAMPAÑAS ---
      Logger.log("Sembrando Campañas...");
      const campanasNombres = ["Campaña VIP Verano 2026", "Hot Sale Membresías", "Black Friday Escapes"];
      const campanasRecords = [];
      for (let i = 0; i < 3; i++) {
        campanasRecords.push({
          nombre: campanasNombres[i],
          fecha_inicio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          objetivo_citas: 50 + (i * 25),
          estado: i === 2 ? "PLANIFICADA" : "ACTIVA",
          created_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Campanas", campanasRecords);

      // --- SEMBRAR 20 LEADS ---
      Logger.log("Sembrando Leads...");
      const leadsNombres = [
        "Francisco Ruiz", "Gabriela Soto", "Humberto Paz", "Isabel Méndez", "Julio Estrada",
        "Laura Calderón", "Mauricio Vega", "Natalia Roldán", "Oscar Lemus", "Patricia Girón",
        "Ricardo Santos", "Silvia Alvarez", "Teresa Pineda", "Victor Rosales", "Wendy López",
        "Xavier Orellana", "Yolanda Dubón", "Zacarias Ortiz", "Alma Cardona", "Bernardo Cruz"
      ];
      
      const bancos     = ["BAC", "BANRURAL", "BI", "PROMERICA", "BAM"];
      const tdcs       = ["VISA", "MASTERCARD", "AMERICAN EXPRESS", "NINGUNA"];
      const estadosLead = ["NUEVO", "CONTACTADO", "INTERESADO", "CITA_AGENDADA"];
      const leadsRecords = [];

      for (let i = 0; i < 20; i++) {
        const nombre   = leadsNombres[i];
        const id_bp    = bpIds[nombre] || '';
        leadsRecords.push({
          id_bp:           id_bp,
          nombre_completo: nombre,
          telefono:        "3333" + String(5000 + i),
          email:           nombre.toLowerCase().replace(" ", ".") + "@test.com",
          tipo_tdc:        tdcs[i % tdcs.length],
          banco_emisor:    bancos[i % bancos.length],
          id_campana:      (i % 2 === 0 ? 1 : 2),
          estado:          i < 10 ? "CITA_AGENDADA" : estadosLead[i % estadosLead.length],
          fuente:          "FACEBOOK",
          notas:           "Perfil con alto interés.",
          created_at:      new Date(),
          updated_at:      new Date(),
          created_by:      user,
        });
      }
      DataAdapter.insertBatch("Leads", leadsRecords);

      // --- SEMBRAR 20 LLAMADAS ---
      Logger.log("Sembrando Llamadas...");
      const resultadosCall = ["NO CONTESTO", "OCUPADO", "CONTACTADO", "INTERESADO", "CITA AGENDADA"];
      const llamadasRecords = [];
      for (let i = 0; i < 20; i++) {
        llamadasRecords.push({
          id_lead: (i % 20) + 1,
          id_empleado: (i % 5) + 1,
          fecha_hora: new Date(Date.now() - (5 - i * 0.2) * 24 * 60 * 60 * 1000),
          duracion_seg: 10 + (i * 30),
          resultado: i < 10 ? "CITA AGENDADA" : resultadosCall[i % resultadosCall.length],
          notas: "Llamada de seguimiento comercial.",
          created_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Llamadas", llamadasRecords);

      // --- SEMBRAR 10 CITAS ---
      Logger.log("Sembrando Citas en Restaurantes...");
      const restaurantes = ["Portal del Ángel", "Altuna", "Tre Fratelli", "Hacienda Real"];
      const citasRecords = [];
      for (let i = 0; i < 10; i++) {
        citasRecords.push({
          id_lead: i + 1,
          id_empleado_agendo: (i % 5) + 1,
          restaurante: restaurantes[i % restaurantes.length],
          fecha_cita: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
          hora_cita: "19:30",
          num_acompanantes: (i % 3) + 1,
          asistio: i < 6 ? "ASISTIO" : "PENDIENTE",
          resultado_venta: i < 4 ? "VENTA" : "PENDIENTE",
          id_membresia_vendida: i < 4 ? 100 + i : "",
          notas: "Confirmó asistencia.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Citas", citasRecords);

      // --- SEMBRAR 15 PAGOS DE NÓMINA ---
      Logger.log("Sembrando Pagos de Nómina...");
      const pagosNominaRecords = [];
      for (let i = 0; i < 15; i++) {
        const idEmp = i + 1;
        const sueldo = 3500.00;
        
        const comisionCalc = NominaUseCases.calcularComisiones(idEmp, 2026, new Date().getMonth(), 1);
        const comisiones = comisionCalc.total_comisiones || 0;
        
        const bonos = 250.00;
        const deduc = 170.00;
        const total = sueldo + comisiones + bonos - deduc;

        pagosNominaRecords.push({
          id_empleado: idEmp,
          anio: 2026,
          quincena: 1,
          sueldo_base: sueldo,
          comisiones: comisiones,
          bonos: bonos,
          deducciones: deduc,
          total_neto: total,
          pagado: true,
          fecha_pago: new Date(),
          metodo_pago: "TRANSFERENCIA",
          created_at: new Date(),
          created_by: user
        });
      }
      DataAdapter.insertBatch("Pagos_Nomina", pagosNominaRecords);

      // --- SEMBRAR 15 COSTOS DE CHIPS ---
      Logger.log("Sembrando Costos de Chips...");
      const costosChipsRecords = [];
      for (let i = 0; i < 15; i++) {
        costosChipsRecords.push({
          id_chip: i + 1,
          anio: 2026,
          mes: new Date().getMonth() + 1,
          monto: 199.00 + (i * 10),
          pagado: true,
          observaciones: "Factura mensual de línea móvil.",
          created_at: new Date()
        });
      }
      DataAdapter.insertBatch("Costos_Chips", costosChipsRecords);

      // --- SEMBRAR MÓDULO EREC (E-Recruiting) ---
      Logger.log("Sembrando E-Recruiting...");
      const vacantesTitulos = [
        { titulo: 'Agente de Call Center',   dept: 2, rol: 3 },
        { titulo: 'Ejecutivo de Ventas VIP', dept: 2, rol: 2 },
        { titulo: 'Analista de Tecnología',  dept: 1, rol: 2 },
      ];
      
      const vacantesRecords = [];
      vacantesTitulos.forEach(function(v, i) {
        vacantesRecords.push({
          codigo:             'EREC-' + String(i + 1).padStart(4, '0'),
          titulo:             v.titulo,
          descripcion:        'Buscamos un profesional para ' + v.titulo + ' con experiencia en atención al cliente.',
          requisitos:         'Mínimo 1 año de experiencia. Disponibilidad inmediata.',
          id_empresa:         defaultCompanyId,
          id_departamento:    v.dept,
          id_rol_destino:     v.rol,
          plazas_disponibles: 3 - i,
          plazas_cubiertas:   i,
          fecha_apertura:     new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          fecha_cierre:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          estado:             i === 2 ? 'ABIERTA' : 'EN_PROCESO',
          created_at:         new Date(),
          updated_at:         new Date(),
          created_by:         user,
        });
      });
      DataAdapter.insertBatch('EREC_Vacantes', vacantesRecords);
      const idsVacantes = vacantesRecords.map(v => v.id_vacante);

      // 9 postulantes EREC
      const erecNombres = [
        'Ana López', 'Bruno Morales', 'Carmen Vega',
        'David Ríos', 'Elena Campos', 'Felipe Torres',
        'Gloria Núñez', 'Hernán Ibarra', 'Iris Peña',
      ];
      
      const erecBpRecords = [];
      erecNombres.forEach(function(nombre, i) {
        const docNum = '3000' + String(5000 + i);
        const emailPost = nombre.toLowerCase().replace(' ', '.') + '@candidato.com';
        erecBpRecords.push({
          tipo_bp:          'PERSONA_FISICA',
          tipo_documento:   'DPI',
          numero_documento: docNum,
          nombre:           nombre,
          email:            emailPost,
          telefono:         '6666' + String(1000 + i),
          activo:           true,
          created_at:       new Date(),
          created_by:       user
        });
      });
      DataAdapter.insertBatch("BP_MASTER", erecBpRecords);

      const erecPostulantesRecords = [];
      erecNombres.forEach(function(nombre, i) {
        const idVac     = idsVacantes[i % idsVacantes.length];
        const etapa     = i < 3 ? 'POSTULADO' : (i < 6 ? 'ENTREVISTA' : 'PRUEBA');
        const docNum    = '3000' + String(5000 + i);
        const emailPost = nombre.toLowerCase().replace(' ', '.') + '@candidato.com';
        const idBp      = erecBpRecords[i].id_bp;

        erecPostulantesRecords.push({
          id_bp:               idBp,
          id_vacante:          idVac,
          nombre_completo:     nombre,
          documento_identidad: docNum,
          telefono:            '6666' + String(1000 + i),
          email:               emailPost,
          link_cv:             '',
          fuente:              i % 2 === 0 ? 'TOKEN_INDIVIDUAL' : 'LINK_PUBLICO',
          etapa_actual:        etapa,
          puntaje:             etapa === 'POSTULADO' ? 0 : 60 + (i * 5),
          notas_candidato:     'Me interesa el puesto, tengo experiencia en el área.',
          fecha_postulacion:   new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
          created_at:          new Date(),
          updated_at:          new Date(),
          created_by:          user,
        });
      });
      DataAdapter.insertBatch('EREC_Postulantes', erecPostulantesRecords);

      // BP_Roles correspondientes
      const erecRolesRecords = [];
      erecPostulantesRecords.forEach(function(p, i) {
        erecRolesRecords.push({
          id_bp:         p.id_bp,
          rol:          'POSTULANTE',
          modulo:       'EREC',
          referencia_id: p.id_postulante_erec,
          activo:       true,
          created_at:   new Date()
        });
      });
      DataAdapter.insertBatch("BP_Roles", erecRolesRecords);

      // Entrevistas
      const entrevistasRecords = [];
      [3, 4, 5].forEach(function(idx, j) {
        const idPostulante = erecPostulantesRecords[idx].id_postulante_erec;
        const idVac        = idsVacantes[idx % idsVacantes.length];
        entrevistasRecords.push({
          id_postulante_erec: idPostulante,
          id_vacante:         idVac,
          id_entrevistador:   1,
          fecha_entrevista:   new Date(Date.now() - (10 - j) * 24 * 60 * 60 * 1000),
          tipo:               ['TELEFONICA', 'PRESENCIAL', 'VIDEO'][j],
          resultado:          j < 2 ? 'APROBADO' : 'PENDIENTE',
          puntaje:            70 + (j * 10),
          notas:              j < 2
            ? 'Candidato muestra buenas habilidades. Se recomienda avanzar.'
            : 'Pendiente segunda instancia de evaluación.',
          created_at:         new Date(),
          created_by:         user,
        });
      });
      DataAdapter.insertBatch('EREC_EntrevistasNotas', entrevistasRecords);

      // Ejecutar filtros y formateo selectivo en las hojas modificadas
      const tablesToFormat = [
        "BP_MASTER", "Postulantes", "Empleados", "Equipos", "Chips", "Asignaciones", 
        "Campanas", "Leads", "Llamadas", "Citas", "Pagos_Nomina", "Costos_Chips", 
        "EREC_Vacantes", "EREC_Postulantes", "EREC_EntrevistasNotas", "BP_Roles"
      ];
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      tablesToFormat.forEach(function(name) {
        const sh = ss.getSheetByName(name);
        if (sh) SetupEngine.formatHeader(sh, true);
      });

      ui.alert(
        "Inicialización Exitosa",
        "Se sembraron exitosamente los registros de prueba en todas las tablas del " + Config.ERP_NAME + ":\n\n" +
        "• 39 Business Partners (BP_MASTER) + roles en BP_Roles\n" +
        "• 20 Postulantes (HCM)\n• 20 Empleados\n• 20 Equipos\n• 20 Chips\n• 10 Asignaciones\n" +
        "• 3 Campañas\n• 20 Leads\n• 20 Llamadas\n• 10 Citas\n• 15 Nóminas\n• 15 Costos de Chips\n" +
        "• 3 Vacantes EREC\n• 9 Postulantes EREC (con id_bp)\n• 3 Entrevistas EREC",
        ui.ButtonSet.OK
      );
      
    } catch (err) {
      ui.alert("Error de Siembra", "Error al poblar base de datos: " + err.message, ui.ButtonSet.OK);
      Logger.log("Error de TestSeeder: " + err.stack);
    }
  }
};
