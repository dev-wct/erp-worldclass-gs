# ERP CORE MAP V5.0

## Arquitectura Funcional Maestra

### Estado: CONGELADA



# 1. VISIÓN

Construir una plataforma ERP Cloud First inspirada en SAP Cloud ERP, SAP Business Technology Platform, SAP Fiori y SAP Analytics Cloud.

Objetivos:

- Aprender arquitectura empresarial.

- Validar procesos reales.

- Servir inicialmente a agencias de viajes.

- Mantener un núcleo ERP genérico reutilizable.

- Aprovechar Google Workspace como plataforma cloud.

- Evolucionar hacia otros sectores económicos.



# 2. PRINCIPIOS FUNDAMENTALES

## Proceso Primero

Los procesos son más importantes que las pantallas.



## Datos como Activo

Los datos son patrimonio de la organización.



## MDM como Fuente de Verdad

Los datos maestros viven en MDM.



## Business Partner como Identidad Universal

Toda persona u organización se representa mediante Business Partner.



## Parametrización antes que Código

Toda regla posible debe configurarse.

Inspiración SAP Customizing.



## 80/20

- 80% ERP Genérico

- 20% Vertical de Industria



## Analytics Driven

Toda decisión importante debe poder respaldarse con datos.



## Cloud Native

La nube es el entorno natural de operación.



# 3. CAPACIDADES EMPRESARIALES

## Soportadas Arquitectónicamente

- Multiempresa

- Multisucursal

- Multipaís

- Multimoneda

- Multiidioma

No necesariamente implementadas en V1.



# 4. ARQUITECTURA GENERAL

01\_infra  
  
02\_core  
  
03\_mdm  
  
04\_hcm  
  
05\_mm  
  
06\_eam  
  
07\_sd  
  
08\_fico  
  
09\_erec  
  
10\_reporting  
  
11\_analytics  
  
12\_innovation  
  
13\_verticals



# 5. INFRA

## Inspiración SAP

SAP Cloud Infrastructure

Responsabilidades:

- Runtime

- Persistencia

- APIs

- Servicios Cloud

- Hosting

- Integraciones técnicas



# 6. CORE

## Inspiración SAP Basis

Capacidades compartidas por todo el ERP.

02\_core  
├── bootstrap  
├── config  
├── customizing  
├── security  
├── setup  
├── registry  
├── integration  
├── ui  
├── audit  
├── workflow  
├── notifications  
├── documents  
├── rules  
└── events



## Bootstrap

Inicialización de plataforma.



## Config

Configuración global.



## Customizing

Parametrización empresarial.



## Security

- Roles

- Permisos

- Accesos

- Auditoría



## Setup

Configuración inicial.



## Registry

Registro de módulos.



## Integration

integration  
├── whatsapp  
├── gmail  
├── calendar  
├── drive  
├── forms  
├── meta  
├── google\_ads  
├── analytics  
└── api

Los canales pertenecen a Integration.

No pertenecen a SD.



## UI

Inspiración SAP Fiori.

ui  
├── design\_system  
├── layouts  
├── themes  
├── components  
└── icons

Tecnologías previstas:

- HTML

- CSS

- Tailwind

- Lucide



## Audit

Trazabilidad transversal.

Campos mínimos:

created\_at  
created\_by  
updated\_at  
updated\_by  
version  
status



## Workflow

Motor de procesos.

Ejemplos:

- Compras

- Vacaciones

- Contrataciones

- Pagos



## Notifications

Motor de notificaciones.

Canales:

- Email

- WhatsApp

- Alertas



## Documents

Gestión documental.

Ejemplos:

- Pasaportes

- Contratos

- Facturas

- Expedientes



## Rules

Motor de reglas empresariales.



## Events

Registro de eventos de negocio.

Ejemplos:

- Lead creado

- Factura emitida

- Pago recibido

- Empleado contratado



# 7. GOOGLE WORKSPACE NATIVE

Ecosistema Oficial

Google Sheets  
Google Docs  
Google Drive  
Google Forms  
Gmail  
Google Calendar  
AppSheet  
Looker Studio  
Google Analytics



# 8. MDM

## SAP Mapping

SAP MDG SAP Business Partner

03\_mdm  
├── business\_partner  
├── persona  
├── organizacion  
├── enterprise\_structure  
├── localizacion  
├── cargo  
├── departamento  
└── catalogos



## Business Partner

Identidad transversal única.

Roles posibles:

- Cliente

- Empleado

- Proveedor

- Postulante

- Contacto



## Catálogos

catalogos  
├── pais  
├── ciudad  
├── moneda  
├── idioma  
├── tasa\_cambio  
└── catalogos\_generales



# 9. ENTERPRISE STRUCTURE

Inspiración SAP Organizational Management.

enterprise\_structure  
├── grupo  
├── empresa  
├── sucursal  
└── unidad\_organizativa



## Grupo

Agrupa empresas.



## Empresa

Entidad legal.

Ejemplos:

- WordClass

- RapiVisa



## Sucursal

Ejemplos:

- Guayaquil

- Quito

