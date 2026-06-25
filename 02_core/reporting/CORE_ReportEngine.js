/**
 * CORE_ReportEngine
 * ============================================================
 * Capa de Presentación / Controlador para el módulo de reportes.
 * Expone la configuración (metadata) y ejecuta los UseCases dinámicamente.
 *
 * MULTI-EMPRESA:
 *  El ReportViewer necesita conocer el contexto de la empresa para:
 *  - Mostrar el nombre y logo correcto en el cabezal
 *  - Formatear la moneda correcta (Q, $, €) via Customizing
 *
 *  apiGetReportContext() resuelve esto de forma limpia consultando
 *  CAT_Empresas + CAT_Paises a través del servicio Customizing.
 */

/**
 * Obtiene el contexto de la empresa principal para el visor de reportes.
 * Retorna: nombre, logo_url, moneda_simbolo, moneda_codigo, nombre_pais.
 * Usa la empresa con id_empresa = 1 como empresa predeterminada del tenant.
 *
 * EXTENSIÓN FUTURA: Cuando se implemente multi-tenancy por sesión,
 * aquí se resolverá la empresa desde el usuario autenticado.
 */
function apiGetReportContext() {
  return safeExecute(function() {
    // 1. Obtener todas las empresas activas
    var empresas = DataAdapter.findAll('CAT_Empresas') || [];
    var activas  = empresas.filter(function(e) { return e.activo; });

    if (activas.length === 0) {
      // Sin empresas configuradas — retornar contexto neutro
      return {
        ok: true,
        data: {
          id_empresa:      null,
          nombre:          'WorldClass ERP',
          logo_url:        '',
          moneda_simbolo:  '$',
          moneda_codigo:   'USD',
          nombre_pais:     'Internacional',
          empresas:        []  // lista para futuro selector de empresa
        }
      };
    }

    // 2. Construir lista ligera de empresas
    var listaEmpresas = activas.map(function(e) {
      return { id: e.id_empresa, nombre: e.nombre, codigo: e.codigo };
    });

    // 3. Si hay múltiples empresas activas, devolver el contexto de Holding por defecto
    if (activas.length > 1) {
      var defaultLogoUrl = '';
      try {
        defaultLogoUrl = PropertiesService.getScriptProperties().getProperty('ERP_LOGO_URL') || '';
      } catch(e) {}
      
      // Fallback a la primera empresa si no hay logo del ERP configurado
      if (!defaultLogoUrl) {
        var defaultEmpresa = activas[0];
        defaultLogoUrl = DriveService.driveUrlToDirectUrl(defaultEmpresa.logo_url || '');
      }

      var defaultLogoBase64 = _getLogoBase64Secure(defaultLogoUrl);

      return {
        ok: true,
        data: {
          id_empresa:      'ALL',
          nombre:          'Holding WorldClass',
          logo_url:        defaultLogoUrl,
          logo_base64:     defaultLogoBase64,
          moneda_simbolo:  '$',
          moneda_codigo:   'USD',
          nombre_pais:     'Multinacional',
          label_doc:       'Identificación',
          empresas:        listaEmpresas
        }
      };
    }

    // 4. Si solo hay una empresa, usar esa empresa principal
    var empresa = activas[0];
    var ctx = Customizing.getContextoEmpresa(empresa.id_empresa);

    return {
      ok: true,
      data: _buildReportContext(empresa, ctx, listaEmpresas)
    };
  }, 'ReportEngine.getContext');
}

/**
 * Obtiene el listado de reportes disponibles para mostrar en el menú (Explorador).
 */
function apiGetReportCatalog() {
  return safeExecute(function() {
    Logger.log("Obteniendo catálogo de reportes...");
    return { ok: true, data: ReportCatalog.getAll() };
  }, 'ReportEngine.getCatalog');
}

/**
 * Obtiene el contexto de una empresa específica por su ID.
 * Usado por el selector de empresa del ReportViewer para cambiar entre
 * WorldClass, Rapivisa, etc. sin recargar la página.
 *
 * @param {number|string} idEmpresa
 */
