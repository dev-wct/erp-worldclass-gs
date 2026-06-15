# ERP CORE MAP V1

## Mini SAP Cloud para PYMES y Agencias de Viajes

---

# Visión

Construir una plataforma ERP Cloud First, modular, escalable y orientada a procesos, inspirada en los principios arquitectónicos de SAP moderno, utilizando Google Apps Script como laboratorio de negocio, validación de procesos y experimentación arquitectónica.

La tecnología es un medio.

El activo principal son:

- Procesos
- Dominios
- Datos maestros
- Reglas de negocio
- Arquitectura empresarial

---

# PRINCIPIOS ARQUITECTÓNICOS

## Regla #1

Los módulos representan capacidades de negocio.

No representan departamentos.

### Correcto

- Ventas
- RRHH
- Finanzas

### Incorrecto

- Call Center
- Marketing Digital
- Piso 2

---

## Regla #2

MDM es dueño de los datos maestros.

Los módulos consumen los datos.

---

## Regla #3

Los módulos son dueños de los procesos.

No de las identidades.

---

## Regla #4

La parametrización debe vivir fuera del código.

Inspirado en SAP Customizing.

---

## Regla #5

La arquitectura debe ser:

- 80% Genérica
- 20% Vertical

El ERP debe servir para múltiples industrias.

Las verticales agregan comportamiento específico.

---

# CAPAS DEL SISTEMA

## 01_INFRA

### Inspiración SAP

Infraestructura SAP Cloud

### Responsabilidades

- Apps Script Runtime
- Google Workspace
- Google Drive
- Google Sheets
- APIs
- Servicios externos

---

## 02_CORE

### Inspiración SAP

SAP Basis

### Responsabilidades

- Bootstrap
- Configuración
- Parametrización
- Seguridad
- Setup
- Registro de módulos
- Framework UI

### Estructura

```text
02_core
├── bootstrap
├── config
├── customizing
├── security
├── setup
├── registry
├── integration
└── ui
```

---

# UI

## Inspiración SAP

SAP Fiori

### Estructura

```text
02_core/ui
├── design_system
├── components
├── layouts
├── themes
└── icons
```

### Tecnologías

- HTML
- CSS
- Tailwind
- Lucide
- Apps Script Templates

### Objetivo

Experiencia consistente en todos los módulos.

---

# 03_MDM

## Inspiración SAP

- SAP Master Data
- SAP MDG
- SAP Business Partner

### Responsabilidad

Administrar datos maestros corporativos.

### Estructura

```text
03_mdm
├── business_partner
├── persona
├── organizacion
├── ubicacion
├── cargo
├── departamento
└── catalogos
```

---

## PERSONA

Datos físicos.

### Ejemplos

- Nombre
- Apellido
- Documento
- Email
- Teléfono

---

## ORGANIZACION

Empresas y entidades jurídicas.

### Ejemplos

- WordClass
- RapiVisa

---

## BUSINESS PARTNER

Identidad empresarial única.

No almacena datos.

Consolida roles.

### Ejemplo

```text
BP0001
Roles:
- Empleado
- Postulante
```

```text
BP0002
Roles:
- Cliente
- Proveedor
```

---

# 04_HCM

## Nombre SAP

Human Capital Management

### Responsabilidad

Administrar la relación laboral.

### Estructura

```text
04_hcm
├── empleado
├── contrato
├── nomina
├── vacaciones
├── asistencia
└── evaluacion
```

### Nota

HCM consume Personas y BP.

No es dueño de ellas.

---

# 05_EAM

## Nombre SAP

Enterprise Asset Management

### Responsabilidad

Administrar activos corporativos.

### Estructura

```text
05_eam
├── activo
├── asignacion
├── mantenimiento
└── inventario
```

### Ejemplos

- Laptop
- Teléfono
- Chip
- Monitor
- Vehículo

---

# 06_SD

## Nombre SAP

Sales and Distribution

### Interpretación Moderna

Lead to Cash

### Responsabilidad

