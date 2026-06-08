/**
 * SD_Campana_Entity
 * Capa de Dominio: Entidad inmutable para representar una Campaña de Call Center.
 */
const CampanaEntity = {
  create: function(props) {
    return Object.freeze({
      id_campana:     props.id_campana || null,
      nombre:         props.nombre,
      fecha_inicio:   props.fecha_inicio ? new Date(props.fecha_inicio) : null,
      fecha_fin:      props.fecha_fin ? new Date(props.fecha_fin) : null,
      objetivo_citas: props.objetivo_citas !== undefined && props.objetivo_citas !== null ? parseInt(props.objetivo_citas, 10) : 0,
      estado:         props.estado || 'PLANIFICADA'
    });
  }
};
