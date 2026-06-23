function onOpen() {
  const ui  = SpreadsheetApp.getUi();
  const url = getWebAppUrl();

  ui.createMenu('🏢 ' + Config.ERP_NAME)
    .addItem('🚀 Abrir ERP',                       'abrirERP')
    .addSeparator()
    .addItem('⚙️ Inicializar ERP (Bootstrap)',      'apiInicializarERPCompleto')
    .addItem('🔄 Sincronizar todas las tablas',     'apiSincronizarTodo')
    .addItem('🧹 Limpiar y Re-sembrar Maestros (Ecuador)', 'apiEjecutarLimpiezaEcuador')
    .addItem('🔍 Diagnosticar base de datos',      'apiEjecutarDiagnostico')
    .addToUi();
}

/**
 * Abre el ERP en una nueva pestaña del browser.
 * Si la URL del Web App no está configurada aún, muestra instrucciones.
 */
function abrirERP() {
  var url = getWebAppUrl();

  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Configuración requerida',
      'La URL del Web App no está configurada.\n\n' +
      'Pasos:\n' +
      '1. Editor Apps Script → Implementar → Nueva implementación\n' +
      '2. Tipo: Aplicación web → Ejecutar como: Yo → Acceso: Cualquier usuario\n' +
      '3. Copiar la URL generada\n' +
      '4. En el editor: Proyecto → Propiedades del script\n' +
      '5. Agregar propiedad: WEBAPP_URL = <URL copiada>',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  // Agregar ?page=launchpad explícito para forzar la ruta correcta
  var launchpadUrl = url + '?page=launchpad';

  var html = HtmlService.createHtmlOutput(
    '<script>' +
    'window.open("' + launchpadUrl + '", "_blank");' +
    'google.script.host.close();' +
    '</script>'
  ).setWidth(1).setHeight(1);
  SpreadsheetApp.getUi().showModalDialog(html, 'Abriendo ERP...');
}

/**
 * Sincroniza todos los módulos — versión segura para Web App (sin getUi).
 * Retorna { ok, mensaje } para que el Launchpad muestre un toast.
 */
function apiSincronizarTodo() {
  return safeExecute(function() {
    SetupEngine.syncDatabase(MDM_Schema); MDM_Setup.seedCatalogs();
    SetupEngine.syncDatabase(RRHH_Schema);
    EAM_Setup.syncAndSeed();
    SetupEngine.syncDatabase(SD_Schema);
    SetupEngine.syncDatabase(FICO_Schema);
    EREC_Setup.syncAndSeed();
    return { ok: true, mensaje: 'Todos los módulos sincronizados correctamente.' };
  }, 'apiSincronizarTodo');
}

/**
 * Bootstrap seguro para Web App — sin getUi, sin confirmaciones de alert.
 * El Launchpad muestra el resultado como toast.
 */
function apiBootstrapWebApp() {
  return safeExecute(function() {
    SetupEngine.syncDatabase(MDM_Schema); MDM_Setup.seedCatalogs();
    SetupEngine.syncDatabase(RRHH_Schema);
    EAM_Setup.syncAndSeed();
    SetupEngine.syncDatabase(SD_Schema);
    SetupEngine.syncDatabase(FICO_Schema);
    EREC_Setup.syncAndSeed();
    try { DriveOrganizer.run(); } catch(e) {}
    Bootstrap._colorearTabs();
    return { ok: true, mensaje: '✔ ERP inicializado correctamente. Todos los módulos listos.' };
  }, 'apiBootstrapWebApp');
}

/**
 * Organizar Drive — seguro para Web App.
 */
function apiOrganizarDriveWebApp() {
  return safeExecute(function() {
    DriveOrganizer.run();
    return { ok: true, mensaje: '✔ Estructura de Drive organizada.' };
  }, 'apiOrganizarDrive');
}

/**
 * Colorear tabs — seguro para Web App.
 */
function apiColorearTabsWebApp() {
  return safeExecute(function() {
    Bootstrap._colorearTabs();
    return { ok: true, mensaje: '✔ Tabs coloreadas por módulo.' };
  }, 'apiColorearTabs');
}

function apiInicializarERPCompleto() {
  Bootstrap.runERPSetup();
}

function apiSembrarDatosPrueba() {
  CORE_TestSeeder.runSeed();
}

