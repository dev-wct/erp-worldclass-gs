/**
 * FICO_CostoChip_UseCases
 * Capa de Aplicación: Casos de uso de control financiero de chips.
 */
const CostoChipUseCases = {
  registrar: function(rawForm) {
    const idChip = parseInt(rawForm.id_chip, 10);
    const anio = parseInt(rawForm.anio, 10);
    const mes = parseInt(rawForm.mes, 10);
    const monto = parseFloat(rawForm.monto);

    if (!idChip) return { ok: false, errores: ['El chip es obligatorio.'] };
    if (!anio || isNaN(anio) || anio < 2020) return { ok: false, errores: ['El año no es válido.'] };
    if (!mes || isNaN(mes) || mes < 1 || mes > 12) return { ok: false, errores: ['El mes no es válido.'] };
    if (isNaN(monto) || monto < 0) return { ok: false, errores: ['El monto del costo debe ser un número positivo.'] };

    // Validar existencia del chip
    const chip = DataAdapter.findById('Chips', idChip);
    if (!chip) {
      return { ok: false, errores: ['El chip con ID ' + idChip + ' no existe en inventario.'] };
    }

    const entidad = CostoChipEntity.create({
      id_chip: idChip,
      anio: anio,
      mes: mes,
      monto: monto,
      pagado: rawForm.pagado === true || rawForm.pagado === 'true',
      observaciones: rawForm.observaciones || ''
    });

    const saved = CostoChipRepo.insert(entidad);

    return {
      ok: true,
      mensaje: 'Costo mensual registrado para el Chip ' + chip.codigo_interno + ' (Monto: Q' + saved.monto.toFixed(2) + ').'
    };
  }
};
