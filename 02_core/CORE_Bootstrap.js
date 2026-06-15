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
      Logger.log("1/6 Sincronizando MDM (Datos Maestros)...");
      SetupEngine.syncDatabase(MDM_Schema);
      MDM_Setup.seedCatalogs();

      // 2. RRHH
      Logger.log("2/6 Sincronizando RRHH...");
      SetupEngine.syncDatabase(RRHH_Schema);

      // 3. MM
      Logger.log("3/6 Sincronizando MM (Materiales)...");
      SetupEngine.syncDatabase(MM_Schema);
      MM_Setup.seedCatalogs();

      // 4. SD
      Logger.log("4/6 Sincronizando SD (Ventas)...");
      SetupEngine.syncDatabase(SD_Schema);

      // 5. FICO
      Logger.log("5/6 Sincronizando FICO (Finanzas)...");
      SetupEngine.syncDatabase(FICO_Schema);

      // 6. EREC — debe ir después de RRHH (referencia suave a Empleados)
      Logger.log("6/6 Sincronizando EREC (E-Recruiting)...");
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
        "  • MDM — Datos Maestros\n" +
        "  • RRHH — Recursos Humanos\n" +
        "  • MM — Materiales\n" +
        "  • SD — Ventas y Call Center\n" +
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
