/**
 * RRHH_Postulante_DTO
 * Capa de Dominio: DTO para normalizar datos de un candidato.
 *
 * Soporta DOS fuentes de datos:
 *  1. Formulario interno (HtmlService): campos de un objeto rawForm normal.
 *  2. Google Form público (onFormSubmit): mapeo por posición de respuesta
 *     usando el array itemResponses del evento de envío del formulario.
 *
 * Patrón: Adaptador de entrada — el resto del sistema no sabe ni le importa
 * de dónde vienen los datos (form interno, Google Form o AppSheet).
 */
const PostulanteDTO = {

  /**
   * Construye un DTO desde un formulario interno (HtmlService).
   * @param {object} rawForm - Objeto de datos del formulario HTML.
   */
  fromForm: function(rawForm) {
    return {
      nombre_completo:   String(rawForm.nombre_completo || '').trim(),
      dpi:               String(rawForm.dpi             || '').trim(),
      telefono:          String(rawForm.telefono        || '').trim(),
      email:             String(rawForm.email           || '').trim().toLowerCase(),
      fuente:            String(rawForm.fuente          || 'FORMULARIO_INTERNO').trim().toUpperCase(),
      notas:             String(rawForm.notas           || '').trim(),
    };
  },

  /**
   * Construye un DTO desde el evento onFormSubmit de Google Forms (form público).
   *
   * Google Forms envía un objeto `e` con e.namedValues (mapa nombre→[valor]).
   * Este método mapea esos campos al DTO estándar del ERP.
   *
   * Convención de nombres de campos en Google Form:
   *   - "Nombre Completo"
   *   - "DPI / NIT"
   *   - "Teléfono"
   *   - "Correo Electrónico"
   *   - "¿Cómo nos conociste?"
   *
   * @param {object} e - Objeto del evento onFormSubmit de Google Apps Script.
   */
  fromGoogleFormEvent: function(e) {
    const v = e.namedValues || {};

    // Helper para extraer el primer valor de un campo de Google Forms
    function val(campo) {
      return v[campo] && v[campo][0] ? String(v[campo][0]).trim() : '';
    }

    return {
      nombre_completo:   val('Nombre Completo'),
      dpi:               val('DPI / NIT'),
      telefono:          val('Teléfono'),
      email:             val('Correo Electrónico').toLowerCase(),
      fuente:            val('¿Cómo nos conociste?').toUpperCase() || 'GOOGLE_FORM',
      notas:             val('Mensaje o Comentarios'),
    };
  },

  /**
   * Construye la respuesta pública que se devuelve al cliente (AppSheet / formulario).
   * @param {object} entity - Entidad de dominio ya persistida.
   */
  toResponse: function(entity) {
    return {
      id_postulante:   entity.id_postulante,
      nombre_completo: entity.nombre_completo,
      email:           entity.email,
      estado:          entity.estado,
    };
  },
};
