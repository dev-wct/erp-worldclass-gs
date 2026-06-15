# 01_GAP_ANALYSIS — Brecha entre Diseño y Código Actual

> Compara lo que dice `docs/` con lo que existe realmente en el código.
> Este documento es la base para planificar la refactorización.

---

## Resumen ejecutivo

La documentación en `docs/01_foundation/` describe un ERP ideal y ambicioso con arquitectura enterprise completa. El código actual (`v2`) es funcional y bien estructurado, pero fue construido iterando rápido y se desvía del diseño en varios puntos. La brecha no es un error — es la deuda técnica natural entre diseño y construcción.

---

## GAP 1 — Nombres de módulos

| Documentación (`docs/`) | Código actual | Impacto |
|---|---|---|
| `04_hcm/` (Human Capital Management) | `04_rrhh/` | Medio — solo renombrar |
| `05_mm/` (Materials Management — compras) | `05_mm/` (equipos, chips, asignaciones) | Alto — la lógica actual de MM es EAM |
| `06_eam/` (Enterprise Asset Management) | No existe | Alto — falta el módulo |
| `07_sd/` | `06_sd/` | Bajo — diferencia de número |
| `08_fico/` | `07_fico/` | Bajo — diferencia de número |
| `09_erec/` | `08_erec/` | Bajo — diferencia de número |

**Conclusión:** el módulo más conflictivo es MM. Lo que hoy está en `05_mm/` (equipos, chips, asignaciones) corresponde conceptualmente a EAM (Enterprise Asset Management), no a MM (compras/proveedores). MM puro aún no existe.

---

## GAP 2 — Convenciones de nomenclatura de archivos

| Documentación | Código actual | Ejemplo doc | Ejemplo actual |
|---|---|---|---|
| `snake_case.capa.js` | `MODULO_Entidad_Capa.js` | `lead.service.js` | `SD_Lead_UseCases.js` |
| `lead.entity.js` | `SD_Lead_Entity.js` | — | — |
| `lead.repository.js` | `SD_Lead_Repository.js` | — | — |

**Conclusión:** convención diferente pero consistente. Es un cambio mecánico seguro de hacer con rename global.

---

## GAP 3 — Business Partner (el más importante)

| Documentación | Código actual |
|---|---|
| Business Partner es la identidad única de toda persona/organización | Cada módulo tiene su propia entidad: `Empleados`, `Leads`, `EREC_Postulantes`, `CAT_Empresas` |
| `03_mdm/business_partner/` centraliza todo | No existe Business Partner |
| Un Lead, un Empleado, un Postulante son todos Business Partners con roles distintos | Son entidades independientes sin vínculo |

**Impacto: ALTO.** Este es el cambio más profundo y más valioso arquitectónicamente. Requiere:
- Crear `BP_MASTER` en MDM
- Migrar `Leads`, `Empleados`, `EREC_Postulantes` para referenciar a BP
- Establecer el concepto de "rol de BP" (Cliente, Empleado, Postulante, Proveedor)

---

## GAP 4 — Enterprise Structure

| Documentación | Código actual |
|---|---|
| `grupo → empresa → sucursal → unidad_organizativa` | Solo existe `CAT_Empresas` y `CAT_Departamentos` |
| Toda transacción conoce empresa + sucursal + unidad organizativa | Las transacciones solo tienen `id_empresa` |

**Impacto: Medio.** Agregar `sucursal` y `unidad_organizativa` a MDM es incremental.

---

## GAP 5 — Estructura interna de módulos

| Documentación | Código actual |
|---|---|
| `lead/lead.entity.js`, `lead/lead.service.js`… | `lead/SD_Lead_Entity.js`, `lead/SD_Lead_UseCases.js`… |
| Carpeta en `snake_case` | Carpeta en `snake_case` ✅ |
| Archivo nombrado `entidad.capa.js` | Archivo nombrado `MODULO_Entidad_Capa.js` |
| Capa llamada `service` | Capa llamada `UseCases` |

**Conclusión:** `UseCases` y `service` son el mismo concepto. El nombre `UseCases` es más claro para este contexto (Clean Architecture). Se puede mantener como decisión consciente.

---

## GAP 6 — Capas faltantes en el diseño documentado

| Capa documentada | En código |
|---|---|
| `events` — eventos empresariales (`LeadCreated`, `EmployeeHired`) | No implementado |
| `workflow` — motor de procesos y aprobaciones | No implementado |
| `security` — roles y permisos | No implementado |
| `registry` — registro de módulos | No implementado |
| `10_analytics/` — capa analítica | No implementado |
| `11_verticals/travel_agency/` | No implementado |

**Conclusión:** estas capas están en la visión a largo plazo. No son urgentes para el estado actual del sistema.

---

## GAP 7 — MM vs EAM (conflicto activo)

El módulo `05_mm/` actual contiene:
- `equipo/` — laptops, celulares, tablets (esto es **EAM**)
- `chip/` — líneas SIM corporativas (esto es **EAM**)
- `asignacion/` — asignación de activos a empleados (esto es **EAM**)

El `05_mm/` según la arquitectura debería contener:
- `proveedor/` — proveedores
- `orden_compra/` — proceso Procure-to-Pay
- `inventario/` — control de stock

**Impacto: Alto.** Resolver este GAP requiere crear `06_eam/` y mover la lógica, renumerar módulos, y construir MM real.

---

## Priorización de GAPs

| # | GAP | Riesgo | Valor | Prioridad |
|---|---|---|---|---|
| 3 | Business Partner | Alto | Muy alto | P1 — planificar bien antes de ejecutar |
| 7 | MM vs EAM | Alto | Alto | P2 — renombrar y separar |
| 1 | Nombres de módulos | Medio | Medio | P3 — mecánico |
| 2 | Convenciones de archivos | Bajo | Medio | P4 — mecánico |
| 4 | Enterprise Structure | Medio | Alto | P5 — incremental |
| 6 | Capas faltantes | Bajo | Alto | P6 — visión largo plazo |
| 5 | Estructura interna | Bajo | Bajo | P7 — opcional |
