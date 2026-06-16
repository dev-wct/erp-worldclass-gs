/**
 * EAM_Setup
 * Datos semilla para catálogos del módulo Enterprise Asset Management.
 * Se ejecuta automáticamente tras sincronizar el schema EAM.
 */
const EAM_Setup = {

  SEED_DATA: {
    CAT_TiposEquipo: [
      [1, 'Laptop',  'HARDWARE',          true],
      [2, 'Celular', 'HARDWARE',          true],
      [3, 'Tablet',  'HARDWARE',          true],
      [4, 'Chip SIM','TELECOMUNICACIONES', true],
    ],
    CAT_Marcas: [
      [1, 'Dell',     true],
      [2, 'HP',       true],
      [3, 'Lenovo',   true],
      [4, 'Apple',    true],
      [5, 'Samsung',  true],
      [6, 'Motorola', true],
      [7, 'Huawei',   true],
    ],
    CAT_Operadoras: [
      [1, 'Claro',    'GT', true],
      [2, 'Movistar', 'GT', true],
      [3, 'Tigo',     'GT', true],
    ],
    CAT_Estados: [
      [1, 'Activo',        'AMBOS',  true,  true],
      [2, 'En bodega',     'AMBOS',  false, true],
      [3, 'En reparación', 'EQUIPO', false, true],
      [4, 'Dado de baja',  'AMBOS',  false, true],
      [5, 'Extraviado',    'AMBOS',  false, true],
    ],
  },

  seedCatalogs: function() {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) return;
    Logger.log('=== [EAM] Iniciando carga de datos semilla ===');

    const ORDER = ['CAT_TiposEquipo', 'CAT_Marcas', 'CAT_Operadoras', 'CAT_Estados'];
    ORDER.forEach(tableName => {
      const sh = ss.getSheetByName(tableName);
      if (!sh) { Logger.log('[!] Tabla no existe: ' + tableName); return; }
      if (sh.getLastRow() > 1) { Logger.log('[*] Ya tiene datos: ' + tableName); return; }
      const rows = this.SEED_DATA[tableName];
      if (rows) rows.forEach(row => sh.appendRow(row));
      Logger.log('[✔] Semilla insertada: ' + tableName);
    });

    Logger.log('=== [EAM] Semilla completada ===');
  },

  syncAndSeed: function() {
    SetupEngine.syncDatabase(EAM_Schema);
    this.seedCatalogs();
  },
};
