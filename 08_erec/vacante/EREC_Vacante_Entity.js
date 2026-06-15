/**
 * EREC_Vacante_Entity
 * Objeto de dominio puro — representa una posición abierta de reclutamiento.
 * Inmutable por diseño (Object.freeze).
 */
const VacanteEntity = {
  create: function(props) {
    return Object.freeze({
      id_vacante:          props.id_vacante          || null,
      codigo:              props.codigo              || '',
      titulo:              props.titulo              || '',
      descripcion:         props.descripcion         || '',
      requisitos:          props.requisitos          || '',
      id_empresa:          props.id_empresa          || null,
      id_departamento:     props.id_departamento     || null,
      id_rol_destino:      props.id_rol_destino      || null,
      plazas_disponibles:  parseInt(props.plazas_disponibles)  || 1,
      plazas_cubiertas:    parseInt(props.plazas_cubiertas)    || 0,
      fecha_apertura:      props.fecha_apertura      ? new Date(props.fecha_apertura) : new Date(),
      fecha_cierre:        props.fecha_cierre        ? new Date(props.fecha_cierre)   : null,
      estado:              props.estado              || 'BORRADOR',
    });
  },

  ESTADOS: ['BORRADOR', 'ABIERTA', 'EN_PROCESO', 'CERRADA', 'CANCELADA'],
};
