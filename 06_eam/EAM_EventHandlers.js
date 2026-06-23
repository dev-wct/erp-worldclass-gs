/**
 * EAM_EventHandlers
 * ─────────────────────────────────────────────────────────────────────────
 * Handlers del módulo EAM que reaccionan a eventos del EventBus.
 *
 * PROPÓSITO:
 *  - EAM automatiza la pre-asignación de recursos cuando un empleado ingresa.
 *  - EAM procesa devoluciones cuando un empleado se da de baja.
 *
 * CONVENCIÓN:
 *  - Nombre: EAM_on{EventType}
 *  - Parámetro: context (EventContext)
 *  - Registrado en: CORE_EventRegistry.js
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Reacciona a EmployeeCreated: Notifica a IT / Bodega para preparar equipos.
 * @param {object} context — EventContext { payload: { id_empleado, nombre, email, cargo } }
 */
function EAM_onEmployeeCreated(context) {
  const p = context.payload;
  Logger_ERP.info('EAM', 'EmployeeCreated recibido. Evaluando asignación de equipos para: ' + p.nombre);

  try {
    // 1. Aquí se podría insertar una "Pre-asignación" en la tabla de Asignaciones
    // si el modelo lo permite, o bien crear un Ticket para IT.
    
    // 2. Notificar al administrador de EAM / IT (simulado vía mail genérico de IT)
    NotificationService.sendEmail({
      to     : 'it-support@worldclasstravel.test',
      subject: 'Preparar equipo para nuevo ingreso: ' + p.nombre,
      body   : 'El empleado ' + p.nombre + ' (' + p.cargo + ') ha sido creado en HCM. Por favor preparar equipo y chip.',
      htmlBody: '<p>Nuevo ingreso en el sistema:</p>' +
                '<ul>' +
                '<li><strong>Nombre:</strong> ' + p.nombre + '</li>' +
                '<li><strong>Cargo:</strong> ' + p.cargo + '</li>' +
                '</ul>' +
                '<p>Por favor, ingresa al módulo EAM y crea su asignación de activos.</p>'
    });

  } catch (e) {
    Logger_ERP.error('EAM', 'Error en EAM_onEmployeeCreated', e);
    throw e;
  }
}

/**
 * Reacciona a EmployeeOnboarded: el empleado ya tiene todo lo legal listo,
 * es el momento de entregarle el equipo físicamente.
 */
function EAM_onEmployeeOnboarded(context) {
  const p = context.payload;
  Logger_ERP.info('EAM', 'EmployeeOnboarded recibido para: ' + p.nombre);
  // Lógica futura: Confirmar entrega de equipos pre-asignados
}

/**
 * Reacciona a EmployeeTerminated: inicia flujo de recuperación de activos.
 */
function EAM_onEmployeeTerminated(context) {
  const p = context.payload;
  Logger_ERP.info('EAM', 'EmployeeTerminated recibido. Iniciando recuperación de equipos para: ' + p.id_empleado);
  
  try {
    // Buscar asignaciones activas de este empleado
    const asignaciones = DataAdapter.findByField('Asignaciones', 'id_empleado', p.id_empleado);
    const activas = asignaciones.filter(a => a.activo === true);

    if (activas.length > 0) {
      Logger_ERP.warn('EAM', 'El empleado dado de baja tiene ' + activas.length + ' asignaciones activas. Se requiere devolución.');
      
      // Notificar a IT para procesar la devolución
      NotificationService.sendEmail({
        to     : 'it-support@worldclasstravel.test',
        subject: 'URGENTE: Recuperar equipos de baja - ' + (p.nombre || p.id_empleado),
        body   : 'El empleado ha sido dado de baja. Debe devolver los equipos.',
      });
    }
  } catch (e) {
    Logger_ERP.error('EAM', 'Error en EAM_onEmployeeTerminated', e);
    throw e;
  }
}

/**
 * Reacciona a Workflow de Asignación Aprobado.
 * Es en este momento donde FÍSICAMENTE el equipo sale de la bodega.
 */
function EAM_onAsignacionAprobada(context) {
  const p = context.payload;
  Logger_ERP.info('EAM', `Asignación ${p.id_documento} APROBADA por flujo. Liberando equipos...`);
  
  try {
    // 1. Cambiar estado de asignación
    DataAdapter.update('Asignaciones', p.id_documento, { estado_flujo: 'ACTIVA' });
    
    // 2. Descontar inventario (Estado 1 = Asignado)
    const dto = p.payload;
    // Asumimos que DataAdapter está disponible globalmente
    if (dto.id_equipo) DataAdapter.update('Equipos', dto.id_equipo, { id_estado: 1 });
    if (dto.id_chip) DataAdapter.update('Chips', dto.id_chip, { id_estado: 1 });

    // 3. Notificar al área de soporte / empleado
    NotificationService.sendEmail({
      to: 'it-support@worldclasstravel.test', 
      subject: `Asignación #${p.id_documento} Autorizada`,
      body: 'La asignación ha sido autorizada. El equipo está listo para entrega.'
    });
  } catch (e) {
    Logger_ERP.error('EAM', 'Error en EAM_onAsignacionAprobada', e);
  }
}

/**
 * Reacciona a Workflow de Asignación Rechazado.
 */
function EAM_onAsignacionRechazada(context) {
  const p = context.payload;
  Logger_ERP.warn('EAM', `Asignación ${p.id_documento} RECHAZADA. Liberando reserva...`);
  try {
    DataAdapter.update('Asignaciones', p.id_documento, { estado_flujo: 'RECHAZADA' });
  } catch(e) {
    Logger_ERP.error('EAM', 'Error en EAM_onAsignacionRechazada', e);
  }
}
