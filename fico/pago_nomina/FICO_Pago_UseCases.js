/**
 * FICO_Pago_UseCases
 * Capa de Aplicación: Casos de uso EXCLUSIVAMENTE financieros.
 *
 * Responsabilidad única (SAP FICO):
 *  - Recibir una Solicitud de Pago validada y pre-calculada por RRHH.
 *  - Validar que no exista un pago duplicado para el mismo período.
 *  - Persistir el registro financiero en la tabla Pagos_Nomina (dispersión).
 *
 * FICO NO calcula nóminas ni comisiones.
 * Esa responsabilidad pertenece a RRHH/NominaUseCases.
 *
 * Paradigmas:
 *  - LISP  : Pipeline lineal (Solicitud → Validación de duplicado → Persistencia → Response).
 *  - POO   : Consume PagoEntity y PagoRepo sin conocer su implementación interna.
 *  - COBOL : Registro transaccional de dispersión financiera (equivalente a FI-AP en SAP).
 */
const PagoUseCases = {

  /**
   * Registra la dispersión de un pago de nómina en el sistema financiero.
   *
   * Flujo (Pipeline):
   *   rawForm → NominaUseCases.prepararSolicitudPago (cálculo en servidor)
   *           → PagoValidator.validarCreacion (reglas de negocio FICO)
   *           → Verificación de duplicado por empleado/período
   *           → PagoEntity.create + PagoRepo.insert
   *           → PagoDTO.toResponse
   *
   * @param {object} rawForm - Datos crudos enviados desde AppSheet o formulario.
   * @returns {{ ok: boolean, data: object, mensaje: string }}
   */
  registrar: function(rawForm) {

    // Paso 1: Delegar el cálculo del total_neto a RRHH (nunca confiar en el cliente)
    const solicitud = NominaUseCases.prepararSolicitudPago(rawForm);
    if (!solicitud.ok) {
      return { ok: false, errores: solicitud.errores };
    }

    // Paso 2: Mapear la solicitud al DTO de FICO para validación financiera
    const dto = PagoDTO.fromForm(solicitud.solicitud_pago);

    // Paso 3: Validar reglas de negocio financieras (montos, fechas, método de pago)
    const validacion = PagoValidator.validarCreacion(dto);
    if (!validacion.valido) {
      return { ok: false, errores: validacion.errores };
    }

    // Paso 4: Verificar que no exista ya una nómina pagada para este empleado y período
    const existentes = PagoRepo.findByEmpleadoPeriodo(dto.id_empleado, dto.anio, dto.quincena);
    if (existentes.length > 0) {
      return {
        ok:      false,
        errores: [
          'Ya se registró el pago de nómina para este empleado en la Quincena '
          + dto.quincena + ' del año ' + dto.anio + '.'
        ]
      };
    }

    // Paso 5: Crear entidad inmutable y persistir el desembolso financiero
    const entidad = PagoEntity.create(dto);
    const user    = DataAdapter.getCurrentUser();
    const saved   = PagoRepo.insert(entidad, user);

    return {
      ok:      true,
      data:    PagoDTO.toResponse(saved),
      mensaje: 'Pago de nómina registrado exitosamente para '
               + saved.empleado + ' (ID Pago: ' + saved.id_pago + ').'
    };
  }
};
