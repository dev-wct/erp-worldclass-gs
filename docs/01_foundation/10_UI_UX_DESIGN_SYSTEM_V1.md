# 10\_UI\_UX\_DESIGN\_SYSTEM\_V1.md

## Estado

APROBADO

## Versión

1.0

## Tipo

Documento Fundacional

## Propósito

Definir los principios, estándares, patrones y lineamientos de experiencia de usuario (UX) e interfaz de usuario (UI) para todo el ERP.

Este documento constituye la fuente única de verdad para el diseño de la experiencia visual del sistema.

Todos los releases, módulos y futuras evoluciones tecnológicas deberán respetar estos lineamientos.



# 1. VISIÓN

## Objetivo

Construir un ERP moderno, simple, rápido y orientado a procesos empresariales.

La experiencia de usuario debe inspirarse en las mejores prácticas observadas en:

- SAP Fiori

- Google Workspace

- Microsoft 365

- Sistemas ERP modernos

- Aplicaciones SaaS contemporáneas



# 2. PRINCIPIOS RECTORES

## Process First

La interfaz debe reflejar cómo trabaja la empresa.

No cómo está construido el software.



## Excel First

Los usuarios empresariales piensan en:

- tablas

- filtros

- listas

- reportes

La interfaz debe respetar esta realidad.



## Mobile First

Toda funcionalidad debe poder utilizarse desde dispositivos móviles.



## Analytics First

La información debe ser visible.

No debe permanecer oculta dentro de formularios.



## Simplicidad

La mejor interfaz es la que requiere menos capacitación.



## Consistencia

La misma acción debe verse y comportarse igual en todo el ERP.



# 3. FILOSOFÍA UX

## Inspiración SAP Fiori

Adoptar:

- Worklists

- Object Pages

- Overview Pages

- Dashboards

- Master Detail

- Action Driven UX



## Evitar

- Pantallas saturadas

- Formularios excesivamente largos

- Menús complejos

- Navegación profunda



# 4. ESTRUCTURA GENERAL

## Layout Corporativo

┌─────────────────────────────┐  
│ Top Bar                     │  
├───────┬─────────────────────┤  
│       │                     │  
│ Side  │     Content         │  
│ Menu  │                     │  
│       │                     │  
├───────┴─────────────────────┤  
│ Footer                      │  
└─────────────────────────────┘



# 5. NAVEGACIÓN

## Menú Principal

Inicio  
  
Comercial  
  
Operaciones  
  
Administración  
  
Analytics  
  
Configuración



## Reglas

- Máximo tres niveles de navegación.

- El usuario siempre debe conocer su ubicación.

- Toda pantalla debe permitir regresar fácilmente.



# 6. DASHBOARDS

## Dashboard First

Todo usuario inicia en un dashboard.



## Componentes Permitidos

### KPI Cards

Ejemplo:

Leads Nuevos  
  
Expedientes Activos  
  
Ventas del Mes



### Gráficos

Permitidos:

- Barras

- Líneas

- Donut

- Área



### Alertas

Ejemplos:

Expedientes vencidos  
  
Tareas pendientes  
  
Documentos faltantes



# 7. TABLAS

## Principio

Las tablas son el componente principal del ERP.



## Capacidades Obligatorias

- búsqueda

- filtrado

- ordenamiento

- exportación

- paginación



## Estructura

Filtros  
  
Buscador  
  
Acciones  
  
Tabla  
  
Paginación



# 8. FORMULARIOS

## Filosofía

Los formularios deben ser cortos y claros.



## Agrupación

Utilizar:

- secciones

- pestañas

- bloques



## Acciones

Ubicación estándar:

Guardar  
  
Guardar y Continuar  
  
Cancelar



# 9. COMPONENTES CORPORATIVOS

## Componentes Base

Button  
  
Card  
  
Table  
  
Modal  
  
Drawer  
  
Tabs  
  
Dropdown  
  
Badge  
  
Alert  
  
Toast  
  
Avatar  
  
Date Picker  
  
Search Box



## Principio

Todos los módulos deben reutilizar los mismos componentes.



# 10. ICONOGRAFÍA

## Estándar

Lucide Icons



## Reglas

- íconos simples

- sin decoración innecesaria

- significado universal



# 11. COLORES

## Principio

La interfaz debe transmitir:

- profesionalismo

- claridad

- confianza



## Estados

### Success

Operación exitosa.



### Warning

Requiere atención.



### Error

Operación fallida.



### Info

Información general.



# 12. TIPOGRAFÍA

## Principio

Legibilidad primero.



## Reglas

- máximo dos familias tipográficas

- tamaños consistentes

- jerarquía visual clara



# 13. RESPONSIVE DESIGN

## Dispositivos

### Mobile

Prioridad alta.



### Tablet

Prioridad media.



### Desktop

Prioridad alta.



## Comportamiento

Las funcionalidades deben mantenerse disponibles independientemente del dispositivo.



# 14. ACCESIBILIDAD

## Objetivos

Garantizar:

- navegación por teclado

- contraste adecuado

- mensajes comprensibles

- estados visibles



# 15. EXPERIENCIA DE ERRORES

## Regla

Los errores deben explicar:

- qué ocurrió

- por qué ocurrió

- cómo resolverlo



## Prohibido

Error desconocido  
  
Exception 500  
  
Null Pointer



# 16. EXPERIENCIA DE CARGA

## Estados

### Loading

Mostrar progreso.



### Empty State

Explicar por qué no existen datos.



### Success State

Confirmar resultado.



# 17. MOBILE OPERATIONS

## Principio

Los usuarios operativos podrán ejecutar tareas desde dispositivos móviles.



## Casos Típicos

- seguimiento

- actualización de estado

- carga documental

- consultas rápidas



# 18. APPSHEET COMPLIANCE

## Principio

Durante la Etapa Inicial (R1-R3), AppSheet podrá utilizarse como plataforma móvil operacional.



## Regla

Las aplicaciones AppSheet deberán respetar:

- navegación definida por el ERP

- terminología corporativa

- flujos empresariales

- principios UX establecidos en este documento



## Objetivo

Mantener una experiencia coherente independientemente de la tecnología utilizada.



# 19. COMPONENT OWNERSHIP

## Principio

Los componentes pertenecen al ERP.

No a una tecnología específica.



## Ejemplos

Button  
  
Card  
  
Table  
  
Form  
  
Dashboard

Son conceptos corporativos.

Su implementación puede variar según la plataforma.



# 20. INDEPENDENCIA TECNOLÓGICA

## Principio Fundamental

Este documento define la experiencia.

No define la tecnología.



Las implementaciones actuales y futuras deberán respetar estos lineamientos independientemente de utilizar:

Apps Script  
  
HTML  
  
Tailwind  
  
AppSheet  
  
Svelte  
  
Flutter  
  
React Native



# 21. VISIÓN FINAL

El ERP debe proporcionar una experiencia:

- moderna

- simple

- consistente

- profesional

- orientada a procesos

La experiencia del usuario tendrá prioridad sobre las decisiones tecnológicas.

La tecnología podrá evolucionar.

La experiencia empresarial deberá permanecer consistente.
