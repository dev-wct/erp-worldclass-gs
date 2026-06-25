/**
 * INFRA_GDriveFileProvider
 * ─────────────────────────────────────────────────────────────────────────
 * Proveedor para almacenamiento de archivos usando Google Drive.
 * Implementa la interfaz esperada por el adaptador de Storage.
 * ─────────────────────────────────────────────────────────────────────────
 */
const GDriveFileProvider = {
  getName: function() { return 'GOOGLE_DRIVE'; },

  /**
   * Sube un archivo en Base64 a Drive y lo expone públicamente.
   *
   * @param {string}   base64Data
   * @param {string}   fileName
   * @param {string}   mimeType
   * @param {string[]} pathArray
   * @param {string}   [subFolder]
   * @returns {string} URL directa (lh3.googleusercontent.com)
   */
  uploadFileBase64: function(base64Data, fileName, mimeType, pathArray, subFolder) {
    try {
      const decoded = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', fileName);
      const folder = this._resolvePath(pathArray, subFolder);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const directUrl = this.normalizeUrl(file.getUrl());
      Logger_ERP.info('INFRA', 'Archivo subido a Google Drive: ' + fileName + ' -> ' + directUrl);
      return directUrl;
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error en GDriveFileProvider.uploadFileBase64', e);
      throw e;
    }
  },

  /**
   * Sube un blob de archivo a Drive.
   *
   * @param {Blob}   fileBlob
   * @param {string} fileName
   * @param {string} folderName
   * @returns {string} URL de Drive
   */
  uploadFileBlob: function(fileBlob, fileName, folderName) {
    try {
      const parentFolder = this._getOrCreateRootFolder();
      let targetFolder;
      const subFolders = parentFolder.getFoldersByName(folderName);
      if (subFolders.hasNext()) {
        targetFolder = subFolders.next();
      } else {
        targetFolder = parentFolder.createFolder(folderName);
      }
      const file = targetFolder.createFile(fileBlob);
      if (fileName) {
        file.setName(fileName);
      }
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const url = file.getUrl();
      Logger_ERP.info('INFRA', 'Blob subido a Google Drive: ' + fileName + ' en ' + folderName);
      return url;
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error en GDriveFileProvider.uploadFileBlob', e);
      throw e;
    }
  },

  /**
   * Convierte URL de Drive a URL directa de imagen (lh3.googleusercontent.com/d/{id}).
   *
   * @param {string} url
   * @returns {string} URL normalizada
   */
  normalizeUrl: function(url) {
    if (!url) return '';
    if (url.indexOf('lh3.googleusercontent.com') !== -1) return url;
    
    // Extraer FILE_ID de /file/d/FILE_ID/...
    let match = url.match(/\/file\/d\/([^\/\?]+)/);
    if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
    
    // Extraer FILE_ID de ?id=FILE_ID
    match = url.match(/[?&]id=([^&]+)/);
    if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
    
    return url;
  },

  /**
   * Obtiene un archivo de Drive en formato Base64 Data URL.
   *
   * @param {string} url
   * @returns {string} Data URL base64 o vacio si no se encuentra/falla
   */
  getFileBase64: function(url) {
    try {
      if (!url) return '';
      let fileId = null;
      let match = url.match(/\/file\/d\/([^\/\?]+)/);
      if (match) fileId = match[1];
      else {
        match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
        else {
          match = url.match(/lh3\.googleusercontent\.com\/d\/([^\/\?]+)/);
          if (match) fileId = match[1];
        }
      }
      if (fileId) {
        const file = DriveApp.getFileById(fileId);
        const mime = file.getMimeType();
        const bytes = file.getBlob().getBytes();
        return 'data:' + mime + ';base64,' + Utilities.base64Encode(bytes);
      }
    } catch(e) {
      Logger_ERP.error('INFRA', 'Error en GDriveFileProvider.getFileBase64', e);
    }
    return '';
  },

  // ── Helpers Internos ──────────────────────────────────────────────────────

  _resolvePath: function(pathArray, subFolder) {
    const root = DriveOrganizer.getRootFolder();
    let currentFolder = root;
    (pathArray || []).forEach(nivel => {
      currentFolder = this._getOrCreateChild(currentFolder, nivel);
    });
    if (subFolder) {
      currentFolder = this._getOrCreateChild(currentFolder, subFolder);
    }
    return currentFolder;
  },

  _getOrCreateChild: function(parent, name) {
    const it = parent.getFoldersByName(name);
    if (it.hasNext()) return it.next();
    return parent.createFolder(name);
  },

  _getOrCreateRootFolder: function() {
    return DriveOrganizer.getRootFolder();
  }
};