/** Colorear tabs manualmente sin correr Bootstrap completo */
function apiColorearTabs() {
  Bootstrap._colorearTabs();
  SpreadsheetApp.getUi().alert(
    'Listo', 'Tabs coloreadas por módulo.', SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/* ── Funciones de migración unificadas y seguras (Spreadsheet UI y Web App) ─── */
function apiMigrarCORE() {
  return safeExecute(function() {
    const res = SetupEngine.syncDatabase(MDM_Schema);
    MDM_Setup.seedCatalogs();
    var msg = '✔ CORE sincronizado. ' + res.mensaje;
    try {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Sincronización Exitosa", "CORE: " + res.mensaje + " Catálogos inicializados con datos semilla.", ui.ButtonSet.OK);
    } catch(e) {}
    return { ok: true, mensaje: msg };
  }, 'apiMigrarCORE');
}

function apiMigrarHCM() {
  return safeExecute(function() {
    const res = SetupEngine.syncDatabase(RRHH_Schema);
    var msg = '✔ HCM sincronizado. ' + res.mensaje;
    try {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Sincronización Exitosa", "HCM: " + res.mensaje, ui.ButtonSet.OK);
    } catch(e) {}
    return { ok: true, mensaje: msg };
  }, 'apiMigrarHCM');
}

function apiMigrarEAM() {
  return safeExecute(function() {
    EAM_Setup.syncAndSeed();
    var msg = '✔ EAM sincronizado.';
    try {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Sincronización Exitosa", "EAM: Activos corporativos sincronizados y catálogos listos.", ui.ButtonSet.OK);
    } catch(e) {}
    return { ok: true, mensaje: msg };
  }, 'apiMigrarEAM');
}

function apiMigrarSD() {
  return safeExecute(function() {
    const res = SetupEngine.syncDatabase(SD_Schema);
    var msg = '✔ SD sincronizado. ' + res.mensaje;
    try {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Sincronización Exitosa", "SD: " + res.mensaje, ui.ButtonSet.OK);
    } catch(e) {}
    return { ok: true, mensaje: msg };
  }, 'apiMigrarSD');
}

function apiMigrarFICO() {
  return safeExecute(function() {
    const res = SetupEngine.syncDatabase(FICO_Schema);
    var msg = '✔ FICO sincronizado. ' + res.mensaje;
    try {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Sincronización Exitosa", "FICO: " + res.mensaje, ui.ButtonSet.OK);
    } catch(e) {}
    return { ok: true, mensaje: msg };
  }, 'apiMigrarFICO');
}

/** Organizar carpetas de Drive */
function apiOrganizarDrive() {
  try {
    DriveOrganizer.run();
    SpreadsheetApp.getUi().alert(
      'Listo', 'Estructura de Drive organizada.', SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch(e) {
    SpreadsheetApp.getUi().alert('Error', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function apiEjecutarLimpiezaEcuador() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "⚠️ ATENCIÓN: Limpieza y Re-sembrado de Maestros",
    "¿Está seguro de que desea limpiar todas las tablas maestras (Empresas, Business Partners corporativos, Países, Departamentos y Roles) y volver a cargarlas desde cero con los datos de Ecuador?\n\nEsto eliminará los duplicados y dejará configuradas a WorldClass y Rapivisa bajo el país Ecuador (RUC y moneda USD) por defecto. Esta acción no se puede deshacer.",
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    ui.alert("Cancelado", "No se modificaron los datos.", ui.ButtonSet.OK);
    return;
  }

  try {
    const res = apiLimpiarYReinstalarMaestros();
    if (res.ok) {
      ui.alert("✔ Éxito", res.mensaje, ui.ButtonSet.OK);
    } else {
      ui.alert("⚠️ Error", res.error || "No se pudo completar la limpieza.", ui.ButtonSet.OK);
    }
  } catch(e) {
    ui.alert("⚠️ Error de ejecución", e.message, ui.ButtonSet.OK);
  }
}

function apiEjecutarDiagnostico() {
  const ui = SpreadsheetApp.getUi();
  const ss = Utils.getActiveSpreadsheet();
  if (!ss) {
    ui.alert("Error", "No se pudo obtener el Spreadsheet activo.", ui.ButtonSet.OK);
    return;
  }

  var report = "=== DIAGNÓSTICO DE BASE DE DATOS ===\n\n";

  var tables = ['CAT_Paises', 'CAT_Empresas', 'BP_MASTER', 'CAT_Sucursales', 'CAT_UnidadesOrganizativas'];
  tables.forEach(tableName => {
    var sh = ss.getSheetByName(tableName);
    if (!sh) {
      report += `❌ Tabla '${tableName}': NO EXISTE\n\n`;
      return;
    }
    
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();
    report += `📁 Tabla '${tableName}': EXISTE (${lastRow} filas, ${lastCol} columnas)\n`;
    if (lastRow > 1) {
      var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
      var rows = sh.getRange(2, 1, Math.min(lastRow - 1, 15), lastCol).getValues();
      report += `   Cabeceras: [${headers.join(', ')}]\n`;
      report += `   Primeras filas:\n`;
      rows.forEach((row, i) => {
        report += `     Row ${i+2}: [${row.join(', ')}]\n`;
      });
    } else {
      report += `   ⚠️ La tabla está vacía (solo cabecera).\n`;
    }
    report += "\n";
  });

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><title>Diagnóstico</title></head>' +
    '<body><h3>🔍 Reporte de Diagnóstico</h3>' +
    '<pre style="background:#f5f5f5;padding:10px;border-radius:4px;white-space:pre-wrap;font-size:11px;word-break:break-all;">' + 
    report.replace(/</g, "&lt;").replace(/>/g, "&gt;") + 
    '</pre></body></html>'
  ).setWidth(600).setHeight(500);

  ui.showModalDialog(html, '🔍 Diagnóstico del ERP');
}
