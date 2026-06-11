/**
 * MDM_Setup
 * Carga de datos semilla para catálogos maestros del holding (MDM).
 * Se ejecuta automáticamente tras sincronizar el esquema MDM si las hojas están vacías.
 */
const MDM_Setup = {

  SEED_DATA: {
    /**
     * Países con configuración regional completa.
     * label_documento define cómo se llama el documento de identidad en cada país.
     * Agregar un nuevo país aquí es suficiente — sin tocar código.
     */
    CAT_Paises: [
      // id | nombre          | iso | moneda_cod | moneda_sym | label_doc        | fmt_fecha    | activo
      [1, 'Guatemala',        'GT', 'GTQ', 'Q',  'DPI',                'DD/MM/YYYY', true],
      [2, 'El Salvador',      'SV', 'USD', '$',  'DUI',                'DD/MM/YYYY', true],
      [3, 'Honduras',         'HN', 'HNL', 'L',  'DNI',                'DD/MM/YYYY', true],
      [4, 'México',           'MX', 'MXN', '$',  'CURP',               'DD/MM/YYYY', true],
      [5, 'Colombia',         'CO', 'COP', '$',  'Cédula de Ciudadanía','DD/MM/YYYY', true],
      [6, 'Argentina',        'AR', 'ARS', '$',  'DNI',                'DD/MM/YYYY', true],
      [7, 'España',           'ES', 'EUR', '€',  'DNI/NIE',            'DD/MM/YYYY', true],
      [8, 'Estados Unidos',   'US', 'USD', '$',  'SSN',                'MM/DD/YYYY', true],
    ],

    CAT_Empresas: [
      // id | nombre               | codigo | id_pais | activo | created | updated
      [1, 'WorldClass Travel', 'WCT',  1, true, new Date(), new Date()],
      [2, 'Rapivisa',          'RAPI', 1, true, new Date(), new Date()],
    ],

    CAT_Departamentos: [
      [1, 'Tecnología',    1, true, new Date(), new Date()],
      [2, 'Ventas',        1, true, new Date(), new Date()],
      [3, 'Operaciones',   1, true, new Date(), new Date()],
      [4, 'Administración',1, true, new Date(), new Date()],
      [5, 'Tecnología',    2, true, new Date(), new Date()],
      [6, 'Operaciones',   2, true, new Date(), new Date()],
      [7, 'Administración',2, true, new Date(), new Date()],
    ],

    CAT_Roles: [
      [1, 'Administrador', 1, true],
      [2, 'Supervisor',    2, true],
      [3, 'Consulta',      3, true],
    ],
  },

  /** Inserta los datos semilla si la hoja está recién creada (solo tiene cabecera) */
  seedCatalogs: function() {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) return;
    Logger.log("=== [MDM] Iniciando carga de datos semilla para Catálogos Maestros ===");
    
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
