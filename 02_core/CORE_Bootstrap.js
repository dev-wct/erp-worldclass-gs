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
      
      // 1. Sincronizar MDM (Esquema base de empresas, departamentos, roles)
      Logger.log("1/5 Sincronizando MDM (Datos Maestros)...");
      SetupEngine.syncDatabase(MDM_Schema);
      MDM_Setup.seedCatalogs();

      // 2. Sincronizar RRHH (Empleados, postulantes, onboarding, bajas)
      Logger.log("2/5 Sincronizando RRHH...");
      SetupEngine.syncDatabase(RRHH_Schema);

      // 3. Sincronizar MM (Inventario, equipos, chips, asignaciones)
      Logger.log("3/5 Sincronizando MM (Materiales)...");
      SetupEngine.syncDatabase(MM_Schema);
      MM_Setup.seedCatalogs();

      // 4. Sincronizar SD (Ventas y Call Center)
      Logger.log("4/5 Sincronizando SD (Ventas)...");
      SetupEngine.syncDatabase(SD_Schema);

      // 5. Sincronizar FICO (Finanzas)
      Logger.log("5/5 Sincronizando FICO (Finanzas)...");
      SetupEngine.syncDatabase(FICO_Schema);

      // 6. Configurar Formulario Público y Triggers (Reclutamiento)
      Logger.log("Configurando Formulario de Postulantes y Trigger...");
      instalarTriggerPostulante();

      Logger.log("=== BOOTSTRAP COMPLETADO CON ÉXITO ===");
      
      const seedResponse = ui.alert(
        "¡Inicialización Exitosa!",
        "La base de datos del ERP ha sido configurada y los catálogos base están listos.\n\n¿Desea cargar los 20 registros de prueba (Postulantes, Empleados, Leads, Llamadas, etc.) para simular el sistema?",
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
