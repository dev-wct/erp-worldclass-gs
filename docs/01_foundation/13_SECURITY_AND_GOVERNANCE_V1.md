# 13\_SECURITY\_AND\_GOVERNANCE\_V1.md

## Estado

APROBADO

## Versión

1.0

## Tipo

Documento Fundacional

## Propósito

Definir las políticas corporativas de seguridad, gobierno, auditoría y control que regirán todo el ERP.

Este documento establece los principios transversales aplicables a todos los módulos, releases y futuras evoluciones de la plataforma.



# 1. VISIÓN

## Objetivo

Garantizar:

- confidencialidad

- integridad

- disponibilidad

- trazabilidad

de la información empresarial.



## Principio Fundamental

La seguridad no es un módulo.

La seguridad es una capacidad transversal de toda la plataforma.



# 2. PRINCIPIOS DE SEGURIDAD

## Least Privilege

Todo usuario tendrá únicamente los accesos necesarios para realizar su trabajo.



## Need To Know

La información debe ser visible únicamente para quienes la necesitan.



## Segregation Of Duties

Las funciones críticas deberán estar separadas entre distintos roles cuando sea necesario.



## Accountability

Toda acción relevante debe ser atribuible a un usuario identificado.



## Auditability

Toda operación importante debe poder ser auditada.



# 3. IDENTIDAD

## Usuario

Toda persona que utilice el ERP deberá poseer una identidad única.



## Regla

No se permite compartir usuarios.



## Identificador

Ejemplos:

correo corporativo  
  
usuario interno  
  
identificador único ERP



# 4. AUTENTICACIÓN

## Objetivo

Verificar la identidad del usuario.



## Etapa Inicial

Google Workspace



## Evolución

Posibilidad de incorporar:

OAuth  
  
OpenID Connect  
  
SSO  
  
MFA



# 5. AUTORIZACIÓN

## Objetivo

Determinar qué puede hacer un usuario.



## Modelo

RBAC

Role Based Access Control.



# 6. ROLES

## Definición

Un rol representa una responsabilidad organizacional.



## Ejemplos

### Administrador

Acceso completo.



### Gerencia

Visión ejecutiva.



### Supervisor

Gestión operativa.



### Operador

Ejecución de tareas.



### Asistente

Soporte administrativo.



# 7. PERMISOS

## Principio

Los permisos pertenecen al sistema.

Los roles agrupan permisos.



## Ejemplos

crear expediente  
  
editar expediente  
  
aprobar expediente  
  
cerrar expediente  
  
ver dashboard ejecutivo



# 8. MULTIEMPRESA

## Objetivo

Permitir la operación de múltiples empresas dentro de la misma plataforma.



## Ejemplo

WorldClass  
  
RapiVisa



## Regla

Los datos deberán estar asociados a una empresa.



## Visibilidad

La visibilidad dependerá de las políticas definidas para cada rol.



# 9. BUSINESS PARTNER COMPARTIDO

## Principio

Clientes, proveedores y personas podrán relacionarse con múltiples empresas.



## Ejemplos

### Cliente

Puede adquirir servicios en distintas empresas.



### Proveedor

Puede prestar servicios a distintas empresas.



### Empleado

Puede trabajar para distintas empresas.



# 10. TRAZABILIDAD

## Objetivo

Conocer quién hizo qué y cuándo.



## Registrar

### Creación

usuario

fecha

hora



### Modificación

usuario

fecha

hora



### Eliminación lógica

usuario

fecha

hora

motivo



# 11. AUDITORÍA

## Principio

Las operaciones relevantes deberán quedar registradas.



## Casos

### Cambio de estado

### Modificación de datos críticos

### Aprobaciones

### Anulaciones

### Cierres



# 12. HISTORIAL

## Objetivo

Preservar la evolución de los datos.



## Ejemplo

Estado Inicial  
  
↓  
  
En Proceso  
  
↓  
  
Aprobado  
  
↓  
  
Cerrado



# 13. GOBIERNO DE DATOS

## Objetivo

Garantizar calidad y consistencia.



## Reglas

### Catálogos controlados

### Datos obligatorios

### Validaciones

### Integridad referencial



# 14. CLASIFICACIÓN DE DATOS

## Público

Información sin restricciones.



## Interno

Uso organizacional.



## Confidencial

Acceso restringido.



## Sensible

Acceso altamente controlado.



# 15. SEGURIDAD OPERATIVA

## Reglas

### Bloqueo de sesiones inactivas

### Control de accesos

### Registro de actividad

### Gestión de permisos



# 16. DISPONIBILIDAD

## Objetivo

Garantizar continuidad operativa.



## Consideraciones

### Respaldos

### Recuperación

### Continuidad



# 17. SEGURIDAD EN INTEGRACIONES

## Principio

Toda integración debe estar autenticada.



## Aplicable a

### APIs

### Servicios externos

### Automatizaciones



# 18. SEGURIDAD MOBILE

## AppSheet

Debe respetar:

- roles

- permisos

- visibilidad

- trazabilidad

definidos por la plataforma.



# 19. SEGURIDAD ANALÍTICA

## Dashboards

La información visible dependerá del rol del usuario.



## Ejemplos

### Operador

Indicadores operativos.



### Supervisor

Indicadores de equipo.



### Gerencia

Indicadores corporativos.



# 20. EVOLUCIÓN

## Estado Inicial

Google Workspace  
  
Apps Script  
  
Sheets  
  
AppSheet



## Estado Futuro

SSO  
  
MFA  
  
OAuth  
  
OpenID Connect  
  
Auditoría avanzada



# 21. GOBIERNO DE LA PLATAFORMA

## Principio

La plataforma deberá evolucionar manteniendo:

- seguridad

- trazabilidad

- control

- cumplimiento



Las decisiones tecnológicas no podrán comprometer estos principios.



# 22. VISIÓN FINAL

La confianza en la información constituye uno de los activos más importantes de la organización.

Toda funcionalidad desarrollada deberá respetar las políticas de seguridad, gobierno y auditoría definidas en este documento.

La seguridad será considerada una responsabilidad compartida entre la plataforma, los procesos empresariales y los usuarios.
