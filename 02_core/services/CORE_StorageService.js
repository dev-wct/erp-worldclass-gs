const StorageService = {
  uploadFile: function(fileBlob, fileName, folderName) {
    const provider = Config.STORAGE_PROVIDER || 'GOOGLE_DRIVE';
    if (provider === 'GOOGLE_DRIVE') {
      return this._uploadToGoogleDrive(fileBlob, fileName, folderName);
    }
    return `https://storage-simulado.com/${folderName}/${fileName}`;
  },

  _uploadToGoogleDrive: function(fileBlob, fileName, folderName) {
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
      file.setName(fileName);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return file.getUrl();
    } catch (e) {
      Logger.log("Error en StorageService: " + e.message);
      throw e;
    }
  },

  _getOrCreateRootFolder: function() {
    const rootName = Config.ERP_NAME || "ERP_WorldClass_Travel";
    const folders = DriveApp.getFoldersByName(rootName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(rootName);
  }
};
