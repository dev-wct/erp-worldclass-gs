# 06_ESTANDARES_DE_DESARROLLO_V1

## Estado

CONGELADO

## Versión

1.0

## Dependencias

- 01_ERP_CORE_MAP_V5.md
- 02_REQUISITOS_NO_FUNCIONALES_V1.md
- 03_MODELO_DATOS_EMPRESARIAL_V1.md
- 04_ARQUITECTURA_TECNICA_V1.md
- 05_ESTRUCTURA_FISICA_DEL_PROYECTO_V1.md

---

# 1. PROPÓSITO

Definir los estándares oficiales de desarrollo del ERP.

Estos estándares buscan:

- Reducir deuda técnica
- Facilitar mantenimiento
- Mejorar legibilidad
- Facilitar migraciones futuras
- Garantizar consistencia

---

# 2. FILOSOFÍA

## Business First

Primero negocio.

Después tecnología.

---

## SAP Inspired

Los procesos dominan el diseño.

Las pantallas son secundarias.

---

## Excel First

El usuario piensa en filas, columnas y procesos.

El ERP abstrae la complejidad.

---

## Cloud First

Todo debe funcionar en un entorno cloud.

---

## Analytics First

Todo dato debe poder analizarse.

---

## AI Ready

Toda información debe ser consumible por futuros asistentes inteligentes.

---

# 3. REGLAS DE ORO

## Regla 1

Proceso > Pantalla

---

## Regla 2

Dato > Interfaz

---

## Regla 3

Dominio > Tecnología

---

## Regla 4

Simplicidad > Elegancia

---

## Regla 5

Legibilidad > Clever Code

---

## Regla 6

Configuración > Código Hardcodeado

---

## Regla 7

Eventos > Acoplamiento Directo

---

# 4. CONVENCIONES DE NOMENCLATURA

## Carpetas

Siempre:

```text
snake_case
```

Ejemplos:

```text
business_partner
sales_order
cost_center
bank_account
```

---

## Archivos

Siempre:

```text
snake_case.tipo.js
```

Ejemplos:

```text
lead.entity.js

lead.repository.js

lead.service.js

lead.validator.js

lead.events.js

lead.constants.js
```

---

## Variables

Siempre:

```javascript
camelCase
```

Ejemplos:

```javascript
leadId

invoiceNumber

employeeCode
```

---

## Constantes

Siempre:

```javascript
UPPER_SNAKE_CASE
```

Ejemplos:

```javascript
MAX_RETRIES

DEFAULT_CURRENCY

STATUS_ACTIVE
```

---

## Funciones

Siempre:

```javascript
verbo + sustantivo
```

Ejemplos:

```javascript
createLead()

convertLead()

createInvoice()

registerPayment()

hireEmployee()
```

---

# 5. CONVENCIONES DE IDENTIFICADORES

## Business Partner

```text
BP-000001
```

---

## Empleados

```text
EMP-000001
```

---

## Proveedores

```text
SUP-000001
```

---

## Activos

```text
AST-000001
```

---

## Leads

```text
LED-000001
```

---

## Facturas

```text
INV-000001
```

---

## Pagos

```text
PAY-000001
```

---

## Vacantes

```text
VAC-000001
```

---

# 6. CONVENCIONES PARA GOOGLE SHEETS

## Regla

No usar nombres ambiguos.

Nunca:

```text
Hoja1

Hoja2

Clientes

ClientesFinal

Clientes2025
```

---

Siempre:

```text
BP_MASTER

EMPLOYEE_MASTER

SUPPLIER_MASTER

INVOICE_HEADER

INVOICE_DETAIL

PAYMENT_HEADER

PAYMENT_DETAIL
```

---

# 7. CONVENCIONES DE EVENTOS

Los eventos representan hechos empresariales.

---

Formato:

```text
Objeto + Acción
```

---

Ejemplos:

```text
LeadCreated

LeadConverted

InvoiceIssued

PaymentReceived

EmployeeHired

AssetAssigned

CandidateApproved
```

---

# 8. CONVENCIONES DE SERVICIOS

Formato:

```text
Objeto + Service
```

---

Ejemplos:

```text
LeadService

InvoiceService

EmployeeService

PaymentService

AssetService
```

---

# 9. CONVENCIONES DE REPOSITORIOS

Formato:

```text
Objeto + Repository
```

---

Ejemplos:

```text
LeadRepository

InvoiceRepository

BusinessPartnerRepository

EmployeeRepository
```

---

# 10. CONVENCIONES DE VALIDADORES

Formato:

```text
Objeto + Validator
```

---

Ejemplos:

```text
LeadValidator

InvoiceValidator

EmployeeValidator
```

