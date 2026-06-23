/**
 * MDM_Configuracion_Controller
 * Capa de Adaptador: Controlador de interfaz para Configuración y Parametrización de Datos de la Empresa.
 * Almacena los datos legales en BP_MASTER y los comerciales en CAT_Empresas.
 */

function apiGetConfiguracionEmpresas() {
  return safeExecute(function() {
    var empresas = DataAdapter.findAll('CAT_Empresas') || [];
    var paises   = DataAdapter.findAll('CAT_Paises') || [];
    
    // Log de diagnóstico temporal para revisar campos
    try {
      writeLog("apiGetConfiguracionEmpresas", "empresas: " + JSON.stringify(empresas) + " | paises: " + JSON.stringify(paises));
    } catch(e) {}
    
    var list = empresas.map(function(emp) {
      var bp = DataAdapter.findById('BP_MASTER', emp.id_bp) || {};
      var pais = DataAdapter.findById('CAT_Paises', emp.id_pais) || {};
      return {
        id_empresa:       emp.id_empresa,
        id_bp:            emp.id_bp,
        nombre:           emp.nombre, // comercial
        codigo:           emp.codigo,
        id_pais:          emp.id_pais,
        pais_nombre:      pais.nombre || '',
        codigo_iso:       pais.codigo_iso || 'GT',
        label_doc_empresa: pais.label_doc_empresa || 'RUC', // e.g. RUC, NIT, RFC
        logo_url:         emp.logo_url || '',
        activo:           emp.activo,
        // Campos de BP
        razon_social:     bp.nombre || '', // legal
        ruc:              bp.numero_documento || '',
        email:            bp.email || '',
        telefono:         bp.telefono || '',
        direccion:        bp.direccion || ''
      };
    });
    
    return { ok: true, empresas: list, paises: paises };
  }, 'MDM.Configuracion.getEmpresas');
}

function apiGuardarConfiguracionEmpresa(idEmpresa, payload) {
  return safeExecute(function() {
    var emp = DataAdapter.findById('CAT_Empresas', idEmpresa);
    if (!emp) throw new Error('Empresa no encontrada.');
    
    // Actualizar nombre comercial, país y logo en CAT_Empresas
    emp.nombre = payload.nombre || emp.nombre;
    emp.id_pais = payload.id_pais || emp.id_pais;
    emp.logo_url = payload.logo_url !== undefined ? payload.logo_url : emp.logo_url;
    emp.updated_at = new Date();
    DataAdapter.update('CAT_Empresas', idEmpresa, emp);
    
    // Actualizar datos legales en BP_MASTER
    var bp = DataAdapter.findById('BP_MASTER', emp.id_bp);
    if (!bp) throw new Error('Business Partner de la empresa no encontrado.');
    
    bp.nombre           = payload.razon_social || bp.nombre;
    bp.numero_documento = payload.ruc || bp.numero_documento;
    bp.email            = payload.email || bp.email;
    bp.telefono         = payload.telefono || bp.telefono;
    bp.direccion        = payload.direccion || bp.direccion;
    
    DataAdapter.update('BP_MASTER', emp.id_bp, bp);
    
    return { ok: true, mensaje: '✔ Configuración de empresa guardada con éxito.' };
  }, 'MDM.Configuracion.guardarEmpresa');
}

function apiSubirLogoEmpresa(base64Data, fileName, mimeType) {
  return safeExecute(function() {
    // Subir a la carpeta central del ERP bajo CORE/Logos
    var url = DriveService.subirArchivoBase64(base64Data, fileName, mimeType, ['CORE', 'Logos']);
    return { ok: true, url: url };
  }, 'MDM.Configuracion.subirLogo');
}

function apiLimpiarYReinstalarMaestros() {
  return safeExecute(function() {
    const ss = Utils.getActiveSpreadsheet();
    if (!ss) throw new Error("No se pudo obtener la hoja de cálculo activa.");

    // Asegurar y sanar la estructura de tablas y cabeceras (Self-Healing)
    SetupEngine.syncDatabase(MDM_Schema);

    // Orden de borrado relacional seguro
    const tablesToClear = ['CAT_Departamentos', 'CAT_UnidadesOrganizativas', 'CAT_Sucursales', 'CAT_Empresas', 'BP_MASTER', 'CAT_Paises', 'CAT_Roles'];
    tablesToClear.forEach(tableName => {
      const sh = ss.getSheetByName(tableName);
      if (sh && sh.getLastRow() > 1) {
        sh.deleteRows(2, sh.getLastRow() - 1);
        Logger.log("[Limpieza] Tabla vaciada: " + tableName);
      }
    });

    // Re-sembrar con la nueva lógica idempotente y ecuatoriana
    MDM_Setup.seedCatalogs();

    return { ok: true, mensaje: '✔ Catálogos maestros limpiados y re-sembrados con datos de Ecuador.' };
  }, 'MDM.Configuracion.limpiarYReinstalarMaestros');
}

