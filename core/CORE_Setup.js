/**
 * CORE_Setup
 * Carga de datos semilla para catálogos maestros del holding (CORE).
 * Se ejecuta automáticamente tras sincronizar el esquema CORE si las hojas están vacías.
 */
const CORE_Setup = {
  
  /** Datos semilla para catálogos del CORE */
  SEED_DATA: {
    CAT_Empresas: [
      [1, 'WorldClass Travel', 'WCT', true, new Date(), new Date()],
      [2, 'Rapivisa', 'RAPI', true, new Date(), new Date()],
    ],
    CAT_Departamentos: [
      [1, 'Tecnología', 1, true, new Date(), new Date()],
      [2, 'Ventas', 1, true, new Date(), new Date()],
      [3, 'Operaciones', 1, true, new Date(), new Date()],
      [4, 'Administración', 1, true, new Date(), new Date()],
      [5, 'Tecnología', 2, true, new Date(), new Date()],
      [6, 'Operaciones', 2, true, new Date(), new Date()],
      [7, 'Administración', 2, true, new Date(), new Date()],
    ],
    CAT_Roles: [
      [1, 'Administrador', 1, true],
      [2, 'Supervisor', 2, true],
      [3, 'Consulta', 3, true],
    ]
  },

  /** Inserta los datos semilla si la hoja está recién creada (solo tiene cabecera) */
  seedCatalogs: function() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("=== Iniciando carga de datos semilla para Catálogos de CORE ===");
    
    Object.keys(this.SEED_DATA).forEach(tableName => {
      const sh = ss.getSheetByName(tableName);
      if (sh) {
        const lastRow = sh.getLastRow();
        if (lastRow <= 1) { // Solo inserta si está vacía o tiene solo el header
          const rows = this.SEED_DATA[tableName];
          rows.forEach(row => {
            sh.appendRow(row);
          });
          Logger.log(`[✔] Datos semilla insertados en la tabla: ${tableName}`);
        } else {
          Logger.log(`[*] La tabla '${tableName}' ya contiene datos. Omitiendo semilla.`);
        }
      } else {
        Logger.log(`[!] La tabla '${tableName}' no existe físicamente en el Sheet.`);
      }
    });
    
    Logger.log("=== Carga de datos semilla completada ===");
  }
};
