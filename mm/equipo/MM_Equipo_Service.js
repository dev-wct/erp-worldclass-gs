/**
 * MM_Equipo_Service
 * Capa de Dominio: Servicio de negocio para Equipos (depreciación, vencimiento de garantía).
 */
const EquipoService = {

  /** Determina si el equipo está actualmente cubierto por la garantía */
  tieneGarantiaActiva: function(equipo) {
    if (!equipo.garantia_hasta) return false;
    return new Date(equipo.garantia_hasta) > new Date();
  },

  /** Genera el código interno único de equipo basado en el ID secuencial */
  generarCodigoInterno: function(secuencial) {
    return 'EQ-' + String(secuencial).padStart(4, '0');
  }
};
