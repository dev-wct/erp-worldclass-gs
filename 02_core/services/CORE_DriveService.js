/**
 * CORE_DriveService
 * ─────────────────────────────────────────────────────────────────────────
 * Servicio centralizado para operaciones con Google Drive.
 *
 * ESTRUCTURA DE CARPETAS (creada por DriveOrganizer):
 *   ERP_WorldClass_DEV/
 *   ├── HCM/
 *   │   └── Empleados/
 *   ├── EAM/
 *   │   ├── Equipos/
 *   │   ├── Chips/
 *   │   └── Asignaciones/
 *   ├── EREC/
 *   │   └── Vacantes/
 *   │       └── EREC-0001/
 *   │           └── Juan_Perez_DPI_1234567890123/   ← subcarpeta por candidato
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
   * Sube un archivo Base64 delegando en el adaptador de almacenamiento activo.
   */
  subirArchivoBase64: function(base64Data, fileName, mimeType, rutaModulo, subCarpeta) {
    return AdapterFactory.getFileStorageAdapter().uploadFileBase64(base64Data, fileName, mimeType, rutaModulo, subCarpeta);
  },

  /**
   * Normaliza una URL de Drive a URL directa de imagen usando el adaptador activo.
   */
  driveUrlToDirectUrl: function(driveUrl) {
    return AdapterFactory.getFileStorageAdapter().normalizeUrl(driveUrl);
  },

  /**
   * Sube el CV de un postulante EREC.
   * Ruta: ERP/EREC/Vacantes/{codigoVacante}/{Nombre_LABEL_Doc}/cv.pdf
   */
  subirCVPostulante: function(base64Data, fileName, mimeType, nombreCandidato, documentoIdentidad, labelDocumento, codigoVacante) {
    var nombreSanitizado = this._sanitizarNombre(nombreCandidato);
    var docSanitizado    = this._sanitizarNombre(String(documentoIdentidad || 'SIN_DOC'));
    var labelSanitizado  = this._sanitizarNombre(String(labelDocumento || 'ID'));

    // Subcarpeta del candidato: Juan_Perez_DPI_1234567890123
    var subCarpetaCandidato = nombreSanitizado + '_' + labelSanitizado + '_' + docSanitizado;

    // Ruta: EREC / Vacantes / [EREC-0001] / Juan_Perez_DPI_123...
    var ruta = codigoVacante
      ? ['EREC', 'Vacantes', this._sanitizarNombre(codigoVacante)]
      : ['EREC', 'Vacantes'];

    return this.subirArchivoBase64(
      base64Data, fileName, mimeType,
      ruta,
      subCarpetaCandidato
    );
  },

  /**
   * Sanitiza un string para usarlo como nombre de carpeta/archivo.
   */
  _sanitizarNombre: function(str) {
    return String(str || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50); // límite de longitud
  }

};
