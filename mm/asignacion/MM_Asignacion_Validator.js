/**
 * MM_Asignacion_Validator
 * Capa de Dominio: Validador de negocio para Asignaciones de Equipos/Chips.
 */
const AsignacionValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.id_empleado) e.push('El empleado es obligatorio.');
    if (!dto.id_equipo && !dto.id_chip) {
      e.push('Debe seleccionar al menos un equipo o un chip para la asignación.');
    }
    if (!dto.fecha_asignacion) e.push('La fecha de asignación es obligatoria.');

    if (dto.link_acta) {
      const esUrl = dto.link_acta.startsWith('http://') || dto.link_acta.startsWith('https://');
      if (!esUrl) e.push('El enlace del acta de entrega no es una URL válida.');
    }

    return { valido: e.length === 0, errores: e };
  }
};
