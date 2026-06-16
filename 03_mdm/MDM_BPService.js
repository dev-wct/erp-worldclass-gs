/**
 * MDM_BPService
 * ─────────────────────────────────────────────────────────────────────────
 * Servicio central de Business Partner.
 * Equivalente a la transacción BP de SAP.
 *
 * RESPONSABILIDAD ÚNICA:
 *   Crear, deduplicar y gestionar Business Partners.
 *   Todos los módulos (HCM, SD, EREC) lo usan para obtener o crear un BP
 *   antes de persistir su propia entidad.
 *
 * DEDUPLICACIÓN:
 *   La clave natural es tipo_documento + numero_documento.
 *   Si ya existe un BP con esa combinación, se retorna el existente.
 *   Nunca se crea un BP duplicado.
 *
 * TRANSPARENCIA:
 *   El usuario nunca interactúa directamente con BP.
 *   Se crea automáticamente como efecto secundario de registrar
 *   un Lead, Empleado, Postulante o Empresa.
 * ─────────────────────────────────────────────────────────────────────────
 */
const BPService = (function() {

  var TABLE_BP    = 'BP_MASTER';
  var TABLE_ROLES = 'BP_Roles';

  /**
   * Obtiene o crea un Business Partner.
   * Si ya existe uno con el mismo tipo_documento + numero_documento, lo retorna.
   * Si no existe, lo crea y retorna el nuevo.
   *
   * @param {object} params
   * @param {string} params.tipo_bp           — PERSONA_FISICA | PERSONA_JURIDICA
   * @param {string} params.tipo_documento    — DPI | DUI | CEDULA | RUC | NIT | etc.
   * @param {string} params.numero_documento  — número del documento
   * @param {string} params.nombre            — nombre completo o razón social
   * @param {string} [params.email]
   * @param {string} [params.telefono]
   * @returns {{ id_bp: number, created: boolean }}
   */
  function obtenerOCrear(params) {
    if (!params.tipo_documento || !params.numero_documento) {
      throw new Error('BPService: tipo_documento y numero_documento son requeridos.');
    }

    // Buscar BP existente por documento
    var existentes = DataAdapter.findAll(TABLE_BP, {
      tipo_documento:   String(params.tipo_documento).trim().toUpperCase(),
      numero_documento: String(params.numero_documento).trim(),
    });

    if (existentes.length > 0) {
      Logger.log('[BPService] BP existente encontrado: id_bp=' + existentes[0].id_bp);
      return { id_bp: existentes[0].id_bp, created: false };
    }

    // Crear nuevo BP
    var id_bp   = DataAdapter.getNextId(TABLE_BP);
    var user    = DataAdapter.getCurrentUser();
    var now     = new Date();

    DataAdapter.insert(TABLE_BP, {
      id_bp:             id_bp,
      tipo_bp:           String(params.tipo_bp || 'PERSONA_FISICA').toUpperCase(),
      tipo_documento:    String(params.tipo_documento).trim().toUpperCase(),
      numero_documento:  String(params.numero_documento).trim(),
      nombre:            String(params.nombre   || '').trim(),
      email:             String(params.email    || '').trim().toLowerCase(),
      telefono:          String(params.telefono || '').trim(),
      activo:            true,
      created_at:        now,
      created_by:        user,
    });

    Logger.log('[BPService] Nuevo BP creado: id_bp=' + id_bp + ' | ' + params.nombre);
    return { id_bp: id_bp, created: true };
  }

  /**
   * Registra un rol para un BP existente.
   * Evita duplicar el mismo rol si ya está activo.
   *
   * @param {number} id_bp
   * @param {string} rol           — CLIENTE | EMPLEADO | POSTULANTE | PROVEEDOR | EMPRESA
   * @param {string} modulo        — HCM | SD | EREC | MDM
   * @param {number} referencia_id — id del registro en su módulo
   */
  function asignarRol(id_bp, rol, modulo, referencia_id) {
    // Verificar que el rol no esté ya activo
    var existentes = DataAdapter.findAll(TABLE_ROLES, {
      id_bp:  id_bp,
      rol:    String(rol).toUpperCase(),
      activo: true,
    });

    if (existentes.length > 0) {
      Logger.log('[BPService] Rol ya existe: ' + rol + ' para id_bp=' + id_bp);
      return existentes[0].id_rol_bp;
    }

    var id_rol_bp = DataAdapter.getNextId(TABLE_ROLES);
    DataAdapter.insert(TABLE_ROLES, {
      id_rol_bp:    id_rol_bp,
      id_bp:        id_bp,
      rol:          String(rol).toUpperCase(),
      modulo:       String(modulo).toUpperCase(),
      referencia_id: referencia_id,
      activo:       true,
      created_at:   new Date(),
    });

    Logger.log('[BPService] Rol asignado: ' + rol + ' → id_bp=' + id_bp);
    return id_rol_bp;
  }

  /**
   * Shortcut: obtenerOCrear + asignarRol en una sola llamada.
   * Es el método que usan los UseCases de cada módulo.
   *
   * @param {object} params        — mismos parámetros que obtenerOCrear()
   * @param {string} rol           — rol a asignar
   * @param {string} modulo        — módulo que hace la llamada
   * @param {number} referencia_id — id del registro recién creado
   * @returns {number} id_bp
   */
  function registrar(params, rol, modulo, referencia_id) {
    var result = obtenerOCrear(params);
    asignarRol(result.id_bp, rol, modulo, referencia_id);
    return result.id_bp;
  }

  /**
   * Obtiene todos los roles activos de un BP.
   * @param {number} id_bp
   * @returns {Array}
   */
  function getRoles(id_bp) {
    return DataAdapter.findAll(TABLE_ROLES, { id_bp: id_bp, activo: true });
  }

  /**
   * Busca un BP por su documento.
   * @param {string} tipo_documento
   * @param {string} numero_documento
   * @returns {object|null}
   */
  function findByDocumento(tipo_documento, numero_documento) {
    var results = DataAdapter.findAll(TABLE_BP, {
      tipo_documento:   String(tipo_documento).toUpperCase(),
      numero_documento: String(numero_documento).trim(),
    });
    return results.length > 0 ? results[0] : null;
  }

  return { obtenerOCrear, asignarRol, registrar, getRoles, findByDocumento };

})();
