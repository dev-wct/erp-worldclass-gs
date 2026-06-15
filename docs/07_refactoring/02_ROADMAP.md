# 02_ROADMAP — Fases de Refactorización

> Plan de trabajo ordenado por impacto y riesgo.
> Cada fase debe completarse y probarse antes de iniciar la siguiente.

---

## Principio rector

**No se tira código que funciona.**
Se refactoriza incrementalmente, módulo por módulo, con el sistema siempre operativo.

---

## Fase 0 — Documentación (COMPLETADA ✅)

**Objetivo:** entender la brecha antes de tocar código.

- [x] Documento de arquitectura general (`ERP_WorldClass_Architecture.md`)
- [x] Gap Analysis (`01_GAP_ANALYSIS.md`)
- [x] Roadmap (`02_ROADMAP.md`)
- [x] Decisions Log (`03_DECISIONS.md`)
- [x] Progress tracking (`04_PROGRESS.md`)

---

## Fase 1 — Renombrar módulos y convenciones (Bajo riesgo)

**Objetivo:** alinear los nombres con la arquitectura documentada sin cambiar lógica.

**Cambios:**
1. Renombrar `04_rrhh/` → `04_hcm/` con todos sus archivos internos
2. Renombrar `06_sd/` → `07_sd/` (y ajustar numeración hacia abajo)
3. Renombrar `07_fico/` → `08_fico/`
4. Renombrar `08_erec/` → `09_erec/`
5. Actualizar todas las referencias internas (includes, paths en Controllers)

**Precaución:** el orden de carga en GAS depende del nombre de archivo. Verificar que la nueva numeración mantiene el orden correcto de dependencias.

**Criterio de done:** `clasp push` exitoso, Bootstrap corre sin errores, menús aparecen correctamente.

---

## Fase 2 — Separar EAM de MM (Riesgo medio)

**Objetivo:** el módulo actual `05_mm/` contiene activos (EAM), no compras (MM). Corregirlo.

**Cambios:**
1. Crear `06_eam/` con la lógica actual de equipos, chips y asignaciones
2. El `05_mm/` queda vacío — reservado para el MM real (Procure-to-Pay) en el futuro
3. Actualizar Schema, Setup, Bootstrap, menús del entrypoint

**Criterio de done:** todos los formularios de equipos/chips/asignaciones funcionan desde `06_eam/`, migrador crea las tablas correctamente.

---

## Fase 3 — Business Partner en MDM (Riesgo alto — planificar con detalle)

**Objetivo:** introducir Business Partner como identidad única transversal.

**Qué implica:**
- Crear `BP_MASTER` en MDM con campos: tipo, nombre, documento, email, teléfono, rol
- Roles de BP: `EMPRESA`, `EMPLEADO`, `LEAD`, `POSTULANTE`, `PROVEEDOR`
- Migrar `CAT_Empresas` → BP con rol EMPRESA
- Migrar `Leads` → BP con rol LEAD (o vincular con `id_bp`)
- Migrar `EREC_Postulantes` → BP con rol POSTULANTE
- Migrar `Empleados` → BP con rol EMPLEADO

**Estrategia de migración segura:**
- No borrar las tablas existentes
- Agregar columna `id_bp` a cada tabla
- El `DataAdapter` resuelve el BP cuando se necesita
- Migrar gradualmente módulo por módulo

**Criterio de done:** un Lead, un Postulante y un Empleado que son la misma persona tienen el mismo `id_bp`. No hay duplicación de datos de identidad.

---

## Fase 4 — Enterprise Structure (Riesgo medio)

**Objetivo:** extender MDM con sucursal y unidad organizativa.

**Cambios:**
1. Agregar `CAT_Sucursales` a MDM Schema (fk → CAT_Empresas)
2. Agregar `CAT_UnidadesOrganizativas` (fk → CAT_Sucursales)
3. Agregar `id_sucursal` a tablas transaccionales clave
4. Actualizar formularios con selector de sucursal

**Criterio de done:** una transacción sabe empresa + sucursal + unidad organizativa.

---

## Fase 5 — Convenciones de archivos (Opcional)

**Objetivo:** alinear nombres de archivo con el estándar `entidad.capa.js`.

**Cambios:** renombrar todos los archivos de `MODULO_Entidad_Capa.js` a `entidad.capa.js`.

**Nota:** esto es cosmético. El sistema funciona igual. Solo hacer si se decide migrar a un bundler o sistema de módulos real (Node.js/Deno/Bun).

---

## Fases futuras (visión largo plazo)

| Fase | Descripción |
|---|---|
| F6 | Motor de eventos (`LeadCreated`, `EmployeeHired`…) |
| F7 | Motor de workflow (aprobaciones, flujos) |
| F8 | Capa de analytics (`10_analytics/`) |
| F9 | Vertical agencia de viajes (`11_verticals/travel_agency/`) |
| F10 | Migración a Hono + Vercel + Supabase |
| F11 | Frontend Svelte |
