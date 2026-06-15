# BUSINESS_USE_CASES

## Estado

APROBADO

## Versión

1.0

## Release

R1 - Operational Core

## Propósito

Documentar la realidad operativa de WordClass y RapiVisa desde la perspectiva del negocio.

Este documento describe procesos, actores, flujos y reglas de negocio sin hacer referencia a tecnología, pantallas, bases de datos o implementaciones técnicas.

Su objetivo es representar cómo funciona la empresa en el mundo real.

---

# 1. ACTORES DEL NEGOCIO

## Prospecto

Persona interesada en uno o más servicios de la empresa.

Todavía no existe una relación comercial formal.

---

## Cliente

Persona u organización que ha contratado al menos un servicio.

---

## Asesor Comercial

Responsable de captar prospectos, realizar seguimiento y generar oportunidades de negocio.

---

## Gestor Operativo

Responsable de ejecutar los servicios contratados y administrar expedientes.

---

## Supervisor

Responsable de monitorear la operación comercial y operativa.

---

## Administrador

Responsable de mantener información maestra y parámetros organizacionales.

---

## Proveedor

Persona u organización que suministra servicios o recursos a la empresa.

---

# 2. PROCESO COMERCIAL

## Objetivo

Transformar prospectos en oportunidades de negocio.

---

## CU-001 Registrar Prospecto

### Actor Principal

Asesor Comercial

### Descripción

Registrar una persona u organización interesada en los servicios ofrecidos por la empresa.

### Flujo

1. El asesor recibe información del prospecto.
2. Registra los datos básicos.
3. El prospecto queda disponible para seguimiento comercial.

### Resultado

Prospecto registrado.

---

## CU-002 Actualizar Prospecto

### Actor Principal

Asesor Comercial

### Descripción

Actualizar información obtenida durante el proceso comercial.

### Flujo

1. El asesor contacta al prospecto.
2. Obtiene nueva información.
3. Actualiza el registro existente.

### Resultado

Información comercial actualizada.

---

## CU-003 Calificar Prospecto

### Actor Principal

Asesor Comercial

### Descripción

Determinar si existe potencial real de negocio.

### Flujo

1. Se analiza el interés del prospecto.
2. Se verifica viabilidad.
3. Se determina nivel de interés.

### Resultado

Prospecto calificado.

---

## CU-004 Convertir Prospecto en Oportunidad

### Actor Principal

Asesor Comercial

### Descripción

Transformar un prospecto calificado en una oportunidad comercial.

### Flujo

1. Prospecto validado.
2. Se identifica una necesidad concreta.
3. Se inicia una oportunidad comercial.

### Resultado

Oportunidad creada.

---

## CU-005 Gestionar Oportunidad

### Actor Principal

Asesor Comercial

### Descripción

Realizar seguimiento comercial hasta obtener una decisión del cliente.

### Flujo

1. Contacto comercial.
2. Seguimiento.
3. Negociación.
4. Definición del resultado.

### Resultado

Oportunidad actualizada.

---

## CU-006 Cerrar Oportunidad

### Actor Principal

Asesor Comercial

### Descripción

Finalizar una oportunidad.

### Resultado Positivo

Se genera un servicio contratado.

### Resultado Negativo

La oportunidad se marca como perdida.

---

# 3. PROCESO OPERATIVO

## Objetivo

Gestionar la ejecución de servicios contratados.

---

## CU-007 Abrir Expediente

### Actor Principal

Gestor Operativo

### Descripción

Crear un expediente asociado a un servicio contratado.

### Flujo

1. Existe una oportunidad ganada.
2. Se recopila información requerida.
3. Se crea expediente.

### Resultado

Expediente activo.

---

## CU-008 Gestionar Expediente

### Actor Principal

Gestor Operativo

### Descripción

Administrar toda la información relacionada con un trámite.

### Flujo

1. Revisar documentación.
2. Registrar novedades.
3. Actualizar estado.

### Resultado

Expediente actualizado.

---

## CU-009 Gestionar Servicio

### Actor Principal

Gestor Operativo

### Descripción

Ejecutar actividades relacionadas con el servicio contratado.

### Servicios Iniciales

* Visa
* Pasaporte
* Cita Consular

### Resultado

Servicio gestionado.

---

## CU-010 Actualizar Estado Operativo

### Actor Principal

Gestor Operativo

### Descripción

Registrar avances del trámite.

### Resultado

Estado actualizado.

---

## CU-011 Cerrar Expediente

### Actor Principal

Gestor Operativo

### Descripción

Finalizar la gestión del servicio.

### Resultado

Expediente completado.

---

# 4. ADMINISTRACIÓN EMPRESARIAL

## Objetivo

Mantener información maestra de la organización.

---

## CU-012 Gestionar Personas

### Actor Principal

Administrador

### Descripción

Administrar información personal utilizada por la organización.

---

## CU-013 Gestionar Organizaciones

### Actor Principal

Administrador

### Descripción

Administrar información de empresas e instituciones.

---

## CU-014 Gestionar Ubicaciones

### Actor Principal

Administrador

### Descripción

Administrar información geográfica y direcciones.

---

## CU-015 Gestionar Catálogos

### Actor Principal

Administrador

### Descripción

Administrar listas parametrizables utilizadas por los procesos.

---

# 5. SUPERVISIÓN

## Objetivo

Controlar la operación comercial y operativa.

---

## CU-016 Consultar Indicadores Comerciales

### Actor Principal

Supervisor

### Descripción

Analizar desempeño del proceso comercial.

### Indicadores

* Prospectos generados
* Oportunidades activas
* Conversión
* Rendimiento comercial

---

## CU-017 Consultar Indicadores Operativos

### Actor Principal

Supervisor

### Descripción

Analizar desempeño operativo.

### Indicadores

* Expedientes activos
* Expedientes finalizados
* Servicios ejecutados
* Tiempos de gestión

---

# 6. MATRIZ DE ACTORES

| Actor            | Comercial | Operaciones | Administración | Supervisión |
| ---------------- | --------- | ----------- | -------------- | ----------- |
| Prospecto        | Participa | No          | No             | No          |
| Cliente          | Participa | Participa   | No             | No          |
| Asesor Comercial | Sí        | No          | No             | No          |
| Gestor Operativo | No        | Sí          | No             | No          |
| Supervisor       | Consulta  | Consulta    | Consulta       | Sí          |
| Administrador    | No        | No          | Sí             | Consulta    |

---

# 7. PRINCIPIOS

Los procesos descritos representan la realidad operacional de la empresa.

No dependen de:

* Tecnología.
* Plataforma.
* Lenguaje de programación.
* Base de datos.
* Infraestructura.

Este documento deberá permanecer estable incluso cuando cambie la tecnología utilizada para implementar el ERP.

Representa la fuente oficial de verdad del negocio.
