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
