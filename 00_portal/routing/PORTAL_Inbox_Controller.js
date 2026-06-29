/**
 * CORE_Inbox_Controller
 * ─────────────────────────────────────────────────────────────────────────
 * Exposición de endpoints para la UI de My Inbox.
 *
 * CODE STYLE: ES6+ (const/let, arrow functions, template literals)
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Muestra el HTML del Inbox (para navegación si se integra un menú).
 */
const abrirMyInbox = () => {
  const html = HtmlService.createTemplateFromFile('00_portal/ui/PORTAL_Inbox')
    .evaluate()
    .setTitle('My Inbox - WorldClass ERP')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  SpreadsheetApp.getUi().showModalDialog(html.setWidth(1000).setHeight(650), 'My Inbox');
};

/**
 * Retorna tareas pendientes para el usuario actual.
 */
const apiGetMyPendingTasks = () => {
  return safeExecute(() => {
    const userEmail = DataAdapter.getCurrentUser();
    const userRoles = DataAdapter.getUserRoles(userEmail);
    return InboxService.getMyPendingTasks(userEmail, userRoles);
  }, 'CORE.Inbox.getPendingTasks');
};

/**
 * Aprueba una tarea.
 */
const apiApproveTask = (id_workitem, notas) => {
  return safeExecute(() => {
    WorkflowEngine.approve(id_workitem, notas);
    return { mensaje: 'Tarea aprobada correctamente' };
  }, 'CORE.Inbox.approveTask');
};

/**
 * Rechaza una tarea.
 */
const apiRejectTask = (id_workitem, notas) => {
  return safeExecute(() => {
    WorkflowEngine.reject(id_workitem, notas);
    return { mensaje: 'Tarea rechazada correctamente' };
  }, 'CORE.Inbox.rejectTask');
};
