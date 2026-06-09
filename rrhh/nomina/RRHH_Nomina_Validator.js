/**
 * RRHH_Nomina_Validator
 * Capa de Dominio: Validador de negocio para el pre-cálculo de nómina.
 */
const NominaValidator = {
  validarPreCalculo: function(dto) {
    const e = [];
    if (!dto.id_empleado) {
      e.push('El empleado es obligatorio.');
    }
    if (!dto.anio || isNaN(dto.anio) || dto.anio < 2020) {
      e.push('El año de la nómina no es válido.');
    }
    if (!dto.quincena || (dto.quincena !== 1 && dto.quincena !== 2)) {
      e.push('La quincena es obligatoria y debe ser 1 o 2.');
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
    return { valido: e.length === 0, errores: e };
  }
};
