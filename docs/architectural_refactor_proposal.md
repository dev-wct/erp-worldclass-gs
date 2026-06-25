# Propuesta de Arquitectura Limpia: Separación de Responsabilidades (Infra, Core, Portal y SysAdmin)

Como Arquitecto de Software Senior, entiendo perfectamente tu preocupación. Es muy común en proyectos que crecen rápidamente que la carpeta `core` se convierta en un "saco de todo" (o *junk drawer*), acumulando desde layouts de UI, enrutadores, páginas de configuración del sistema, hasta lógica de workflows.

Esta propuesta define una **separación de responsabilidades estricta** (Clean Architecture / Domain-Driven Design) para organizar el ERP de forma profesional y escalable.

---

## 1. Definición Semántica: `01_infra` vs `02_core`

Para evitar que estas dos capas se solapen, debemos trazar una línea dura basada en sus responsabilidades técnicas y de negocio:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        00_portal (UI & Routing)                        │
│               [Launchpad, Shell, Global Styles, Head]                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    04_hcm, 05_mm, 06_eam, 07_sd, ...                   │
│                          (Módulos de Negocio)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     02_core (Kernel / Lógica Central)                  │
│     [EventBus, DB Schemas, Workflow Engine, CacheService (Interface)]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    01_infra (Tecnología / Adaptadores)                 │
│      [GDriveProvider, GmailProvider, Logger, ErrorHandler, Auth]       │
└────────────────────────────────────────────────────────────────────────┘
```

### 🎛️ `01_infra` (Infraestructura: El "Cómo" Técnico)
* **Responsabilidad:** Conectar el ERP con el mundo físico y la tecnología subyacente. No tiene **ninguna** regla de negocio del ERP.
* **Qué hay aquí:** Drivers de base de datos crudos (DataAdapter), proveedores físicos de almacenamiento (GDriveFileProvider), pasarelas físicas de email (GmailProvider), loggers de disco, guardianes de sesión y manejo genérico de excepciones.
* **Regla de Oro:** Si cambias Google Drive por Amazon S3, o Google Sheets por PostgreSQL, **solo** se modifica el código dentro de `01_infra`. El resto de la aplicación no se entera.

### 🧠 `02_core` (Kernel/Núcleo de Negocio: El "Qué" del ERP)
* **Responsabilidad:** Orquestar y gobernar las reglas lógicas comunes del ERP. Define el comportamiento compartido del sistema.
* **Qué hay aquí:** El bus de eventos del sistema (`EventBus`), el catálogo y motor de flujos de aprobación (`WorkflowEngine`), los esquemas lógicos de datos (`CORE_Schema.js`), y las APIs/interfaces lógicas comunes (como `CacheService` o `StorageService` antes de tocar la red).
* **Regla de Oro:** Contiene lógica pura de negocio del ERP. No sabe si el logo se dibuja con Tailwind, si el email se manda por Gmail o SMTP, ni conoce rutas de la URL.

---

## 2. Los Solapamientos Actuales (La Deuda Estructural)

Actualmente en nuestro código existen tres solapamientos que generan confusión semántica:

1. **El Portal de Entrada (`Launchpad` & `Shell`):** Están mezclados en `02_core/ui/`. El Launchpad y el Shellbar son la aplicación contenedora del frontend (el *App Shell* y enrutador visual). No son lógica de negocio "core".
2. **La Consola de Administración (`SystemAdmin`):** Viven en `02_core/config/` y `02_core/ui/`. La parametrización del sistema (licencias, backups, banners de mantenimiento) es un **módulo técnico vertical**, no lógica compartida del kernel.
3. **El Motor de Reportes (`Reporting`):** Está en `02_core/reporting/`. Los reportes son un servicio de aplicación de cara al usuario, no reglas fundamentales del núcleo.

---

## 3. Propuesta de Estructura de Carpetas Refactorizada

Para resolver esto de forma elegante, dividiremos el proyecto en **módulos semánticos independientes** y extraeremos el portal y la consola de administración a sus propias ubicaciones:

```
erp_worldclass_v2/
├── 00_portal/                  <── NUEVO: Marco visual y enrutamiento del front
│   ├── ui/
│   │   ├── PORTAL_Launchpad.html   <── Movido de 02_core/ui
│   │   ├── PORTAL_Shell.html       <── Movido de 02_core/ui
│   │   ├── PORTAL_ShellClose.html
│   │   ├── PORTAL_Styles.html
│   │   └── PORTAL_Head.html
│   └── routing/
│       └── PORTAL_AppRouter.js     <── Movido de 02_core/routing
│
├── 01_infra/                   <── Tecnología pura y drivers (Sin reglas de negocio)
│   ├── adapters/
│   ├── exceptions/
│   ├── logging/
│   └── security/
│
├── 02_core/                    <── Kernel de negocio (Reglas lógicas puras)
│   ├── db/                     <── Configuración de esquemas de datos del ERP
│   ├── events/                 <── EventBus y mensajería lógica
│   ├── services/               <── CacheService_ERP, StorageService (Lógica)
│   └── workflow/               <── Catálogo y motor de aprobaciones
│
├── 03_sysadmin/                <── NUEVO: Consola de Administración (Basis / Config)
│   ├── controllers/
│   │   └── SYS_Admin_Controller.js <── Movido de 02_core/config (Backups, Licencia, Banners)
│   └── ui/
│       └── SYS_AdminView.html      <── Movido de 02_core/ui (Formulario Fiori de parámetros)
│
├── 04_hcm/                     <── Módulos funcionales del ERP
├── 05_mm/
├── 06_eam/
├── 07_sd/
└── 08_fico/
```

### Ventajas de este Diseño de Alta Cohesión:
1. **Separación Limpia:** El núcleo (`02_core`) se vuelve 100% agnóstico de pantallas de configuración visuales.
2. **Módulo Técnico Dedicado (`03_sysadmin`):** Equivale a la capa **BASIS** de SAP o la consola de configuración de Salesforce. Agrupa sus controladores y vistas en un solo lugar.
3. **App Shell Independiente (`00_portal`):** Si mañana decides cambiar tu frontend de HTML simple a React, Angular o Next.js, **solo** tienes que reescribir `00_portal`, manteniendo intacto todo el resto del ERP.

---

## 4. Plan de Acción Recomendado (Paso a Paso)

Para realizar esta migración de forma segura y sin romper el sistema en producción:

1. **Paso A (Portal):** Crear la carpeta `00_portal` y mover el enrutador (`AppRouter.js`), `Launchpad.html`, `Shell.html`, `ShellClose.html`, `Styles.html` y `Head.html`. Actualizar las referencias de `include()` internas de HTML.
2. **Paso B (System Admin):** Crear la carpeta `03_sysadmin` y mover `CORE_SystemAdmin_Controller.js` y `CORE_SystemAdmin.html` (renombrándolos para seguir la nomenclatura modular).
3. **Paso C (Limpieza de Core):** Eliminar directorios vacíos de `02_core/routing/` y `02_core/ui/` para dejar `02_core` libre de acoplamiento visual.
4. **Paso D (Verificación):** Ejecutar pruebas de navegación completa y desplegar a Apps Script.
