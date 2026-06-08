const DataAdapter = (() => {
  function _sheet(t) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(t);
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

  return {
    findAll: function(table, filters) {
      const sh = _sheet(table);
      if (!sh || sh.getLastRow() < 2) return [];
      const h = _headers(sh);
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues();
      let res = rows.map(r => _rowToObj(h, r));
      if (filters) {
        Object.keys(filters).forEach(k => {
          res = res.filter(r => r[k] === filters[k]);
        });
      }
      return res;
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
      sh.appendRow(_objToRow(h, record));
      return record;
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
  };
})();
