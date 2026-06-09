/**
 * MDM_Schema
 * Contiene únicamente las tablas maestras compartidas por todo el holding.
 */
const MDM_Schema = {
  CAT_Empresas: {
    pk: 'id_empresa',
    columns: ['id_empresa','nombre','codigo','activo','created_at','updated_at'],
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
