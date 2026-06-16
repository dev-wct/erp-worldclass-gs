# R1_OPERATIONAL_CORE - RELEASE

## Estado

APROBADO

## Versión

1.0

## Fase

REALIZE

## Release

R1 - Operational Core

## Dependencias

* 01_ERP_CORE_MAP_V5.md
* 03_MODELO_DATOS_EMPRESARIAL_V1.md
* 07_IMPLEMENTATION_ROADMAP_V1.md
* 08_MVP_DEFINITIVO_V1.md
* 09_RELEASE_PLANNING_V1.md

---

# 1. PROPÓSITO

R1 representa el nacimiento operativo del ERP.

Su objetivo es digitalizar el núcleo comercial y operativo de WordClass y RapiVisa mediante una plataforma única 
capaz de administrar prospectos, oportunidades, expedientes y servicios.

Este release valida:

* Arquitectura empresarial.
* Modelo de datos.
* Experiencia de usuario.
* Procesos comerciales.
* Procesos operativos.
* Adopción organizacional.

---

# 2. OBJETIVOS DEL RELEASE

## Objetivo General

Permitir gestionar el ciclo completo desde la captación de un prospecto hasta la gestión de un expediente operativo.

---

## Objetivos Específicos

* Centralizar la información empresarial.
* Eliminar duplicidad de datos.
* Unificar clientes, empleados y proveedores mediante Business Partner.
* Digitalizar el pipeline comercial.
* Digitalizar la gestión de expedientes.
* Crear la primera capa de indicadores empresariales.
* Generar información estructurada para futuras capacidades analíticas.

---

# 3. ALCANCE

## MDM

### Business Partner

Entidad maestra universal.

Representa:

* Clientes
* Prospectos
* Empleados
* Proveedores
* Aliados
* Instituciones

---

### Persona

Información personal.

---

### Organización

Información empresarial.

---

### Ubicación

Direcciones y referencias geográficas.

---

### Catálogos

Datos parametrizables del sistema.

---

### Enterprise Structure

Estructura organizacional empresarial.

Incluye:

* Empresa
* Sucursal
* Departamento
* Cargo

---

## CORE

### Seguridad

* Usuarios
* Roles
* Permisos

---

### Configuración

* Parámetros
* Customizing
* Catálogos

---

### Navegación

* Menús
* Dashboard
* Preferencias

---

## SD

### Marketing

Incluye:

* Leads
* Campañas
* Fuentes de captación

---

### Ventas

Incluye:

* Oportunidades
* Actividades
* Pipeline
* Seguimiento comercial

---

## TRAVEL_AGENCY

### Expedientes

Incluye:

* Apertura
* Seguimiento
* Estado
* Historial

---

### Servicios

Incluye:

* Visa
* Pasaporte
* Cita Consular

---

# 4. PROCESOS DEL RELEASE

## Proceso Comercial

Lead
↓
Calificación
↓
Oportunidad
↓
Seguimiento

---

## Proceso Operativo

Oportunidad
↓
Expediente
↓
Servicio
↓
Seguimiento

---

## Proceso Gerencial

Datos
↓
Indicadores
↓
Decisiones

---

# 5. ENTREGABLES FUNCIONALES

## MDM

* Gestión de Business Partner
* Gestión de Personas
* Gestión de Organizaciones
* Gestión de Ubicaciones
* Gestión de Catálogos

---

## CORE

* Login
* Gestión de Usuarios
* Gestión de Roles
* Gestión de Permisos

---

## SD

* Gestión de Leads
* Gestión de Oportunidades
* Pipeline Comercial
* Actividades Comerciales

---

## TRAVEL_AGENCY

* Gestión de Expedientes
* Gestión de Servicios
* Seguimiento Operativo

---

# 6. DASHBOARDS

## Comercial

Indicadores:

* Leads generados
* Leads por fuente
* Oportunidades activas
* Conversión
* Embudo comercial

---

## Operaciones

Indicadores:

* Expedientes activos
* Expedientes por estado
* Visas gestionadas
* Pasaportes gestionados
* Citas programadas

---

# 7. KPIS DEL RELEASE

## Marketing

* Leads generados
* Leads por canal
* Tasa de conversión

---

## Ventas

* Oportunidades abiertas
* Oportunidades ganadas
* Oportunidades perdidas

---

## Operaciones

* Expedientes activos
* Tiempo promedio de gestión
* Servicios completados

---

# 8. GO LIVE

R1 se considera terminado cuando:

* Los usuarios pueden iniciar sesión.
* Existe Business Partner funcional.
* Existe Lead funcional.
* Existe Oportunidad funcional.
* Existe Expediente funcional.
* Existe Dashboard Comercial.
* Existe Dashboard Operativo.
* La operación diaria puede ejecutarse dentro del ERP.

---

# 9. EXCLUSIONES

No forman parte de R1.

## FICO

* Facturación
* Cuentas por Cobrar
* Tesorería
* Contabilidad

---

## MM

* Compras
* Inventario
* Abastecimiento

---

## HCM

* Nómina
* Vacaciones
* Evaluaciones

---

## EAM

* Activos
* Asignaciones
* Mantenimiento

---

## EREC

* Reclutamiento

---

## IA

* Predicciones
* Automatizaciones Inteligentes
* Asistentes Virtuales

---

# 10. CRITERIOS DE ÉXITO

El release será considerado exitoso cuando:

1. WordClass pueda gestionar prospectos y expedientes desde el ERP.

2. RapiVisa pueda gestionar prospectos y expedientes desde el ERP.

3. La información se encuentre centralizada.

4. Los usuarios adopten el sistema para su operación diaria.

5. La gerencia disponga de indicadores operativos confiables.

6. Se genere una base de datos consistente para los releases posteriores.

---

# 11. VISIÓN

R1 no busca terminar el ERP.

R1 busca demostrar que la arquitectura empresarial diseñada es capaz de operar el negocio real.

Representa el nacimiento oficial de la plataforma ERP y la primera transición desde una operación basada en hojas de cálculo hacia una gestión empresarial integrada, orientada a procesos, datos y toma de decisiones.
