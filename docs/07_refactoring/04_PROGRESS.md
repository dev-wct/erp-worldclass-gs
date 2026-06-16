# 04_PROGRESS — Estado de la Refactorización

> Actualizar este archivo cada vez que se completa un ítem.
> Fecha de última actualización: Junio 2026

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

## Fase 2 — Separar EAM de MM ⏳ PENDIENTE

| Ítem | Estado |
|---|---|
| Crear `06_eam/` con estructura de capas | ⏳ |
| Mover `equipo/`, `chip/`, `asignacion/` a EAM | ⏳ |
| Actualizar EREC Schema | ⏳ |
| Actualizar Bootstrap | ⏳ |
| Actualizar entrypoint (menús) | ⏳ |
| Actualizar DriveOrganizer (carpeta EAM) | ⏳ |
| Migrar datos existentes en Sheets | ⏳ |
| `clasp push` + smoke test | ⏳ |

---

## Fase 3 — Business Partner ⏳ PENDIENTE (requiere diseño previo)

| Ítem | Estado |
|---|---|
| Diseño del modelo BP (campos, roles, relaciones) | ⏳ |
| Crear `BP_MASTER` en MDM | ⏳ |
| Agregar `id_bp` a `CAT_Empresas` | ⏳ |
| Agregar `id_bp` a `Leads` | ⏳ |
| Agregar `id_bp` a `Empleados` | ⏳ |
| Agregar `id_bp` a `EREC_Postulantes` | ⏳ |
| Migrar datos existentes | ⏳ |
| `clasp push` + smoke test | ⏳ |

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
