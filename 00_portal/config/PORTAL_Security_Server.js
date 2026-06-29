/**
 * CORE_Security_Server
 * ─────────────────────────────────────────────────────────────────────────
 * Utilidades de seguridad server-side para Google Apps Script.
 *
 * Uso en Controllers:
 *   const sanitized = SecurityServer.escapeHtml(userInput);
 *   const safeUrl = SecurityServer.sanitizeUrl(urlParam);
 *
 * CODE STYLE: ES6+
 * ─────────────────────────────────────────────────────────────────────────
 */

const SecurityServer = (() => {

  /** Caracteres HTML peligrosos y sus entidades */
  const HTML_CHARS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };

  /** Patrones de URLs peligrosas */
  const DANGEROUS_URL_PATTERNS = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i
  ];

  /**
   * Escapa caracteres HTML peligrosos para prevenir XSS.
   *
   * @param {string} str — Texto a escapar
   * @returns {string} Texto seguro para inserción en HTML
   */
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"'`/]/g, (char) => HTML_CHARS[char] || char);
  };

  /**
   * Escapa un atributo HTML.
   *
   * @param {string} str — Valor de atributo
   * @returns {string} Valor seguro para atributo HTML
   */
  const escapeAttr = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  /**
   * Sanitiza una URL para prevenir ataques XSS.
   *
   * @param {string} url — URL a sanitizar
   * @returns {string} URL segura o ''
   */
  const sanitizeUrl = (url) => {
    if (!url) return '';

    const trimmed = String(url).trim();

    // Verificar si es una URL peligrosa
    if (DANGEROUS_URL_PATTERNS.some(pattern => pattern.test(trimmed))) {
      Logger.log(`[Security] URL peligrosa bloqueada: ${trimmed}`);
      return '';
    }

    // Permitir rutas relativas seguras
    if (/^[a-z0-9_/-]+$/i.test(trimmed)) {
      return trimmed;
    }

    // Permitir query params seguros
    if (/^\?page=[a-z0-9_-]+$/i.test(trimmed)) {
      return trimmed;
    }

    return '';
  };

  /**
   * Limpia un input de texto removiendo tags HTML.
   *
   * @param {string} input — Texto del usuario
   * @returns {string} Texto sin tags HTML
   */
  const stripHtml = (input) => {
    if (!input) return '';
    return String(input).replace(/<[^>]*>/g, '');
  };

  /**
   * Valida que un email sea seguro.
   *
   * @param {string} email — Email a validar
   * @returns {boolean}
   */
  const isValidEmail = (email) => {
    if (!email) return false;
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(String(email));
  };

  /**
   * Valida que un ID sea seguro (alfanumérico, guiones, guiones bajos).
   *
   * @param {string} id — ID a validar
   * @returns {boolean}
   */
  const isValidId = (id) => {
    if (!id) return false;
    return /^[a-zA-Z0-9_-]+$/.test(String(id));
  };

  /**
   * Genera un token CSRF simple para formularios.
   *
   * @returns {string} Token aleatorio
   */
  const generateCsrfToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // API pública
  return {
    escapeHtml,
    escapeAttr,
    sanitizeUrl,
    stripHtml,
    isValidEmail,
    isValidId,
    generateCsrfToken
  };

})();
