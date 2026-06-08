/**
 * SD_Lead_Entity
 * Capa de Dominio: Entidad inmutable para representar un Lead de Ventas.
 */
const LeadEntity = {
  create: function(props) {
    return Object.freeze({
      id_lead:         props.id_lead || null,
      nombre_completo: props.nombre_completo,
      telefono:        props.telefono,
      email:           props.email || '',
      tipo_tdc:        props.tipo_tdc || 'NINGUNA',
      banco_emisor:    props.banco_emisor || 'NINGUNO',
      id_campana:      props.id_campana ? parseInt(props.id_campana, 10) : null,
      campana:         props.campana || '',
      estado:          props.estado || 'NUEVO',
      fuente:          props.fuente || 'DESCONOCIDA',
      notas:           props.notas || ''
    });
  }
};
