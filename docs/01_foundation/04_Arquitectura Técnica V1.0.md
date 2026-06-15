# ARQUITECTURA TÉCNICA V1.0

## ERP Cloud Inspired by SAP

### Estado: CONGELADO

Dependencias:

- 01\_ERP\_CORE\_MAP\_V5.md

- 02\_REQUISITOS\_NO\_FUNCIONALES\_V1.md

- 03\_MODELO\_DATOS\_EMPRESARIAL\_V1.md



# 1. PROPÓSITO

Definir la arquitectura técnica base del ERP.

Este documento establece:

- Capas

- Responsabilidades

- Dependencias

- Flujo de datos

- Principios de desarrollo



# 2. PRINCIPIOS

## Negocio Primero

La lógica empresarial es el activo principal.

La tecnología es reemplazable.



## Portabilidad

El dominio no debe depender de:

- Google Apps Script

- Google Sheets

- Frameworks

- Motores de base de datos



## Bajo Acoplamiento

Los módulos deben depender de contratos.

No de implementaciones.



## Alta Cohesión

Cada componente debe tener una única responsabilidad.



## Adaptadores para Todo

Toda dependencia externa deberá encapsularse mediante adaptadores.



# 3. FILOSOFÍA

## COBOL

Inspiración para:

- Procesos

- Casos de uso

- Reglas empresariales



## LISP

Inspiración para:

- Composición

- Funciones pequeñas

- Encadenamiento



## SAP

Inspiración para:

- Arquitectura empresarial

- Módulos

- Datos maestros

- Procesos



# 4. ARQUITECTURA GENERAL

UI  
│  
▼  
Application  
│  
▼  
Domain  
│  
▼  
Infrastructure



# 5. CAPAS

## UI

Responsable de:

- Pantallas

- Formularios

- Navegación

- Dashboards

No contiene reglas de negocio.



## Application

Responsable de:

- Casos de uso

- Orquestación

- Flujos



## Domain

Responsable de:

- Entidades

- Reglas

- Objetos de valor

- Políticas

Es el corazón del ERP.



## Infrastructure

Responsable de:

- Persistencia

- APIs

- Integraciones

- Archivos

- Servicios externos



# 6. ESTRUCTURA BASE

src  
│  
├── domain  
├── application  
├── infrastructure  
├── ui  
└── shared



# 7. DOMAIN

domain  
│  
├── mdm  
├── hcm  
├── mm  
├── eam  
├── sd  
├── fico  
├── erec  
└── analytics



# 8. ENTITIES

Representan conceptos empresariales.

Ejemplos:

BusinessPartner  
  
Employee  
  
Contract  
  
Lead  
  
Invoice  
  
Asset



## Regla

Las entidades no conocen:

- Sheets

- APIs

- HTML

- GAS



# 9. VALUE OBJECTS

Representan conceptos inmutables.

Ejemplos:

Money  
  
Email  
  
Phone  
  
DocumentNumber  
  
Address



# 10. REPOSITORIES

Definen contratos de acceso a datos.



Ejemplo:

BusinessPartnerRepository  
  
EmployeeRepository  
  
InvoiceRepository



Regla:

El dominio sólo conoce interfaces.



# 11. APPLICATION

## Casos de Uso

Representan acciones empresariales.



Ejemplos:

CreateLead  
  
ConvertLead  
  
HireEmployee  
  
CreateInvoice  
  
AssignAsset



## Regla

Un caso de uso debe representar una acción empresarial completa.



# 12. DTO

Objetos de transferencia.



Responsabilidad:

Transportar información.



No contienen reglas.



# 13. VALIDATORS

Responsables de:

- Validaciones

- Formato

- Reglas simples



No contienen lógica empresarial compleja.



# 14. SERVICES

Contienen lógica transversal.



Ejemplos:

NotificationService  
  
DocumentService  
  
AuditService



# 15. INFRASTRUCTURE

## Data Sources

Ejemplos:

Google Sheets  
  
Drive  
  
REST API  
  
Database



## Adaptadores

Responsables de traducir:

Dominio  
↔  
Proveedor Externo



# 16. DATA ADAPTERS

Ejemplo:

SheetsAdapter  
  
DriveAdapter  
  
WhatsAppAdapter  
  
CalendarAdapter



Regla:

Toda dependencia externa debe pasar por adaptadores.



# 17. GATEWAY

Punto único de acceso a servicios.



Ejemplo:

ERP.Gateway.call()



Beneficios:

- Desacoplamiento

- Trazabilidad

- Portabilidad



# 18. EVENTS

Arquitectura orientada a eventos simples.



Ejemplos:

LeadCreated  
  
InvoiceIssued  
  
PaymentReceived  
  
EmployeeHired



# 19. WORKFLOW

Motor de procesos.



Responsabilidades:

- Estados

- Transiciones

- Aprobaciones



# 20. DOCUMENTS

Gestión documental transversal.



Responsabilidades:

- Adjuntos

- Versiones

- Metadatos



# 21. AUDITORÍA

Transversal a todo el sistema.



Toda operación relevante genera:

Audit Record



# 22. INTEGRACIÓN

Todas las integraciones viven en:

core/integration



Ejemplos:

WhatsApp  
  
Meta  
  
Google Ads  
  
Analytics  
  
Gmail  
  
Calendar



# 23. UI

Inspiración:

SAP Fiori

SAP Horizon



Tecnologías Iniciales:

HTML  
  
CSS  
  
Tailwind  
  
Lucide



# 24. ANALYTICS

Consume:

Eventos  
+  
Transacciones



Nunca consume UI.



# 25. IA

Consume:

Analytics  
+  
Eventos  
+  
Datos Empresariales



No modifica directamente procesos.



# 26. REGLAS DE ORO

Nunca acceder a Sheets desde UI.

Nunca acceder a Sheets desde Domain.

Nunca poner lógica empresarial en HTML.

Nunca duplicar maestros.

Nunca depender directamente de Apps Script.

Siempre programar contra contratos.

Siempre modelar primero el negocio.



# 27. VISIÓN FINAL

El ERP debe poder migrar desde:

Apps Script + Sheets

hacia:

Go .NET Java Node.js

sin modificar:

- Procesos

- Modelo de Datos

- Reglas Empresariales

La tecnología cambia.

El dominio permanece.
