# 00_CONTEXT — ERP WorldClass v2
> Lee este documento primero. Si perdiste el historial de chat, cambiaste de IA, o entraste al proyecto por primera vez, aquí está todo lo que necesitas para continuar.

---

## ¿Qué es este proyecto?

Un ERP empresarial construido sobre **Google Apps Script (GAS) + Google Sheets**, inspirado en SAP. Cubre el 80% de procesos de negocio generales y un 20% especializado en agencias de viaje.

**Stack actual:**
- Runtime: Google Apps Script V8
- Base de datos: Google Sheets (una pestaña = una tabla)
- Almacenamiento: Google Drive
- Frontend interno: HtmlService (modales en Sheets)
- Frontend público: Web App GAS (`doGet` / `doPost`)
- Design System: SAP Horizon (CSS propio, Inter font)
- Gestión de código: `clasp` (CLI de GAS) + Git

**Repositorio local:**
```
/home/rujanad/worldclass-workspace-solution/01_dev_project_workspace/excel/erp_worldclass_v2/
```

---

## Módulos construidos hoy (v2)

| Carpeta | Módulo | Estado |
|---|---|---|
| `01_infra/` | Infraestructura (BaseRepository, ErrorHandler) | ✅ Completo |
| `02_core/` | Núcleo — Config, Bootstrap, DataAdapter, SetupEngine, etc. | ✅ Completo |
| `03_mdm/` | Master Data Management — CAT_Paises, CAT_Empresas, etc. | ✅ Completo |
| `04_rrhh/` | RRHH — Empleados, Nómina, Postulantes (legacy) | ✅ Funcional |
| `05_mm/` | Materials Management — Equipos, Chips, Asignaciones | ✅ Funcional |
| `06_sd/` | Sales & Distribution — Campañas, Leads, Llamadas, Citas | ✅ Funcional |
| `07_fico/` | Finance & Controlling — Nómina, Costos de Chips | ✅ Funcional |
| `08_erec/` | E-Recruiting — Vacantes, Postulantes, Entrevistas, Links | ✅ Completo |

---

## Arquitectura técnica actual — cómo está construido

### Capas por entidad (Clean Architecture)

Cada entidad sigue exactamente este stack:

```
Controller  →  UseCases  →  Validator
                              ↓
                           Entity / DTO  →  Repository  →  DataAdapter  →  Sheets
```

### Paradigmas aplicados (importante — no cambiar sin consenso)

| Capa | Paradigma | Por qué |
|---|---|---|
| UseCases, Validators, DTOs | **Funcional (LISP)** | Funciones puras, sin estado, composables |
| Repository, ErrorHandler | **POO** | Herencia de BaseRepository elimina duplicación |
| buildRecord(), Schemas | **COBOL** | Registros fijos, auditados, completos |

### Anti vendor lock-in

`CORE_DataAdapter.js` es el único archivo que toca `SpreadsheetApp`. Si mañana cambia el backend, solo ese archivo cambia.

### Gateway isomórfico

`ERP.Gateway.call()` en el frontend abstrae `google.script.run`. Al migrar a Hono/Vercel, solo cambia la implementación del Gateway — los formularios no se tocan.

---

## Convenciones de nomenclatura ACTUALES (v2)

> ⚠️ Estas convenciones difieren de lo que dice `docs/01_foundation/06_ESTANDARES_DE_DESARROLLO_V1.md`. Ver brecha en `01_GAP_ANALYSIS.md`.

**Archivos:**
```
MODULO_Entidad_Capa.js
Ejemplos: RRHH_Empleado_Controller.js, SD_Lead_UseCases.js
```

**Funciones de API:**
```
api[Verbo][Entidad]()
Ejemplos: apiGuardarLead(), apiGetCatalogosVacante()
```

**Repositorios:**
```
[Entidad]Repo
Ejemplos: LeadRepo, VacanteRepo, ErecPostulanteRepo
```

---

## Servicios core disponibles (usar siempre estos, no reinventarlos)

| Servicio | Archivo | Para qué |
|---|---|---|
| `safeExecute(fn, ctx)` | `INFRA_ErrorHandler.js` | Envolver cualquier operación con manejo de errores centralizado |
| `DataAdapter` | `CORE_DataAdapter.js` | Única puerta de acceso a Sheets |
| `Customizing` | `CORE_Customizing.js` | Labels regionales por país (DPI, DUI, Cédula…) |
| `DriveService` | `CORE_DriveService.js` | Subir archivos a Drive desde formularios públicos |
| `DriveOrganizer` | `CORE_DriveOrganizer.js` | Crear/encontrar estructura de carpetas (idempotente por ID) |
| `EmailService` | `CORE_EmailService.js` | Enviar emails con `MailApp` |
| `SetupEngine` | `CORE_SetupEngine.js` | Migrador de tablas (crea, agrega columnas, reordena) |
| `Bootstrap` | `CORE_Bootstrap.js` | Setup completo del ERP en orden de dependencias |

---

## Reglas de oro — nunca romper

1. **Ningún HTML toca Sheets directamente** — todo pasa por `google.script.run` → Controller → UseCases → Repository → DataAdapter
2. **Ningún módulo llama directamente a otro módulo** — si necesita datos de otro módulo, los recibe como parámetro o usa DataAdapter
3. **`DataAdapter` es la única puerta a Sheets** — nunca usar `SpreadsheetApp` fuera de él
4. **`safeExecute()` en todos los Controllers** — nunca `try/catch` manual en un Controller
5. **Todo registro tiene `created_at`, `created_by`** — sin excepción
6. **Las FKs cross-módulo son referencias suaves** — se documentan pero no se declaran como FK en el Schema para evitar dependencias de orden

---

## Lo que NO se debe hacer (decisiones ya tomadas)

| ❌ No hacer | ✅ Por qué se decidió así |
|---|---|
| Poner lógica de negocio en HTML | El HTML es solo presentación |
| Usar `SpreadsheetApp` fuera de DataAdapter | Anti vendor lock-in |
| Crear archivos `utils.js`, `helpers.js`, `misc.js` | Antipatrón documentado en estándares |
| Hardcodear términos regionales (DPI, Q, etc.) | Viven en `CAT_Paises` vía `Customizing` |
| Crear triggers de Google Forms para postulantes | Reemplazado por Web App con tokens EREC |
| Guardar el link de Drive buscando por nombre | Usar ID persistido en Script Properties |

---

## Script Properties requeridas

| Propiedad | Valor |
|---|---|
| `WEBAPP_URL` | URL de la Web App publicada (sin `/` final) |
| `ERP_NAME` | Nombre del ERP (override opcional) |
| `DRIVE_ROOT_FOLDER_ID_DEV` | Auto-generado por DriveOrganizer |
| `DRIVE_ROOT_FOLDER_ID_PROD` | Auto-generado por DriveOrganizer |

---

## Estado de la refactorización

Ver `01_GAP_ANALYSIS.md` para la brecha completa entre el diseño documentado y el código actual.
Ver `02_ROADMAP.md` para las fases de refactorización planificadas.
Ver `03_DECISIONS.md` para decisiones ya tomadas y sus justificaciones.
Ver `04_PROGRESS.md` para el progreso actual.
