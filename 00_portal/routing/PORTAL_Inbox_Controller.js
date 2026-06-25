/**
 * CORE_Inbox_Controller
 * ─────────────────────────────────────────────────────────────────────────
 * Exposición de endpoints para la UI de My Inbox.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Muestra el HTML del Inbox (para navegación si se integra un menú).
 */
function abrirMyInbox() {
  const html = HtmlService.createTemplateFromFile('00_portal/ui/PORTAL_Inbox')
    .evaluate()
    .setTitle('My Inbox - WorldClass ERP')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Si se embute en la UI global
    
  SpreadsheetApp.getUi().showModalDialog(html.setWidth(1000).setHeight(650), 'My Inbox');
}

/**
 * Retorna tareas pendientes para el usuario actual.
 */
function apiGetMyPendingTasks() {
  return safeExecute(function() {
    const userEmail = DataAdapter.getCurrentUser();
    
    // NOTA: Idealmente los roles vienen de BD (SYS_UserRoles o AuthGuard).
    // Para simplificar, asumimos que el user tiene roles base para pruebas:
    const userRoles = ['IT_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'MANAGER'];
    
    return InboxService.getMyPendingTasks(userEmail, userRoles);
  }, 'CORE.Inbox.getPendingTasks');
}

/**
 * Aprueba una tarea.
 */
function apiApproveTask(id_workitem, notas) {
  return safeExecute(function() {
    WorkflowEngine.approve(id_workitem, notas);
    return { mensaje: 'Tarea aprobada correctamente' };
  }, 'CORE.Inbox.approveTask');
}

/**
 * Rechaza una tarea.
 */
function apiRejectTask(id_workitem, notas) {
  return safeExecute(function() {
    WorkflowEngine.reject(id_workitem, notas);
    return { mensaje: 'Tarea rechazada correctamente' };
  }, 'CORE.Inbox.rejectTask');
}
