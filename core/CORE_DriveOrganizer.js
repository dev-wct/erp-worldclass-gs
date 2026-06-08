/**
 * CORE_DriveOrganizer
 * Script de inicialización que crea la estructura de carpetas del ERP en Google Drive
 * y mueve las Sheets de DEV y PROD a sus carpetas correspondientes.
 * Este script se ejecuta UNA SOLA VEZ para organizar el Drive.
 */
const DriveOrganizer = {

  /** Crea recursivamente la estructura de carpetas */
  createFolderTree: function(parentFolder, structure) {
    const created = {};
    Object.keys(structure).forEach(folderName => {
      let folder;
      const existing = parentFolder.getFoldersByName(folderName);
      if (existing.hasNext()) {
        folder = existing.next();
        Logger.log(`[*] Carpeta existente: ${folderName}`);
      } else {
        folder = parentFolder.createFolder(folderName);
        Logger.log(`[+] Creada carpeta: ${folderName}`);
      }
      created[folderName] = folder;

      // Recursión para subcarpetas
      const children = structure[folderName];
      if (Object.keys(children).length > 0) {
        this.createFolderTree(folder, children);
      }
    });
    return created;
  },

  /** Mueve un archivo a una carpeta destino */
  moveFileToFolder: function(fileName, targetFolder) {
    const files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      const file = files.next();
      file.moveTo(targetFolder);
      Logger.log(`[✔] Movido '${fileName}' a carpeta '${targetFolder.getName()}'`);
      return true;
    }
    Logger.log(`[!] Archivo '${fileName}' no encontrado en Drive.`);
    return false;
  },

  /** Ejecuta la organización completa */
  run: function() {
    Logger.log("=== Iniciando Organización de Google Drive en Enfoque Cápsula ===");

    // 1. Obtener la Sheet activa y determinar el entorno
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ssName = ss.getName();
    
    let envName, rootFolderName;
    if (ssName.includes("PRODUCTION")) {
      envName = "PROD";
      rootFolderName = "ERP_WorldClass_PROD";
    } else {
      envName = "DEV";
      rootFolderName = "ERP_WorldClass_DEV";
    }
    
    Logger.log(`[*] Detectado Entorno: ${envName}`);
    Logger.log(`[*] Carpeta Raíz Destino: ${rootFolderName}`);

    // 2. Definir la estructura de carpetas aislada para este entorno
    const structure = {};
    structure[rootFolderName] = {
      'Documentos': {
        'Contratos': {},
        'Actas_Entrega': {},
        'Reportes': {},
        'Facturas': {},
      },
      'Uploads': {
        'Fotos_Empleados': {},
        'Hojas_Vida': {},
        'Fotos_Equipos': {},
      },
      'Plantillas': {},
    };

    // 3. Crear estructura de carpetas en la raíz del Drive
    const driveRoot = DriveApp.getRootFolder();
    const topLevel = this.createFolderTree(driveRoot, structure);
    const erpRootFolder = topLevel[rootFolderName];

    // 4. Mover la Sheet activa a su respectiva carpeta raíz del entorno
    this.moveFileToFolder(ssName, erpRootFolder);

    Logger.log(`=== Organización Completada para Entorno ${envName} ===`);
    return { ok: true, mensaje: `Drive organizado exitosamente en la carpeta aislada '${rootFolderName}'.` };
  }
};

/** Punto de entrada global para ejecutar la organización del Drive */
function apiOrganizarDrive() {
  try {
    const res = DriveOrganizer.run();
    SpreadsheetApp.getUi().alert("Drive Organizado", res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
    return res;
  } catch (e) {
    Logger.log("Error organizando Drive: " + e.message);
    SpreadsheetApp.getUi().alert("Error", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
    return { ok: false, errores: [e.message] };
  }
}