function apiGetReportContextForEmpresa(idEmpresa) {
  return safeExecute(function() {
    var empresa = DataAdapter.findById('CAT_Empresas', Number(idEmpresa));
    if (!empresa || !empresa.activo) {
      throw new Error('Empresa con ID ' + idEmpresa + ' no encontrada o inactiva.');
    }

    var ctx     = Customizing.getContextoEmpresa(empresa.id_empresa);
    var activas = (DataAdapter.findAll('CAT_Empresas') || []).filter(function(e) { return e.activo; });
    var listaEmpresas = activas.map(function(e) {
      return { id: e.id_empresa, nombre: e.nombre, codigo: e.codigo };
    });

    return {
      ok: true,
      data: _buildReportContext(empresa, ctx, listaEmpresas)
    };
  }, 'ReportEngine.getContextForEmpresa');
}


/**
 * Obtiene la configuración de columnas (metadata) de un reporte específico.
 */
function apiGetReportMetadata(reportId) {
  return safeExecute(function() {
    Logger.log('Obteniendo metadata para reporte: ' + reportId);
    return { ok: true, data: ReportCatalog.get(reportId) };
  }, 'ReportEngine.getMetadata');
}

/**
 * Endpoint unificado que ejecuta el dataSource correspondiente al reporte.
 * Recibe filtros (ej. fechas) para prevenir el "Over-fetching".
 */
function apiExecuteReport(reportId, filters) {
  return safeExecute(function() {
    Logger.log('Ejecutando reporte: ' + reportId + ' con filtros: ' + JSON.stringify(filters));

    // 1. Obtener configuración
    var config = ReportCatalog.get(reportId);

    // 2. Validar que exista la función dataSource globalmente
    var globalObj = typeof globalThis !== 'undefined' ? globalThis : this;
    if (typeof globalObj[config.dataSource] !== 'function') {
      throw new Error("El DataSource '" + config.dataSource + "' no está implementado en el backend.");
    }

    // 3. Ejecutar la función (inyección dinámica)
    var data = globalObj[config.dataSource](filters);

    return { ok: true, data: data };
  }, 'ReportEngine.executeReport');
}

/**
 * Endpoint para obtener el logo en Base64 bajo demanda (Optimización SAP Fiori).
 * Evita transferir datos pesados en la carga inicial de la página.
 */
function apiGetLogoBase64(logoUrl) {
  return safeExecute(function() {
    var logoBase64 = _getLogoBase64Secure(logoUrl);
    return { ok: true, data: logoBase64 };
  }, 'ReportEngine.getLogoBase64');
}

/**
 * Helper privado para construir el objeto del contexto de empresa de forma DRY.
 */
function _buildReportContext(empresa, ctx, listaEmpresas) {
  var logoUrl = DriveService.driveUrlToDirectUrl(empresa.logo_url || '');
  var logoBase64 = _getLogoBase64Secure(logoUrl);

  return {
    id_empresa:     empresa.id_empresa,
    nombre:         empresa.nombre,
    codigo:         empresa.codigo,
    logo_url:       logoUrl,
    logo_base64:    logoBase64,
    moneda_simbolo: ctx.moneda_simbolo,
    moneda_codigo:  ctx.moneda_codigo,
    nombre_pais:    ctx.nombre_pais,
    label_doc:      ctx.label_documento,
    empresas:       listaEmpresas
  };
}

/**
 * Obtiene de forma segura la representación Base64 del logotipo.
 * Implementa caché local de servidor (CacheService_ERP) para optimizar rendimiento.
 *
 * @param {string} logoUrl
 * @returns {string} Base64 Data URL o vacio si falla
 */
function _getLogoBase64Secure(logoUrl) {
  if (!logoUrl) return '';
  
  // Generar clave única para caché
  var cacheKey = 'LOGO_B64_' + logoUrl.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  
  // Intentar leer de caché central primero
  var cached = CacheService_ERP.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fallback: leer de Drive y guardar en caché
  try {
    var base64 = AdapterFactory.getFileStorageAdapter().getFileBase64(logoUrl);
    if (base64) {
      CacheService_ERP.put(cacheKey, base64, 21600); // 6 horas
      return base64;
    }
  } catch(e) {
    Logger.log("[ReportEngine] Error cargando logo base64 para URL " + logoUrl + ": " + e.message);
  }
  
  return '';
}
