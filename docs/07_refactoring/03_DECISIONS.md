# 03_DECISIONS — Decisiones Tomadas

> Registro de decisiones de arquitectura y diseño ya tomadas.
> El propósito es no volver a discutirlas en cada sesión de chat.
> Si una decisión cambia, se documenta aquí con la fecha y la razón.

---

## DEC-001 — Paradigma mixto: Funcional + POO + COBOL

**Decisión:** usar los tres paradigmas de forma deliberada según la capa.
- Funcional (LISP): UseCases, Validators, DTOs — funciones puras sin estado
- POO: Repository (herencia de BaseRepository), jerarquía de errores
- COBOL: buildRecord(), Schemas — registros fijos y auditados

**Justificación:** cada paradigma tiene ventaja real en su capa. No es mezcla arbitraria.

**Estado:** ✅ Permanente

---

## DEC-002 — DataAdapter como única puerta a Google Sheets

**Decisión:** `CORE_DataAdapter.js` es el único archivo que usa `SpreadsheetApp` para leer/escribir datos.

**Justificación:** anti vendor lock-in. Si cambia el backend, solo cambia este archivo.

**Estado:** ✅ Permanente

---

## DEC-003 — Carpetas numeradas para orden de carga en GAS

**Decisión:** prefijos numéricos (`01_infra`, `02_core`…) para garantizar orden lexicográfico de carga en GAS.

**Justificación:** GAS no tiene `import`/`require`. El orden de carga es por nombre de archivo. Los números garantizan que las dependencias existan antes de ser usadas.

**Estado:** ✅ Permanente mientras el stack sea GAS

---

## DEC-004 — safeExecute() en todos los Controllers

**Decisión:** ningún Controller tiene `try/catch` manual. Todo usa `safeExecute(fn, ctx)`.

**Justificación:** manejo de errores centralizado, respuesta uniforme al cliente siempre.

**Estado:** ✅ Permanente

---

## DEC-005 — No usar Google Forms para postulantes

**Decisión:** el flujo de postulación usa Web App GAS con tokens (EREC), no Google Forms.

**Justificación:** Google Forms no permite UI personalizada, validaciones en tiempo real, ni control del flujo. La Web App da control total y mejor UX.

**Estado:** ✅ Permanente. El código legacy de Google Forms se mantiene como `@deprecated` por compatibilidad.

---

## DEC-006 — DriveOrganizer persiste el ID de carpeta raíz en Script Properties

**Decisión:** la carpeta raíz del ERP en Drive se identifica por su ID (inmutable), no por nombre.

**Justificación:** evitar carpetas duplicadas al re-ejecutar el organizador. Los nombres pueden existir duplicados en Drive; los IDs no.

**Propiedad:** `DRIVE_ROOT_FOLDER_ID_DEV` / `DRIVE_ROOT_FOLDER_ID_PROD`

**Estado:** ✅ Permanente

---

## DEC-007 — Referencias suaves para FKs cross-módulo

**Decisión:** cuando una tabla de un módulo referencia a otra de un módulo diferente, la FK se documenta en comentario pero no se declara formalmente en el Schema.

**Justificación:** evitar que `SetupEngine.syncDatabase()` falle por dependencia de orden entre módulos. El Bootstrap ejecuta los módulos en secuencia, pero el validador de FKs solo ve el lote actual.

**Ejemplo:** `EREC_EntrevistasNotas.id_entrevistador` → `Empleados` (módulo RRHH)

**Estado:** ✅ Permanente hasta que se implemente un migrador multi-módulo

---

## DEC-008 — EREC es independiente de RRHH

**Decisión:** el módulo de reclutamiento (EREC) es completamente separado de RRHH. RRHH gestiona empleados activos; EREC gestiona el pipeline de selección previo a contratar.

**Justificación:** separación de responsabilidades. En SAP son módulos distintos (HCM vs E-Recruiting).

**Integración:** cuando un postulante llega a etapa CONTRATADO, `ErecPostulanteUseCases._convertirAEmpleado()` crea el empleado en RRHH. Un solo click, sin re-ingreso de datos.

**Estado:** ✅ Permanente

