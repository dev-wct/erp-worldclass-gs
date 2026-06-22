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
    /**
     * CAT_Paises — label_documento (personas) + label_doc_empresa (empresas)
     * id | nombre | iso | moneda_cod | moneda_sym | label_doc_persona | label_doc_empresa | fmt_fecha | activo
     */
    CAT_Paises: [
      [1, 'Guatemala',      'GT', 'GTQ', 'Q',  'DPI',                  'NIT',  'DD/MM/YYYY', true],
      [2, 'El Salvador',    'SV', 'USD', '$',  'DUI',                  'NIT',  'DD/MM/YYYY', true],
      [3, 'Honduras',       'HN', 'HNL', 'L',  'DNI',                  'RTN',  'DD/MM/YYYY', true],
      [4, 'México',         'MX', 'MXN', '$',  'CURP',                 'RFC',  'DD/MM/YYYY', true],
      [5, 'Colombia',       'CO', 'COP', '$',  'Cédula de Ciudadanía', 'NIT',  'DD/MM/YYYY', true],
      [6, 'Argentina',      'AR', 'ARS', '$',  'DNI',                  'CUIT', 'DD/MM/YYYY', true],
      [7, 'España',         'ES', 'EUR', '€',  'DNI/NIE',              'CIF',  'DD/MM/YYYY', true],
      [8, 'Estados Unidos', 'US', 'USD', '$',  'SSN',                  'EIN',  'MM/DD/YYYY', true],
      [9, 'Ecuador',        'EC', 'USD', '$',  'Cédula',               'RUC',  'DD/MM/YYYY', true],
    ],

    /**
     * BP_MASTER — seed inicial para las empresas del holding.
     * Las empresas también son Business Partners (PERSONA_JURIDICA).
     * id_bp | tipo_bp | tipo_documento | numero_documento | nombre | email | telefono | activo | created_at | created_by
     */
    BP_MASTER: [
      [1, 'PERSONA_JURIDICA', 'RUC', '1790011223001', 'WorldClass Travel Ecuador S.A.', 'info@worldclasstravel.com.ec', '+593 2-299-9999', 'Av. Amazonas N32-12 y La Niña, Quito, Ecuador', true, new Date(), 'system'],
      [2, 'PERSONA_JURIDICA', 'RUC', '1790011223002', 'Rapivisa Ecuador S.A.',          'info@rapivisa.com.ec',         '+593 4-299-9999', 'Av. Francisco de Orellana, Guayaquil, Ecuador', true, new Date(), 'system'],
    ],

    CAT_Empresas: [
      // id | id_bp | nombre           | codigo | id_pais | logo_url | activo | created | updated
      [1, 1, 'WorldClass Travel', 'WCT',  9, '', true, new Date(), new Date()],
      [2, 2, 'Rapivisa',          'RAPI', 9, '', true, new Date(), new Date()],
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

  /** Inserta los datos semilla de forma idempotente */
  seedCatalogs: function() {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) return;
    Logger.log("=== [MDM] Iniciando carga de datos semilla para Catálogos Maestros (Idempotente) ===");

    // Orden explícito — BP_MASTER debe existir antes de CAT_Empresas (FK id_bp)
    const ORDER = ['CAT_Paises', 'BP_MASTER', 'BP_Roles', 'CAT_Empresas', 'CAT_Departamentos', 'CAT_Roles'];

    ORDER.forEach(tableName => {
      const sh = ss.getSheetByName(tableName);
      if (!sh) {
        Logger.log(`[!] Tabla '${tableName}' no existe físicamente. Ejecuta Sincronizar CORE primero.`);
        return;
      }
      
      const seedRows = this.SEED_DATA[tableName];
      if (!seedRows || seedRows.length === 0) return;

      const lastRow = sh.getLastRow();
      if (lastRow <= 1) {
        // La hoja está vacía (solo cabecera), insertar todo en lote
        sh.getRange(2, 1, seedRows.length, seedRows[0].length).setValues(seedRows);
        Logger.log(`[✔] Semilla insertada en vacío: ${tableName} (${seedRows.length} filas)`);
      } else {
        // La hoja ya tiene datos, verificar registro por registro (por ID en columna A)
        const existingData = sh.getRange(2, 1, lastRow - 1, 1).getValues();
        const existingIds = existingData.map(r => String(r[0]));

        const rowsToInsert = seedRows.filter(r => !existingIds.includes(String(r[0])));
        if (rowsToInsert.length > 0) {
          // Escribir filas nuevas
          sh.getRange(lastRow + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
          Logger.log(`[✔] Semilla actualizada (nuevas filas insertadas): ${tableName} (${rowsToInsert.length} filas)`);
        } else {
          Logger.log(`[*] '${tableName}' ya contiene todos los registros semilla.`);
        }
      }
    });

    Logger.log("=== [MDM] Semilla completada ===");
  }
};
