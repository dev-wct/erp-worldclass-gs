/**
 * CORE_WorkflowEngine
 * ─────────────────────────────────────────────────────────────────────────
 * Máquina de estados genérica para flujos de aprobación.
 * Completamente agnóstica de módulos de negocio.
 * ─────────────────────────────────────────────────────────────────────────
 */
const WorkflowEngine = {
  
  /**
   * Inicia un flujo de aprobación.
   */
  start: function(tipo_workflow, id_documento, payload_json, solicitante) {
    const def = WorkflowCatalog.getDefinition(tipo_workflow);
    if (!def) throw new Error('Workflow no definido en el catálogo: ' + tipo_workflow);

    const instanceId = Utilities.getUuid();
    
    // Guardar Instancia
    DataAdapter.insert('SYS_WorkflowInstances', {
      id_instance: instanceId,
      tipo_workflow: tipo_workflow,
      estado: 'PENDIENTE',
      id_documento: id_documento,
      payload_json: JSON.stringify(payload_json),
      solicitante: solicitante || DataAdapter.getCurrentUser(),
      fecha_inicio: DataAdapter.now(),
      paso_actual: 1
    }, 'SISTEMA');

    // Generar primera tarea
    this._createWorkItem(instanceId, def, 1);
    
    Logger_ERP.info('WORKFLOW', `Iniciado flujo ${tipo_workflow} para doc ${id_documento}`);
    return instanceId;
  },

  /**
   * Aprueba un item de trabajo. Si es el último, lanza el evento de Aprobado.
   */
  approve: function(id_workitem, notas) {
    const wi = DataAdapter.findById('SYS_WorkItems', id_workitem);
    if (!wi) throw new Error('WorkItem no existe.');
    if (wi.estado !== 'PENDIENTE') throw new Error('La tarea ya fue procesada.');

    // Marcar Tarea como aprobada
    DataAdapter.update('SYS_WorkItems', id_workitem, {
      estado: 'COMPLETADO',
      decision: 'APROBADO',
      notas: notas || '',
      fecha_resolucion: DataAdapter.now(),
      usuario_resolucion: DataAdapter.getCurrentUser()
    });

    const inst = DataAdapter.findById('SYS_WorkflowInstances', wi.id_instance);
    const def = WorkflowCatalog.getDefinition(inst.tipo_workflow);

    // ¿Hay más pasos?
    const maxPasos = def.pasos.length;
    if (inst.paso_actual < maxPasos) {
      const nextPaso = inst.paso_actual + 1;
      DataAdapter.update('SYS_WorkflowInstances', inst.id_instance, { paso_actual: nextPaso });
      this._createWorkItem(inst.id_instance, def, nextPaso);
    } else {
      // Fin del flujo
      DataAdapter.update('SYS_WorkflowInstances', inst.id_instance, {
        estado: 'APROBADO',
        fecha_fin: DataAdapter.now()
      });
      
      Logger_ERP.info('WORKFLOW', `Aprobado flujo ${inst.tipo_workflow} para doc ${inst.id_documento}`);
      
      // GRITAR AL SISTEMA
      EventBus.publish(def.evento_aprobado, {
        id_instance: inst.id_instance,
        id_documento: inst.id_documento,
        payload: JSON.parse(inst.payload_json)
      });
    }
  },

  /**
   * Rechaza el item de trabajo. Lanza el evento de Rechazado.
   */
  reject: function(id_workitem, motivo) {
    if (!motivo) throw new Error('Debe proporcionar un motivo de rechazo.');
    const wi = DataAdapter.findById('SYS_WorkItems', id_workitem);
    if (!wi) throw new Error('WorkItem no existe.');
    
    DataAdapter.update('SYS_WorkItems', id_workitem, {
      estado: 'COMPLETADO',
      decision: 'RECHAZADO',
      notas: motivo,
      fecha_resolucion: DataAdapter.now(),
      usuario_resolucion: DataAdapter.getCurrentUser()
    });

    const inst = DataAdapter.findById('SYS_WorkflowInstances', wi.id_instance);
    const def = WorkflowCatalog.getDefinition(inst.tipo_workflow);

    DataAdapter.update('SYS_WorkflowInstances', inst.id_instance, {
      estado: 'RECHAZADO',
      fecha_fin: DataAdapter.now()
    });
    
    Logger_ERP.warn('WORKFLOW', `Rechazado flujo ${inst.tipo_workflow} para doc ${inst.id_documento} | Motivo: ${motivo}`);

    EventBus.publish(def.evento_rechazado, {
      id_instance: inst.id_instance,
      id_documento: inst.id_documento,
      motivo: motivo,
      payload: JSON.parse(inst.payload_json)
    });
  },

  /**
   * Helper privado para crear tareas en el inbox
   */
  _createWorkItem: function(instanceId, def, paso_orden) {
    const paso = def.pasos.find(p => p.orden === paso_orden);
    DataAdapter.insert('SYS_WorkItems', {
      id_workitem: Utilities.getUuid(),
      id_instance: instanceId,
      rol_asignado: paso.rol_aprobador,
      usuario_asignado: '', // Opcional: si se asigna directo a un email
      titulo_tarea: 'Requiere Aprobación: ' + def.descripcion,
      estado: 'PENDIENTE',
      decision: '',
      notas: '',
      fecha_creacion: DataAdapter.now()
    }, 'SISTEMA');
  }
};
