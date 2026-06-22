# Arquitectura del Layout y Envoltura de Navegación (Shell)
`ERP WorldClass v2` · HCM · SD · EERE · FICO

Este documento define la arquitectura y el estándar de implementación para las interfaces de usuario del ERP. El objetivo es garantizar una navegación unificada, Mobile-First, y libre de duplicación de código en cabeceras, menús y pies de página.

---

## 1. Regla de Oro del Layout: El Shell Centralizado

Ningún formulario o módulo debe declarar etiquetas HTML base como `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` ni incluir menús de navegación de forma manual. Todos deben envolverse en los archivos de estructura del Core:

```html
<?!= include('02_core/ui/CORE_Shell'); ?>

<!-- El contenido de la página se inyecta aquí -->
<div class="space-y-4 max-w-6xl mx-auto w-full">
  ...
</div>

<?!= include('02_core/ui/CORE_ShellClose'); ?>
```

### Componentes de la Envoltura:
*   `CORE_Shell.html`: Proporciona la configuración del HTML, viewport, meta-tags, CDN de Tailwind y Lucide Icons, la barra superior fija (**Shellbar**) y la navegación lateral colapsable (**Sidebar**).
*   `CORE_ShellClose.html`: Cierra los contenedores del viewport, inyecta las librerías `CORE_Components` y `CORE_FormHandler` e inicializa los scripts del sidebar lateral.

---

## 2. Patrón de Diseño para Teléfonos (Mobile-First)

Para lograr una ergonomía premium en dispositivos móviles, se prohíbe el uso de ventanas emergentes (Modales) para la creación, edición o confirmación de bajas de registros. En su lugar, se implementa el patrón **Multi-View Swapping**:

### Estructura de Vistas:
Cada página transaccional se divide en bloques `div` principales que se ocultan/muestran utilizando clases CSS (como `hidden` de Tailwind) manipuladas a través de JavaScript:

```html
<!-- Vista 1: Directorio / Dashboard -->
<div id="view-list" class="space-y-4">
  <!-- Tabla, buscador y estadísticas -->
</div>

<!-- Vista 2: Formulario Alta y Modificación -->
<div id="view-form" class="hidden">
  <!-- Formulario único para Crear y Editar -->
</div>

<!-- Vista 3: Procesos Especiales (ej. Baja Laboral) -->
<div id="view-baja" class="hidden">
  <!-- Confirmación con parámetros dedicados -->
</div>
```

---

## 3. Escalabilidad de Formularios Extensos (Sub-Tabs)

Cuando un formulario requiere capturar un volumen grande de datos, no se debe realizar un scroll vertical infinito. Se debe emplear un sistema de sub-pestañas internas dentro de la tarjeta del formulario (`view-form`):

1.  Se inyecta el componente `ERP.UI.tabStrip` en la cabecera del formulario.
2.  Se agrupan los campos en secciones lógicas (ej. `#form-sec-personal`, `#form-sec-direccion`, `#form-sec-finanzas`).
3.  Al hacer clic en una pestaña del sub-tab, se alternan las secciones mediante la clase `.hidden`.

---

## 4. Desacoplamiento Tecnológico (Anti Vendor Lock-in)

Las vistas deben ser "slots" HTML limpios y dinámicos. Toda la generación de marcado complejo (tablas, barras de pestañas, message strips) debe delegarse a la librería unificada de componentes en `ERP.UI.*` (declarada en `CORE_Components.html`).

Esto asegura que, si el ERP migra en el futuro de Google Apps Script a una tecnología de Single Page Application (como Next.js o SvelteKit), solo se deben reescribir las funciones en `CORE_Components.html` para retornar componentes React/Svelte correspondientes, manteniendo intactos los controladores y maquetados de negocio de los módulos.