- Cuenca



## Unidad Organizativa

Ejemplos:

- Call Center

- Marketing

- Ventas

- RRHH

- Operaciones

- Administración



# Regla

Toda transacción debe conocer:

- Empresa

- Sucursal

- Unidad Organizativa



# 10. HCM

## SAP Mapping

Human Capital Management

04\_hcm  
├── empleado  
├── contrato  
├── asistencia  
├── vacaciones  
├── nomina  
└── evaluacion



## Regla

HCM calcula nómina.

FICO ejecuta pagos.



# 11. MM

## SAP Mapping

Materials Management

05\_mm  
├── proveedor  
├── solicitud\_compra  
├── orden\_compra  
├── recepcion  
├── contrato\_compra  
└── catalogo\_compra



## Pipeline

Necesidad

↓

Solicitud Compra

↓

Aprobación

↓

Orden Compra

↓

Recepción

↓

CxP

↓

Pago



# 12. EAM

## SAP Mapping

Enterprise Asset Management

06\_eam  
├── activo  
├── asignacion  
├── inventario  
├── mantenimiento  
└── baja



## Activos

Ejemplos:

- Laptop

- Teléfono

- Chip

- Impresora

- Vehículo



## Regla

MM compra.

EAM administra.



# 13. SD

## SAP Mapping

SAP SD SAP Sales Cloud SAP Service Cloud

07\_sd  
├── marketing  
├── ventas  
├── facturacion  
└── servicio



## Marketing

- Campañas

- Embudos

- Fuentes

- Landing Pages



## Ventas

- Lead

- Oportunidad

- Cotización

- Pedido



## Facturación

- Facturas

- Notas Crédito

- Notas Débito



## Servicio

- Casos

- Renovaciones

- Seguimiento



## Pipeline Comercial

Marketing

↓

Lead

↓

Oportunidad

↓

Cotización

↓

Pedido

↓

Facturación

↓

CxC

↓

Cobro



# 14. FICO

## SAP Mapping

FI + CO

08\_fico  
├── contabilidad\_general  
├── cuentas\_por\_cobrar  
├── cuentas\_por\_pagar  
├── tesoreria  
├── controlling  
└── activos\_financieros



## Contabilidad General

- Plan de cuentas

- Asientos

- Períodos



## Cuentas por Cobrar

- Facturas cliente

- Cobros

- Saldos



## Cuentas por Pagar

- Facturas proveedor

- Nómina procesada

- Obligaciones



## Tesorería

- Caja

- Bancos

- Transferencias

- Conciliaciones



## Controlling

- Presupuestos

- Costos

- Rentabilidad



## Regla

Ningún módulo mueve dinero.

FICO administra el dinero.



# 15. EREC

## SAP Mapping

SAP E-Recruiting

09\_erec  
├── vacante  
├── postulacion  
├── entrevista  
├── evaluacion  
└── oferta\_laboral



# 16. REPORTING

## Responsabilidad

Información operativa.

10\_reporting  
├── reportes  
├── consultas  
├── exportaciones  
└── documentos

Pregunta:

¿Qué pasó?



# 17. ANALYTICS

## Inspiración

SAP Analytics Cloud

11\_analytics  
├── marketing  
├── comercial  
├── financiero  
├── rrhh  
├── operaciones  
├── ejecutivo  
└── kpi\_catalog



## Marketing Analytics

Fuentes:

- Google Analytics

- Meta Ads

- Google Ads



## Comercial Analytics

Fuentes:

- SD



## Financiero Analytics

Fuentes:

- FICO



## RRHH Analytics

Fuentes:

- HCM

- EREC



## Ejecutivo Analytics

Dashboard corporativo.



Pregunta:

¿Por qué pasó?

¿Qué puede pasar?



# 18. INNOVATION

12\_innovation  
├── ai\_services  
├── automation  
├── ocr  
├── blockchain  
├── digital\_signature  
└── iot



## Regla

La innovación es una capacidad transversal.

No forma parte del núcleo ERP.



# 19. VERTICALES

13\_verticals  
└── travel\_agency



## Travel Agency

travel\_agency  
├── visa  
├── pasaporte  
├── cita\_consular  
├── expediente  
├── proveedor\_turistico  
└── turismo



# 20. FILOSOFÍA DE DATOS

Reporting responde:

¿Qué pasó?

Analytics responde:

¿Por qué pasó?

Innovation responde:

¿Qué puede pasar?



# 21. FILOSOFÍA TECNOLÓGICA

Cloud First

Mobile First

Spreadsheet First

Workspace Native

Analytics Ready

AI Ready

SAP Inspired



# 22. VISIÓN FINAL

Los procesos son el corazón.

Los datos son el activo.

Business Partner es la identidad.

FICO controla el dinero.

SD controla el ciclo comercial.

HCM controla el talento.

MM controla el abastecimiento.

EAM controla los activos.

Analytics convierte datos en decisiones.

La IA amplifica capacidades.

Google Workspace es el ecosistema operativo.

El ERP existe para ayudar a tomar mejores decisiones empresariales.
