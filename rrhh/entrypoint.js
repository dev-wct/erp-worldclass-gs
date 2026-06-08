function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // 1. Submenú de Sincronización de Base de Datos
  const menuSync = ui.createMenu('🔄 Sincronizar Bases de Datos')
    .addItem('Base de Datos: CORE (Catálogos)', 'apiMigrarCORE')
    .addItem('Base de Datos: RRHH (Empleados)', 'apiMigrarRRHH')
    .addItem('Base de Datos: MM (Inventario)', 'apiMigrarMM')
    .addItem('Base de Datos: SD (Call Center)', 'apiMigrarSD')
    .addItem('Base de Datos: FICO (Finanzas)', 'apiMigrarFICO');

  // 2. Submenú CORE (Administración y Sistema)
  const menuCore = ui.createMenu('⚙️ Administración y Sistema')
    .addItem('📁 Organizar Carpetas en Drive', 'apiOrganizarDrive')
    .addItem('🧪 Poblar Datos de Prueba (20 registros)', 'apiSembrarDatosPrueba')
    .addSeparator()
    .addSubMenu(menuSync);

  // 3. Submenú RRHH / HCM
  const menuHCM = ui.createMenu('👥 HCM (Recursos Humanos)')
    .addItem('👤 Registrar Empleado', 'abrirFormEmpleado');

  // 4. Submenú MM (Logística y Activos IT)
  const menuMM = ui.createMenu('📦 MM (Logística y Materiales)')
    .addItem('💻 Registrar Equipo Informático', 'abrirFormEquipo')
    .addItem('📱 Registrar Chip SIM (Línea)', 'abrirFormChip')
    .addItem('🔗 Asignación de Activos', 'abrirFormAsignacion');

  // 5. Submenú SD (Ventas & Call Center)
  const menuSD = ui.createMenu('📞 SD (Ventas y Call Center)')
    .addItem('📢 Registrar Campaña', 'abrirFormCampana')
    .addItem('👤 Registrar Lead', 'abrirFormLead')
    .addItem('📞 Registrar Llamada', 'abrirFormLlamada')
    .addItem('📅 Agendar Cita VIP', 'abrirFormCita');

  // 6. Submenú FICO (Finanzas y Controlling)
  const menuFICO = ui.createMenu('💵 FICO (Finanzas y Control)')
    .addItem('💰 Registrar Pago de Nómina', 'abrirFormPagoNomina');

  // Menú Raíz del ERP
  ui.createMenu('🏢 ERP WorldClass')
    .addSubMenu(menuHCM)
    .addSubMenu(menuMM)
    .addSubMenu(menuSD)
    .addSubMenu(menuFICO)
    .addSeparator()
    .addSubMenu(menuCore)
    .addToUi();
}

function apiSembrarDatosPrueba() {
  CORE_TestSeeder.runSeed();
}

function apiMigrarCORE() {
  try {
    const res = SetupEngine.syncDatabase(CORE_Schema);
    CORE_Setup.seedCatalogs();
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "CORE: " + res.mensaje + " Catálogos inicializados con datos semilla.", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarRRHH() {
  try {
    const res = SetupEngine.syncDatabase(RRHH_Schema);
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "RRHH: " + res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarMM() {
  try {
    const res = SetupEngine.syncDatabase(MM_Schema);
    MM_Setup.seedCatalogs();
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "MM: " + res.mensaje + " Catálogos de Inventario inicializados con datos semilla.", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarSD() {
  try {
    const res = SetupEngine.syncDatabase(SD_Schema);
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "SD: " + res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarFICO() {
  try {
    const res = SetupEngine.syncDatabase(FICO_Schema);
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "FICO: " + res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
