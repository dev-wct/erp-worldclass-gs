/**
 * EREC_Schema
 * ─────────────────────────────────────────────────────────────────────────
 * Módulo 08 — E-Recruiting (Reclutamiento Electrónico)
 * Inspirado en SAP E-Recruiting / SuccessFactors Recruiting.
 *
 * ENTIDADES:
 *
 *  EREC_Vacantes          → La posición abierta que la empresa quiere cubrir.
 *                           Es el equivalente a una "Requisición de Personal"
 *                           en SAP HCM (PA40 / PP01).
 *
 *  EREC_ProcesosSeleccion → El proceso de evaluación asociado a una vacante.
 *                           Una vacante puede tener uno o varios procesos
 *                           (ej. proceso por etapas, proceso express).
 *
 *  EREC_Postulantes       → Los candidatos que se postulan a una vacante.
 *                           Desacoplado de RRHH_Postulantes (que era un
 *                           receptor genérico de Google Forms).
 *                           Aquí el postulante está vinculado a una vacante
 *                           y tiene un pipeline de etapas.
 *
 *  EREC_EntrevistasNotas  → Registro de entrevistas y observaciones del
 *                           reclutador por candidato. Equivalente al
 *                           "Talent Assessment" de SAP SuccessFactors.
 *
 * FLUJO:
 *  Vacante → [genera link público o token individual]
 *  Candidato postula → EREC_Postulantes (estado: POSTULADO)
 *  Reclutador avanza etapa → ENTREVISTA → PRUEBA → OFERTA → CONTRATADO
 *  CONTRATADO → RRHH.EmpleadoUseCases.contratar()  (un solo click)
 * ─────────────────────────────────────────────────────────────────────────
 */
const EREC_Schema = {

  EREC_Vacantes: {
    pk: 'id_vacante',
    columns: [
      'id_vacante',
      'codigo',             // EREC-0001 (autogenerado)
      'titulo',             // "Agente de Call Center", "Ejecutivo de Ventas"
      'descripcion',        // Descripción del puesto
      'requisitos',         // Requisitos mínimos (texto)
      'id_empresa',         // FK → CAT_Empresas
      'id_departamento',    // FK → CAT_Departamentos
      'id_rol_destino',     // FK → CAT_Roles (a qué rol se contratará)
      'plazas_disponibles', // Número de posiciones a cubrir
      'plazas_cubiertas',   // Conteo automático al contratar
      'fecha_apertura',
      'fecha_cierre',       // Fecha límite para postular
      'estado',             // BORRADOR | ABIERTA | EN_PROCESO | CERRADA | CANCELADA
      'created_at',
      'updated_at',
      'created_by',
    ],
    fk: {
      id_empresa:      'CAT_Empresas',
      id_departamento: 'CAT_Departamentos',
      id_rol_destino:  'CAT_Roles',
    },
  },

  EREC_Postulantes: {
    pk: 'id_postulante_erec',
    columns: [
      'id_postulante_erec',
      'id_vacante',          // FK → EREC_Vacantes
      'nombre_completo',
      'documento_identidad', // Número de cédula/DPI/DUI según país
      'telefono',
      'email',
      'link_cv',             // URL en Drive (subido desde el formulario)
      'fuente',              // TOKEN_INDIVIDUAL | LINK_PUBLICO | REFERIDO | INTERNO
      'etapa_actual',        // POSTULADO | REVISION | ENTREVISTA | PRUEBA | OFERTA | CONTRATADO | DESCARTADO
      'puntaje',             // 0-100 (asignado por el reclutador)
      'notas_candidato',     // Notas libres del postulante (del formulario)
      'fecha_postulacion',
      'created_at',
      'updated_at',
      'created_by',
    ],
    fk: { id_vacante: 'EREC_Vacantes' },
  },

  EREC_EntrevistasNotas: {
    pk: 'id_entrevista',
    columns: [
      'id_entrevista',
      'id_postulante_erec',
      'id_vacante',
      'id_entrevistador',    // Referencia suave a Empleados — no declarada como FK
      'fecha_entrevista',    // para evitar dependencia de orden entre módulos.
      'tipo',                // TELEFONICA | PRESENCIAL | VIDEO | PRUEBA_TECNICA
      'resultado',           // APROBADO | RECHAZADO | PENDIENTE
      'puntaje',             // 0-100
      'notas',
      'created_at',
      'created_by',
    ],
    fk: {
      id_postulante_erec: 'EREC_Postulantes',
      id_vacante:         'EREC_Vacantes',
      // id_entrevistador → Empleados: referencia suave (RRHH es módulo separado)
    },
  },

  /**
   * EREC_LinksPostulacion
   * Reemplaza PostulantesTokens de RRHH — ahora los tokens pertenecen
   * a una vacante específica, no a una campaña de marketing.
   *
   * MODOS:
   *   INDIVIDUAL → Token personal para un candidato específico (1 solo uso)
   *   PUBLICO    → Link abierto para publicar en redes / landing page (usos ilimitados)
   */
  EREC_LinksPostulacion: {
    pk: 'id_link',
    columns: [
      'id_link',
      'token',
      'link_url',            // URL completa lista para copiar
      'modo',                // INDIVIDUAL | PUBLICO
      'id_vacante',          // FK → EREC_Vacantes
      'email_destino',       // Solo modo INDIVIDUAL
      'nombre_destino',      // Solo modo INDIVIDUAL
      'creado_por',
      'creado_at',
      'expira_at',
      'estado',              // PENDIENTE | USADO | EXPIRADO
      'usado_at',
    ],
    fk: { id_vacante: 'EREC_Vacantes' },
  },

};
