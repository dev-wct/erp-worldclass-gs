/**
 * CORE_DriveOrganizer
 * ─────────────────────────────────────────────────────────────────────────
 * Crea y mantiene la estructura de carpetas del ERP en Google Drive.
 *
 * IDEMPOTENCIA GARANTIZADA:
 *  El ID de la carpeta raíz se persiste en Script Properties la primera vez
 *  que se crea. En ejecuciones posteriores se busca por ID (inmutable),
 *  no por nombre. Esto evita crear carpetas duplicadas aunque el nombre
 *  del ERP cambie o ya exista otra carpeta con el mismo nombre en Drive.
 *
 * PROPIEDAD USADA: 'DRIVE_ROOT_FOLDER_ID_{ENV}'
 *  Ej: 'DRIVE_ROOT_FOLDER_ID_DEV'  → ID de la carpeta raíz de desarrollo
 *      'DRIVE_ROOT_FOLDER_ID_PROD' → ID de la carpeta raíz de producción
 * ─────────────────────────────────────────────────────────────────────────
 */
const DriveOrganizer = {

  /**
   * Detecta el entorno actual (DEV o PROD) desde el nombre de la Sheet.
   */
  _getEnv: function() {
    try {
      const ss = Utils.getActiveSpreadsheet();
      const name = ss ? ss.getName().toUpperCase() : '';
      return (name.includes('PRODUCTION') || name.includes('PROD')) ? 'PROD' : 'DEV';
    } catch(e) { return 'DEV'; }
  },

  /**
   * Obtiene la clave de Script Property para el ID de la carpeta raíz.
   */
  _propKey: function(env) {
    return 'DRIVE_ROOT_FOLDER_ID_' + (env || this._getEnv());
  },

  /**
   * Obtiene la carpeta raíz del ERP, creándola si no existe.
   * Persiste el ID en Script Properties para ejecuciones futuras.
   * NUNCA crea una carpeta duplicada.
   *
   * @returns {Folder}
   */
  getRootFolder: function() {
    var env     = this._getEnv();
    var propKey = this._propKey(env);
    var props   = PropertiesService.getScriptProperties();
    var savedId = props.getProperty(propKey);

    // Intentar obtener por ID guardado (camino feliz — más rápido y seguro)
    if (savedId) {
      try {
        var folder = DriveApp.getFolderById(savedId);
        Logger.log('[DriveOrganizer] Carpeta raíz encontrada por ID: ' + folder.getName());
        return folder;
      } catch(e) {
        // El ID existe pero la carpeta fue eliminada — limpiar y recrear
        Logger.log('[DriveOrganizer] ID guardado inválido, recreando carpeta raíz...');
        props.deleteProperty(propKey);
      }
    }

    // Primera vez o carpeta eliminada — buscar por nombre antes de crear
    var ss = Utils.getActiveSpreadsheet();
    var baseName = Config.ERP_NAME.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    var rootName = baseName + '_' + env;

    var driveRoot = DriveApp.getRootFolder();
    var it = driveRoot.getFoldersByName(rootName);

    var rootFolder;
    if (it.hasNext()) {
      rootFolder = it.next();
      Logger.log('[DriveOrganizer] Carpeta raíz encontrada por nombre: ' + rootName);
    } else {
      rootFolder = driveRoot.createFolder(rootName);
      Logger.log('[DriveOrganizer] Carpeta raíz creada: ' + rootName);
    }

    // Persistir el ID para siempre — de aquí en adelante se usa por ID
    props.setProperty(propKey, rootFolder.getId());
    Logger.log('[DriveOrganizer] ID persistido en Script Properties: ' + rootFolder.getId());

    return rootFolder;
  },

  /**
   * Crea recursivamente la estructura de subcarpetas bajo un padre.
   * Idempotente: no crea si ya existe.
   *
   * @param {Folder} parentFolder
   * @param {object} structure  — { 'nombreCarpeta': { hijos... } }
   */
  _createTree: function(parentFolder, structure) {
    Object.keys(structure).forEach(function(folderName) {
      var it = parentFolder.getFoldersByName(folderName);
      var folder = it.hasNext() ? it.next() : parentFolder.createFolder(folderName);

      if (!it.hasNext()) {
        Logger.log('[DriveOrganizer] Creada: ' + folderName);
      }

      var children = structure[folderName];
      if (children && Object.keys(children).length > 0) {
        DriveOrganizer._createTree(folder, children);
      }
    });
  },

  /**
   * Mueve un archivo a una carpeta destino.
   * @param {string} fileName
   * @param {Folder} targetFolder
   */
  _moveFile: function(fileName, targetFolder) {
    var files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      files.next().moveTo(targetFolder);
      Logger.log('[DriveOrganizer] Movido: ' + fileName);
      return true;
    }
    Logger.log('[DriveOrganizer] Archivo no encontrado: ' + fileName);
    return false;
  },

  /**
   * Ejecuta la organización completa del Drive.
   * Idempotente: se puede llamar N veces sin efectos negativos.
   */
  run: function() {
    Logger.log('=== [DriveOrganizer] Iniciando organización de Drive ===');

    var rootFolder = this.getRootFolder();

    // Estructura de carpetas por módulo SAP
    // Cada módulo es dueño de sus archivos — separación de responsabilidades
    var structure = {
      'EREC': {
        'Vacantes': {},        // CVs por vacante → candidato
      },
      'HCM': {
        'Empleados':  {},      // Contratos y expedientes
        'Onboarding': {},      // Documentos de incorporación
      },
      'MM': {
        'Proveedores':   {},   // Documentos de proveedores (futuro)
        'OrdenesCompra': {},   // Órdenes de compra (futuro)
      },
      'EAM': {
        'Equipos':      {},    // Fotos y facturas de equipos
        'Chips':        {},    // Documentos de líneas SIM
        'Asignaciones': {},    // Actas de entrega firmadas
      },
      'SD': {
        'Campanas': {},        // Materiales de campaña
      },
      'FICO': {
        'Nomina':   {},        // Comprobantes de pago
        'Facturas': {},        // Facturas de proveedores
      },
      'CORE': {
        'Reportes':   {},      // Reportes generados por el ERP
        'Plantillas': {},      // Plantillas de documentos
        'Backups':    {},      // Respaldos de datos
      },
    };

    this._createTree(rootFolder, structure);

    // Mover la Sheet activa a la carpeta raíz del entorno
    try {
      var ss = Utils.getActiveSpreadsheet();
      if (ss) this._moveFile(ss.getName(), rootFolder);
    } catch(e) {
      Logger.log('[DriveOrganizer] No se pudo mover la Sheet: ' + e.message);
    }

    Logger.log('=== [DriveOrganizer] Organización completada ===');
    return { ok: true, mensaje: 'Drive organizado en: ' + rootFolder.getName() + ' (ID: ' + rootFolder.getId() + ')' };
  },

  /**
   * Limpia el ID guardado para forzar una re-búsqueda por nombre.
   * Usar solo si se mueve manualmente la carpeta raíz en Drive.
   */
  resetRootId: function() {
    var env = this._getEnv();
    PropertiesService.getScriptProperties().deleteProperty(this._propKey(env));
    Logger.log('[DriveOrganizer] ID de carpeta raíz eliminado de Script Properties.');
    return { ok: true, mensaje: 'ID reseteado. La próxima llamada a run() buscará por nombre.' };
  },
};

function apiOrganizarDrive() {
  try {
    const res = DriveOrganizer.run();
    SpreadsheetApp.getUi().alert('Drive Organizado', res.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
    return res;
  } catch(e) {
    Logger.log('[DriveOrganizer] Error: ' + e.message);
    SpreadsheetApp.getUi().alert('Error', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
    return { ok: false, errores: [e.message] };
  }
}
