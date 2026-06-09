/**
 * CORE_SetupEngine
 * Motor agnóstico de creación y optimización de bases de datos Sheets.
 * Recibe el esquema del módulo como parámetro para respetar la modularidad.
 * Valida la existencia previa de claves foráneas para integridad relacional.
 */
const SetupEngine = {

  /** Sincroniza las pestañas físicas de la Sheet activa con el esquema inyectado */
  syncDatabase: function(moduleSchema) {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) throw new Error("No se pudo obtener la hoja de cálculo activa para la sincronización.");
    Logger.log("=== Iniciando sincronización de Base de Datos ===");

    const tables = Object.keys(moduleSchema);

    // 1. VALIDAR INTEGRIDAD Y PRECEDENCIAS (FKs) antes de crear nada
    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i];
      const tableDef = moduleSchema[tableName];

      if (tableDef.fk) {
        const fkFields = Object.keys(tableDef.fk);
        for (let j = 0; j < fkFields.length; j++) {
          const fkField = fkFields[j];
          const targetTable = tableDef.fk[fkField];

          // Revisa si la tabla destino de la FK existe físicamente o si será creada en este mismo lote
          const targetSh = ss.getSheetByName(targetTable);
          const willBeCreated = tables.includes(targetTable);
          
          if (!targetSh && !willBeCreated) {
            const errMsg = `[ERROR DE PRECEDENCIA] No se puede sincronizar la tabla '${tableName}' porque su dependencia relacional '${targetTable}' no existe en el sistema. Asegúrate de inicializar primero el módulo CORE o la tabla requerida.`;
            Logger.log(errMsg);
            throw new Error(errMsg);
          }
        }
      }
    }

    // 2. CREAR / ACTUALIZAR ESTRUCTURAS
    tables.forEach(tableName => {
      const tableDef = moduleSchema[tableName];
      let sh = ss.getSheetByName(tableName);

      if (!sh) {
        // Crear hoja si no existe
        sh = ss.insertSheet(tableName);
        sh.appendRow(tableDef.columns);
        this.formatHeader(sh);
        Logger.log(`[+] Creada nueva tabla: ${tableName}`);
      } else {
        // Verificar que no falten columnas agregadas en el esquema local
        const currentHeaders = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn()))
                                 .getValues()[0]
                                 .map(h => String(h).trim());

        const missingColumns = tableDef.columns.filter(c => !currentHeaders.includes(c));

        if (missingColumns.length > 0) {
          missingColumns.forEach(colName => {
            const nextColIdx = sh.getLastColumn() + 1;
            sh.getRange(1, nextColIdx).setValue(colName);
            Logger.log(`  [+] Agregado campo faltante '${colName}' a la tabla '${tableName}'`);
          });
          this.formatHeader(sh);
        } else {
          Logger.log(`[✔] Tabla '${tableName}' al día.`);
        }
      }
    });

    Logger.log("=== Sincronización de Base de Datos completada exitosamente ===");
    return { ok: true, mensaje: "Estructuras de datos actualizadas con éxito." };
  },

  /** Aplica el formato visual SAP corporativo a la primera fila */
  formatHeader: function(sh) {
    const lastCol = sh.getLastColumn();
    if (lastCol < 1) return;
    const headerRange = sh.getRange(1, 1, 1, lastCol);
    headerRange.setFontWeight("bold");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setBackground("#2C3E50"); // Azul marino oscuro SAP
    headerRange.setHorizontalAlignment("center");
    
    for (let col = 1; col <= lastCol; col++) {
      sh.autoResizeColumn(col);
    }
  }
};