Gestionar el ciclo comercial completo.

### Estructura

```text
06_sd
├── marketing
├── ventas
└── servicio
```

---

## MARKETING

### Responsabilidad

Generar demanda.

### Procesos

- Campañas
- Landing Pages
- Segmentación
- Fuentes de Lead
- Canales

---

## VENTAS

### Responsabilidad

Convertir demanda en ingresos.

### Procesos

- Lead
- Oportunidad
- Llamada
- Cita
- Cotización
- Pedido
- Factura

---

## SERVICIO

### Responsabilidad

Mantener clientes.

### Procesos

- Caso
- Seguimiento
- Renovación
- Atención

---

# 07_FICO

## Nombre SAP

Financial Accounting + Controlling

### Responsabilidad

Administrar información financiera.

### Estructura

```text
07_fico
├── cuenta_contable
├── centro_costo
├── asiento
├── periodo
├── cuenta_por_cobrar
├── cuenta_por_pagar
└── pago
```

---

# 08_EREC

## Inspiración SAP

- SAP E-Recruiting
- SAP SuccessFactors Recruiting

### Responsabilidad

Gestionar reclutamiento.

### Estructura

```text
08_erec
├── vacante
├── postulacion
├── entrevista
├── evaluacion
└── oferta_laboral
```

### Nota

Consume BP.

No es dueño de postulantes.

---

# 09_VERTICALS

## Inspiración SAP

Industry Solutions

### Responsabilidad

Extender el ERP para industrias específicas.

---

## TRAVEL_AGENCY

Vertical inicial.

### Estructura

```text
travel_agency
├── visa
├── pasaporte
├── cita_consular
├── expediente
└── proveedor_turistico
```

---

# CAPACIDADES TRANSVERSALES FUTURAS

## ORGANIZATIONAL MANAGEMENT

### Inspiración SAP

Enterprise Structure

### Componentes

- Company
- Sucursal
- Área
- Equipo
- Unidad Organizativa

---

## SECURITY

### Inspiración SAP

Authorization Concept

### Componentes

- Usuario
- Rol
- Perfil
- Permisos

---

## WORKFLOW

### Inspiración SAP

SAP Workflow

### Componentes

- Aprobaciones
- Estados
- Flujo documental

---

## REPORTING

### Inspiración SAP

SAP Analytics

### Componentes

- Dashboard
- KPI
- Reportes
- Indicadores

---

## INTEGRATIONS

### Componentes

- WhatsApp
- Email
- Google Drive
- Formularios
- APIs Externas

---

# ESTRUCTURA FINAL V1

```text
01_infra

02_core
├── bootstrap
├── config
├── customizing
├── security
├── setup
├── registry
├── integration
└── ui
    ├── design_system
    ├── components
    ├── layouts
    ├── themes
    └── icons

03_mdm
├── business_partner
├── persona
├── organizacion
├── ubicacion
├── cargo
├── departamento
└── catalogos

04_hcm
├── empleado
├── contrato
├── nomina
├── vacaciones
├── asistencia
└── evaluacion

05_eam
├── activo
├── asignacion
├── mantenimiento
└── inventario

06_sd
├── marketing
├── ventas
└── servicio

07_fico
├── cuenta_contable
├── centro_costo
├── asiento
├── periodo
└── pago

08_erec
├── vacante
├── postulacion
├── entrevista
├── evaluacion
└── oferta_laboral

09_verticals
└── travel_agency
    ├── visa
    ├── pasaporte
    ├── cita_consular
    ├── expediente
    └── proveedor_turistico
```

---

# FILOSOFÍA FINAL

- MDM es dueño de las identidades.
- Business Partner es la identidad empresarial única.
- Los módulos son dueños de los procesos.
- Las verticales son dueñas de las particularidades de la industria.
- El Core es estable.
- La parametrización cambia.
- Los procesos mandan.
- La tecnología es reemplazable.
- La arquitectura y el conocimiento del negocio son el verdadero activo del ERP.
