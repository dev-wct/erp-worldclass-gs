const StorageService = {
  /**
   * Sube un archivo blob delegando en el adaptador de almacenamiento activo.
   *
   * @param {Blob}   fileBlob
   * @param {string} fileName
   * @param {string} folderName
   * @returns {string} URL del archivo subido
   */
  uploadFile: function(fileBlob, fileName, folderName) {
    return AdapterFactory.getFileStorageAdapter().uploadFileBlob(fileBlob, fileName, folderName);
  }
};

