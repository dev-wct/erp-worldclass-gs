/**
 * SD_Llamada_Validator
 * Capa de Dominio: Validador para el registro de Llamadas.
 */
const LlamadaValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.id_lead) {
      e.push('El lead asociado es obligatorio.');
    }
    if (!dto.id_empleado) {
      e.push('El empleado (agente) que realiza la llamada es obligatorio.');
    }
    if (!dto.resultado) {
      e.push('El resultado de la llamada es obligatorio.');
    }
    if (dto.duracion_seg === null || isNaN(dto.duracion_seg) || dto.duracion_seg < 0) {
      e.push('La duración de la llamada debe ser un número mayor o igual a cero.');
    }
    if (dto.fecha_hora) {
      const fHora = new Date(dto.fecha_hora);
      if (isNaN(fHora.getTime())) {
        e.push('La fecha y hora de la llamada no es válida.');
      }
    }

    return { valido: e.length === 0, errores: e };
  }
};
