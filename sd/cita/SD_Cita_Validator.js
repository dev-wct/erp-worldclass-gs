/**
 * SD_Cita_Validator
 * Capa de Dominio: Validador para la creación de Citas.
 */
const CitaValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.id_lead) {
      e.push('El lead (prospecto) es obligatorio.');
    }
    if (!dto.id_empleado_agendo) {
      e.push('El empleado que agenda es obligatorio.');
    }
    if (!dto.restaurante || dto.restaurante.length < 2) {
      e.push('El nombre del restaurante es obligatorio.');
    }
    if (!dto.fecha_cita) {
      e.push('La fecha de la cita es obligatoria.');
    } else {
      const fCita = new Date(dto.fecha_cita);
      if (isNaN(fCita.getTime())) {
        e.push('La fecha de la cita no es válida.');
      }
    }
    if (!dto.hora_cita) {
      e.push('La hora de la cita es obligatoria.');
    }
    if (dto.num_acompanantes === null || isNaN(dto.num_acompanantes) || dto.num_acompanantes < 0) {
      e.push('El número de acompañantes debe ser mayor o igual a cero.');
    }

    return { valido: e.length === 0, errores: e };
  }
};
