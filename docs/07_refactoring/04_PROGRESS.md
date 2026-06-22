# 04_PROGRESS — Estado de la Refactorización

> Actualizar este archivo cada vez que se completa un ítem.
> Fecha de última actualización: 17 Jun 2026 — Design System + Web App Router completados

---

## Fase 0 — Documentación ✅ COMPLETADA

| Ítem | Estado |
|---|---|
| `00_CONTEXT.md` — documento anti-pérdida-de-chat | ✅ |
| `01_GAP_ANALYSIS.md` — brecha diseño vs. código | ✅ |
| `02_ROADMAP.md` — fases de refactorización | ✅ |
| `03_DECISIONS.md` — decisiones tomadas | ✅ |
| `04_PROGRESS.md` — este archivo | ✅ |

---

## Fase 1 — Renombrar módulos ✅ COMPLETADA

| Ítem | Estado |
|---|---|
| Renombrar `04_rrhh/` → `04_hcm/` | ✅ |
| Ajustar numeración (SD→07, FICO→08, EREC→09) | ✅ |
| Slot `06` reservado para `06_eam` (Fase 2) | ✅ |
| Corregir todas las rutas `createTemplateFromFile()` | ✅ |
| Renombrar `apiMigrarRRHH` → `apiMigrarHCM` | ✅ |
| Actualizar labels del menú de sincronización | ✅ |
| `git commit` con historial de renombres preservado | ✅ |

---

## Fase 2 — Separar EAM de MM ✅ COMPLETADA

| Ítem | Estado |
|---|---|
| Crear `06_eam/` con estructura de capas | ✅ |
| Mover `equipo/`, `chip/`, `asignacion/` a EAM | ✅ |
| Renombrar prefijos `MM_` → `EAM_` en todos los archivos | ✅ |
| `EAM_Schema.js` con FKs cross-módulo como referencias suaves | ✅ |
| `EAM_Setup.js` con `syncAndSeed()` idempotente | ✅ |
| `05_mm/` queda como placeholder documentado para Procure-to-Pay | ✅ |
| Bootstrap actualizado — 7 pasos con EAM en lugar de MM seed | ✅ |
| Entrypoint — menú EAM, `apiMigrarEAM` | ✅ |
| DriveOrganizer — carpetas `HCM/`, `EAM/`, `MM/` separadas | ✅ |
| CORE_TestSeeder — usa `EAM_Setup.seedCatalogs()` | ✅ |
| `git commit` con historial de renombres preservado | ✅ |

---

## Fase 3 — Business Partner ✅ COMPLETADA

| Ítem | Estado |
|---|---|
| Diseño del modelo BP (campos, roles, relaciones) — `DEC-012` y `DEC-013` | ✅ |
| `BP_MASTER` y `BP_Roles` en `MDM_Schema.js` | ✅ |
| `MDM_BPService.js` — `obtenerOCrear`, `asignarRol`, `registrar`, `getRoles`, `findByDocumento` | ✅ |
| `MDM_Setup.js` — seed de `BP_MASTER` para empresas del holding | ✅ |
| `CAT_Empresas` — columna `id_bp` (FK suave → BP_MASTER) | ✅ |
| `SD_Schema.js` / `Leads` — columna `id_bp` | ✅ |
| `RRHH_Schema.js` / `Empleados` — columna `id_bp` | ✅ |
| `EREC_Schema.js` / `EREC_Postulantes` — columna `id_bp` | ✅ |
| `SD_Lead_UseCases.js` — llama `BPService.registrar()` en `registrar()` | ✅ |
| `RRHH_Empleado_UseCases.js` — llama `BPService.registrar()` en `contratar()` | ✅ |
| `EREC_Vacante_UseCases.js` — llama `BPService.registrar()` en `ErecPostulanteUseCases.registrar()` | ✅ |
| `CORE_TestSeeder.js` — seed de 30 BPs personas físicas + 9 postulantes EREC con `id_bp` | ✅ |

---

## Fase 4 — Enterprise Structure ⏳ PENDIENTE

| Ítem | Estado |
|---|---|
| Crear `CAT_Sucursales` en MDM | ⏳ |
| Crear `CAT_UnidadesOrganizativas` en MDM | ⏳ |
| Agregar `id_sucursal` a tablas transaccionales clave | ⏳ |
| Actualizar formularios | ⏳ |

---

## Mejoras técnicas completadas (fuera de fases)

| Ítem | Versión | Fecha |
|---|---|---|
| `SetupEngine` detecta y corrige columnas fuera de orden | v2 | Jun 2026 |
| `DriveOrganizer` persiste ID en Script Properties | v2 | Jun 2026 |
| `CORE_Customizing` — labels regionales por país | v2 | Jun 2026 |
| `CORE_DriveService` — upload de archivos Base64 desde Web App | v2 | Jun 2026 |
| `CORE_FormHandler` — librería JS compartida por todos los forms | v2 | Jun 2026 |
| `08_erec/` — módulo E-Recruiting completo | v2 | Jun 2026 |
| `CAT_Paises` — tabla MDM con configuración regional | v2 | Jun 2026 |
| Email habilitado con `MailApp` (estaba comentado) | v2 | Jun 2026 |

---

## Design System v2 ✅ COMPLETADO

| Ítem | Estado |
|---|---|
| `CORE_Head.html` — Tailwind CDN + tokens SAP Horizon + Inter + Lucide + CSS puro `.erp-*` | ✅ |
| `CORE_Shell.html` / `CORE_ShellClose.html` — layout wrapper sin scriptlets | ✅ |
| `CORE_Components.html` — `ERP.UI.*`: msg, skeleton, badge, spinner, card, field, emptyState, setFormReady/Loading/Error | ✅ |
| `CORE_FormHandler.html` — `ERP.Msg/Btn/Select/Form/Gateway` refactorizados con `Gateway.submit()` | ✅ |
| `CORE_DesignSystem.html` — puente legacy `.sap-*` para formularios no migrados | ✅ |
| Bug `Date` en GAS — fix en `DataAdapter._sanitize()` (JSON round-trip en `findAll`) | ✅ |
| `EREC_FormVacante.html` — template de referencia sobre el nuevo design system | ✅ |

---

## Web App Router ✅ COMPLETADO

| Ítem | Estado |
|---|---|
| `CORE_AppRouter.js` — `doGet/doPost` único, mapa de rutas `APP_ROUTES`, variables universales de template | ✅ |
| `CORE_Launchpad.html` — Launchpad SAP Fiori standalone: shellbar, tiles por módulo, indicador conectado, sync overlay | ✅ |
| `EREC_Vacante_Controller.js` — `doGet/doPost` renombrados a `_erecDoGetPublico/_erecDoPostPublico` | ✅ |
| `EREC_FormVacante.html` — migrado a standalone: shellbar + breadcrumb + botón Volver → `?page=launchpad` | ✅ |
| `entrypoint.js` — menú reducido a 2 ítems: "Abrir ERP" (nueva pestaña) + Bootstrap | ✅ |
| `CORE_Bootstrap.js` — `_colorearTabs()`: tabs de Sheets coloreadas por módulo al final del Bootstrap | ✅ |

**Flujo completo:** Sheets → `🚀 Abrir ERP` → nueva pestaña → Launchpad → tile → formulario → Volver → Launchpad

**Pendiente de deploy:**
1. `clasp push`
2. Apps Script → Implementar → Nueva implementación (Web App)
3. Copiar URL → Script Properties → `WEBAPP_URL = <url>`
4. Recargar Sheets → probar flujo completo
