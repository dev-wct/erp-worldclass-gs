/**
 * HCM_EventHandlers
 * ─────────────────────────────────────────────────────────────────────────
 * Handlers del módulo HCM que reaccionan a eventos del EventBus.
 *
 * PROPÓSITO:
 *  - HCM no sabe que EREC existe. Solo sabe que cuando alguien es contratado
 *    (venga de donde venga), HCM debe crear el expediente del empleado.
 *  - Anti-acoplamiento: HCM nunca llama a EREC. EREC nunca llama a HCM.
 *    Solo se hablan a través del EventBus.
 *
 * CONVENCIÓN:
 *  - Nombre: HCM_on{EventType}
 *  - Parámetro: context (EventContext)
 *  - Registrado en: CORE_EventRegistry.js
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Reacciona a CandidateHired: crea el expediente del empleado en HCM.
 * Equivale al antiguo EmpleadoUseCases.contratar() llamado directamente desde EREC.
 *
 * @param {object} context — EventContext
 * @param {object} context.payload — {
 *   id_postulante_erec, id_bp, nombre, email, telefono,
 *   documento_identidad, cargo, id_empresa, id_departamento,
 *   id_rol, tipo_contrato, fecha_ingreso
 * }
 */
function HCM_onCandidateHired(context) {
  const p = context.payload;
  Logger.log('[HCM_EventHandlers] CandidateHired recibido | Candidato: ' + p.nombre + ' | EventID: ' + context.eventId);

  try {
    const dtoEmpleado = {
      id_postulante_erec : p.id_postulante_erec || null,
      id_bp              : p.id_bp              || null,
      nombre_completo    : p.nombre,
      dpi                : p.documento_identidad || '',
      email              : p.email              || '',
      telefono           : p.telefono           || '',
      id_empresa         : p.id_empresa         || '',
      id_departamento    : p.id_departamento    || '',
      id_rol             : p.id_rol             || '',
      tipo_contrato      : p.tipo_contrato      || 'TIEMPO_COMPLETO',
      fecha_ingreso      : p.fecha_ingreso ? new Date(p.fecha_ingreso) : new Date(),
    };

    const resultado = EmpleadoUseCases.contratar(dtoEmpleado);

    if (resultado.ok) {
      Logger.log('[HCM_EventHandlers] Empleado creado exitosamente: ' + (resultado.data ? resultado.data.id_empleado : '—'));
      // Publicar EmployeeCreated para que EAM y otros módulos reaccionen
      EventBus.publishSafe('EmployeeCreated', {
        id_empleado    : resultado.data ? resultado.data.id_empleado : null,
        nombre         : p.nombre,
        email          : p.email,
        cargo          : p.cargo || '',
        id_empresa     : p.id_empresa,
        id_departamento: p.id_departamento,
      }, { source: 'HCM' });
    } else {
      Logger.log('[HCM_EventHandlers] Error al crear empleado: ' + (resultado.errores || []).join(', '));
      throw new Error((resultado.errores || ['Error desconocido']).join(', '));
    }
  } catch (e) {
    Logger.log('[HCM_EventHandlers] Excepción en HCM_onCandidateHired: ' + e.message);
    throw e; // re-lanzar para que EventBus registre el error en el log
  }
}

/**
 * Reacciona a PayrollProcessed: actualiza el historial de pagos en el expediente.
 * @param {object} context — EventContext { payload: { periodo, total, id_empresa } }
 */
function HCM_onPayrollProcessed(context) {
  const p = context.payload;
  Logger.log('[HCM_EventHandlers] PayrollProcessed | Período: ' + p.periodo + ' | Total: ' + p.total);
  // TODO: actualizar campo ultima_nomina en ficha de empleado cuando se implemente FICO completo
}

/**
 * Reacciona a EquipmentAssigned: registra el equipo en el expediente del empleado.
 * @param {object} context — EventContext { payload: { id_empleado, nombre_equipo, serie } }
 */
function HCM_onEquipmentAssigned(context) {
  const p = context.payload;
  Logger.log('[HCM_EventHandlers] EquipmentAssigned | Empleado: ' + p.id_empleado + ' | Equipo: ' + p.nombre_equipo);
  // TODO: marcar en expediente HCM que el empleado tiene equipo asignado
}
