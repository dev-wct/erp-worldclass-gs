/**
 * EREC_Entrevista_Repository
 * Persistencia de entrevistas y evaluaciones de candidatos.
 * Equivalente al "Talent Assessment" de SAP SuccessFactors.
 */
const ErecEntrevistaRepo = new class extends BaseRepository {
  constructor() {
    super('EREC_EntrevistasNotas', (raw) => raw);
  }

  buildRecord(id, entity, now, user) {
    return {
      id_entrevista:      id,
      id_postulante_erec: entity.id_postulante_erec || '',
      id_vacante:         entity.id_vacante         || '',
      id_entrevistador:   entity.id_entrevistador   || '',
      fecha_entrevista:   entity.fecha_entrevista   ? new Date(entity.fecha_entrevista) : now,
      tipo:               entity.tipo               || 'PRESENCIAL',
      resultado:          entity.resultado          || 'PENDIENTE',
      puntaje:            parseInt(entity.puntaje)  || 0,
      notas:              entity.notas              || '',
      created_at:         now,
      created_by:         user,
    };
  }

  findByPostulante(idPostulante) {
    return this.findByField('id_postulante_erec', idPostulante);
  }

  findByVacante(idVacante) {
    return this.findByField('id_vacante', idVacante);
  }
}();


/**
 * ErecEntrevistaUseCases
 * Registra entrevistas y calcula el puntaje promedio del candidato.
 */
const ErecEntrevistaUseCases = {

  TIPOS:      ['TELEFONICA', 'PRESENCIAL', 'VIDEO', 'PRUEBA_TECNICA'],
  RESULTADOS: ['APROBADO', 'RECHAZADO', 'PENDIENTE'],

  /**
   * Registra una entrevista o evaluación para un candidato.
   */
  registrar: function(dto) {
    var errores = [];

    if (!dto.id_postulante_erec)
      errores.push('El candidato es requerido.');
    if (!dto.tipo || !this.TIPOS.includes(dto.tipo.toUpperCase()))
      errores.push('Tipo de entrevista no válido. Use: ' + this.TIPOS.join(', '));
    if (dto.puntaje !== undefined && (dto.puntaje < 0 || dto.puntaje > 100))
      errores.push('El puntaje debe estar entre 0 y 100.');

    if (errores.length > 0) return { ok: false, errores: errores };

    var user  = DataAdapter.getCurrentUser();
    var saved = ErecEntrevistaRepo.insert(dto, user);

    // Actualizar puntaje promedio del candidato
    this._actualizarPuntajePromedio(dto.id_postulante_erec);

    return {
      ok:      true,
      data:    { id_entrevista: saved.id_entrevista },
      mensaje: 'Entrevista registrada exitosamente.',
    };
  },

  /**
   * Recalcula el puntaje promedio del candidato basado en todas sus entrevistas.
   * El puntaje vive en EREC_Postulantes.puntaje.
   */
  _actualizarPuntajePromedio: function(idPostulante) {
    try {
      var entrevistas = ErecEntrevistaRepo.findByPostulante(idPostulante)
        .filter(function(e) { return e.resultado !== 'PENDIENTE' && parseInt(e.puntaje) > 0; });

      if (entrevistas.length === 0) return;

      var suma = entrevistas.reduce(function(acc, e) { return acc + (parseInt(e.puntaje) || 0); }, 0);
      var promedio = Math.round(suma / entrevistas.length);

      ErecPostulanteRepo.update(idPostulante, { puntaje: promedio });
    } catch(e) {
      Logger.log('[EREC] Error actualizando puntaje: ' + e.message);
    }
  },

  /**
   * Obtiene el historial completo de entrevistas de un candidato.
   */
  getHistorial: function(idPostulante) {
    return ErecEntrevistaRepo.findByPostulante(idPostulante);
  },
};
