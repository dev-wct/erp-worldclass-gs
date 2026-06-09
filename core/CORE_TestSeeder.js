/**
 * CORE_TestSeeder
 * Capa de Infraestructura: Generador de datos transaccionales realistas para pruebas integrales del ERP.
 * Genera 20 registros vinculados de forma lógica en todos los módulos (HCM, MM, SD, FICO).
 */
const CORE_TestSeeder = {
  
  runSeed: function() {
    const ui = SpreadsheetApp.getUi();
    const confirm = ui.alert(
      "Confirmación de Inicialización de Pruebas",
      "¿Desea generar 20 registros consistentes de prueba en todas las tablas transaccionales del ERP? Esto poblará automáticamente Postulantes, Empleados, Equipos, Chips, Asignaciones, Campañas, Leads, Llamadas, Citas, Nóminas y Costos de Chips.",
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      ui.alert("Acción cancelada", "No se modificaron los datos.", ui.ButtonSet.OK);
      return;
    }

    try {
      // 1. Asegurar catálogos base inicializados
      MDM_Setup.seedCatalogs();
      MM_Setup.seedCatalogs();
      
      const user = DataAdapter.getCurrentUser();

      // Resolver catálogos de empresas en memoria
      const empresasList = DataAdapter.findAll("CAT_Empresas");
      const companyMap = {};
      empresasList.forEach(c => {
        companyMap[c.id_empresa] = c.nombre;
      });

      // Si no hay empresas, usar un fallback default
      const defaultCompanyId = empresasList.length > 0 ? empresasList[0].id_empresa : 1;
      const defaultCompanyName = empresasList.length > 0 ? empresasList[0].nombre : "WorldClass Travel";
      
      // --- SEMBRAR 20 POSTULANTES ---
      Logger.log("Sembrando Postulantes...");
      const postulantesNombres = [
        "Alejandro Gómez", "Beatriz Estrada", "Carlos Lemus", "Diana Flores", "Eduardo Reyes",
        "Gabriela Ortiz", "Héctor Maldonado", "Irene Morales", "Jorge Cabrera", "Karen Santos",
        "Luis Fuentes", "María Argueta", "Néstor Paredes", "Olga Castillo", "Pedro Méndez",
        "Ramiro Aldana", "Sofía Cruz", "Tomás Sandoval", "Ursula Mérida", "Víctor Juárez"
      ];
      
      const fuentes = ["FACEBOOK", "INSTAGRAM", "REFERIDO", "LINKEDIN", "COMPUTRABAJO"];
      const estadosPost = ["POSTULADO", "ENTREVISTA", "PRUEBA", "ACEPTADO", "RECHAZADO"];
      
      for (let i = 0; i < 20; i++) {
        const idPost = DataAdapter.getNextId("Postulantes");
        DataAdapter.insert("Postulantes", {
          id_postulante: idPost,
          nombre_completo: postulantesNombres[i],
          dpi: "2000" + String(10000 + i),
          telefono: "5555" + String(1000 + i),
          email: postulantesNombres[i].toLowerCase().replace(" ", ".") + "@mail.com",
          fuente: fuentes[i % fuentes.length],
          fecha_postulacion: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
          estado: i < 12 ? "ACEPTADO" : estadosPost[i % estadosPost.length],
          notas: "Perfil con interés en Call Center.",
          created_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 20 EMPLEADOS ---
      Logger.log("Sembrando Empleados...");
      const departamentos = [1, 2, 3, 4]; // Tecnología, Ventas, Operaciones, Admón
      const empresas = [1, 2]; // WCT, Rapivisa
      const roles = [1, 2, 3]; // Admin, Supervisor, Consulta
      
      for (let i = 0; i < 20; i++) {
        const idEmp = DataAdapter.getNextId("Empleados");
        const nombre = i < postulantesNombres.length ? postulantesNombres[i] : "Agente " + i;
        const empIdEmpresa = empresas[i % empresas.length];
        const empCompanyName = companyMap[empIdEmpresa] || "worldclasstravel";
        const emailDomain = empCompanyName.toLowerCase().replace("erp", "").trim().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") + ".com";

        DataAdapter.insert("Empleados", {
          id_empleado: idEmp,
          id_postulante: i < 12 ? (i + 1) : "",
          nombre_completo: nombre,
          dpi: "2000" + String(20000 + i),
          email: nombre.toLowerCase().replace(" ", ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@" + emailDomain,
          telefono: "4444" + String(2000 + i),
          id_departamento: departamentos[i % departamentos.length],
          id_empresa: empIdEmpresa,
          id_rol: roles[i % roles.length],
          activo: i < 18, // 18 activos, 2 inactivos
          fecha_ingreso: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000),
          fecha_salida: i >= 18 ? new Date() : "",
          tipo_contrato: i % 2 === 0 ? "PLANILLA" : "SERVICIOS",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 20 EQUIPOS ---
      Logger.log("Sembrando Equipos en Bodega...");
      const marcas = [1, 2, 3, 4, 5]; // Dell, HP, Lenovo, Apple, Samsung
      const tipos = [1, 2, 3]; // Laptop, Celular, Tablet
      const estadosEq = [1, 2, 3]; // Activo, En Bodega, Reparación
      
      for (let i = 0; i < 20; i++) {
        const idEq = DataAdapter.getNextId("Equipos");
        DataAdapter.insert("Equipos", {
          id_equipo: idEq,
          codigo_interno: "EQ-" + String(idEq).padStart(4, '0'),
          id_tipo: tipos[i % tipos.length],
          tipo: ["Laptop", "Celular", "Tablet"][i % tipos.length],
          id_marca: marcas[i % marcas.length],
          marca: ["Dell", "HP", "Lenovo", "Apple", "Samsung"][i % marcas.length],
          modelo: "ProBook " + i,
          serial: "SN-" + String(9999 + i),
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_estado: estadosEq[i % estadosEq.length],
          estado: ["Activo", "En bodega", "En reparación"][i % estadosEq.length],
          fecha_compra: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          garantia_hasta: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          valor_compra: 4500 + (i * 100),
          link_factura: "https://drive.google.com/factura_" + idEq,
          link_foto: "https://drive.google.com/foto_" + idEq,
          observaciones: "Equipo en excelente estado.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 20 CHIPS SIM ---
      Logger.log("Sembrando Chips SIM...");
      const operadoras = [1, 2, 3]; // Claro, Movistar, Tigo
      
      for (let i = 0; i < 20; i++) {
        const idChip = DataAdapter.getNextId("Chips");
        DataAdapter.insert("Chips", {
          id_chip: idChip,
          codigo_interno: "SIM-" + String(idChip).padStart(4, '0'),
          numero: "3000" + String(9000 + i),
          id_operadora: operadoras[i % operadoras.length],
          operadora: ["Claro", "Movistar", "Tigo"][i % operadoras.length],
          plan: "Plan Corporativo Ilimitado " + i,
          costo_mensual: 199.00 + (i * 10),
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_estado: i % 2 === 0 ? 1 : 2, // 1: Activo, 2: En Bodega
          estado: i % 2 === 0 ? "Activo" : "En bodega",
          fecha_activacion: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          observaciones: "SIM corporativa.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 10 ASIGNACIONES ---
      Logger.log("Sembrando Asignaciones...");
      for (let i = 0; i < 10; i++) {
        const idAsig = DataAdapter.getNextId("Asignaciones");
        DataAdapter.insert("Asignaciones", {
          id_asignacion: idAsig,
          id_equipo: i + 1,
          codigo_equipo: "EQ-" + String(i + 1).padStart(4, '0'),
          id_chip: i + 1,
          codigo_chip: "SIM-" + String(i + 1).padStart(4, '0'),
          id_empleado: i + 1,
          empleado: postulantesNombres[i],
          id_empresa: defaultCompanyId,
          empresa: defaultCompanyName,
          id_departamento: 2, // Ventas
          departamento: "Ventas",
          estado_flujo: "APROBADO",
          fecha_asignacion: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
          fecha_devolucion: "",
          activo: true,
          link_acta: "https://drive.google.com/acta_" + idAsig,
          notas: "Asignación inicial para Call Center.",
          created_at: new Date(),
          approved_by: user,
          approved_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 3 CAMPAÑAS ---
      Logger.log("Sembrando Campañas...");
      const campanasNombres = ["Campaña VIP Verano 2026", "Hot Sale Membresías", "Black Friday Escapes"];
      for (let i = 0; i < 3; i++) {
        const idCamp = DataAdapter.getNextId("Campanas");
        DataAdapter.insert("Campanas", {
          id_campana: idCamp,
          nombre: campanasNombres[i],
          fecha_inicio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          objetivo_citas: 50 + (i * 25),
          estado: i === 2 ? "PLANIFICADA" : "ACTIVA",
          created_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 20 LEADS ---
      Logger.log("Sembrando Leads...");
      const leadsNombres = [
        "Francisco Ruiz", "Gabriela Soto", "Humberto Paz", "Isabel Méndez", "Julio Estrada",
        "Laura Calderón", "Mauricio Vega", "Natalia Roldán", "Oscar Lemus", "Patricia Girón",
        "Ricardo Santos", "Silvia Alvarez", "Teresa Pineda", "Victor Rosales", "Wendy López",
        "Xavier Orellana", "Yolanda Dubón", "Zacarias Ortiz", "Alma Cardona", "Bernardo Cruz"
      ];
      
      const bancos = ["BAC", "BANRURAL", "BI", "PROMERICA", "BAM"];
      const tdcs = ["VISA", "MASTERCARD", "AMERICAN EXPRESS", "NINGUNA"];
      const estadosLead = ["NUEVO", "CONTACTADO", "INTERESADO", "CITA_AGENDADA"];

      for (let i = 0; i < 20; i++) {
        const idLead = DataAdapter.getNextId("Leads");
        DataAdapter.insert("Leads", {
          id_lead: idLead,
          nombre_completo: leadsNombres[i],
          telefono: "3333" + String(5000 + i),
          email: leadsNombres[i].toLowerCase().replace(" ", ".") + "@test.com",
          tipo_tdc: tdcs[i % tdcs.length],
          banco_emisor: bancos[i % bancos.length],
          id_campana: (i % 2 === 0 ? 1 : 2), // Campaña 1 o 2 (Activas)
          estado: i < 10 ? "CITA_AGENDADA" : estadosLead[i % estadosLead.length],
          fuente: "FACEBOOK",
          notas: "Perfil con alto interés.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 20 LLAMADAS ---
      Logger.log("Sembrando Llamadas...");
      const resultadosCall = ["NO CONTESTO", "OCUPADO", "CONTACTADO", "INTERESADO", "CITA AGENDADA"];
      for (let i = 0; i < 20; i++) {
        const idCall = DataAdapter.getNextId("Llamadas");
        DataAdapter.insert("Llamadas", {
          id_llamada: idCall,
          id_lead: (i % 20) + 1,
          id_empleado: (i % 5) + 1, // Agentes 1 al 5
          fecha_hora: new Date(Date.now() - (5 - i * 0.2) * 24 * 60 * 60 * 1000),
          duracion_seg: 10 + (i * 30),
          resultado: i < 10 ? "CITA AGENDADA" : resultadosCall[i % resultadosCall.length],
          notas: "Llamada de seguimiento comercial.",
          created_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 10 CITAS ---
      Logger.log("Sembrando Citas en Restaurantes...");
      const restaurantes = ["Portal del Ángel", "Altuna", "Tre Fratelli", "Hacienda Real"];
      for (let i = 0; i < 10; i++) {
        const idCita = DataAdapter.getNextId("Citas");
        DataAdapter.insert("Citas", {
          id_cita: idCita,
          id_lead: i + 1, // Leads 1 al 10 que tienen estado CITA_AGENDADA
          id_empleado_agendo: (i % 5) + 1,
          restaurante: restaurantes[i % restaurantes.length],
          fecha_cita: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
          hora_cita: "19:30",
          num_acompanantes: (i % 3) + 1,
          asistio: i < 6 ? "ASISTIO" : "PENDIENTE",
          resultado_venta: i < 4 ? "VENTA" : "PENDIENTE", // 4 Ventas para probar comisiones
          id_membresia_vendida: i < 4 ? 100 + i : "",
          notas: "Confirmó asistencia.",
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user
        });
      }

      // --- SEMBRAR 15 PAGOS DE NÓMINA ---
      Logger.log("Sembrando Pagos de Nómina...");
      for (let i = 0; i < 15; i++) {
        const idPago = DataAdapter.getNextId("Pagos_Nomina");
        
        // Empleados del 1 al 15
        const idEmp = i + 1;
        const emp = DataAdapter.findById("Empleados", idEmp);
        const sueldo = 3500.00;
        
        // Calcular comisiones del empleado en Junio 2026, Quincena 1 (donde metimos las citas de arriba)
        const comisionCalc = NominaUseCases.calcularComisiones(idEmp, 2026, new Date().getMonth(), 1);
        const comisiones = comisionCalc.total_comisiones || 0;
        
        const bonos = 250.00;
        const deduc = 170.00;
        const total = sueldo + comisiones + bonos - deduc;

        DataAdapter.insert("Pagos_Nomina", {
          id_pago: idPago,
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

      // --- SEMBRAR 15 COSTOS DE CHIPS ---
      Logger.log("Sembrando Costos de Chips...");
      for (let i = 0; i < 15; i++) {
        const idCosto = DataAdapter.getNextId("Costos_Chips");
        DataAdapter.insert("Costos_Chips", {
          id_costo: idCosto,
          id_chip: i + 1,
          anio: 2026,
          mes: new Date().getMonth() + 1,
          monto: 199.00 + (i * 10),
          pagado: true,
          observaciones: "Factura mensual de línea móvil.",
          created_at: new Date()
        });
      }

      ui.alert(
        "Inicialización Exitosa",
        "Se sembraron exitosamente los 20 registros cruzados y consistentes en todas las tablas del " + Config.ERP_NAME + ". Ya puede realizar pruebas integrales.",
        ui.ButtonSet.OK
      );
      
    } catch (err) {
      ui.alert("Error de Siembra", "Error al poblar base de datos: " + err.message, ui.ButtonSet.OK);
      Logger.log("Error de TestSeeder: " + err.stack);
    }
  }
};
