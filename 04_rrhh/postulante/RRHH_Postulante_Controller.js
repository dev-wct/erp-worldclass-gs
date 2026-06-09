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
  const ui = SpreadsheetApp.getUi();
  try {
    const ss = Utils.getActiveSpreadsheet();
    let formUrl = ss.getFormUrl();
    let form;
    let createdNew = false;

    if (!formUrl) {
      Logger.log('[*] No se detectó formulario vinculado. Creando uno nuevo...');
      form = FormApp.create(Config.ERP_NAME + ' - Registro de Postulantes');
      form.setDescription('Formulario oficial de postulaciones para candidatos al Call Center.');

      // Crear las preguntas con los nombres exactos que espera el DTO
      form.addTextItem().setTitle('Nombre Completo').setRequired(true);
      form.addTextItem().setTitle('DPI / NIT').setRequired(true);
      form.addTextItem().setTitle('Teléfono').setRequired(true);
      form.addTextItem().setTitle('Correo Electrónico').setRequired(true);

      const list = form.addListItem();
      list.setTitle('¿Cómo nos conociste?');
      list.setChoiceValues(['FACEBOOK', 'INSTAGRAM', 'REFERIDO', 'LINKEDIN', 'COMPUTRABAJO', 'OTRO']);
      list.setRequired(true);

      form.addParagraphTextItem().setTitle('Mensaje o Comentarios');

      // Vincular el formulario a esta hoja de cálculo
      form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
      
      formUrl = form.getPublishedUrl();
      createdNew = true;
      Logger.log('[✔] Google Form creado y vinculado: ' + formUrl);
    } else {
      Logger.log('[*] Ya existe un formulario vinculado: ' + formUrl);
    }

    // Eliminar triggers previos del mismo nombre para evitar duplicados
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(t) {
      if (t.getHandlerFunction() === 'onPostulanteFormSubmit') {
        ScriptApp.deleteTrigger(t);
        Logger.log('[*] Trigger previo eliminado.');
      }
    });

    // Instalar el nuevo trigger vinculado a la hoja activa (Spreadsheet Form Submit)
    ScriptApp.newTrigger('onPostulanteFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();

    Logger.log('[✔] Trigger onPostulanteFormSubmit instalado exitosamente.');

    if (createdNew) {
      ui.alert(
        '🚀 Google Form y Trigger Creados',
        '¡Formulario de Reclutamiento creado y vinculado automáticamente!\n\n' +
        '👉 Link PÚBLICO para candidatos:\n' + form.getPublishedUrl() + '\n\n' +
        '🛠️ Link para EDITAR el formulario:\n' + form.getEditUrl() + '\n\n' +
        'El trigger quedó configurado para registrar los envíos directamente en el ERP.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'Trigger Instalado',
        'El trigger se vinculó al formulario existente:\n' + formUrl + '\n\n' +
        'Cada envío del formulario registrará automáticamente al candidato en la hoja Postulantes.',
        ui.ButtonSet.OK
      );
    }
  } catch (err) {
    Logger.log('[ERROR] No se pudo instalar el trigger: ' + err.message);
    ui.alert('Error en Instalación', err.message, ui.ButtonSet.OK);
  }
}
