/**
 * CORE_Security
 * ─────────────────────────────────────────────────────────────────────────
 * Centraliza utilidades de seguridad para el portal ERP.
 *
 * Uso server-side:
 *   include('00_portal/config/PORTAL_Security');
 *   ERP.Security.escapeHtml(input);
 *   ERP.Security.sanitizeUrl(url);
 *
 * CODE STYLE: ES6+
 * ─────────────────────────────────────────────────────────────────────────
 */

const ERP = ERP || {};

ERP.Security = (() => {

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

  /** Patrones de URLs permitidas */
  const SAFE_URL_PATTERNS = [
    /^\?page=[a-z0-9_-]+$/i,
    /^#[a-z0-9_-]+$/i,
    /^javascript:void\(0\)$/i
  ];

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
   *
   * @example
   *   ERP.Security.escapeHtml('<script>alert(1)</script>');
   *   // → '&lt;script&gt;alert(1)&lt;/script&gt;'
   */
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"'`/]/g, (char) => HTML_CHARS[char] || char);
  };

  /**
   * Escapa un atributo HTML (más restrictivo que escapeHtml).
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
   * Escapa un string para uso seguro en JavaScript inline.
   *
   * @param {string} str — Texto para JS
   * @returns {string} Texto seguro para inserción en JS
   */
  const escapeJs = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  /**
   * Sanitiza una URL para prevenir ataques XSS via href/src.
   * Solo permite URLs seguras (relativas, query params, hash).
   *
   * @param {string} url — URL a sanitizar
   * @returns {string} URL segura o '#'
   *
   * @example
   *   ERP.Security.sanitizeUrl('?page=launchpad');  // → '?page=launchpad'
   *   ERP.Security.sanitizeUrl('javascript:alert(1)'); // → '#'
   */
  const sanitizeUrl = (url) => {
    if (!url) return '#';

    const trimmed = String(url).trim();

    // Verificar si es una URL peligrosa
    if (DANGEROUS_URL_PATTERNS.some(pattern => pattern.test(trimmed))) {
      console.warn(`[Security] URL peligrosa bloqueada: ${trimmed}`);
      return '#';
    }

    // Verificar si coincide con un patrón permitido
    if (SAFE_URL_PATTERNS.some(pattern => pattern.test(trimmed))) {
      return trimmed;
    }

    // Permitir rutas absolutas del mismo dominio
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }

    // Permitir URLs de mismo origen
    try {
      const parsed = new URL(trimmed, window.location.origin);
      if (parsed.origin === window.location.origin) {
        return trimmed;
      }
    } catch (e) {
      // URL inválida
    }

    // Por defecto, retornar # para URLs no reconocidas
    console.warn(`[Security] URL no reconocida, usando '#': ${trimmed}`);
    return '#';
  };

  /**
   * Limpia un input de texto removiendo tags HTML.
   * Útil para inputs que deben ser texto plano.
   *
   * @param {string} input — Texto del usuario
   * @returns {string} Texto sin tags HTML
   */
  const stripHtml = (input) => {
    if (!input) return '';
    return String(input).replace(/<[^>]*>/g, '');
  };

  /**
   * Valida que un input no contenga caracteres peligrosos.
   *
   * @param {string} input — Texto a validar
   * @returns {{ valid: boolean, reason?: string }}
   */
  const validateInput = (input) => {
    if (!input) return { valid: true };

    const str = String(input);

    // Detectar intentos de XSS comunes
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(str)) {
        return {
          valid: false,
          reason: `Input contiene patrón potencialmente peligroso: ${pattern.source}`
        };
      }
    }

    return { valid: true };
  };

  /**
   * Genera un nonce CSP (Content Security Policy) para scripts inline.
   * En producción, esto debe generarse server-side.
   *
   * @returns {string} Nonce aleatorio
   */
  const generateNonce = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  };

  // API pública
  return {
    escapeHtml,
    escapeAttr,
    escapeJs,
    sanitizeUrl,
    stripHtml,
    validateInput,
    generateNonce
  };

})();
