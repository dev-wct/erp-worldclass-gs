function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // 1. Submenú de Sincronización de Base de Datos
  const menuSync = ui.createMenu('🔄 Sincronizar Bases de Datos')
    .addItem('Base de Datos: CORE (Catálogos)',       'apiMigrarCORE')
    .addItem('Base de Datos: HCM (Empleados)',        'apiMigrarHCM')
    .addItem('Base de Datos: EAM (Activos)',         'apiMigrarEAM')
    .addItem('Base de Datos: SD (Ventas)',            'apiMigrarSD')
    .addItem('Base de Datos: FICO (Finanzas)',        'apiMigrarFICO')
    .addItem('Base de Datos: EREC (Reclutamiento)',   'apiMigrarEREC');

  // 2. Submenú CORE (Administración y Sistema)
  const menuCore = ui.createMenu('⚙️ Administración y Sistema')
    .addItem('🚀 Inicializar ERP Completo (Bootstrap)', 'apiInicializarERPCompleto')
    .addSeparator()
    .addItem('📁 Organizar Carpetas en Drive', 'apiOrganizarDrive')
    .addItem('🧪 Poblar Datos de Prueba (20 registros)', 'apiSembrarDatosPrueba')
    .addSeparator()
    .addSubMenu(menuSync);

  // 3. Submenú RRHH / HCM — solo gestión de empleados activos
  const menuHCM = ui.createMenu('👥 HCM (Recursos Humanos)')
    .addItem('👤 Registrar Empleado', 'abrirFormEmpleado');

  // 4. Submenú EREC — E-Recruiting
  const menuEREC = ui.createMenu('🎯 E-Recruiting (Reclutamiento)')
    .addItem('📋 Nueva Vacante',              'abrirFormVacante')
    .addItem('🔗 Generar Link de Postulación','abrirDialogoLinksVacante')
    .addSeparator()
    .addItem('📋 Ver Links Generados',         'abrirDialogoVerLinksEREC');
  // 5. Submenú EAM (Activos Corporativos)
  const menuEAM = ui.createMenu('🖥️ EAM (Activos Corporativos)')
    .addItem('💻 Registrar Equipo',        'abrirFormEquipo')
    .addItem('📱 Registrar Chip SIM',      'abrirFormChip')
    .addItem('🔗 Asignación de Activos',   'abrirFormAsignacion');

  // 6. Submenú SD (Ventas & Call Center)
  const menuSD = ui.createMenu('📞 SD (Ventas y Call Center)')
    .addItem('📢 Registrar Campaña', 'abrirFormCampana')
    .addItem('👤 Registrar Lead', 'abrirFormLead')
    .addItem('📞 Registrar Llamada', 'abrirFormLlamada')
    .addItem('📅 Agendar Cita VIP', 'abrirFormCita');

  // 7. Submenú FICO (Finanzas y Controlling)
  const menuFICO = ui.createMenu('💵 FICO (Finanzas y Control)')
    .addItem('💰 Registrar Pago de Nómina', 'abrirFormPagoNomina');

  // Menú Raíz del ERP
  ui.createMenu('🏢 ' + Config.ERP_NAME)
    .addSubMenu(menuHCM)
    .addSubMenu(menuEREC)
    .addSubMenu(menuEAM)
    .addSubMenu(menuSD)
    .addSubMenu(menuFICO)
    .addSeparator()
    .addSubMenu(menuCore)
    .addToUi();
}

function apiInicializarERPCompleto() {
  Bootstrap.runERPSetup();
}

function apiSembrarDatosPrueba() {
  CORE_TestSeeder.runSeed();
}

function apiMigrarCORE() {
  try {
    const res = SetupEngine.syncDatabase(MDM_Schema);
    MDM_Setup.seedCatalogs();
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "CORE: " + res.mensaje + " Catálogos inicializados con datos semilla.", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarHCM() {
  try {
    const res = SetupEngine.syncDatabase(RRHH_Schema);
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "HCM: " + res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error de Integridad", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiMigrarEAM() {
  try {
    EAM_Setup.syncAndSeed();
    SpreadsheetApp.getUi().alert("Sincronización Exitosa", "EAM: Activos corporativos sincronizados y catálogos listos.", SpreadsheetApp.getUi().ButtonSet.OK);
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
