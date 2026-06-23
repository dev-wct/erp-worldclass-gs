/**
 * CORE_Bootstrap
 * Capa de Infraestructura (Basis): Orquestador del arranque y setup inicial del ERP.
 * 
 * Responsabilidades:
 *  1. Ejecutar las migraciones de tablas en el orden estricto de dependencias.
 *  2. Insertar automáticamente los datos semilla de los catálogos base (MDM y MM).
 *  3. Preguntar si se desea poblar los datos transaccionales de prueba (20 registros).
 */
const Bootstrap = {
  /**
   * Mapa de colores por módulo.
   * Coincide exactamente con los colores del Launchpad (tiles).
   * Clave: fragmento del nombre de la hoja (case-insensitive).
   */
  TAB_COLORS: {
    // MDM / Catálogos — azul corporativo
    'BP_MASTER':          '#0a6ed1',
    'BP_Roles':           '#0a6ed1',
    'CAT_':               '#0a6ed1',

    // HCM — café
    'Empleados':          '#5d4037',
    'Postulantes':        '#5d4037',
    'Onboarding':         '#5d4037',
    'Bajas':              '#5d4037',
    'Pagos_Nomina':       '#1b5e20',

    // EREC — azul oscuro
    'EREC_':              '#1565c0',

    // EAM — verde azulado
    'Equipos':            '#00695c',
    'Chips':              '#00695c',
    'Asignaciones':       '#00695c',
    'Costos_Chips':       '#00695c',

    // SD — morado
    'Campanas':           '#6a1b9a',
    'Leads':              '#6a1b9a',
    'Llamadas':           '#6a1b9a',
    'Citas':              '#6a1b9a',

    // FICO — verde oscuro (Pagos_Nomina ya está arriba)

    // F6 — Motor de Eventos / Auditoría — gris oscuro
    'LOG_Eventos':        '#424242',
  },

  /**
   * Colorea las tabs de todas las hojas según su módulo.
   * Se llama automáticamente al final del Bootstrap.
   */
  _colorearTabs: function() {
    try {
      var ss     = Utils.getActiveSpreadsheet();
      var sheets = ss.getSheets();
      var colores = Bootstrap.TAB_COLORS;

      sheets.forEach(function(sh) {
        var nombre = sh.getName();
        // Buscar el primer patrón que coincida con el nombre de la hoja
        var colorAsignado = null;
        Object.keys(colores).forEach(function(patron) {
          if (!colorAsignado && nombre.indexOf(patron) === 0) {
            colorAsignado = colores[patron];
          }
        });
        if (colorAsignado) {
          sh.setTabColor(colorAsignado);
        }
      });
      Logger.log('[Bootstrap] Tabs coloreadas: ' + sheets.length + ' hojas procesadas.');
    } catch(e) {
      Logger.log('[Bootstrap] No se pudieron colorear tabs: ' + e.message);
    }
  },
  runERPSetup: function() {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "Inicialización Completa del ERP (Basis Setup)",
      "¿Desea inicializar toda la base de datos del ERP? Esto creará todas las tablas, columnas, formatos y cargará los catálogos base en el orden de dependencia correcto.",
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      ui.alert("Cancelado", "No se realizaron cambios.", ui.ButtonSet.OK);
      return;
    }

    try {
      Logger.log("=== INICIANDO BOOTSTRAP DEL ERP ===");

      // 0. Motor de Eventos — debe inicializarse antes que cualquier módulo
      Logger.log("0/7 Inicializando Motor de Eventos (F6)...");
      Logger.log("    Eventos en catálogo: " + EventCatalog.listAll().length);
      Logger.log("    Eventos con handlers activos: " + EventRegistry.getActiveEvents().join(', '));
      Logger.log("    Adapter de notificación: " + AdapterFactory.getActiveAdapterName());

      // 1. MDM
      Logger.log("1/7 Sincronizando MDM (Datos Maestros)...");
      SetupEngine.syncDatabase(MDM_Schema);
      MDM_Setup.seedCatalogs();

      // 2. HCM
      Logger.log("2/7 Sincronizando HCM (Human Capital Management)...");
      SetupEngine.syncDatabase(RRHH_Schema);

      // 3. MM — placeholder, sin tablas aún
      Logger.log("3/7 MM reservado (Procure-to-Pay — pendiente de implementación).");

      // 4. EAM — activos corporativos (antes vivía en MM)
      Logger.log("4/7 Sincronizando EAM (Enterprise Asset Management)...");
      EAM_Setup.syncAndSeed();

      // 5. SD
      Logger.log("5/7 Sincronizando SD (Ventas y Call Center)...");
      SetupEngine.syncDatabase(SD_Schema);

      // 6. FICO
      Logger.log("6/7 Sincronizando FICO (Finanzas)...");
      SetupEngine.syncDatabase(FICO_Schema);

      // 7. EREC — debe ir después de HCM (referencia suave a Empleados)
      Logger.log("7/7 Sincronizando EREC (E-Recruiting)...");
      EREC_Setup.syncAndSeed();

      // 7. Organizar Drive con estructura por módulo
      Logger.log("Organizando estructura de Drive...");
      try { DriveOrganizer.run(); } catch(driveErr) {
        Logger.log("Drive ya organizado o sin permisos: " + driveErr.message);
      }

      // Colorear tabs de hojas por módulo — UX visual SAP
      Logger.log("Coloreando tabs de hojas por módulo...");
      Bootstrap._colorearTabs();

      Logger.log("=== BOOTSTRAP COMPLETADO CON ÉXITO ===");

      const seedResponse = ui.alert(
        "¡ERP Inicializado!",
        "✔ Todos los módulos están listos:\n" +
        "  • MDM  — Datos Maestros\n" +
        "  • HCM  — Human Capital Management\n" +
        "  • MM   — Materials Management (reservado)\n" +
        "  • EAM  — Enterprise Asset Management\n" +
        "  • SD   — Ventas y Call Center\n" +
        "  • FICO — Finanzas\n" +
        "  • EREC — E-Recruiting\n\n" +
        "¿Desea cargar los registros de prueba para simular el sistema?",
        ui.ButtonSet.YES_NO
      );

      if (seedResponse === ui.Button.YES) {
        CORE_TestSeeder.runSeed();
      } else {
        ui.alert("ERP Listo", "El ERP está listo para usarse con bases de datos limpias.", ui.ButtonSet.OK);
      }

    } catch (error) {
      Logger.log("Error en el Bootstrap: " + error.message);
      ui.alert("Error en Inicialización", "Ocurrió un error: " + error.message, ui.ButtonSet.OK);
    }
  }
};
