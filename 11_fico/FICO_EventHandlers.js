/**
 * FICO_EventHandlers
 * ─────────────────────────────────────────────────────────────────────────
 * Handlers del módulo FICO que reaccionan a eventos del EventBus.
 *
 * PROPÓSITO:
 *  - FICO reacciona a eventos de HCM para iniciar y terminar nóminas.
 *  - FICO reacciona a eventos de EAM para contabilizar gastos fijos de chips.
 *
 * CONVENCIÓN:
 *  - Nombre: FICO_on{EventType}
 *  - Parámetro: context (EventContext)
 *  - Registrado en: CORE_EventRegistry.js
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Reacciona a CandidateHired o EmployeeCreated.
 * FICO debe crear un expediente base de nómina para el nuevo empleado.
 */
function FICO_onCandidateHired(context) {
  const p = context.payload;
  Logger_ERP.info('FICO', 'CandidateHired recibido. Configurando cuenta de nómina para: ' + p.nombre);
  
  // Aquí FICO crearía el registro inicial de nómina en la tabla 'FICO_DatosNomina'
  // (Tabla que se agregará en futuras fases).
}

/**
 * Reacciona a EmployeeTerminated.
 * FICO debe congelar la nómina regular y generar la liquidación/finiquito.
 */
function FICO_onEmployeeTerminated(context) {
  const p = context.payload;
  Logger_ERP.info('FICO', 'EmployeeTerminated recibido. Calculando finiquito para: ' + p.id_empleado);
  
  // Lógica futura: Generar registro de finiquito.
}

/**
 * Reacciona a EquipmentAssigned (Ej: Vehículos o Computadoras).
 * FICO inicia el cálculo de depreciación del activo.
 */
function FICO_onEquipmentAssigned(context) {
  Logger_ERP.debug('FICO', 'EquipmentAssigned recibido. Evaluar si requiere depreciación asignada.');
}

/**
 * Reacciona a ChipAssigned.
 * FICO empieza a cruzar el costo mensual del chip con el centro de costos del empleado.
 */
function FICO_onChipAssigned(context) {
  const p = context.payload;
  Logger_ERP.info('FICO', `ChipAssigned recibido. Contabilizando costo de ${p.codigo_chip} al CC de empleado ${p.id_empleado}`);
}
