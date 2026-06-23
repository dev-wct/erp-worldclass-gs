/**
 * CORE_WorkflowCatalog
 * ─────────────────────────────────────────────────────────────────────────
 * Define las reglas de enrutamiento y aprobación del sistema.
 * 
 * PATRÓN: Registry/Catalog
 * ─────────────────────────────────────────────────────────────────────────
 */
const WorkflowCatalog = {
  getDefinition: function(tipo_workflow) {
    const definitions = {
      'EAM_ASIGNACION_EQUIPO': {
        descripcion: 'Aprobación para asignar un nuevo activo de IT',
        pasos: [
          { orden: 1, rol_aprobador: 'IT_ADMIN', requiere_firma: true }
        ],
        evento_aprobado: 'Workflow_EAM_ASIGNACION_Aprobado',
        evento_rechazado: 'Workflow_EAM_ASIGNACION_Rechazado'
      },
      'FICO_FINIQUITO': {
        descripcion: 'Aprobación de liquidación final de empleado',
        pasos: [
          { orden: 1, rol_aprobador: 'HR_MANAGER', requiere_firma: true },
          { orden: 2, rol_aprobador: 'FINANCE_MANAGER', requiere_firma: true }
        ],
        evento_aprobado: 'Workflow_FICO_FINIQUITO_Aprobado',
        evento_rechazado: 'Workflow_FICO_FINIQUITO_Rechazado'
      }
    };
    return definitions[tipo_workflow] || null;
  }
};
