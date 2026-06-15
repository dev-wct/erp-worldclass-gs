# 05_ESTRUCTURA_FISICA_DEL_PROYECTO_V1

## Estado

CONGELADO

## Versión

1.0

## Dependencias

- 01_ERP_CORE_MAP_V5.md
- 02_REQUISITOS_NO_FUNCIONALES_V1.md
- 03_MODELO_DATOS_EMPRESARIAL_V1.md
- 04_ARQUITECTURA_TECNICA_V1.md

---

# 1. PROPÓSITO

Definir la estructura física oficial del ERP.

Esta estructura deberá mantenerse independientemente de:

- Google Apps Script
- Google Sheets
- AppSheet
- Go
- .NET
- Java
- PostgreSQL

La estructura representa la organización permanente del sistema.

---

# 2. PRINCIPIOS RECTORES

## Business First

La estructura sigue el negocio.

No sigue tecnologías.

---

## SAP Inspired

La organización está inspirada en SAP moderno:

- MDM
- HCM
- MM
- EAM
- SD
- FICO
- EREC

---

## Modularidad

Cada módulo debe ser autónomo.

---

## Portabilidad

La estructura debe sobrevivir a cualquier migración tecnológica futura.

---

## Cloud First

Diseñada para ejecutarse inicialmente sobre Google Workspace.

---

## Analytics Ready

Toda información debe poder ser explotada por Reporting y Analytics.

---

## AI Ready

Toda información debe ser consumible por futuras capacidades de IA.

---

# 3. ESTRUCTURA MAESTRA

```text
erp/

├── 01_infra/
├── 02_core/
├── 03_mdm/
├── 04_hcm/
├── 05_mm/
├── 06_eam/
├── 07_sd/
├── 08_fico/
├── 09_erec/
├── 10_analytics/
└── 11_verticals/
```

---

# 4. 01_INFRA

Infraestructura técnica.

Responsable de los mecanismos de soporte.

```text
01_infra/

├── storage/
├── cache/
├── logging/
├── monitoring/
├── scheduler/
├── mail/
├── messaging/
└── api/
```

---

# 5. 02_CORE

Inspirado conceptualmente en SAP Basis.

Responsable de la plataforma.

```text
02_core/

├── bootstrap/
├── config/
├── customizing/
├── security/
├── setup/
├── registry/
├── workflow/
├── events/
├── documents/
├── integration/
└── ui/
```

---

## bootstrap

Inicialización del ERP.

---

## config

Configuración global.

---

## customizing

Parametrización empresarial.

Inspirado en SAP Customizing.

---

## security

Roles, permisos y autenticación.

---

## setup

Instalación y configuración inicial.

---

## registry

Registro de componentes y servicios.

---

## workflow

Motor de procesos.

---

## events

Gestión de eventos empresariales.

---

## documents

Gestión documental corporativa.

---

## integration

Integraciones externas.

---

## ui

Inspirado en SAP Fiori.

```text
ui/

├── design_system/
├── components/
├── layouts/
├── themes/
├── icons/
├── navigation/
└── dashboard/
```

---

# 6. 03_MDM

Master Data Management.

Centro del ERP.

Dueño de los datos maestros.

```text
03_mdm/

├── business_partner/
├── persona/
├── organizacion/
├── ubicacion/
├── cargo/
├── departamento/
├── moneda/
├── pais/
├── catalogos/
└── enterprise_structure/
```

---

## Enterprise Structure

Inspirado directamente en SAP.

```text
enterprise_structure/

├── grupo/
├── empresa/
├── sucursal/
└── unidad_organizativa/
```

---

## Business Partner

Identidad empresarial única.

Consumida por todos los módulos.

---

# 7. 04_HCM

Human Capital Management.

Gestión de talento humano.

```text
04_hcm/

├── empleado/
├── contrato/
├── nomina/
├── vacaciones/
├── asistencia/
├── evaluacion/
├── capacitacion/
└── disciplina/
```

---

# 8. 05_MM

Materials Management.

Compras e inventario.

```text
05_mm/

├── proveedor/
├── compras/
├── inventario/
├── recepcion/
├── requisicion/
└── orden_compra/
```

---

## proveedor

Proveedor empresarial.

Consume Business Partner.

---

## compras

Proceso Procure-to-Pay.

---

## inventario

Control de existencias.

---

# 9. 06_EAM

Enterprise Asset Management.

Gestión de activos empresariales.

```text
06_eam/

├── activo/
├── asignacion/
├── mantenimiento/
├── garantia/
└── baja_activo/
```

---

## activo

Laptop.

Teléfono.

Chip.

Escritorio.

Impresora.

Vehículo.

---

## asignacion

Historial completo de responsables.

---

## mantenimiento

Mantenimiento preventivo y correctivo.

---

# 10. 07_SD

Sales & Distribution.

Pipeline comercial.

```text
07_sd/

├── marketing/
├── ventas/
├── billing/
└── servicio/
```

---

# Marketing

