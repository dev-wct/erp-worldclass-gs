# REQUISITOS NO FUNCIONALES V1.0

## Arquitectura Operativa y Tecnológica

### Estado: CONGELADO



# 1. PROPÓSITO

Definir cómo debe comportarse el ERP independientemente de los procesos de negocio.

Este documento establece los principios técnicos, operativos, arquitectónicos y de experiencia de usuario que regirán toda evolución futura del sistema.



# 2. PRINCIPIOS RECTORES

## Cloud First

La nube es el entorno natural de operación.

Toda solución debe diseñarse inicialmente para ejecución remota.



## Mobile First

Toda funcionalidad crítica debe ser usable desde dispositivos móviles.



## Spreadsheet First

Google Sheets será el almacenamiento operativo inicial.

La arquitectura nunca debe depender directamente de Google Sheets.

Todo acceso a datos deberá realizarse mediante adaptadores.



## Workspace Native

El ERP debe aprovechar de forma nativa el ecosistema Google Workspace.



## Analytics Ready

Toda operación relevante debe generar información explotable para Reporting y Analytics.



## AI Ready

Toda información generada por el ERP debe poder ser consumida por futuras capacidades de Inteligencia Artificial.



## Audit First

Toda acción relevante debe ser trazable.



## Configuration First

La parametrización debe prevalecer sobre el desarrollo personalizado.



## Vendor Neutral

La lógica de negocio debe ser portable a otras plataformas tecnológicas.



## Low Cost First

La complejidad técnica sólo será introducida cuando exista una necesidad empresarial demostrable.



# 3. PLATAFORMA

## Plataforma Inicial

Google Apps Script  
Google Workspace  
Google Sheets  
Google Drive



## Evolución Prevista

Node.js  
Go  
.NET  
Java



## Restricción

La lógica de negocio no debe depender directamente del proveedor tecnológico.



# 4. EXPERIENCIA DE USUARIO

## Inspiración

SAP Fiori SAP Horizon



## Principios UX

- Simplicidad

- Consistencia

- Rapidez

- Acciones frecuentes visibles

- Navegación intuitiva

- Curva de aprendizaje reducida



## Diseño

Responsive obligatorio.



## Compatibilidad

### Escritorio

- Chrome

- Edge



### Móvil

- Android

- iOS



# 5. DESIGN SYSTEM

Existirá un Design System único para todo el ERP.



## Componentes

Botones  
Tablas  
Formularios  
Tarjetas  
Indicadores  
Modales  
Navegación



## Tecnologías

HTML  
CSS  
Tailwind  
Lucide



# 6. SEGURIDAD

## Control de Acceso

Basado en roles.



## Principio

Menor privilegio posible.



## Requisitos

- Autenticación obligatoria

- Control de permisos

- Control por módulo

- Control por acción



# 7. AUDITORÍA

Toda entidad empresarial deberá registrar:

created\_at  
created\_by  
  
updated\_at  
updated\_by  
  
version  
  
status



## Eventos Auditables

- Creación

- Modificación

- Eliminación lógica

- Aprobaciones

- Rechazos



# 8. RENDIMIENTO

## Tiempo Objetivo

Operaciones comunes:

\< 3 segundos



## Operaciones Pesadas

\< 10 segundos



## Reportes Grandes

Procesamiento asíncrono permitido.



# 9. DISPONIBILIDAD

Objetivo inicial:

99%



## Recuperación

Capacidad de restauración mediante Google Workspace.



# 10. ESCALABILIDAD

La arquitectura debe soportar:

- Multiempresa

- Multisucursal

- Multipaís

- Multimoneda

- Multiidioma



## Evolución

Sin rediseños masivos.



# 11. INTEGRACIÓN

## Principio

Toda integración externa debe pasar por:

02\_core/integration



## Integraciones Previstas

WhatsApp  
Gmail  
Calendar  
Drive  
Forms  
Meta  
Google Ads  
Google Analytics  
APIs Externas



# 12. DATOS

## Fuente de Verdad

MDM.



## Principio

No duplicar información maestra.



## Consistencia

Business Partner será la identidad transversal única.



# 13. ANALYTICS

Todo módulo deberá producir información explotable.



## Reporting

Pregunta:

¿Qué pasó?



## Analytics

Preguntas:

¿Por qué pasó?  
  
¿Qué puede pasar?



# 14. EVENTOS

Toda acción importante deberá generar eventos.

Ejemplos:

Lead creado  
Lead convertido  
Factura emitida  
Pago recibido  
Empleado contratado



## Objetivo

Permitir:

- Analytics

- Automatización

- IA



# 15. INTELIGENCIA ARTIFICIAL

La IA es una capacidad transversal.

No es un módulo.



## Casos Futuros

- Asistentes

- Predicciones

- Recomendaciones

- Consultas en lenguaje natural

- Automatización documental



# 16. DOCUMENTOS

Todos los documentos empresariales deberán ser gestionados mediante:

02\_core/documents



## Soporte

- Adjuntos

- Versionado

- Metadatos

- Integración Drive



# 17. OBSERVABILIDAD

Toda operación crítica deberá poder rastrearse.



## Fuentes

- Logs

- Auditoría

- Eventos



# 18. MANTENIBILIDAD

La arquitectura deberá favorecer:

- Bajo acoplamiento

- Alta cohesión

- Modularidad

- Reutilización



# 19. PORTABILIDAD

La lógica empresarial deberá ser independiente de:

- Google Sheets

- Apps Script

- Base de datos específica



## Objetivo

Permitir migración futura a:

Node.js  
Go  
.NET  
Java



# 20. RESTRICCIONES TECNOLÓGICAS

No introducir prematuramente:

Microservicios  
Kafka  
Data Lake  
Data Warehouse  
Kubernetes  
Machine Learning Complejo  
Blockchain Operativo



## Justificación

Evitar complejidad innecesaria.



# 21. FILOSOFÍA OPERATIVA

La tecnología existe para servir al negocio.

La complejidad debe justificarse.

La parametrización debe prevalecer sobre el código.

Los procesos son más importantes que las pantallas.

Los datos son activos corporativos.

La trazabilidad es obligatoria.

La simplicidad es una ventaja competitiva.



# 22. VISIÓN FINAL

Construir un ERP inspirado en SAP Cloud moderno.

Aprovechar Google Workspace como plataforma inicial.

Mantener independencia tecnológica.

Priorizar procesos sobre herramientas.

Convertir datos en decisiones.

Evolucionar progresivamente sin generar deuda arquitectónica innecesaria.
