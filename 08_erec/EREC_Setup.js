/**
 * EREC_Setup
 * Datos semilla para el módulo de E-Recruiting.
 * Se ejecuta automáticamente tras sincronizar el schema EREC.
 */
const EREC_Setup = {

  SEED_DATA: {
    /**
     * Etapas del pipeline de selección — son datos maestros de referencia.
     * No se crean como tabla separada (son un enum en código) porque
     * las etapas son fijas en el proceso estándar.
     * Se documentan aquí para referencia del equipo.
     *
     * Orden del pipeline:
     *  1. POSTULADO   → Candidato recibido, pendiente de revisión
     *  2. REVISION    → Reclutador revisando CV y perfil
     *  3. ENTREVISTA  → Entrevista agendada o en proceso
     *  4. PRUEBA      → Prueba técnica o psicológica
     *  5. OFERTA      → Oferta de trabajo enviada
     *  6. CONTRATADO  → Proceso completado → pasa a RRHH
     *  7. DESCARTADO  → No avanza en el proceso (con razón documentada)
     */
  },

  /**
   * Sincroniza las tablas EREC e inserta datos semilla si están vacías.
   */
  syncAndSeed: function() {
    Logger.log('=== [EREC] Sincronizando módulo E-Recruiting ===');
    SetupEngine.syncDatabase(EREC_Schema);
    Logger.log('=== [EREC] Sincronización completada ===');
  },
};
