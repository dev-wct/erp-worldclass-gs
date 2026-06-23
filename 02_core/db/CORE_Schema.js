/**
 * CORE_Schema
 * ─────────────────────────────────────────────────────────────────────────
 * Definición de las tablas del sistema base (Core).
 * Contiene estructuras transversales como Workflow, Logs, etc.
 * ─────────────────────────────────────────────────────────────────────────
 */
const CORE_Schema = {
  
  SYS_WorkflowInstances: {
    description: 'Instancias de flujos de aprobación en ejecución',
    pk: 'id_instance',
    columns: [
      'id_instance',
      'tipo_workflow',
      'estado',
      'id_documento',
      'payload_json',
      'solicitante',
      'fecha_inicio',
      'fecha_fin',
      'paso_actual'
    ]
  },

  SYS_WorkItems: {
    description: 'Bandeja de entrada: tareas pendientes por aprobar',
    pk: 'id_workitem',
    columns: [
      'id_workitem',
      'id_instance',
      'rol_asignado',
      'usuario_asignado',
      'titulo_tarea',
      'estado',
      'decision',
      'notas',
      'fecha_creacion',
      'fecha_resolucion',
      'usuario_resolucion'
    ],
    fk: { id_instance: 'SYS_WorkflowInstances' }
  }

};
