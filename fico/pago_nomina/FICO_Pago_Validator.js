/**
 * FICO_Pago_Validator
 * Capa de Dominio: Validador de negocio y sintaxis para Pagos de Nómina.
 */
const PagoValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.id_empleado) {
      e.push('El empleado es obligatorio.');
    }
    if (!dto.anio || isNaN(dto.anio) || dto.anio < 2020) {
      e.push('El año del pago no es válido.');
    }
    if (!dto.quincena || (dto.quincena !== 1 && dto.quincena !== 2)) {
      e.push('La quincena es obligatoria y debe ser 1 (primera quincena) o 2 (segunda quincena).');
    }
    if (dto.sueldo_base === null || isNaN(dto.sueldo_base) || dto.sueldo_base < 0) {
      e.push('El sueldo base debe ser un número positivo.');
    }
    if (dto.comisiones === null || isNaN(dto.comisiones) || dto.comisiones < 0) {
      e.push('Las comisiones deben ser un número positivo o cero.');
    }
    if (dto.bonos === null || isNaN(dto.bonos) || dto.bonos < 0) {
      e.push('Los bonos deben ser un número positivo o cero.');
    }
    if (dto.deducciones === null || isNaN(dto.deducciones) || dto.deducciones < 0) {
      e.push('Las deducciones deben ser un número positivo o cero.');
    }
    if (dto.total_neto < 0) {
      e.push('El total neto de la nómina no puede ser negativo.');
    }

    if (dto.pagado) {
      if (!dto.fecha_pago) {
        e.push('Si el pago ya fue realizado, la fecha de pago es obligatoria.');
      } else {
        const fPago = new Date(dto.fecha_pago);
        if (isNaN(fPago.getTime())) {
          e.push('La fecha de pago no es válida.');
        }
      }
      if (!dto.metodo_pago) {
        e.push('Si el pago ya fue realizado, el método de pago es obligatorio.');
      }
    }

    return { valido: e.length === 0, errores: e };
  }
};
