const EmpleadoEntity = {
  create: function(props) {
    return Object.freeze({
      id_empleado:     props.id_empleado || null,
      id_postulante:   props.id_postulante || null,
      nombre_completo: props.nombre_completo,
      dpi:             props.dpi,
      email:           props.email,
      telefono:        props.telefono,
      id_departamento: props.id_departamento,
      id_empresa:      props.id_empresa,
      id_sucursal:     props.id_sucursal || null,
      id_unidad:       props.id_unidad || null,
      id_rol:          props.id_rol,
      activo:          props.activo,
      fecha_ingreso:   props.fecha_ingreso,
      fecha_salida:    props.fecha_salida || null,
      tipo_contrato:   props.tipo_contrato,
    });
  },
};
