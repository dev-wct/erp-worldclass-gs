/**
 * CORE_NotifyHandlers
 * ─────────────────────────────────────────────────────────────────────────
 * Handlers de notificación para todos los eventos del ERP.
 *
 * PROPÓSITO:
 *  - Centraliza TODA la lógica de "qué notificar y a quién" en un único archivo.
 *  - Los módulos de negocio (HCM, EREC, EAM…) NO saben nada de notificaciones.
 *  - Cada función NOTIFY_on{EventType} recibe el EventContext y usa
 *    NotificationService para enviar (sin acoplarse a Gmail ni WhatsApp).
 *
 * CONVENCIÓN:
 *  - Nombre: NOTIFY_on{EventType}
 *  - Parámetro: context (EventContext del EventBus)
 *  - Retorna: void (los errores se manejan internamente)
 *
 * PLANTILLAS DE EMAIL:
 *  Usar HTML simple compatible con clientes de correo.
 *  Referencia: https://www.caniemail.com/
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Helper privado de plantilla HTML base ───────────────────────────────
/**
 * Envuelve el contenido en una plantilla HTML de email corporativa.
 * @param {string} titulo
 * @param {string} contenido — HTML interno
 * @returns {string}
 */
function _emailTemplate(titulo, contenido) {
  return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
    '<div style="background:#0a6ed1;padding:20px;border-radius:8px 8px 0 0;">' +
      '<h2 style="color:#fff;margin:0;font-size:18px;">' + Config.ERP_NAME + '</h2>' +
    '</div>' +
    '<div style="background:#f8f9fa;padding:24px;border:1px solid #e0e0e0;">' +
      '<h3 style="color:#333;margin-top:0;">' + titulo + '</h3>' +
      contenido +
    '</div>' +
    '<div style="background:#e0e0e0;padding:10px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px;">' +
      'Este es un mensaje automático del sistema ERP. Por favor no responder.' +
    '</div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// EREC — E-Recruiting
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notifica cuando un candidato aplica a una vacante.
 * @param {object} context — EventContext { payload: { nombre, cargo, email } }
 */
function NOTIFY_onCandidateApplied(context) {
  const p = context.payload;
  NotificationService.sendEmail({
    to     : p.email_reclutador || '',
    subject: 'Nuevo postulante: ' + (p.nombre || 'Sin nombre') + ' — ' + (p.cargo || ''),
    body   : 'Un nuevo postulante se registró en el sistema.',
    htmlBody: _emailTemplate(
      'Nuevo Postulante Recibido',
      '<p>Se ha registrado un nuevo postulante:</p>' +
      '<ul>' +
        '<li><strong>Nombre:</strong> ' + (p.nombre || '—') + '</li>' +
        '<li><strong>Cargo:</strong> '  + (p.cargo  || '—') + '</li>' +
        '<li><strong>Email:</strong> '  + (p.email  || '—') + '</li>' +
      '</ul>'
    ),
  });
}

/**
 * Notifica cuando un candidato es contratado.
 * @param {object} context — EventContext { payload: { nombre, cargo, email, telefono } }
 */
function NOTIFY_onCandidateHired(context) {
  const p = context.payload;
  // Notificar al candidato
  if (p.email) {
    NotificationService.sendEmail({
      to     : p.email,
      subject: '¡Bienvenido a ' + Config.ERP_NAME + '!',
      body   : 'Has sido contratado para el cargo de ' + (p.cargo || ''),
      htmlBody: _emailTemplate(
        '¡Felicitaciones! Has sido contratado',
        '<p>Estimado/a <strong>' + (p.nombre || '') + '</strong>,</p>' +
        '<p>Es un placer informarte que has sido seleccionado/a para el cargo de <strong>' + (p.cargo || '') + '</strong>.</p>' +
        '<p>En breve recibirás más detalles sobre tu incorporación.</p>'
      ),
    });
  }
  // Notificar por WhatsApp
  if (p.telefono) {
    NotificationService.sendWhatsApp({
      phone  : p.telefono,
      message: '¡Felicitaciones! Has sido contratado/a en ' + Config.ERP_NAME + ' para el cargo de ' + (p.cargo || '') + '.',
    });
  }
}

/**
 * Notifica cuando un candidato es rechazado.
 * @param {object} context
 */
function NOTIFY_onCandidateRejected(context) {
  const p = context.payload;
  if (p.email) {
    NotificationService.sendEmail({
      to     : p.email,
      subject: 'Actualización de tu proceso en ' + Config.ERP_NAME,
      body   : 'Gracias por tu interés. Hemos decidido continuar con otros candidatos.',
      htmlBody: _emailTemplate(
        'Resultado de tu proceso de selección',
        '<p>Estimado/a <strong>' + (p.nombre || '') + '</strong>,</p>' +
        '<p>Agradecemos el tiempo que dedicaste a nuestro proceso de selección.</p>' +
        '<p>En esta ocasión hemos decidido continuar con otros perfiles, pero guardaremos tus datos para futuras oportunidades.</p>'
      ),
    });
  }
}

/**
 * Notifica cambio de estado de candidato.
 * @param {object} context
 */
function NOTIFY_onCandidateStatusChanged(context) {
  const p = context.payload;
  if (p.email) {
    NotificationService.sendEmail({
      to     : p.email,
      subject: 'Actualización de tu proceso — ' + Config.ERP_NAME,
      body   : 'Tu estado en el proceso cambió a: ' + (p.nuevo_estado || ''),
      htmlBody: _emailTemplate(
        'Actualización de proceso',
        '<p>Tu estado actual en el proceso es: <strong>' + (p.nuevo_estado || '') + '</strong></p>'
      ),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HCM — Human Capital Management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notifica cuando se crea un nuevo empleado.
 * @param {object} context
 */
function NOTIFY_onEmployeeCreated(context) {
  const p = context.payload;
  if (p.email) {
    NotificationService.sendEmail({
      to     : p.email,
      subject: 'Tu cuenta en ' + Config.ERP_NAME + ' está lista',
      body   : 'Tu perfil de empleado ha sido creado en el sistema.',
      htmlBody: _emailTemplate(
        'Bienvenido al equipo',
        '<p>Hola <strong>' + (p.nombre || '') + '</strong>,</p>' +
        '<p>Tu perfil ha sido registrado exitosamente en el sistema ERP.</p>' +
        '<p><strong>Cargo:</strong> ' + (p.cargo || '—') + '</p>'
      ),
    });
  }
}

/**
 * Notifica cuando el onboarding es completado.
 * @param {object} context
 */
function NOTIFY_onEmployeeOnboarded(context) {
  const p = context.payload;
  if (p.email) {
    NotificationService.sendEmail({
      to     : p.email,
      subject: 'Onboarding completado — ' + Config.ERP_NAME,
      body   : 'Tu proceso de onboarding ha sido completado.',
      htmlBody: _emailTemplate(
        'Onboarding completado',
        '<p>Hola <strong>' + (p.nombre || '') + '</strong>,</p>' +
        '<p>Tu proceso de incorporación ha sido completado satisfactoriamente. ¡Bienvenido al equipo!</p>'
      ),
    });
  }
}

/**
 * Notifica cuando un empleado es dado de baja.
 * @param {object} context
 */
function NOTIFY_onEmployeeTerminated(context) {
  const p = context.payload;
  // Notificar a RRHH / administración (no al empleado por privacidad)
  Logger.log('[NOTIFY] Empleado dado de baja: ' + (p.nombre || p.id_empleado || '—') + ' | Motivo: ' + (p.motivo || '—'));
}

// ═══════════════════════════════════════════════════════════════════════════
// EAM — Enterprise Asset Management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notifica cuando un equipo es asignado.
 * @param {object} context
 */
function NOTIFY_onEquipmentAssigned(context) {
  const p = context.payload;
  if (p.email_empleado) {
    NotificationService.sendEmail({
      to     : p.email_empleado,
      subject: 'Equipo asignado — ' + Config.ERP_NAME,
      body   : 'Se te ha asignado el equipo: ' + (p.nombre_equipo || ''),
      htmlBody: _emailTemplate(
        'Equipo asignado',
        '<p>Hola <strong>' + (p.nombre_empleado || '') + '</strong>,</p>' +
        '<p>Se te ha asignado el siguiente equipo:</p>' +
        '<ul>' +
          '<li><strong>Equipo:</strong> '  + (p.nombre_equipo || '—') + '</li>' +
          '<li><strong>Serie:</strong> '   + (p.serie        || '—') + '</li>' +
          '<li><strong>Fecha:</strong> '   + (p.fecha        || '—') + '</li>' +
        '</ul>'
      ),
    });
  }
}

/**
 * Notifica cuando un equipo es devuelto.
 * @param {object} context
 */
function NOTIFY_onEquipmentReturned(context) {
  const p = context.payload;
  Logger.log('[NOTIFY] Equipo devuelto: ' + (p.nombre_equipo || '—') + ' por empleado: ' + (p.nombre_empleado || '—'));
}

/**
 * Notifica cuando un chip es asignado.
 * @param {object} context
 */
function NOTIFY_onChipAssigned(context) {
  const p = context.payload;
  if (p.email_empleado) {
    NotificationService.sendEmail({
      to     : p.email_empleado,
      subject: 'Chip/SIM asignado — ' + Config.ERP_NAME,
      body   : 'Se te ha asignado un chip de comunicación.',
      htmlBody: _emailTemplate(
        'Chip de comunicación asignado',
        '<p>Hola <strong>' + (p.nombre_empleado || '') + '</strong>,</p>' +
        '<p>Se te ha asignado el chip: <strong>' + (p.numero_chip || '—') + '</strong></p>'
      ),
    });
  }
}

/**
 * Notifica cuando un chip es devuelto.
 * @param {object} context
 */
function NOTIFY_onChipReturned(context) {
  const p = context.payload;
  Logger.log('[NOTIFY] Chip devuelto: ' + (p.numero_chip || '—') + ' por: ' + (p.nombre_empleado || '—'));
}

// ═══════════════════════════════════════════════════════════════════════════
// SD — Sales & Distribution
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notifica cuando se crea un nuevo lead.
 * @param {object} context
 */
function NOTIFY_onLeadCreated(context) {
  const p = context.payload;
  Logger.log('[NOTIFY] Nuevo lead creado: ' + (p.nombre || '—') + ' | Fuente: ' + (p.fuente || '—'));
}

/**
 * Notifica cuando un lead es convertido.
 * @param {object} context
 */
function NOTIFY_onLeadConverted(context) {
  const p = context.payload;
  Logger.log('[NOTIFY] Lead convertido: ' + (p.nombre || '—'));
}

/**
 * Notifica cuando se agenda una cita.
 * @param {object} context
 */
function NOTIFY_onAppointmentScheduled(context) {
  const p = context.payload;
  if (p.email_lead) {
    NotificationService.sendEmail({
      to     : p.email_lead,
      subject: 'Cita confirmada — ' + Config.ERP_NAME,
      body   : 'Tu cita ha sido agendada para el ' + (p.fecha || '') + ' a las ' + (p.hora || ''),
      htmlBody: _emailTemplate(
        'Cita Confirmada',
        '<p>Estimado/a <strong>' + (p.nombre_lead || '') + '</strong>,</p>' +
        '<p>Tu cita ha sido confirmada:</p>' +
        '<ul>' +
          '<li><strong>Fecha:</strong> ' + (p.fecha    || '—') + '</li>' +
          '<li><strong>Hora:</strong> '  + (p.hora     || '—') + '</li>' +
          '<li><strong>Asesor:</strong> '+ (p.asesor   || '—') + '</li>' +
        '</ul>'
      ),
    });
  }
  if (p.telefono_lead) {
    NotificationService.sendWhatsApp({
      phone  : p.telefono_lead,
      message: 'Tu cita en ' + Config.ERP_NAME + ' está confirmada para el ' + (p.fecha || '') + ' a las ' + (p.hora || '') + '.',
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FICO — Finance & Controlling
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notifica cuando se procesa la nómina.
 * @param {object} context
 */
function NOTIFY_onPayrollProcessed(context) {
  const p = context.payload;
  Logger.log('[NOTIFY] Nómina procesada: período ' + (p.periodo || '—') + ' | Total: ' + (p.total || '—'));
}