---

## DEC-009 — Customizing regional vive en CAT_Paises (MDM)

**Decisión:** los términos regionales (DPI, DUI, Cédula, GTQ, Q…) viven en la tabla `CAT_Paises` del MDM. Se acceden vía `Customizing.getLabelDocumento(idEmpresa)`.

**Justificación:** agregar un nuevo país = agregar una fila. Sin tocar código. Equivalente al IMG de SAP.

**Estado:** ✅ Permanente

---

## DEC-010 — Nombre de la capa "UseCases" en lugar de "Service"

**Decisión:** la capa de lógica de negocio se llama `UseCases` (no `Service` como dice la documentación).

**Justificación:** `UseCases` es más preciso en el contexto de Clean Architecture — cada método es un caso de uso del negocio. `Service` es más ambiguo.

**Nota:** funcionalmente son lo mismo. Esta es una decisión cosmética consciente.

**Estado:** ✅ Permanente en v2. Se puede revisar en Fase 5 de refactorización.

---

## DEC-012 — Business Partner como identidad única transversal

**Decisión:** introducir `BP_MASTER` en MDM como la identidad única de toda persona u organización del sistema.

**Comportamiento:**
- El BP se crea **automáticamente** como efecto secundario de registrar cualquier entidad (Lead, Empleado, Postulante, Empresa). El usuario nunca interactúa directamente con BP.
- Si al crear una entidad ya existe un BP con el mismo `tipo_documento` + `numero_documento`, se reutiliza el existente — no se crea duplicado.
- Un BP puede tener múltiples roles simultáneos (ej: Juan Pérez es POSTULANTE y luego EMPLEADO bajo el mismo `id_bp`).

**Identificadores únicos naturales:**
- `PERSONA_FISICA` → cédula / DPI / DUI / DNI (según país, resuelto por `Customizing.getLabelDocumento()`)
- `PERSONA_JURIDICA` → RUC / NIT / RFC (según país)
- La combinación `tipo_documento + numero_documento` es el campo de deduplicación.
- `id_bp` sigue siendo un autonumérico interno — es la FK que usan los módulos.

**Tablas que agregan `id_bp`:**
- `CAT_Empresas` (tipo: PERSONA_JURIDICA, rol: EMPRESA)
- `Leads` (tipo: PERSONA_FISICA, rol: CLIENTE)
- `Empleados` (tipo: PERSONA_FISICA, rol: EMPLEADO)
- `EREC_Postulantes` (tipo: PERSONA_FISICA, rol: POSTULANTE)

**Los módulos NO cambian su UX.** Los formularios existentes siguen igual. La creación del BP ocurre en los UseCases de cada módulo, transparente para el usuario.

**Datos de prueba:** son semilla, se pueden recrear. La estrategia es correr Bootstrap limpio con el nuevo schema y luego el Seeder que ya crea los BPs automáticamente.

**Estado:** 🔄 En implementación (Fase 3)

---

## DEC-013 — Estructura del BP_MASTER

**Decisión:** el modelo de BP tiene dos tablas en MDM.

`BP_MASTER` — registro central de identidad:
```
id_bp, tipo_bp (PERSONA_FISICA | PERSONA_JURIDICA),
tipo_documento, numero_documento,
nombre, email, telefono,
created_at, created_by
```

`BP_Roles` — roles activos de cada BP:
```
id_rol_bp, id_bp, rol (CLIENTE | EMPLEADO | POSTULANTE | PROVEEDOR | EMPRESA),
modulo, referencia_id, activo, created_at
```

**Justificación:** separar identidad de roles permite que un BP tenga múltiples roles sin duplicar datos personales. Es el modelo exacto de SAP Business Partner.

**Estado:** 🔄 En implementación (Fase 3)

**Decisión (pendiente de implementar):** el módulo `05_mm/` actual contiene lógica de activos (equipos, chips, asignaciones) que arquitectónicamente pertenece a EAM. El MM real (Procure-to-Pay) aún no existe.

**Plan:** Fase 2 del Roadmap — crear `06_eam/` y mover la lógica actual.

**Estado:** 🔄 Pendiente de implementación