```text
marketing/

├── campania/
├── landing_page/
├── embudo/
├── fuente_lead/
└── audiencia/
```

---

Responsable de:

- Captación
- Generación de Leads
- Marketing Digital
- Call Center Comercial
- Promotores

---

# Ventas

```text
ventas/

├── lead/
├── oportunidad/
├── cotizacion/
├── pedido/
└── actividad_comercial/
```

---

Responsable de:

- Conversión
- Seguimiento
- Negociación
- Cierre

---

# Billing

Facturación.

```text
billing/

├── factura/
├── nota_credito/
├── nota_debito/
└── impuestos/
```

---

Responsable de:

- Facturación
- Documentos fiscales

---

# Servicio

```text
servicio/

├── ticket/
├── seguimiento/
├── caso/
└── satisfaccion/
```

---

Responsable de:

- Postventa
- Atención al cliente

---

# 11. 08_FICO

Finanzas.

```text
08_fico/

├── contabilidad/
├── cxc/
├── cxp/
├── tesoreria/
├── impuestos/
└── conciliacion/
```

---

# Contabilidad

```text
contabilidad/

├── cuenta_contable/
├── asiento/
├── diario/
└── periodo/
```

---

# Cuentas por Cobrar

```text
cxc/

├── cuenta_cobrar/
├── cobro/
├── recibo/
└── antiguedad_saldos/
```

---

# Cuentas por Pagar

```text
cxp/

├── cuenta_pagar/
├── pago/
├── retencion/
└── obligaciones/
```

---

# Tesorería

```text
tesoreria/

├── caja/
├── banco/
├── movimiento/
├── transferencia/
└── flujo_caja/
```

---

Responsable de:

- Liquidez
- Caja
- Bancos
- Flujo de efectivo

---

# 12. 09_EREC

E-Recruiting.

Separado de HCM.

```text
09_erec/

├── vacante/
├── postulacion/
├── entrevista/
├── evaluacion/
├── oferta_laboral/
└── onboarding/
```

---

Responsable de:

- Reclutamiento
- Selección
- Contratación

---

# 13. 10_ANALYTICS

Capa analítica corporativa.

No es dueña de datos.

Consume información de todos los módulos.

```text
10_analytics/

├── reporting/
├── bi/
├── dashboard/
├── kpi/
├── eventos/
├── forecasting/
└── marketing_intelligence/
```

---

# Reporting

```text
reporting/

├── operativo/
├── tactico/
└── ejecutivo/
```

---

Pregunta:

¿Qué pasó?

---

# BI

```text
bi/

├── ventas/
├── marketing/
├── rrhh/
├── finanzas/
└── operaciones/
```

---

Preguntas:

¿Por qué pasó?

¿Qué oportunidades existen?

---

# Forecasting

Predicciones simples basadas en datos históricos.

---

# Marketing Intelligence

Optimización de campañas.

Conversión.

Embudos.

Segmentación.

---

# 14. 11_VERTICALS

Especialización por industria.

```text
11_verticals/

└── travel_agency/
```

---

# Travel Agency

Vertical inicial.

```text
travel_agency/

├── visa/
├── pasaporte/
├── cita_consular/
├── expediente/
├── proveedor_turistico/
├── estudiante_extranjero/
├── programa_migratorio/
├── traduccion/
├── legalizacion/
└── seguimiento_consular/
```

---

# 15. ESTRUCTURA INTERNA DE OBJETOS

Ejemplo:

```text
03_mdm/business_partner/
```

```text
business_partner/

├── bp.entity.js
├── bp.repository.js
├── bp.service.js
├── bp.validator.js
├── bp.events.js
└── bp.constants.js
```

---

# 16. REGLAS DE IMPLEMENTACIÓN

No acceder directamente a Google Sheets desde UI.

No colocar lógica de negocio en HTML.

No duplicar maestros.

No acoplar módulos entre sí.

Siempre consumir Business Partner desde MDM.

Toda integración debe pasar por:

```text
02_core/integration
```

Todo evento empresarial debe registrarse en:

```text
02_core/events
```

Toda parametrización debe vivir en:

```text
02_core/customizing
```

---

# 17. MAPEO SAP

| ERP | SAP |
|-------|-------|
| MDM | Business Partner + MDG |
| HCM | HCM |
| EREC | E-Recruiting |
| MM | Materials Management |
| EAM | Enterprise Asset Management |
| SD | Sales & Distribution |
| Billing | Billing |
| FICO | Financial Accounting + Controlling |
| Analytics | SAC / BW / Embedded Analytics |
| Core | SAP Basis |
| UI | SAP Fiori |

---

# 18. VISIÓN FINAL

El ERP se construirá sobre procesos empresariales.

Los módulos representan capacidades de negocio.

Los datos maestros viven en MDM.

Business Partner es el centro del ecosistema.

Analytics transforma datos en decisiones.

La IA consumirá Analytics.

La tecnología podrá cambiar.

La arquitectura permanecerá.
