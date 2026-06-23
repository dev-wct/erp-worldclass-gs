/**
 * INFRA_AuthGuard
 * ─────────────────────────────────────────────────────────────────────────
 * Capa de Infraestructura: Control de Acceso Basado en Roles (RBAC).
 *
 * PROPÓSITO:
 *  - Garantiza que el usuario activo tenga los permisos necesarios para ejecutar
 *    una acción. Si no los tiene, bloquea la ejecución.
 *  - Reemplaza las comprobaciones manuales dispersas.
 *  - Equivalente SAP: AUTHORITY-CHECK (SU24) / Authorization Objects.
 *
 * USO EN CONTROLADORES O CASOS DE USO:
 *  AuthGuard.requireRole('HR_ADMIN'); // Lanza BusinessError si falla
 *  
 *  if (AuthGuard.hasRole('SD_AGENT')) { ... } // Comprobación silenciosa
 *
 * NOTA DE DISEÑO (Anti Vendor Locking):
 *  - La obtención de roles del usuario está abstraída. Actualmente puede leer
 *    de una hoja 'SYS_UserRoles' o de una tabla MDM, pero mañana en Vercel
 *    se conectará a Supabase Auth o JWT Claims sin tocar los casos de uso.
 * ─────────────────────────────────────────────────────────────────────────
 */
const AuthGuard = (() => {

  /**
   * Obtiene los roles asignados al usuario actual.
   * Implementación temporal: lee de Script Properties (para admins del sistema)
   * o asume un rol base por defecto para desarrollo.
   * @param {string} userEmail
   * @returns {string[]} Lista de roles (ej: ['HR_ADMIN', 'SYS_ADMIN'])
   */
  function _getUserRoles(userEmail) {
    try {
      // 1. Verificar si hay un override de administrador supremo
      const sysAdmins = PropertiesService.getScriptProperties().getProperty('SYS_ADMINS') || '';
      if (sysAdmins.includes(userEmail)) {
        return ['SYS_ADMIN', 'HR_ADMIN', 'SD_ADMIN', 'FICO_ADMIN', 'EAM_ADMIN'];
      }
      
      // 2. Consulta a base de datos (Ejemplo: SYS_UserRoles)
      // const repo = new BaseRepository('SYS_UserRoles', raw => raw);
      // const records = repo.findByField('email', userEmail);
      // return records.map(r => r.rol);

      // En entorno de desarrollo sin DB de usuarios armada, asumimos full access
      // o un set de roles genéricos. En producción, esto devolvería [] por defecto.
      const isDebug = PropertiesService.getScriptProperties().getProperty('DEBUG_MODE') === 'true';
      if (isDebug) {
        Logger_ERP.debug('INFRA', 'AuthGuard: Modo DEBUG activo, otorgando roles amplios a ' + userEmail);
        return ['HR_ADMIN', 'SD_AGENT', 'FICO_USER'];
      }
      
      return []; // Por defecto, acceso denegado a menos que esté registrado.
    } catch (e) {
      Logger_ERP.error('INFRA', 'Error obteniendo roles de usuario', e);
      return [];
    }
  }

  // ── API Pública ──────────────────────────────────────────────────────────
  return {

    /**
     * Retorna el email del usuario en sesión.
     * @returns {string}
     */
    getCurrentUser: function() {
      try {
        return Session.getActiveUser().getEmail() || 'anonymous@local';
      } catch (e) {
        return 'anonymous@local';
      }
    },

    /**
     * Verifica si el usuario actual posee un rol específico de forma silenciosa.
     * @param {string} roleName — Nombre del rol (ej: 'HR_ADMIN')
     * @returns {boolean}
     */
    hasRole: function(roleName) {
      const email = this.getCurrentUser();
      const roles = _getUserRoles(email);
      const has = roles.includes('SYS_ADMIN') || roles.includes(roleName);
      
      if (!has) {
        Logger_ERP.warn('INFRA', `Acceso denegado: Usuario ${email} no tiene el rol ${roleName}`);
      }
      return has;
    },

    /**
     * Fuerza la comprobación de un rol. Si el usuario no lo tiene, lanza una
     * excepción de negocio que será capturada por el ErrorHandler.
     * @param {string} roleName
     * @throws {BusinessError} Si no tiene acceso
     */
    requireRole: function(roleName) {
      if (!this.hasRole(roleName)) {
        throw new BusinessError(
          `No tienes permisos para realizar esta acción. Se requiere el rol: ${roleName}.`,
          'ERR_UNAUTHORIZED'
        );
      }
    },

    /**
     * Verifica si el usuario tiene AL MENOS UNO de los roles proporcionados.
     * @param {string[]} roleList
     * @returns {boolean}
     */
    hasAnyRole: function(roleList) {
      const email = this.getCurrentUser();
      const roles = _getUserRoles(email);
      
      if (roles.includes('SYS_ADMIN')) return true;
      
      const hasAny = roleList.some(r => roles.includes(r));
      if (!hasAny) {
        Logger_ERP.warn('INFRA', `Acceso denegado: Usuario ${email} no tiene ninguno de los roles: ${roleList.join(', ')}`);
      }
      return hasAny;
    }

  };

})();
