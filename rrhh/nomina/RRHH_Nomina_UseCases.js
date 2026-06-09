/**
 * RRHH_Nomina_UseCases
 * Capa de Aplicación: Orquestador de cálculo y preparación de nómina.
 *
 * Responsabilidades:
 *  - Consultar las ventas concretadas en el módulo SD para calcular comisiones.
 *  - Calcular el total bruto de nómina (sueldo + comisiones + bonos - deducciones).
 *  - Generar una Solicitud de Pago lista para ser dispersada por el módulo FICO.
 *
 * Paradigmas:
 *  - LISP  : Pipeline funcional (DTO → Validación → Cálculo → Solicitud).
 *  - POO   : Consume entidades de Empleado sin acoplarse a su persistencia.
 *  - COBOL : Trata cada nómina como un registro de negocio bien estructurado.
 */
const NominaUseCases = {

  /**
   * Calcula las comisiones devengadas por un agente en un período de quincena.
   * Regla de negocio: Q500 por cada Cita con resultado_venta = 'VENTA' o 'VENTA_CERRADA'.
   *
   * Insumo: Módulo SD (Citas).
   * Salida: Resumen de ventas y monto total de comisiones.
   *
   * @param {number} idEmpleado
   * @param {number} anio
   * @param {number} mes      - Índice 0-11 (Enero = 0)
   * @param {number} quincena - 1 (días 1-15) | 2 (días 16-31)
   * @returns {{ ok: boolean, ventas_concretadas: number, total_comisiones: number, detalle_citas: string[] }}
   */
  calcularComisiones: function(idEmpleado, anio, mes, quincena) {
    try {
      const todasLasCitas = DataAdapter.findAll('Citas', {
        id_empleado_agendo: parseInt(idEmpleado, 10)
      });

      // Pipeline funcional: filtrar por período → filtrar por resultado de venta
      const citasDelPeriodo = todasLasCitas.filter(function(cita) {
        if (!cita.fecha_cita) return false;
        const fecha    = new Date(cita.fecha_cita);
        const esAnio   = fecha.getFullYear() === parseInt(anio, 10);
        const esMes    = fecha.getMonth()    === parseInt(mes, 10);
        if (!esAnio || !esMes) return false;
        const dia      = fecha.getDate();
        return parseInt(quincena, 10) === 1
          ? (dia >= 1  && dia <= 15)
          : (dia >= 16 && dia <= 31);
      });

      const ventasConcretadas = citasDelPeriodo.filter(function(cita) {
        const resultado = String(cita.resultado_venta).toUpperCase();
        return resultado === 'VENTA' || resultado === 'VENTA_CERRADA';
      });

      const COMISION_POR_VENTA = 500; // Q500 por venta concretada (regla de negocio)
      const totalComisiones    = ventasConcretadas.length * COMISION_POR_VENTA;

      return {
        ok:                  true,
        ventas_concretadas:  ventasConcretadas.length,
        total_comisiones:    totalComisiones,
        detalle_citas:       ventasConcretadas.map(function(v) {
          return 'ID Cita: ' + v.id_cita + ' - Restaurante: ' + v.restaurante;
        })
      };
    } catch (err) {
      return {
        ok:                 false,
        ventas_concretadas: 0,
        total_comisiones:   0,
        errores:            [err.message]
      };
    }
  },

  /**
   * Prepara y calcula la nómina bruta de un empleado para un período dado.
   * Recibe los montos base del formulario y recalcula el total_neto en el servidor.
   * Esta función es el "upstream" del módulo FICO: genera la Solicitud de Pago.
   *
   * IMPORTANTE: El total_neto SIEMPRE se recalcula aquí en el servidor.
   * Cualquier valor enviado desde el cliente (AppSheet o formulario) es ignorado
   * para garantizar integridad financiera y proteger contra manipulación del frontend.
   *
   * @param {{ id_empleado, anio, quincena, sueldo_base, comisiones, bonos, deducciones }} rawForm
   * @returns {{ ok: boolean, solicitud_pago: object, mensaje: string }}
   */
  prepararSolicitudPago: function(rawForm) {
    // Paso 1: Normalizar entrada usando DTO
    const dto = NominaDTO.fromForm(rawForm);

    // Paso 2: Validar campos usando Validator
    const validacion = NominaValidator.validarPreCalculo(dto);
    if (!validacion.valido) {
      return {
        ok:      false,
        errores: validacion.errores
      };
    }

    // Paso 3: Recálculo obligatorio en el servidor (Anti-fraude frontend)
    const total_neto = dto.sueldo_base + dto.comisiones + dto.bonos - dto.deducciones;

    if (total_neto < 0) {
      return {
        ok:      false,
        errores: ['El total neto de la nómina no puede ser negativo. Revisar deducciones.']
      };
    }

    const solicitud = Object.assign({}, dto, {
      total_neto: total_neto // Calculado en servidor, nunca en cliente
    });

    return {
      ok:             true,
      solicitud_pago: solicitud,
      mensaje:        'Nómina calculada correctamente. Total neto: Q' + total_neto.toFixed(2)
    };
  }
};
