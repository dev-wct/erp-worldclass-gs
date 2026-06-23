const DataAdapter = (() => {
  function _sheet(t) {
    const ss = Utils.getActiveSpreadsheet();
    return ss ? ss.getSheetByName(t) : null;
  }

  function _headers(sh) {
    if (!sh || sh.getLastRow() < 1) return [];
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
           .map(h => String(h).trim());
  }

  function _rowToObj(headers, row) {
    const o = {};
    headers.forEach((h, i) => { o[h] = row[i]; });
    return o;
  }

  function _objToRow(headers, obj) {
    return headers.map(h => obj[h] !== undefined ? obj[h] : '');
  }

  /**
   * Sanitiza un array de registros para transferencia segura al browser.
   *
   * PROBLEMA: GAS serializa el objeto de retorno de google.script.run
   * para enviarlo al iframe del browser. Si alguna propiedad es un objeto
   * Date nativo de JS, la serialización interna de GAS falla silenciosamente
   * y el withSuccessHandler recibe null en lugar del objeto.
   *
   * SOLUCIÓN: JSON.parse(JSON.stringify(...)) convierte todos los Date a
   * strings ISO 8601 antes de que GAS intente su propia serialización.
   *
   * Aplicar siempre que los datos vayan a cruzar la frontera servidor→browser.
   */
  function _sanitize(records) {
    try {
      return JSON.parse(JSON.stringify(records));    } catch(e) {
      Logger_ERP.error('INFRA', '[DataAdapter._sanitize] Error: ' + e.message, e);
      return records;
    }
  }

  return {
    findAll: function(table, filters) {
      const sh = _sheet(table);
      if (!sh || sh.getLastRow() < 2) return [];
      const h = _headers(sh);
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues();
      let res = rows.map(r => _rowToObj(h, r));
      if (filters) {
        Object.keys(filters).forEach(k => {
          const filterVal = filters[k];
          res = res.filter(r => {
            const cellVal = r[k];
            if (typeof filterVal === 'boolean') {
              return cellVal === filterVal ||
                     String(cellVal).toUpperCase() === String(filterVal).toUpperCase();
            }
            if (cellVal === undefined || cellVal === null) {
              return filterVal === undefined || filterVal === null || filterVal === '';
            }
            return String(cellVal).trim() === String(filterVal).trim();
          });
        });
      }
      return _sanitize(res);
    },

    findById: function(table, id) {
      const all = this.findAll(table);
      if (!all.length) return null;
      const pk = Object.keys(all[0])[0];
      return all.find(r => r[pk] == id) || null;
    },

    findByField: function(table, field, value) {
      return this.findAll(table, { [field]: value });
    },

    insert: function(table, record) {
      const sh = _sheet(table);
      const h = _headers(sh);
      // Auto-asignar PK si el campo ID (primera columna) está vacío
      const pk = h[0];
      if (pk && (record[pk] === undefined || record[pk] === '' || record[pk] === null)) {
        record[pk] = this.getNextId(table);
      }
      sh.appendRow(_objToRow(h, record));
      return record;
    },

    insertBatch: function(table, records) {
      if (!records || records.length === 0) return [];
      const sh = _sheet(table);
      if (!sh) return [];
      const h = _headers(sh);
      const pk = h[0];
      
      let nextId = 1;
      if (pk) {
        nextId = this.getNextId(table);
      }
      
      const rows = records.map(record => {
        if (pk && (record[pk] === undefined || record[pk] === '' || record[pk] === null)) {
          record[pk] = nextId++;
        }
        return _objToRow(h, record);
      });
      
      const lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, rows.length, h.length).setValues(rows);
      return records;
    },

    update: function(table, id, fields) {
      const sh = _sheet(table);
      const h = _headers(sh);
      const data = sh.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          Object.keys(fields).forEach(f => {
            const ci = h.indexOf(f);
            if (ci >= 0) sh.getRange(i + 1, ci + 1).setValue(fields[f]);
          });
          return true;
        }
      }
      return false;
    },

    getNextId: function(table) {
      const sh = _sheet(table);
      if (!sh || sh.getLastRow() < 2) return 1;
      const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
      return Math.max(0, ...ids.filter(v => typeof v === 'number')) + 1;
    },

    getCurrentUser: function() {
      return Session.getActiveUser().getEmail();
    },

    now: function() {
      return new Date();
    },

    /**
     * repairIds — rellena PKs vacíos en filas existentes usando el número de fila.
     * Seguro de ejecutar múltiples veces: omite filas que ya tienen ID.
     * Uso: DataAdapter.repairIds('CAT_Departamentos')
     */
    repairIds: function(table) {
      const sh = _sheet(table);
      if (!sh || sh.getLastRow() < 2) return { fixed: 0 };
      const h = _headers(sh);
      const pk = h[0];
      if (!pk) return { fixed: 0 };
      const pkIdx = 1; // columna A (1-indexed para GAS)
      var fixed = 0;
      var nextId = 1;
      for (var i = 2; i <= sh.getLastRow(); i++) {
        var cell = sh.getRange(i, pkIdx).getValue();
        if (cell === '' || cell === null || cell === undefined) {
          // Buscar el máximo ID ya asignado para no colisionar
          var existing = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat()
            .filter(function(v) { return typeof v === 'number' && v > 0; });
          nextId = existing.length > 0 ? Math.max.apply(null, existing) + 1 : nextId;
          sh.getRange(i, pkIdx).setValue(nextId);
          nextId++;
          fixed++;
        }
      }
      Logger_ERP.info('INFRA', '[DataAdapter.repairIds] ' + table + ': ' + fixed + ' IDs reparados');
      return { table: table, fixed: fixed };
    },

    /**
     * Expuesto para que los Controllers puedan sanitizar manualmente
     * objetos arbitrarios antes de retornarlos al browser.
     * Ej: return DataAdapter.sanitize({ ok: true, data: result });
     */
    sanitize: _sanitize,
  };
})();

/**
 * Función GAS ejecutable desde el editor de Apps Script.
 * Ejecutar manualmente para reparar IDs vacíos en catálogos.
 */
function repararIdsCatalogos() {
  var tablas = ['CAT_Empresas', 'CAT_Departamentos', 'CAT_Roles'];
  var resultado = tablas.map(function(t) { return DataAdapter.repairIds(t); });
  Logger_ERP.info('INFRA', 'repararIdsCatalogos → ' + JSON.stringify(resultado));
  return resultado;
}
