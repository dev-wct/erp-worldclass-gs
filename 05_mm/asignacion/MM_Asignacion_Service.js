/**
 * MM_Asignacion_Service
 * Capa de Dominio: Lógica de negocio para Asignaciones.
 */
const AsignacionService = {

  /** Verifica que un equipo no tenga una asignación activa vigente */
  equipoDisponible: function(idEquipo) {
    if (!idEquipo) return true;
    const asignaciones = DataAdapter.findAll('Asignaciones', { id_equipo: idEquipo, activo: true });
    return asignaciones.length === 0;
  },

  /** Verifica que un chip no tenga una asignación activa vigente */
  chipDisponible: function(idChip) {
    if (!idChip) return true;
    const asignaciones = DataAdapter.findAll('Asignaciones', { id_chip: idChip, activo: true });
    return asignaciones.length === 0;
  }
};
