/**
 * CORE_CacheService
 * ─────────────────────────────────────────────────────────────────────────
 * Servicio centralizado de caché para el ERP.
 * Abstrae el motor de caché subyacente para evitar el acoplamiento a GAS.
 * 
 * CARACTERÍSTICA AVANZADA:
 *  Maneja de forma transparente la segmentación de cadenas de texto grandes.
 *  La caché de GAS tiene un límite estricto de 100KB por clave. Si una entrada
 *  (como una imagen Base64) supera este límite, la segmenta de forma segura
 *  en trozos de 90KB y genera un manifiesto para reconstruirla al recuperarla.
 * ─────────────────────────────────────────────────────────────────────────
 */
const CacheService_ERP = {
  
  /**
   * Obtiene un valor de texto de la caché.
   *
   * @param {string} key
   * @returns {string|null}
   */
  get: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      var manifestStr = cache.get(key + '_manifest');
      
      if (manifestStr) {
        var manifest = JSON.parse(manifestStr);
        var chunks = [];
        for (var i = 0; i < manifest.count; i++) {
          var chunk = cache.get(key + '_' + i);
          if (chunk === null) {
            // Si falta algún fragmento (expirado), invalidar toda la entrada
            return null;
          }
          chunks.push(chunk);
        }
        return chunks.join('');
      }
      
      return cache.get(key);
    } catch(e) {
      Logger.log('[CacheService] Error al obtener clave ' + key + ': ' + e.message);
      return null;
    }
  },
  
  /**
   * Guarda un valor de texto en la caché.
   * Fragmenta automáticamente el valor si excede los 90KB.
   *
   * @param {string} key
   * @param {string} value
   * @param {number} [expirationSeconds] - Máximo 21600 segundos (6 horas).
   */
  put: function(key, value, expirationSeconds) {
    try {
      if (value === null || value === undefined) return;
      var cache = CacheService.getScriptCache();
      var exp = expirationSeconds || 21600; // 6 horas por defecto (límite GAS)
      if (exp > 21600) exp = 21600;
      
      var valueStr = String(value);
      var limit = 90000; // 90KB por seguridad (límite GAS es 100KB)
      
      if (valueStr.length > limit) {
        var count = Math.ceil(valueStr.length / limit);
        var manifest = { count: count };
        
        // Guardar fragmentos
        for (var i = 0; i < count; i++) {
          var chunk = valueStr.substring(i * limit, (i + 1) * limit);
          cache.put(key + '_' + i, chunk, exp);
        }
        // Guardar manifiesto
        cache.put(key + '_manifest', JSON.stringify(manifest), exp);
      } else {
        cache.put(key, valueStr, exp);
      }
    } catch(e) {
      Logger.log('[CacheService] Error al guardar clave ' + key + ': ' + e.message);
    }
  },
  
  /**
   * Elimina un valor y sus posibles fragmentos de la caché.
   *
   * @param {string} key
   */
  remove: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      var manifestStr = cache.get(key + '_manifest');
      
      if (manifestStr) {
        var manifest = JSON.parse(manifestStr);
        for (var i = 0; i < manifest.count; i++) {
          cache.remove(key + '_' + i);
        }
        cache.remove(key + '_manifest');
      }
      cache.remove(key);
    } catch(e) {
      Logger.log('[CacheService] Error al eliminar clave ' + key + ': ' + e.message);
    }
  },
  
  /**
   * Obtiene y parsea un objeto JSON guardado en caché.
   *
   * @param {string} key
   * @returns {object|null}
   */
  getJson: function(key) {
    var val = this.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch(e) {
      return null;
    }
  },
  
  /**
   * Guarda un objeto serializándolo en JSON.
   *
   * @param {string} key
   * @param {object} obj
   * @param {number} [expirationSeconds]
   */
  putJson: function(key, obj, expirationSeconds) {
    if (obj === null || obj === undefined) return;
    this.put(key, JSON.stringify(obj), expirationSeconds);
  }
};