---

# 11. CONVENCIONES DE PANTALLAS

Inspirado en SAP Fiori.

---

Formato:

```text
Objeto + Acción
```

---

Ejemplos:

```text
LeadList

LeadDetail

LeadForm

LeadDashboard

InvoiceList

EmployeeProfile
```

---

# 12. CONVENCIONES DE DASHBOARDS

Formato:

```text
Dominio + Dashboard
```

---

Ejemplos:

```text
SalesDashboard

MarketingDashboard

FinanceDashboard

HRDashboard
```

---

# 13. CONVENCIONES DE API

Formato:

```text
/api/recurso
```

---

Ejemplos:

```text
/api/business-partners

/api/employees

/api/invoices

/api/payments
```

---

# 14. CONVENCIONES DE LOGS

Niveles oficiales:

```text
INFO

WARN

ERROR

AUDIT
```

---

## INFO

Operación normal.

---

## WARN

Situación anómala.

---

## ERROR

Fallo técnico.

---

## AUDIT

Evento empresarial relevante.

---

# 15. AUDITORÍA

Toda operación importante debe generar auditoría.

---

Acciones oficiales:

```text
CREATE

UPDATE

DELETE

APPROVE

REJECT

ASSIGN

UNASSIGN

LOGIN

LOGOUT
```

---

# 16. ESTRUCTURA INTERNA DE OBJETOS

Ejemplo:

```text
lead/
```

---

```text
lead/

├── lead.entity.js
├── lead.repository.js
├── lead.service.js
├── lead.validator.js
├── lead.events.js
└── lead.constants.js
```

---

# 17. RESPONSABILIDADES

## Entity

Representa negocio.

---

## Repository

Acceso a datos.

---

## Service

Casos de uso y lógica empresarial.

---

## Validator

Validaciones.

---

## Events

Eventos empresariales.

---

## Constants

Constantes del módulo.

---

# 18. REGLAS PARA HTML

HTML no contiene negocio.

---

Permitido:

```text
Presentación

Layouts

Navegación
```

---

Prohibido:

```text
Reglas empresariales

Consultas directas

Procesamiento complejo
```

---

# 19. REGLAS PARA APPS SCRIPT

Apps Script es infraestructura.

No es dominio.

---

Nunca:

```text
Lógica empresarial dispersa
```

---

Siempre:

```text
Servicios

Repositorios

Eventos
```

---

# 20. REGLAS PARA CUSTOMIZING

Toda parametrización empresarial vive en:

```text
02_core/customizing
```

---

Ejemplos:

```text
Estados

Catálogos

Tipos de documentos

Flujos

Configuraciones
```

---

Nunca hardcodear configuraciones de negocio.

---

# 21. REGLAS PARA INTEGRACIONES

Toda integración debe vivir en:

```text
02_core/integration
```

---

Ejemplos:

```text
WhatsApp

Meta

Google Analytics

Google Ads

Gmail

Calendar

Drive

AppSheet
```

---

# 22. REGLAS PARA ANALYTICS

Todo módulo debe responder:

```text
¿Qué pasó?

¿Por qué pasó?

¿Qué debería hacer?
```

---

Ejemplos:

## Ventas

```text
¿Cuántos leads llegaron?

¿Cuántos cerraron?

¿Por qué se perdieron?
```

---

## Finanzas

```text
¿Cuánto cobramos?

¿Cuánto debemos?

¿Cuál es el flujo de caja?
```

---

## RRHH

```text
¿Cuánto tarda una contratación?

¿Cuál es la rotación?
```

---

# 23. REGLAS PARA IA

La IA no reemplaza procesos.

La IA asiste procesos.

---

La IA consume:

```text
Analytics

Eventos

Datos Maestros

Transacciones
```

---

La IA recomienda.

El usuario decide.

---

# 24. ANTI PATRONES PROHIBIDOS

Nunca crear:

```text
helpers.js

utils.js

misc.js

common.js

final.js

final_v2.js
```

---

Nunca:

```text
Copiar y pegar lógica
```

---

Nunca:

```text
Duplicar maestros
```

---

Nunca:

```text
Consultar Google Sheets desde HTML
```

---

Nunca:

```text
Acoplar módulos directamente
```

---

# 25. VISIÓN FINAL

El ERP debe ser:

- Simple de entender
- Fácil de mantener
- Difícil de romper
- Fácil de migrar
- Fácil de extender

La arquitectura debe sobrevivir a la tecnología.

Los procesos deben sobrevivir a la arquitectura.

Los datos deben sobrevivir a los procesos.

La información debe generar decisiones.

Las decisiones deben generar ventaja competitiva.
