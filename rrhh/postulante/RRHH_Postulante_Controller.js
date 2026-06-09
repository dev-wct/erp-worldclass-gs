/**
 * RRHH_Postulante_Controller
 * Capa de Adaptador: Punto de entrada para operaciones de candidatos.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PATRÓN PARA FORMS PÚBLICOS (Google Forms → ERP)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * El flujo de un formulario PÚBLICO de Google Forms funciona así:
 *
 *   [Candidato llena Google Form]
 *          ↓
 *   [Google Forms dispara el trigger onFormSubmit]
 *          ↓
 *   [onPostulanteFormSubmit(e) — este archivo]
 *          ↓
 *   [PostulanteDTO.fromGoogleFormEvent(e) — mapea campos del form al DTO]
 *          ↓
 *   [PostulanteUseCases.registrar(dto) — valida, deduplica y persiste]
 *          ↓
 *   [Email de confirmación automático al candidato]
 *
 * INSTALACIÓN DEL TRIGGER:
 *   En la hoja de cálculo del cliente, ir a:
 *   Extensiones > Apps Script > Triggers (ícono de reloj) > + Add Trigger
 *     - Función a ejecutar : onPostulanteFormSubmit
 *     - Tipo de evento     : From spreadsheet → On form submit
 *   O instalar programáticamente ejecutando una sola vez: instalarTriggerPostulante()
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── WEBHOOK: Receptor del Google Form Público ─────────────────────────────

/**
 * Punto de entrada del trigger onFormSubmit de Google Forms.
 * Google Apps Script llama a esta función AUTOMÁTICAMENTE cada vez que
 * un candidato envía el formulario público.
 *
 * @param {object} e - Objeto de evento onFormSubmit. Contiene e.namedValues
 *                     con los campos del form mapeados a sus respuestas.
 */
function onPostulanteFormSubmit(e) {
  return safeExecute(function() {
    // 1. Adaptar los datos del Google Form al DTO del ERP
    const dto = PostulanteDTO.fromGoogleFormEvent(e);

    // 2. Orquestar el caso de uso (validación + deduplicación + persistencia + notificación)
    const resultado = PostulanteUseCases.registrar(dto);

    // 3. Loguear resultado para auditoría interna
    if (resultado.ok) {
      Logger.log('[✔] Postulante registrado desde Google Form: ' + dto.nombre_completo);
    } else {
      Logger.log('[!] Error al registrar postulante desde Google Form: ' +
                 JSON.stringify(resultado.errores));
    }

    return resultado;
  }, 'RRHH.onPostulanteFormSubmit');
}

// ─── APIs INTERNAS (para el formulario HtmlService interno de RRHH) ─────────

/**
 * Registra un candidato desde el formulario interno de RRHH.
 * @param {object} formData - Datos del formulario HTML interno.
 */
function apiGuardarPostulante(formData) {
  return safeExecute(function() {
    const dto = PostulanteDTO.fromForm(formData);
    return PostulanteUseCases.registrar(dto);
  }, 'RRHH.guardarPostulante');
}

/**
 * Retorna la lista de candidatos por estado para el panel de RRHH.
 * @param {string} estado - POSTULADO | ENTREVISTA | PRUEBA | ACEPTADO | RECHAZADO
 */
function apiGetPostulantesPorEstado(estado) {
  return safeExecute(function() {
    return PostulanteUseCases.listarPorEstado(estado || 'POSTULADO');
  }, 'RRHH.getPostulantes');
}

/**
 * Avanza el estado del proceso de selección de un candidato.
 * @param {number} id         - ID del candidato.
 * @param {string} nuevoEstado - Nuevo estado.
 */
function apiAvanzarEstadoPostulante(id, nuevoEstado) {
  return safeExecute(function() {
    return PostulanteUseCases.avanzarEstado(id, nuevoEstado);
  }, 'RRHH.avanzarEstado');
}

// ─── INSTALADOR DEL TRIGGER (ejecutar una sola vez por instalación) ──────────

/**
 * Instala programáticamente el trigger de Google Forms en esta hoja.
 * Solo necesitas ejecutar esta función UNA VEZ después de vincular el
 * Google Form a esta hoja de cálculo como destino de respuestas.
 *
 * Cómo usar:
 *   1. Crea tu Google Form público.
 *   2. En el Form, ve a Respuestas > Vincular a hoja de cálculo > selecciona ESTA hoja.
 *   3. En el editor de Apps Script, ejecuta esta función manualmente UNA VEZ.
 *   4. Acepta los permisos cuando Google te los solicite.
 *   5. ¡Listo! Cada envío del formulario disparará onPostulanteFormSubmit().
 */
function instalarTriggerPostulante() {
  try {
    // Eliminar triggers previos del mismo nombre para evitar duplicados
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(t) {
      if (t.getHandlerFunction() === 'onPostulanteFormSubmit') {
        ScriptApp.deleteTrigger(t);
        Logger.log('[*] Trigger previo eliminado.');
      }
    });

    // Instalar el nuevo trigger vinculado a la hoja activa
    ScriptApp.newTrigger('onPostulanteFormSubmit')
      .forSpreadsheet(Utils.getActiveSpreadsheet())
      .onFormSubmit()
      .create();

    Logger.log('[✔] Trigger onPostulanteFormSubmit instalado exitosamente.');
    SpreadsheetApp.getUi().alert(
      'Trigger Instalado',
      'El formulario público de postulantes quedó vinculado al ERP. ' +
      'Cada envío del Google Form registrará automáticamente al candidato en la hoja Postulantes.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (err) {
    Logger.log('[ERROR] No se pudo instalar el trigger: ' + err.message);
    SpreadsheetApp.getUi().alert('Error', err.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
