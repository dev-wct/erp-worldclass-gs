/**
 * MDM_Schema
 * Contiene únicamente las tablas maestras compartidas por todo el holding.
 */
const MDM_Schema = {
  /**
   * CAT_Paises
   * Catálogo de países con configuración regional.
   * Permite que cada empresa tenga su propio contexto cultural
   * sin hardcodear términos en el código (Opción B — SAP Customizing).
   *
   * label_documento: Cómo se llama el documento de identidad en ese país.
   *   Guatemala → DPI | El Salvador → DUI | Colombia → Cédula | etc.
   */
  CAT_Paises: {
    pk: 'id_pais',
    columns: [
      'id_pais',
      'nombre',
      'codigo_iso',         // GT, SV, HN, CO, MX, AR, ES...
      'moneda_codigo',      // GTQ, USD, COP, MXN...
      'moneda_simbolo',     // Q, $, $, $...
      'label_documento',    // DPI, DUI, DNI, Cédula, CURP...
      'formato_fecha',      // DD/MM/YYYY, MM/DD/YYYY...
      'activo',
    ],
  },

  CAT_Empresas: {
    pk: 'id_empresa',
    columns: ['id_empresa','nombre','codigo','id_pais','activo','created_at','updated_at'],
    fk: { id_pais: 'CAT_Paises' },
  },

  CAT_Departamentos: {
    pk: 'id_departamento',
    columns: ['id_departamento','nombre','id_empresa','activo','created_at','updated_at'],
    fk: { id_empresa: 'CAT_Empresas' },
  },

  CAT_Roles: {
    pk: 'id_rol',
    columns: ['id_rol','nombre','nivel','activo'],
  },
};
