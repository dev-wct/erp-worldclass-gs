/**
 * MDM_Schema
 * ─────────────────────────────────────────────────────────────────────────
 * Contiene las tablas maestras compartidas por todo el holding.
 *
 * CENTRO DEL ERP: Business Partner
 *   Toda persona u organización del sistema es un Business Partner.
 *   Los módulos (HCM, SD, EREC) referencian al BP vía id_bp.
 *   El BP se crea automáticamente al registrar cualquier entidad — nunca
 *   de forma manual por el usuario.
 * ─────────────────────────────────────────────────────────────────────────
 */
const MDM_Schema = {

  /**
   * BP_MASTER — Identidad única transversal.
   * Equivalente a SAP Business Partner (transaction BP).
   *
   * tipo_bp:
   *   PERSONA_FISICA   → se identifica con cédula/DPI/DUI (personas)
   *   PERSONA_JURIDICA → se identifica con RUC/NIT/RFC (empresas)
   *
   * tipo_documento + numero_documento = identificador único natural.
   * El sistema deduplica por esta combinación antes de crear un BP nuevo.
   */
  BP_MASTER: {
    pk: 'id_bp',
    columns: [
      'id_bp',
      'tipo_bp',            // PERSONA_FISICA | PERSONA_JURIDICA
      'tipo_documento',     // CEDULA | DPI | DUI | DNI | RUC | NIT | RFC | PASAPORTE
      'numero_documento',   // número del documento — clave de deduplicación
      'nombre',             // nombre completo o razón social
      'email',
      'telefono',
      'direccion',          // Dirección física o fiscal
      'activo',
      'created_at',
      'created_by',
    ],
  },

  /**
   * BP_Roles — Roles activos de cada BP.
   * Un BP puede tener múltiples roles simultáneos.
   * Ejemplo: Juan Pérez es POSTULANTE (EREC) y luego EMPLEADO (HCM)
   *          bajo el mismo id_bp — sin duplicar datos de identidad.
   */
  BP_Roles: {
    pk: 'id_rol_bp',
    columns: [
      'id_rol_bp',
      'id_bp',          // FK → BP_MASTER
      'rol',            // CLIENTE | EMPLEADO | POSTULANTE | PROVEEDOR | EMPRESA
      'modulo',         // HCM | SD | EREC | MDM
      'referencia_id',  // id del registro en su módulo (id_lead, id_empleado…)
      'activo',
      'created_at',
    ],
    fk: { id_bp: 'BP_MASTER' },
  },

  /**
   * CAT_Paises — Configuración regional por país.
   * Resuelve labels (DPI, DUI, Cédula…) y formato de moneda.
   * Consumido por CORE_Customizing.
   */
  CAT_Paises: {
    pk: 'id_pais',
    columns: [
      'id_pais', 'nombre', 'codigo_iso',
      'moneda_codigo', 'moneda_simbolo',
      'label_documento',    // cómo se llama la cédula en ese país
      'label_doc_empresa',  // cómo se llama el RUC en ese país
      'formato_fecha',
      'activo',
    ],
  },

  CAT_Empresas: {
    pk: 'id_empresa',
    columns: ['id_empresa', 'id_bp', 'nombre', 'codigo', 'id_pais', 'logo_url', 'activo', 'created_at', 'updated_at'],
    fk: {
      id_bp:   'BP_MASTER',  // toda empresa es un BP de tipo PERSONA_JURIDICA
      id_pais: 'CAT_Paises',
    },
  },

  CAT_Departamentos: {
    pk: 'id_departamento',
    columns: ['id_departamento', 'nombre', 'id_empresa', 'activo', 'created_at', 'updated_at'],
    fk: { id_empresa: 'CAT_Empresas' },
  },

  CAT_Roles: {
    pk: 'id_rol',
    columns: ['id_rol', 'nombre', 'nivel', 'activo'],
  },
};
