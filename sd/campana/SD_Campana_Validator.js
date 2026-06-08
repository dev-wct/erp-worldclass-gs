/**
 * SD_Campana_Validator
 * Capa de Dominio: Validador de negocio y sintaxis para Campañas.
 */
const CampanaValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.nombre || dto.nombre.length < 3) {
      e.push('El nombre de la campaña es obligatorio y debe tener al menos 3 caracteres.');
    }
    if (!dto.fecha_inicio) {
      e.push('La fecha de inicio es obligatoria.');
    }
    if (!dto.fecha_fin) {
      e.push('La fecha de fin es obligatoria.');
    }
    if (dto.fecha_inicio && dto.fecha_fin) {
      const fInicio = new Date(dto.fecha_inicio);
      const fFin = new Date(dto.fecha_fin);
      if (isNaN(fInicio.getTime())) {
        e.push('La fecha de inicio no es válida.');
      }
      if (isNaN(fFin.getTime())) {
        e.push('La fecha de fin no es válida.');
      }
      if (!isNaN(fInicio.getTime()) && !isNaN(fFin.getTime()) && fInicio > fFin) {
        e.push('La fecha de inicio debe ser menor o igual a la fecha de fin.');
      }
    }
    if (dto.objetivo_citas === null || isNaN(dto.objetivo_citas) || dto.objetivo_citas < 0) {
      e.push('El objetivo de citas debe ser un número entero mayor o igual a cero.');
    }

    return { valido: e.length === 0, errores: e };
  }
};
