# ERP WorldClass v2 — Documento de Arquitectura

**Versión:** 4.0.0
**Plataforma:** Google Apps Script (GAS) + Google Sheets
**Fecha:** Junio 2026
**Clasificación:** Documento técnico interno

---

## Tabla de Contenidos

1. [Visión del Sistema](#1-visión-del-sistema)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Módulos](#3-estructura-de-módulos)
4. [Arquitectura Técnica](#4-arquitectura-técnica)
5. [Capas por Entidad — Clean Architecture](#5-capas-por-entidad--clean-architecture)
6. [Paradigmas de Programación](#6-paradigmas-de-programación)
7. [Infraestructura Core](#7-infraestructura-core)
8. [Módulo E-Recruiting (08_erec)](#8-módulo-e-recruiting-08_erec)
9. [Flujos Clave del Sistema](#9-flujos-clave-del-sistema)
10. [Diseño de Datos](#10-diseño-de-datos)
11. [Frontend — Design System](#11-frontend--design-system)
12. [Isomorfismo y Migración Futura](#12-isomorfismo-y-migración-futura)
13. [Organización de Google Drive](#13-organización-de-google-drive)
14. [Configuración y Customizing Regional](#14-configuración-y-customizing-regional)
15. [Convenciones de Nomenclatura](#15-convenciones-de-nomenclatura)

---

## 1. Visión del Sistema

ERP WorldClass es un sistema de gestión empresarial construido sobre Google Apps Script y Google Sheets. 
Está diseñado para empresas medianas que necesitan procesos ERP profesionales sin la complejidad ni el costo 
de implementar SAP o sistemas similares.

### Propósito

El sistema cubre el **80% de procesos de negocio generales** (RRHH, inventario, finanzas, reclutamiento) y 
un **20% especializado en agencias de viaje** (membresías VIP, call center, citas en restaurantes).

### Principios de diseño

- **Desacoplado** — cada módulo es independiente. Cambiar uno no rompe los otros.
- **Modular** — nuevos módulos se agregan sin modificar los existentes.
- **Isomórfico** — el código está escrito para poder migrar a Hono/Vercel/Supabase sin reescribir la lógica de negocio.
- **Anti vendor lock-in** — el acceso a Google Sheets está 100% abstraído en `DataAdapter`. Si mañana cambia el backend, 
solo ese archivo cambia.
- **Inspirado en SAP** — la nomenclatura, la separación de módulos y los flujos siguen convenciones SAP (HCM, MM, SD, FICO, 
E-Recruiting).

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Google Apps Script V8 (motor JavaScript de Chrome) |
| Base de datos | Google Sheets (una hoja por tabla) |
| Almacenamiento de archivos | Google Drive |
| Frontend interno | HtmlService (modales en Google Sheets) |
| Frontend público | Web App (doGet / doPost) |
| Email | MailApp (nativo GAS) |
| Gestión de código | clasp (CLI de Google Apps Script) |
| Control de versiones | Git |
| Design System | SAP Horizon (CSS custom, Inter font) |

### Por qué Google Sheets como base de datos

GAS es la única plataforma que permite correr código del lado del servidor, servir HTML como Web App, y leer/escribir Sheets, 
todo en el mismo entorno autorizado. Para el tamaño y presupuesto de este proyecto, elimina la necesidad de un servidor dedicado, 
una base de datos externa, y un servicio de autenticación.

---

## 3. Estructura de Módulos

La estructura sigue la convención SAP de módulos numerados por orden de dependencia:

```
erp_worldclass_v2/
│
├── 01_infra/          → Infraestructura técnica (carga primero por orden alfabético)
├── 02_core/           → Núcleo del sistema (configuración, bootstrap, adaptadores)
├── 03_mdm/            → Master Data Management (catálogos maestros compartidos)
├── 04_rrhh/           → Human Capital Management (empleados, nómina)
├── 05_mm/             → Materials Management (equipos, chips, asignaciones)
├── 06_sd/             → Sales & Distribution (campañas, leads, citas)
├── 07_fico/           → Finance & Controlling (nómina, costos)
└── 08_erec/           → E-Recruiting (vacantes, pipeline de selección)
```

### Por qué carpetas numeradas

GAS no tiene `import` ni `require`. Todo el código se compila en un único scope global en **orden lexicográfico** 
por nombre de archivo. Los prefijos numéricos garantizan que las dependencias existan antes de ser usadas:

- `01_infra` carga antes que `02_core` → `BaseRepository` existe cuando `DataAdapter` lo necesita
- `02_core` carga antes que `03_mdm` → `Config` existe cuando `MDM_Schema` lo referencia
- `03_mdm` carga antes que `04_rrhh` → `CAT_Empresas` existe cuando `Empleados` declara su FK

Este patrón reemplaza el sistema de módulos de Node.js dentro de las limitaciones de GAS.

---

## 4. Arquitectura Técnica

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│  HtmlService (modales internos)  +  Web App (pública)  │
│  SAP Horizon Design System — CORE_DesignSystem.html    │
│  Librería JS compartida  — CORE_FormHandler.html       │
└────────────────────────┬────────────────────────────────┘
                         │  google.script.run / fetch
┌────────────────────────▼────────────────────────────────┐
│                   CONTROLLERS                           │
│  Punto de entrada de cada módulo                       │
│  safeExecute() — manejo centralizado de errores        │
│  doGet / doPost — Web App pública (EREC)               │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   USE CASES                             │
│  Orquestación de lógica de negocio                     │
│  Pipelines funcionales: DTO → Validate → Persist → Notify │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│    VALIDATORS       │   │    REPOSITORIES             │
│  Reglas de negocio  │   │  Extienden BaseRepository   │
│  puras, sin I/O     │   │  Solo definen buildRecord() │
└─────────────────────┘   └──────────┬───────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────┐
│                   DATA ADAPTER                          │
│  CORE_DataAdapter.js — abstracción 100% de Sheets      │
│  findAll / findById / insert / update / getNextId      │
│  Anti vendor lock-in: cambiar backend = cambiar 1 archivo │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              GOOGLE SHEETS (base de datos)              │
│  Una pestaña = una tabla  |  Fila 1 = encabezados      │
└─────────────────────────────────────────────────────────┘
```

### Gateway isomórfico

`CORE_FormHandler.html` expone `ERP.Gateway.call()` en el frontend. Cuando se migre a Hono/Vercel, solo cambia la 
implementación del Gateway — los formularios no se tocan.

```
Hoy (GAS):       ERP.Gateway.call('apiGuardarLead', data) → google.script.run
Mañana (Hono):   ERP.Gateway.call('apiGuardarLead', data) → fetch('/api/lead')
```

---

## 5. Capas por Entidad — Clean Architecture

Cada entidad de negocio sigue exactamente el mismo stack vertical de 7 capas:

```
MODULO_Entidad_Controller.js   ← Entrada: triggers GAS, menús, doGet/doPost
MODULO_Entidad_UseCases.js     ← Orquestación: valida + persiste + notifica
MODULO_Entidad_Validator.js    ← Reglas de negocio puras (sin I/O)
MODULO_Entidad_Repository.js   ← Persistencia: extiende BaseRepository
MODULO_Entidad_Entity.js       ← Objeto de dominio inmutable (Object.freeze)
MODULO_Entidad_DTO.js          ← Adaptador de entrada/salida
MODULO_FormEntidad.html        ← Vista: SAP Horizon + CORE_FormHandler
```

### Responsabilidad de cada capa

| Capa | Responsabilidad | Tiene I/O |
|---|---|---|
| **Controller** | Recibir la petición y devolver la respuesta | No (delega) |
| **UseCases** | Orquestar el flujo completo de una operación | No (delega) |
| **Validator** | Verificar reglas de negocio antes de persistir | No |
| **Repository** | Traducir entre dominio y Sheets | Sí (Sheets) |
| **Entity** | Representar el objeto de dominio inmutable | No |
| **DTO** | Normalizar datos de entrada/salida | No |
| **Form HTML** | Interfaz de usuario, UX, validaciones de cliente | Sí (UI) |

### Ejemplo concreto — flujo de registro de Lead

```
SD_FormLead.html
  └→ ERP.Gateway.call('apiGuardarLead', formData)
       └→ SD_Lead_Controller.apiGuardarLead(formData)
            └→ safeExecute(() => LeadUseCases.registrar(formData))
                 └→ LeadDTO.fromForm(formData)          // normalizar
                      └→ LeadValidator.validar(dto)      // reglas
                           └→ LeadEntity.create(dto)     // inmutable
                                └→ LeadRepo.insert(entity) // persistir
                                     └→ DataAdapter.insert('Leads', record)
                                          └→ Google Sheets
```

---

## 6. Paradigmas de Programación

El sistema aplica tres paradigmas de forma deliberada y justificada. No es una mezcla arbitraria — cada paradigma 
se usa donde tiene ventaja real.

### 6.1 Programación Funcional (LISP)

**Dónde se aplica:** transformaciones de datos, pipelines de casos de uso, utilidades, validadores.

**Por qué:** las funciones puras son predecibles, fáciles de testear y no tienen efectos secundarios ocultos. 
En GAS donde no hay un framework de testing robusto, la funcionalidad pura reduce drásticamente los bugs.

**Ejemplos en el código:**

```javascript
// Pipeline funcional en UseCases — cada paso es una transformación pura
registrar: function(dto) {
  const validacion = LeadValidator.validar(dto);           // transforma dto → resultado
  if (!validacion.valido) return { ok: false, ... };

  const entity = LeadEntity.create(dto);                   // transforma dto → entity
  const saved  = LeadRepo.insert(entity, user);            // transforma entity → record
  EmailService.send(saved.email, ...);                     // side effect al final

  return { ok: true, data: LeadDTO.toResponse(saved) };   // transforma record → response
}
```

```javascript
// safeExecute() — función de orden superior (Higher-Order Function)
// Envuelve cualquier función y garantiza manejo de errores uniforme
function safeExecute(action, context) {
  try {
    return action();       // ejecuta la función recibida como argumento
  } catch(err) {
    return ErrorHandler.process(err, context);
  }
}
```

```javascript
// ERP.Gateway — closure funcional en el frontend
ERP.Gateway = (function() {
  function call(method, payload, onSuccess, onFailure) { ... }
  function callArgs(method, args, onSuccess, onFailure) { ... }
  return { call, callArgs };  // interfaz pública mínima
})();
```

**Justificación LISP:** en LISP, todo es una expresión que devuelve un valor y las funciones son ciudadanos de primera clase. 
El patrón `safeExecute(fn, ctx)` es exactamente eso — una función que recibe una función y la envuelve con comportamiento adicional. Los pipelines de UseCases (DTO → Validate → Entity → Persist → Notify) son secuencias de transformaciones funcionales puras, sin estado compartido.

### 6.2 Programación Orientada a Objetos (POO)

**Dónde se aplica:** Entidades de dominio, BaseRepository, jerarquía de errores, servicios con estado.

**Por qué:** cuando el dominio modela objetos del mundo real con comportamiento propio (un Empleado, una Vacante, una Asignación), 
la POO expresa esa semántica de forma natural.

**Ejemplos en el código:**

```javascript
// BaseRepository — clase base con herencia
// Los repositorios específicos solo definen buildRecord()
class BaseRepository {
  constructor(tableName, toEntity) { ... }
  findAll(filters)  { ... }  // heredado por todos
  findById(id)      { ... }  // heredado por todos
  insert(entity)    { ... }  // heredado por todos
  update(id, fields){ ... }  // heredado por todos
  buildRecord(...)  { throw new Error('Implementar en subclase'); }  // abstracto
}

// Subclase — solo define lo específico de Leads
const LeadRepo = new class extends BaseRepository {
  constructor() { super('Leads', (raw) => LeadEntity.create(raw)); }
  buildRecord(id, entity, now, user) {
    return { id_lead: id, nombre_completo: entity.nombre_completo, ... };
  }
  findByEstado(estado) { return this.findByField('estado', estado); }
}();
```

```javascript
// Jerarquía de errores — POO para clasificar y manejar errores
class AppError extends Error { ... }              // base
class ValidationError extends AppError { ... }   // datos inválidos
class BusinessError extends AppError { ... }     // regla de negocio
class InfrastructureError extends AppError { ... } // fallo técnico
```

```javascript
// Entity — objeto de dominio inmutable
const VacanteEntity = {
  create: function(props) {
    return Object.freeze({    // inmutable por diseño
      id_vacante: props.id_vacante || null,
      titulo:     props.titulo,
      estado:     props.estado || 'BORRADOR',
      ...
    });
  }
};
```

**Justificación POO:** `BaseRepository` con herencia elimina ~60% de código duplicado. Sin ella, 
cada uno de los 20+ repositorios repetiría las mismas operaciones CRUD. 
La jerarquía de errores permite que `safeExecute()` maneje cada tipo diferente sin `if/else` en todos los controladores.

### 6.3 Estilo COBOL — Registros estructurados y auditados

**Dónde se aplica:** `buildRecord()` en todos los repositorios, esquemas de tablas, campos de auditoría.

**Por qué:** en sistemas financieros y de RRHH, cada transacción debe ser un registro completo, 
inmutable e identificable. COBOL, diseñado para contabilidad, garantizaba que cada operación sobre datos dejara un rastro completo. Este sistema aplica el mismo principio.

**Ejemplos en el código:**

```javascript
// buildRecord() — cada registro es una estructura plana y completa
// Equivalente a un "párrafo de datos" en COBOL
buildRecord(id, entity, now, user) {
  return {
    id_pago:      id,           // PK autonumérica
    id_empleado:  entity.id_empleado,
    sueldo_base:  entity.sueldo_base,
    comisiones:   entity.comisiones,
    total_neto:   entity.total_neto,
    created_at:   now,          // auditoría — cuándo
    created_by:   user,         // auditoría — quién
  };
}
```

```javascript
// Esquema de tabla — define la estructura como COBOL define un RECORD
const RRHH_Schema = {
  Empleados: {
    pk: 'id_empleado',
    columns: ['id_empleado', 'nombre_completo', 'dpi', 'email',
              'id_empresa', 'id_departamento', 'activo',
              'created_at', 'updated_at', 'created_by'],
    fk: { id_empresa: 'CAT_Empresas' }
  }
};
```

**Justificación COBOL:** COBOL definía datos como `WORKING-STORAGE SECTION` con campos fijos y bien tipados. Los `buildRecord()` 
de este sistema son exactamente eso — estructuras fijas que definen qué campos se persisten, en qué orden, 
y con qué valores por defecto. Los campos `created_at`, `updated_at`, `created_by` 
son obligatorios en todos los registros transaccionales, igual que los campos de auditoría en COBOL.

### Resumen — cuándo usar cada paradigma

| Capa | Paradigma | Razón |
|---|---|---|
| UseCases — pipeline de operaciones | **Funcional** | Sin estado, composable, predecible |
| Validator — reglas de negocio | **Funcional** | Función pura: dto → {valido, errores} |
| DTO — transformaciones | **Funcional** | Función pura: raw → normalizado |
| safeExecute — manejo de errores | **Funcional (HOF)** | Decorador sin estado |
| Repository — persistencia | **POO (herencia)** | Reutilización de CRUD común |
| Entity — objeto de dominio | **POO + inmutabilidad** | Semántica clara del dominio |
| ErrorHandler — jerarquía de errores | **POO** | Polimorfismo para clasificar errores |
| buildRecord — estructura del registro | **COBOL** | Registro fijo, auditado, completo |
| Schema — definición de tablas | **COBOL** | Declarativo, sin lógica |

---

## 7. Infraestructura Core

### 7.1 INFRA_BaseRepository.js

Clase base genérica que provee CRUD completo. Todos los repositorios la extienden y solo implementan `buildRecord()`. 
Elimina ~60% de código duplicado.

### 7.2 INFRA_ErrorHandler.js

Jerarquía de errores y función `safeExecute()`. Garantiza que todos los controladores devuelvan la misma estructura de respuesta, 
sin `try/catch` repetidos.

Contrato de respuesta garantizado:
```javascript
{ ok: true,  data: any,      mensaje: string }   // éxito
{ ok: false, errores: string[], ...}              // error controlado
```

### 7.3 CORE_Config.js

Configuración global con cero dependencias. Se carga en cualquier orden. Resuelve el nombre del ERP por prioridad:
1. Script Property `ERP_NAME`
2. Nombre del archivo de la Sheet activa
3. Fallback hardcodeado

### 7.4 CORE_DataAdapter.js

Abstracción 100% del acceso a Google Sheets. Es el único archivo que usa `SpreadsheetApp` para leer/escribir datos. 
Toda la aplicación usa esta interfaz.

```javascript
DataAdapter.findAll(tabla, filtros)
DataAdapter.findById(tabla, id)
DataAdapter.insert(tabla, registro)
DataAdapter.update(tabla, id, campos)
DataAdapter.getNextId(tabla)
```

### 7.5 CORE_SetupEngine.js

Motor de migraciones. Lee el schema de cada módulo y crea/actualiza las pestañas en la Sheet. Idempotente: 
se puede ejecutar N veces sin efectos negativos.

**Capacidades del migrador v2:**
- Crea tablas nuevas con encabezados formateados
- Agrega columnas faltantes sin borrar datos
- **Detecta y corrige columnas fuera de orden** preservando todos los datos existentes

### 7.6 CORE_Bootstrap.js

Orquestador del setup inicial. Ejecuta las migraciones en orden de dependencias:
1. MDM (catálogos base)
2. RRHH (empleados)
3. MM (inventario)
4. SD (ventas)
5. FICO (finanzas)
6. EREC (reclutamiento)
7. Drive (organización de carpetas)

### 7.7 CORE_Customizing.js

Equivalente al IMG (Implementation Guide) de SAP. Resuelve configuración regional por empresa sin hardcodear términos en el código.

```javascript
Customizing.getLabelDocumento(idEmpresa)  // "DPI" | "DUI" | "Cédula" | ...
Customizing.getSimboloMoneda(idEmpresa)   // "Q" | "$" | "€" | ...
Customizing.getContextoEmpresa(idEmpresa) // objeto completo con todo el contexto regional
```

Los términos viven en `CAT_Paises` del MDM. Agregar un nuevo país = agregar una fila. Sin tocar código.

### 7.8 CORE_DriveService.js

Sube archivos a Google Drive desde formularios públicos. El candidato no necesita cuenta de Google — el archivo llega 
como Base64 en el POST, el servidor lo decodifica y lo sube a la carpeta correcta según la jerarquía del módulo.

Ruta de archivos EREC:
```
ERP_WorldClass_DEV/
└── EREC/
    └── Vacantes/
        └── EREC-0001/
            └── Ana_Lopez_DPI_3000001/
                └── cv_ana_lopez.pdf
```

### 7.9 CORE_DriveOrganizer.js

Crea y mantiene la estructura de carpetas en Drive. **Idempotente garantizado:** el ID de la carpeta raíz se persiste 
en Script Properties. En ejecuciones posteriores se busca por ID inmutable, no por nombre. Nunca crea carpetas duplicadas.

---

## 8. Módulo E-Recruiting (08_erec)

El módulo de reclutamiento electrónico está inspirado en SAP E-Recruiting y SuccessFactors. Es completamente independiente 
del módulo RRHH — RRHH gestiona empleados activos, EREC gestiona el pipeline de selección antes de contratar.

### Entidades

| Tabla | Descripción |
|---|---|
| `EREC_Vacantes` | Posición abierta (equivalente a Requisición de Personal en SAP HCM) |
| `EREC_Postulantes` | Candidatos vinculados a una vacante específica |
| `EREC_EntrevistasNotas` | Evaluaciones y observaciones por candidato (Talent Assessment) |
| `EREC_LinksPostulacion` | Tokens de acceso al formulario público |

### Pipeline de etapas

```
POSTULADO → REVISION → ENTREVISTA → PRUEBA → OFERTA → CONTRATADO
                                                           ↓
                                               RRHH.EmpleadoUseCases.contratar()
                                               (un solo click — sin re-ingreso de datos)

DESCARTADO ← (desde cualquier etapa)
```

### Modos de postulación

| Modo | Descripción | Expiración |
|---|---|---|
| **INDIVIDUAL** | Token personal para un candidato específico | 7 días, 1 solo uso |
| **PUBLICO** | Link abierto para landing page o redes sociales | 1 año, usos ilimitados |

### Formulario público (Web App)

El formulario muestra la información de la vacante (título, descripción, requisitos) en una tarjeta visual. 
El label del documento de identidad (DPI, DUI, Cédula…) se resuelve automáticamente desde `Customizing` 
según el país de la empresa. El CV se adjunta directamente desde el dispositivo del candidato y se sube a Drive en el servidor.

---

## 9. Flujos Clave del Sistema

### 9.1 Reclutamiento (EREC)

```
Reclutador crea Vacante
    │
    ├─→ [Modo Individual] Genera token → Email al candidato con link personal
    │
    └─→ [Modo Público] Genera link → Publica en redes / landing page
                │
                ▼
        Candidato abre el link → doGet valida → muestra EREC_FormPostulante
                │
                ▼
        Candidato adjunta CV y envía → doPost
                │
                ├─→ CV subido a Drive: EREC/Vacantes/EREC-XXXX/Candidato/
                ├─→ Registro en EREC_Postulantes (etapa: POSTULADO)
                └─→ Email de confirmación al candidato
                │
                ▼
        Reclutador avanza etapas: REVISION → ENTREVISTA → PRUEBA → OFERTA
                │
                ▼ (CONTRATADO)
        ErecPostulanteUseCases._convertirAEmpleado()
                └─→ EmpleadoUseCases.contratar(dto)
                        └─→ Nuevo registro en tabla Empleados (RRHH)
```

### 9.2 Call Center — Lead a Cita VIP (SD)

```
Reclutador registra Lead → SD_FormLead
    │
    ▼
Agente llama → SD_FormLlamada (con timer)
    │
    ▼ (resultado: CITA AGENDADA)
Cita en restaurante → SD_FormCita
    │
    ▼ (resultado_venta: VENTA)
Comisión calculada automáticamente → FICO_FormPago
    └─→ NominaUseCases.calcularComisiones(idEmpleado, año, mes, quincena)
```

### 9.3 Asignación de activos (MM)

```
Registrar Equipo (MM_FormEquipo) → estado: EN_BODEGA
Registrar Chip   (MM_FormChip)   → estado: EN_BODEGA
    │
    ▼
Asignación (MM_FormAsignacion) → estado: PENDIENTE → APROBADO
    └─→ Equipo y Chip → estado: ACTIVO
    └─→ Acta de entrega → link en Drive/MM/Asignaciones/
```

---

## 10. Diseño de Datos

### Normalización

El diseño sigue las tres formas normales (3FN) donde aplica:

- **1FN:** cada celda contiene un valor atómico. No hay listas en campos.
- **2FN:** cada campo no-clave depende de la clave primaria completa.
- **3FN:** no hay dependencias transitivas. Los nombres de empresa, departamento, etc. no se repiten en tablas hijas 
— solo el ID.

### Claves foráneas

Las FKs se declaran en el Schema y el `SetupEngine` las valida antes de crear tablas. Si una tabla dependiente no existe, 
la migración falla con error descriptivo.

```javascript
Empleados: {
  fk: {
    id_empresa:      'CAT_Empresas',      // debe existir antes
    id_departamento: 'CAT_Departamentos', // debe existir antes
  }
}
```

### Referencias suaves (cross-module)

Cuando una tabla de un módulo referencia a otra de un módulo diferente, se usa una **referencia suave** 
(el campo existe pero no se declara FK) para evitar dependencias de orden entre módulos:

```javascript
// EREC_Postulantes referencia Empleados (RRHH) — módulo diferente
// Se documenta en comentario pero no se declara como FK
id_entrevistador: '...',   // referencia suave → Empleados
```

### Campos de auditoría obligatorios

Todas las tablas transaccionales incluyen:

| Campo | Tipo | Propósito |
|---|---|---|
| `created_at` | Timestamp | Cuándo se creó el registro |
| `updated_at` | Timestamp | Última modificación |
| `created_by` | String (email) | Quién lo creó |

---

## 11. Frontend — Design System

Todos los formularios usan el **SAP Horizon Design System** implementado en `CORE_DesignSystem.html`. 
Es la única fuente de verdad para estilos — ningún formulario define CSS propio excepto para componentes específicos de su contexto.

### Tokens de diseño

```css
--sap-primary: #0a6ed1        /* azul SAP */
--sap-success: #107e3e        /* verde semáforo */
--sap-error:   #bb0000        /* rojo semáforo */
--sap-warning: #e9730c        /* naranja semáforo */
--sap-font-family: 'Inter'    /* tipografía */
```

### Componentes disponibles

- `.sap-card` + `.sap-card-header` + `.sap-card-content` + `.sap-card-footer`
- `.sap-form-grid` (grid responsive auto-fit)
- `.sap-input` / `.sap-select` / `.sap-textarea`
- `.sap-btn` / `.sap-btn-emphasized` / `.sap-btn-accept` / `.sap-btn-reject`
- `.sap-message-strip` (info / success / error / warning)
- `.sap-section-title`
- `.sap-spinner` (animación CSS pura)

### CORE_FormHandler.html

Librería JS compartida por todos los formularios internos. Expone cuatro namespaces funcionales:

```javascript
ERP.Msg.show(text, type, elementId)     // manejo de message strips
ERP.Btn.loading(btnId)                  // estado loading del botón
ERP.Btn.ready(btnId, originalText)      // restaurar botón
ERP.Select.fill(id, items, valueField, labelFn)  // poblar selects
ERP.Select.autoSelect(id, needle)       // pre-seleccionar opción
ERP.Form.collect(fieldIds)              // recoger valores del form
ERP.Form.formatGTQ(amount)             // formatear moneda
ERP.Gateway.call(method, payload, ...)  // llamar al servidor
ERP.Gateway.callArgs(method, args, ...) // llamar con múltiples args
```

---

## 12. Isomorfismo y Migración Futura

El sistema está diseñado para poder migrar a un stack moderno (Hono + Vercel + Supabase) sin reescribir la lógica de negocio.

### Qué no cambia al migrar

- Todas las capas de UseCases
- Todos los Validators
- Todas las Entities
- Todos los DTOs
- Todos los formularios HTML

### Qué cambia al migrar

| Hoy (GAS) | Mañana (Hono/Vercel) |
|---|---|
| `DataAdapter` (lee Sheets) | `DataAdapter` (lee Supabase/PostgreSQL) |
| `ERP.Gateway.call()` (usa `google.script.run`) | `ERP.Gateway.call()` (usa `fetch('/api/...')`) |
| `doGet / doPost` en GAS | Rutas Hono equivalentes |
| `MailApp.sendEmail()` | Resend / SendGrid |
| `DriveApp.createFile()` | Supabase Storage / S3 |

El cambio es de infraestructura, no de lógica. Eso es la definición de Clean Architecture.

### Svelte (planificado)

Cuando se implemente el frontend moderno con Svelte/SvelteKit:
- Los componentes Svelte reemplazarán los formularios HtmlService
- `ERP.Gateway` se convierte en un store Svelte con las mismas funciones
- El Design System migra a variables CSS con los mismos tokens

---

## 13. Organización de Google Drive

Estructura de carpetas por módulo SAP. Cada módulo es dueño de sus archivos.

```
ERP_WorldClass_DEV/
├── EREC/
│   └── Vacantes/
│       └── EREC-0001/
│           └── Juan_Perez_DPI_1234567890123/
│               ├── cv.pdf
│               └── cedula.jpg
├── RRHH/
│   ├── Empleados/
│   └── Onboarding/
├── MM/
│   ├── Equipos/
│   ├── Chips/
│   └── Asignaciones/
├── SD/
│   └── Campanas/
├── FICO/
│   ├── Nomina/
│   └── Facturas/
└── CORE/
    ├── Reportes/
    ├── Plantillas/
    └── Backups/
```

**Idempotencia garantizada:** el ID de la carpeta raíz se persiste en Script Properties (`DRIVE_ROOT_FOLDER_ID_DEV`). 
Ejecutar `apiOrganizarDrive` N veces no crea duplicados.

---

## 14. Configuración y Customizing Regional

### Script Properties requeridas

| Propiedad | Descripción | Ejemplo |
|---|---|---|
| `WEBAPP_URL` | URL de la Web App publicada | `https://script.google.com/macros/s/.../exec` |
| `ERP_NAME` | Nombre del ERP (override) | `WorldClass Travel` |
| `DRIVE_ROOT_FOLDER_ID_DEV` | ID de carpeta raíz DEV (auto-generado) | `1BxiM...` |
| `DRIVE_ROOT_FOLDER_ID_PROD` | ID de carpeta raíz PROD (auto-generado) | `2CyiN...` |

### Customizing por país (MDM)

Los términos regionales viven en `CAT_Paises`. Agregar un nuevo país requiere solo una fila de datos:

| id_pais | nombre | codigo_iso | moneda_codigo | moneda_simbolo | label_documento | formato_fecha |
|---|---|---|---|---|---|---|
| 1 | Guatemala | GT | GTQ | Q | DPI | DD/MM/YYYY |
| 2 | El Salvador | SV | USD | $ | DUI | DD/MM/YYYY |
| 5 | Colombia | CO | COP | $ | Cédula de Ciudadanía | DD/MM/YYYY |

`Customizing.getLabelDocumento(idEmpresa)` resuelve el término correcto en tiempo de ejecución.

---

## 15. Convenciones de Nomenclatura

### Archivos

```
MODULO_Entidad_Capa.js

Ejemplos:
  RRHH_Empleado_Repository.js
  SD_Lead_UseCases.js
  FICO_Pago_Validator.js
  MM_Equipo_Controller.js
  EREC_Vacante_Entity.js
```

### Prefijos de módulo

| Prefijo | Módulo |
|---|---|
| `INFRA_` | Infraestructura técnica |
| `CORE_` | Núcleo del sistema |
| `MDM_` | Master Data Management |
| `RRHH_` | Recursos Humanos / HCM |
| `MM_` | Materials Management |
| `SD_` | Sales & Distribution |
| `FICO_` | Finance & Controlling |
| `EREC_` | E-Recruiting |

### Funciones de API (Controllers)

Todas las funciones de API siguen el patrón:
```
api[Verbo][Entidad][Contexto]()

Ejemplos:
  apiGuardarLead()
  apiGetCatalogosVacante()
  apiAvanzarEtapaPostulante()
  apiGenerarLinkVacante()
```

### Namespaces de repositorios

```javascript
LeadRepo            // SD
EmpleadoRepo        // RRHH
VacanteRepo         // EREC
ErecPostulanteRepo  // EREC (prefijo para distinguir de PostulanteRepo de RRHH)
ErecLinkRepo        // EREC
```

### Variables de template GAS (HtmlService)

Las variables pasadas al template usan camelCase:
```javascript
tpl.erpName         = Config.ERP_NAME;
tpl.labelDocumento  = Customizing.getLabelDocumento(idEmpresa);
tpl.vacanteData     = JSON.stringify(VacanteDTO.toPublic(vacante));
```

---

## Apéndice — Estructura de archivos completa

```
erp_worldclass_v2/
├── 01_infra/
│   ├── INFRA_BaseRepository.js
│   └── INFRA_ErrorHandler.js
│
├── 02_core/
│   ├── CORE_AIService.js
│   ├── CORE_Bootstrap.js
│   ├── CORE_Config.js
│   ├── CORE_Customizing.js
│   ├── CORE_DataAdapter.js
│   ├── CORE_DesignSystem.html
│   ├── CORE_DriveOrganizer.js
│   ├── CORE_DriveService.js
│   ├── CORE_EmailService.js
│   ├── CORE_FormHandler.html
│   ├── CORE_Gateway.js
│   ├── CORE_SetupEngine.js
│   ├── CORE_StorageService.js
│   ├── CORE_TestSeeder.js
│   ├── CORE_Utils.js
│   └── CORE_WhatsAppService.js
│
├── 03_mdm/
│   ├── MDM_Schema.js          → CAT_Paises, CAT_Empresas, CAT_Departamentos, CAT_Roles
│   └── MDM_Setup.js           → Datos semilla de catálogos
│
├── 04_rrhh/
│   ├── RRHH_Schema.js         → Postulantes, Empleados, Onboarding, Bajas
│   ├── entrypoint.js          → onOpen(), menús
│   ├── empleado/              → Entity, DTO, Validator, Repo, UseCases, Controller, Form
│   ├── nomina/                → DTO, UseCases, Validator
│   └── postulante/            → Entity, DTO, Validator, Repo, UseCases, Controller, Form
│
├── 05_mm/
│   ├── MM_Schema.js           → Equipos, Chips, Asignaciones + catálogos MM
│   ├── MM_Setup.js
│   ├── equipo/                → Stack completo
│   ├── chip/                  → Stack completo
│   └── asignacion/            → Stack completo
│
├── 06_sd/
│   ├── SD_Schema.js           → Campanas, Leads, Llamadas, Citas
│   ├── campana/               → Stack completo
│   ├── lead/                  → Stack completo
│   ├── llamada/               → Stack completo + timer widget
│   └── cita/                  → Stack completo
│
├── 07_fico/
│   ├── FICO_Schema.js         → Pagos_Nomina, Costos_Chips
│   ├── pago_nomina/           → Stack completo + cálculo de comisiones
│   └── costo_chip/            → Entity, Repo, UseCases
│
└── 08_erec/
    ├── EREC_Schema.js         → EREC_Vacantes, EREC_Postulantes,
    │                            EREC_EntrevistasNotas, EREC_LinksPostulacion
    ├── EREC_Setup.js
    ├── entrypoint.js          → apiMigrarEREC(), abrirDialogoVerLinksEREC()
    └── vacante/
        ├── EREC_Vacante_Entity.js
        ├── EREC_Vacante_DTO.js
        ├── EREC_Vacante_Validator.js
        ├── EREC_Vacante_Repository.js   → VacanteRepo, ErecPostulanteRepo, ErecLinkRepo
        ├── EREC_Entrevista_Repository.js → ErecEntrevistaRepo, ErecEntrevistaUseCases
        ├── EREC_Vacante_UseCases.js     → VacanteUseCases, ErecPostulanteUseCases
        ├── EREC_Vacante_Controller.js   → doGet, doPost, 9 APIs internas
        ├── EREC_FormVacante.html        → Formulario interno (modal Sheets)
        └── EREC_FormPostulante.html     → Formulario público (Web App)
```
