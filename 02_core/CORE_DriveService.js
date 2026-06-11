/**
 * CORE_DriveService
 * ─────────────────────────────────────────────────────────────────────────
 * Servicio centralizado para operaciones con Google Drive.
 *
 * ESTRUCTURA DE CARPETAS (creada por DriveOrganizer):
 *   ERP_WorldClass_DEV/
 *   ├── RRHH/
 *   │   └── Postulantes/
 *   │       └── Juan_Perez_DPI_1234567890123/   ← subcarpeta por candidato
 *   │           ├── cv_juan_perez.pdf
 *   │           └── cedula_juan_perez.jpg
 *   ├── MM/
 *   │   └── Equipos/
 *   └── CORE/
 *       └── Reportes/
 *
 * PRINCIPIO:
 *   Cada módulo es dueño de su ruta en Drive — igual que en las tablas.
 *   Este servicio navega la jerarquía sin crear carpetas fuera de su módulo.
 * ─────────────────────────────────────────────────────────────────────────
 */
const DriveService = {

  /**
   * Sube un archivo Base64 a la ruta correcta dentro de la estructura del ERP.
   *
   * @param {string}   base64Data  — Contenido del archivo en Base64 puro (sin prefijo data:...)
   * @param {string}   fileName    — Nombre original del archivo (ej. "cv_maria.pdf")
   * @param {string}   mimeType    — Tipo MIME (ej. "application/pdf")
   * @param {string[]} rutaModulo  — Ruta relativa desde la raíz del ERP (ej. ['RRHH','Postulantes'])
   * @param {string}   [subCarpeta]— Subcarpeta adicional (ej. nombre del candidato)
   * @returns {string}             — URL de visualización del archivo
   */
  subirArchivoBase64: function(base64Data, fileName, mimeType, rutaModulo, subCarpeta) {
    var decoded = Utilities.base64Decode(base64Data);
    var blob    = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', fileName);

    var carpetaDestino = this._resolverRuta(rutaModulo, subCarpeta);

    var file = carpetaDestino.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    Logger.log('[DriveService] Subido: ' + file.getName() + ' → ' + file.getUrl());
    return file.getUrl();
  },

  /**
   * Sube el CV de un postulante.
   * Resuelve automáticamente la ruta RRHH/Postulantes/{nombre}_{labelDoc}_{dpi}/
   *
   * @param {string} base64Data
   * @param {string} fileName
   * @param {string} mimeType
   * @param {string} nombreCandidato  — Para construir el nombre de la subcarpeta
   * @param {string} dpi              — Número de documento de identidad
   * @param {string} labelDocumento   — Ej: "DPI", "DUI", "Cédula" (viene de Customizing)
   * @returns {string} URL del archivo
   */
  subirCVPostulante: function(base64Data, fileName, mimeType, nombreCandidato, dpi, labelDocumento) {
    // Sanitizar el nombre para usarlo como nombre de carpeta
    var nombreSanitizado = this._sanitizarNombre(nombreCandidato);
    var dpiSanitizado    = this._sanitizarNombre(String(dpi || 'SIN_DOC'));
    var labelSanitizado  = this._sanitizarNombre(String(labelDocumento || 'ID'));

    // Subcarpeta: Juan_Perez_DPI_1234567890123
    var subCarpeta = nombreSanitizado + '_' + labelSanitizado + '_' + dpiSanitizado;

    return this.subirArchivoBase64(
      base64Data, fileName, mimeType,
      ['RRHH', 'Postulantes'],
      subCarpeta
    );
  },

  /**
   * Resuelve la carpeta de destino navegando la jerarquía del ERP.
   * Crea los niveles faltantes si no existen (idempotente).
   *
   * @param {string[]} rutaModulo  — Ej: ['RRHH', 'Postulantes']
   * @param {string}   [subCarpeta]
   * @returns {Folder}
   */
  _resolverRuta: function(rutaModulo, subCarpeta) {
    // Encontrar la carpeta raíz del ERP (creada por DriveOrganizer)
    var raiz = this._getRaizERP();

    // Navegar / crear cada nivel de la ruta del módulo
    var carpetaActual = raiz;
    (rutaModulo || []).forEach(function(nivel) {
      carpetaActual = DriveService._obtenerOCrearHija(carpetaActual, nivel);
    });

    // Subcarpeta opcional (ej. carpeta del candidato)
    if (subCarpeta) {
      carpetaActual = this._obtenerOCrearHija(carpetaActual, subCarpeta);
    }

    return carpetaActual;
  },

  /**
   * Obtiene la carpeta raíz del ERP en Drive.
   * Busca por el nombre derivado de Config.ERP_NAME + entorno.
   * Si no existe (DriveOrganizer no se ejecutó aún), la crea en la raíz de Drive.
   *
   * @returns {Folder}
   */
  _getRaizERP: function() {
    var ss = Utils.getActiveSpreadsheet();
    var ssName = ss ? ss.getName() : '';
    var envName = (ssName.toUpperCase().includes('PROD')) ? 'PROD' : 'DEV';
    var baseName = Config.ERP_NAME.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    var rootName = baseName + '_' + envName;

    var it = DriveApp.getFoldersByName(rootName);
    if (it.hasNext()) return it.next();

    // No existe → crear carpeta raíz (DriveOrganizer no se ejecutó aún)
    Logger.log('[DriveService] Carpeta raíz no encontrada. Creando: ' + rootName);
    return DriveApp.createFolder(rootName);
  },

  /**
   * Obtiene una subcarpeta hija por nombre, o la crea si no existe.
   * @param {Folder} parent
   * @param {string} nombre
   * @returns {Folder}
   */
  _obtenerOCrearHija: function(parent, nombre) {
    var it = parent.getFoldersByName(nombre);
    if (it.hasNext()) return it.next();
    Logger.log('[DriveService] Creando subcarpeta: ' + nombre);
    return parent.createFolder(nombre);
  },

  /**
   * Sanitiza un string para usarlo como nombre de carpeta en Drive.
   * Elimina caracteres especiales y espacios.
   * @param {string} str
   * @returns {string}
   */
  _sanitizarNombre: function(str) {
    return String(str || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50); // límite de longitud
  },

};
