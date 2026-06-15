/**
 * EREC_Vacante_Validator
 * Reglas de negocio para la creación y modificación de Vacantes.
 */
const VacanteValidator = {

  validarCreacion: function(dto) {
    const e = [];

    if (!dto.titulo || dto.titulo.length < 3)
      e.push('El título de la vacante es obligatorio (mínimo 3 caracteres).');

    if (!dto.id_empresa)
      e.push('Debe seleccionar la empresa que abre la vacante.');

    if (!dto.id_departamento)
      e.push('Debe seleccionar el departamento de la vacante.');

    if (!dto.plazas_disponibles || dto.plazas_disponibles < 1)
      e.push('Debe haber al menos 1 plaza disponible.');

    if (dto.fecha_cierre && dto.fecha_apertura) {
      const apertura = new Date(dto.fecha_apertura);
      const cierre   = new Date(dto.fecha_cierre);
      if (cierre <= apertura)
        e.push('La fecha de cierre debe ser posterior a la fecha de apertura.');
    }

    if (dto.estado && !VacanteEntity.ESTADOS.includes(dto.estado))
      e.push('Estado de vacante no válido: ' + dto.estado);

    return { valido: e.length === 0, errores: e };
  },

  validarCambioEstado: function(estadoActual, nuevoEstado) {
    const transicionesValidas = {
      BORRADOR:   ['ABIERTA', 'CANCELADA'],
      ABIERTA:    ['EN_PROCESO', 'CERRADA', 'CANCELADA'],
      EN_PROCESO: ['CERRADA', 'CANCELADA'],
      CERRADA:    [],
      CANCELADA:  [],
    };
    const permitidos = transicionesValidas[estadoActual] || [];
    if (!permitidos.includes(nuevoEstado)) {
      return {
        valido: false,
        errores: ['No se puede cambiar de ' + estadoActual + ' a ' + nuevoEstado + '.'],
      };
    }
    return { valido: true, errores: [] };
  },
};
