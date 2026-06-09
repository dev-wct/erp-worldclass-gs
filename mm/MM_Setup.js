/**
 * MM_Setup
 * Carga de datos semilla para catálogos del módulo de Gestión de Materiales (MM).
 * Se ejecuta automáticamente después de sincronizar el esquema si las tablas están vacías.
 */
const MM_Setup = {
  
  /** Datos semilla para catálogos */
  SEED_DATA: {
    CAT_TiposEquipo: [
      [1, 'Laptop', 'HARDWARE', true],
      [2, 'Celular', 'HARDWARE', true],
      [3, 'Tablet', 'HARDWARE', true],
      [4, 'Chip SIM', 'TELECOMUNICACIONES', true],
    ],
    CAT_Marcas: [
      [1, 'Dell', true],
      [2, 'HP', true],
      [3, 'Lenovo', true],
      [4, 'Apple', true],
      [5, 'Samsung', true],
      [6, 'Motorola', true],
      [7, 'Huawei', true],
    ],
    CAT_Operadoras: [
      [1, 'Claro', 'GT', true],
      [2, 'Movistar', 'GT', true],
      [3, 'Tigo', 'GT', true],
    ],
    CAT_Estados: [
      [1, 'Activo', 'AMBOS', true, true],
      [2, 'En bodega', 'AMBOS', false, true],
      [3, 'En reparación', 'EQUIPO', false, true],
      [4, 'Dado de baja', 'AMBOS', false, true],
      [5, 'Extraviado', 'AMBOS', false, true],
    ]
  },

  /** Inserta los datos semilla si la hoja está recién creada (solo tiene cabecera) */
  seedCatalogs: function() {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) return;
    Logger.log("=== Iniciando carga de datos semilla para Catálogos de MM ===");
    
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
