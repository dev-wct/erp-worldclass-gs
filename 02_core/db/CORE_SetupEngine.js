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
        // Crear hoja nueva desde cero
        sh = ss.insertSheet(tableName);
        sh.appendRow(tableDef.columns);
        this.formatHeader(sh, true);
        Logger.log(`[+] Creada nueva tabla: ${tableName}`);
        return;
      }

      // ── Tabla existente: verificar columnas ──
      const lastCol = Math.max(1, sh.getLastColumn());
      const currentHeaders = sh.getRange(1, 1, 1, lastCol)
                               .getValues()[0]
                               .map(h => String(h).trim());

      const expectedColumns = tableDef.columns;
      const missingColumns  = expectedColumns.filter(c => !currentHeaders.includes(c));
      const outOfOrder      = expectedColumns.some((col, idx) => currentHeaders[idx] !== col);

      if (missingColumns.length === 0 && !outOfOrder) {
        Logger.log(`[✔] Tabla '${tableName}' al día.`);
        this.formatHeader(sh, false);
        return;
      }

      if (missingColumns.length > 0 && !outOfOrder) {
        // Solo faltan columnas nuevas al final — agregar sin tocar datos
        missingColumns.forEach(colName => {
          const nextColIdx = sh.getLastColumn() + 1;
          sh.getRange(1, nextColIdx).setValue(colName);
          Logger.log(`  [+] Columna agregada: '${colName}' en '${tableName}'`);
        });
        this.formatHeader(sh, false);
        return;
      }

      // ── Columnas fuera de orden o renombradas: reconstruir preservando datos ──
      Logger.log(`[~] Reconstruyendo '${tableName}' por columnas fuera de orden...`);

      const lastRow    = sh.getLastRow();
      const lastColVal = sh.getLastColumn();
      const allData    = lastRow > 1
        ? sh.getRange(2, 1, lastRow - 1, lastColVal).getValues()
        : [];

      // Mapear datos viejos: { nombreColumna: [valor fila1, valor fila2, ...] }
      const colMap = {};
      currentHeaders.forEach((header, i) => {
        if (header) colMap[header] = allData.map(row => row[i] !== undefined ? row[i] : '');
      });

      // Limpiar hoja completamente
      sh.clearContents();

      // Escribir encabezados en el orden correcto del schema
      sh.getRange(1, 1, 1, expectedColumns.length).setValues([expectedColumns]);
      this.formatHeader(sh, false);

      // Reescribir datos en el orden correcto
      if (allData.length > 0) {
        const newData = allData.map((_, rowIdx) =>
          expectedColumns.map(col => {
            const colData = colMap[col];
            return colData ? (colData[rowIdx] !== undefined ? colData[rowIdx] : '') : '';
          })
        );
        sh.getRange(2, 1, newData.length, expectedColumns.length).setValues(newData);
        this.formatHeader(sh, true);
      }

      Logger.log(`[✔] Tabla '${tableName}' reconstruida con ${allData.length} filas de datos preservados.`);
    });

    Logger.log("=== Sincronización de Base de Datos completada exitosamente ===");
    return { ok: true, mensaje: "Estructuras de datos actualizadas con éxito." };
  },

  getTabColor: function(tableName) {
    if (tableName.indexOf("EREC_") === 0) return "#8E44AD"; // Púrpura/Violeta
    
    // MDM
    if (tableName.indexOf("CAT_Paises") === 0 || 
        tableName.indexOf("BP_MASTER") === 0 || 
        tableName.indexOf("BP_Roles") === 0 || 
        tableName.indexOf("CAT_Empresas") === 0 || 
        tableName.indexOf("CAT_Departamentos") === 0 || 
        tableName.indexOf("CAT_Roles") === 0) {
      return "#7F8C8D"; // Gris
    }
    
    // HCM
    if (tableName.indexOf("Postulantes") === 0 || 
        tableName.indexOf("PostulantesTokens") === 0 || 
        tableName.indexOf("Empleados") === 0 || 
        tableName.indexOf("Onboarding") === 0 || 
        tableName.indexOf("Bajas") === 0) {
      return "#2980B9"; // Azul
    }
    
    // EAM
    if (tableName.indexOf("CAT_TiposEquipo") === 0 || 
        tableName.indexOf("CAT_Marcas") === 0 || 
        tableName.indexOf("CAT_Operadoras") === 0 || 
        tableName.indexOf("CAT_Estados") === 0 || 
        tableName.indexOf("Equipos") === 0 || 
        tableName.indexOf("Chips") === 0 || 
        tableName.indexOf("Asignaciones") === 0) {
      return "#D35400"; // Naranja
    }
    
    // SD
    if (tableName.indexOf("Campanas") === 0 || 
        tableName.indexOf("Leads") === 0 || 
        tableName.indexOf("Llamadas") === 0 || 
        tableName.indexOf("Citas") === 0) {
      return "#27AE60"; // Verde
    }
    
    // FICO
    if (tableName.indexOf("Pagos_Nomina") === 0 || 
        tableName.indexOf("Costos_Chips") === 0) {
      return "#C0392B"; // Rojo
    }
    
    return null;
  },

  applyFilter: function(sh) {
    try {
      const lastRow = sh.getLastRow();
      const lastCol = sh.getLastColumn();
      if (lastRow < 2 || lastCol < 1) {
        // Remover filtro si no hay datos suficientes
        const existingFilter = sh.getFilter();
        if (existingFilter) existingFilter.remove();
        return;
      }

      const tableName = sh.getName();
      // Mapeo de tablas principales y cantidad de columnas críticas a filtrar
      const mainTables = {
        "Empleados": 7,     // Nombre, DPI, Email, Teléfono, Depto, Empresa, Rol
        "Leads": 5,         // Nombre, Teléfono, Email, TDC, Banco
        "Llamadas": 4,      // ID, Lead, Empleado, Fecha
        "Citas": 6,         // ID, Lead, Empleado, Restaurante, Fecha, Hora
        "Equipos": 6,       // ID, Código, Tipo, Marca, Modelo, Serial
        "Chips": 5,         // ID, Código, Número, Operadora, Plan
        "Asignaciones": 7,  // ID, Equipo, Chip, Empleado, Empresa, Depto, Estado
        "Pagos_Nomina": 7,  // ID, Empleado, Año, Quincena, Sueldo, Comisión, Total
        "EREC_Vacantes": 5,   // ID, Código, Título, Empresa, Depto
        "EREC_Postulantes": 6, // ID, BP, Vacante, Nombre, Documento, Teléfono
        "BP_MASTER": 5      // ID, Tipo BP, Tipo Doc, Num Doc, Nombre
      };

      const filterCols = mainTables[tableName];
      const existingFilter = sh.getFilter();

      if (filterCols) {
        const targetCols = Math.min(lastCol, filterCols);
        // Si no tiene filtro o la cobertura del filtro es distinta, se reconstruye
        if (!existingFilter) {
          sh.getRange(1, 1, lastRow, targetCols).createFilter();
        }
      } else {
        // Remover filtros en tablas de catálogos y auxiliares para optimizar velocidad
        if (existingFilter) {
          existingFilter.remove();
        }
      }
    } catch (e) {
      Logger.log("[SetupEngine.applyFilter] Error: " + e.message);
    }
  },

  /** Aplica el formato visual SAP corporativo a la primera fila (optimizado) */
  formatHeader: function(sh, forceResize) {
    const lastCol = sh.getLastColumn();
    if (lastCol < 1) return;

    // Evitar rehacer formato si ya tiene filtro y color correctos y no se requiere forzar resize
    const tabColor = this.getTabColor(sh.getName());
    const hasFilter = !!sh.getFilter();
    const hasColor = !tabColor || sh.getTabColor() === tabColor;

    if (!forceResize && hasFilter && hasColor) {
      return; // Omitir llamadas a la API de GAS para optimizar tiempo y evitar timeout
    }

    const headerRange = sh.getRange(1, 1, 1, lastCol);
    headerRange.setFontWeight("bold");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setBackground("#2C3E50"); // Azul marino oscuro SAP
    headerRange.setHorizontalAlignment("center");
    
    // Autoajustar columnas sólo si se solicita (ej: al crear o reconstruir con datos)
    if (forceResize) {
      const maxColsToResize = 20; // Limitar para no exceder tiempo
      for (let col = 1; col <= Math.min(lastCol, maxColsToResize); col++) {
        sh.autoResizeColumn(col);
      }
    }

    // Aplicar color de pestaña según módulo
    if (tabColor && sh.getTabColor() !== tabColor) {
      sh.setTabColor(tabColor);
    }

    // Auto-aplicar filtros en la hoja para permitir búsqueda y ordenación
    this.applyFilter(sh);
  }
};
