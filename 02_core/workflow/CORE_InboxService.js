/**
 * CORE_InboxService
 * ─────────────────────────────────────────────────────────────────────────
 * Provee la lógica para alimentar la pantalla My Inbox (Fiori).
 * Retorna las tareas pendientes que el usuario activo debe resolver.
 * ─────────────────────────────────────────────────────────────────────────
 */
const InboxService = {
  
  /**
   * @param {string} userEmail
   * @param {string[]} userRoles - ej. ['IT_ADMIN', 'EMPLEADO']
   * @returns {Array} Tareas enriquecidas con payload para dibujar en UI
   */
  getMyPendingTasks: function(userEmail, userRoles) {
    // 1. Buscar todas las tareas pendientes globalmente
    const allPending = DataAdapter.findByField('SYS_WorkItems', 'estado', 'PENDIENTE');
    
    // 2. Filtrar las que me tocan a mí (por rol o por asignación directa)
    const myTasks = allPending.filter(t => {
      if (t.usuario_asignado && t.usuario_asignado === userEmail) return true;
      if (t.rol_asignado && userRoles.includes(t.rol_asignado)) return true;
      return false;
    });

    // 3. Enriquecer con los datos de la Instancia padre (para mostrar los detalles en pantalla)
    return myTasks.map(t => {
      const inst = DataAdapter.findById('SYS_WorkflowInstances', t.id_instance);
      
      let payloadParsed = {};
      try {
        payloadParsed = JSON.parse(inst.payload_json);
      } catch(e) {}

      return {
        id_workitem: t.id_workitem,
        titulo_tarea: t.titulo_tarea,
        fecha_creacion: t.fecha_creacion,
        tipo_workflow: inst.tipo_workflow,
        solicitante: inst.solicitante,
        payload: payloadParsed
      };
    });
  }
};