function apiGuardarPais(idPais, payload) {
  return safeExecute(function() {
    if (idPais) {
      // Editar
      var p = DataAdapter.findById('CAT_Paises', idPais);
      if (!p) throw new Error('País no encontrado.');
      p.nombre            = payload.nombre || p.nombre;
      p.codigo_iso        = (payload.codigo_iso || p.codigo_iso).toUpperCase();
      p.moneda_codigo     = (payload.moneda_codigo || p.moneda_codigo).toUpperCase();
      p.moneda_simbolo    = payload.moneda_simbolo || p.moneda_simbolo;
      p.label_documento   = payload.label_documento || p.label_documento;
      p.label_doc_empresa = payload.label_doc_empresa || p.label_doc_empresa;
      p.formato_fecha     = payload.formato_fecha || p.formato_fecha;
      p.activo            = payload.activo !== undefined ? (payload.activo === true || payload.activo === 'true' || payload.activo === 1) : p.activo;
      DataAdapter.update('CAT_Paises', idPais, p);
      return { ok: true, mensaje: '✔ País actualizado correctamente.' };
    } else {
      // Crear nuevo
      var newPais = {
        nombre:            payload.nombre,
        codigo_iso:        payload.codigo_iso.toUpperCase(),
        moneda_codigo:     payload.moneda_codigo.toUpperCase(),
        moneda_simbolo:    payload.moneda_simbolo,
        label_documento:   payload.label_documento,
        label_doc_empresa: payload.label_doc_empresa,
        formato_fecha:     payload.formato_fecha,
        activo:            payload.activo !== undefined ? (payload.activo === true || payload.activo === 'true' || payload.activo === 1) : true
      };
      DataAdapter.insert('CAT_Paises', newPais);
      return { ok: true, mensaje: '✔ Nuevo país registrado en la parametrización global.' };
    }
  }, 'MDM.Configuracion.guardarPais');
}

function apiGetEstructuraOrganizativa(idEmpresa) {
  return safeExecute(function() {
    var sucursales = DataAdapter.findByField('CAT_Sucursales', 'id_empresa', Number(idEmpresa)) || [];
    var unidades   = DataAdapter.findByField('CAT_UnidadesOrganizativas', 'id_empresa', Number(idEmpresa)) || [];
    return { ok: true, sucursales: sucursales, unidades: unidades };
  }, 'MDM.Configuracion.getEstructuraOrganizativa');
}

function apiGuardarSucursal(idSucursal, payload) {
  return safeExecute(function() {
    var record = {
      id_empresa: Number(payload.id_empresa),
      nombre:     payload.nombre,
      codigo:     payload.codigo.toUpperCase(),
      direccion:  payload.direccion || '',
      telefono:   payload.telefono || '',
      activo:     payload.activo === true || payload.activo === 'true' || payload.activo === 1,
      updated_at: new Date()
    };

    if (idSucursal) {
      var current = DataAdapter.findById('CAT_Sucursales', idSucursal);
      if (!current) throw new Error('Sucursal no encontrada.');
      Object.keys(record).forEach(k => { current[k] = record[k]; });
      DataAdapter.update('CAT_Sucursales', idSucursal, current);
      return { ok: true, mensaje: '✔ Sucursal actualizada correctamente.' };
    } else {
      record.created_at = new Date();
      DataAdapter.insert('CAT_Sucursales', record);
      return { ok: true, mensaje: '✔ Nueva sucursal registrada con éxito.' };
    }
  }, 'MDM.Configuracion.guardarSucursal');
}

function apiGuardarUnidadOrganizativa(idUnidad, payload) {
  return safeExecute(function() {
    var record = {
      id_empresa: Number(payload.id_empresa),
      nombre:     payload.nombre,
      codigo:     payload.codigo.toUpperCase(),
      id_padre:   payload.id_padre ? Number(payload.id_padre) : '',
      activo:     payload.activo === true || payload.activo === 'true' || payload.activo === 1,
      updated_at: new Date()
    };

    if (idUnidad) {
      var current = DataAdapter.findById('CAT_UnidadesOrganizativas', idUnidad);
      if (!current) throw new Error('Unidad Organizativa no encontrada.');
      
      if (record.id_padre) {
        if (Number(idUnidad) === Number(record.id_padre)) {
          throw new Error('Una unidad organizativa no puede tenerse a sí misma como padre.');
        }
        
        // Evitar bucles jerárquicos (ciclos)
        var currentParentId = record.id_padre;
        var visited = {};
        while (currentParentId) {
          if (Number(currentParentId) === Number(idUnidad)) {
            throw new Error('Bucle circular detectado: la unidad superior seleccionada es descendiente de la unidad actual.');
          }
          if (visited[currentParentId]) {
            break;
          }
          visited[currentParentId] = true;
          
          var parentNode = DataAdapter.findById('CAT_UnidadesOrganizativas', currentParentId);
          currentParentId = (parentNode && parentNode.id_padre) ? parentNode.id_padre : null;
        }
      }
      Object.keys(record).forEach(k => { current[k] = record[k]; });
      DataAdapter.update('CAT_UnidadesOrganizativas', idUnidad, current);
      return { ok: true, mensaje: '✔ Unidad organizativa actualizada correctamente.' };
    } else {
      record.created_at = new Date();
      DataAdapter.insert('CAT_UnidadesOrganizativas', record);
      return { ok: true, mensaje: '✔ Nueva unidad organizativa registrada con éxito.' };
    }
  }, 'MDM.Configuracion.guardarUnidadOrganizativa');
}
