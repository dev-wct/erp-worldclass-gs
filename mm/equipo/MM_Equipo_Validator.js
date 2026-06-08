/**
 * MM_Equipo_Validator
 * Capa de Dominio: Validador de negocio y sintaxis para Equipos.
 */
const EquipoValidator = {
  validarCreacion: function(dto) {
    const e = [];
    if (!dto.id_tipo) e.push('El Tipo de Equipo es obligatorio.');
    if (!dto.id_marca) e.push('La Marca del Equipo es obligatoria.');
    if (!dto.modelo || dto.modelo.length < 2) e.push('El Modelo es obligatorio y debe tener al menos 2 caracteres.');
    if (!dto.serial || dto.serial.length < 4) e.push('El Número de Serie (Serial) es obligatorio y debe tener al menos 4 caracteres.');
    if (!dto.id_empresa) e.push('La Empresa Propietaria es obligatoria.');
    if (!dto.id_estado) e.push('El Estado inicial del activo es obligatorio.');
    
    if (dto.valor_compra !== null && (isNaN(dto.valor_compra) || dto.valor_compra < 0)) {
      e.push('El valor de compra debe ser un número positivo.');
    }
    
    if (dto.fecha_compra && dto.garantia_hasta) {
      const fCompra = new Date(dto.fecha_compra);
      const fGarantia = new Date(dto.garantia_hasta);
      if (fGarantia < fCompra) {
        e.push('La fecha de vencimiento de la garantía no puede ser anterior a la fecha de compra.');
      }
    }
    
    // Validar URLs si existen
    const esUrlValida = (u) => u.startsWith('http://') || u.startsWith('https://');
    if (dto.link_factura && !esUrlValida(dto.link_factura)) e.push('El enlace de la factura no es una URL válida.');
    if (dto.link_foto && !esUrlValida(dto.link_foto)) e.push('El enlace de la foto no es una URL válida.');

    return { valido: e.length === 0, errores: e };
  }
};
