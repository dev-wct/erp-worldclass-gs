const PostulanteEntity = {
  create: function(props) {
    return Object.freeze({
      id_postulante:     props.id_postulante     || null,
      nombre_completo:   props.nombre_completo,
      dpi:               props.dpi               || '',
      email:             props.email             || '',
      telefono:          props.telefono          || '',
      fuente:            props.fuente            || 'FORMULARIO_PUBLICO',
      id_campana:        props.id_campana        || '',
      fecha_postulacion: props.fecha_postulacion ? new Date(props.fecha_postulacion) : new Date(),
      estado:            props.estado            || 'POSTULADO',
      notas:             props.notes || props.notas || '',
      link_cv:           props.link_cv           || '',
    });
  },
};
