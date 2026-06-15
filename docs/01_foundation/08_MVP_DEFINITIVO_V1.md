# 08_MVP_DEFINITIVO_V1

## Estado

CONGELADO

## Versión

1.0

---

# 1. PROPÓSITO

Definir el alcance mínimo funcional para considerar que el ERP ha nacido oficialmente.

El MVP no busca completar el ERP.

El MVP busca validar:

- Arquitectura
- Procesos
- Modelo de datos
- Adopción de usuarios
- Operación real

---

# 2. ENFOQUES EVALUADOS

Durante la fase de arquitectura se analizaron dos estrategias.

---

## MVP STARTUP

Incluye:

- MDM
- Core
- HCM Básico
- CRM / SD
- Travel Agency
- Billing
- FICO Lite
- Analytics Básico

Ventaja:

Mayor funcionalidad inicial.

Desventaja:

Mayor complejidad y riesgo.

---

## MVP SAPIENS

Incluye:

- MDM
- Core
- CRM / SD
- Travel Agency

Ventaja:

Entrega rápida de valor.

Menor complejidad.

Menor riesgo.

Mayor capacidad de aprendizaje.

---

# 3. DECISIÓN

Se adopta oficialmente:

MVP SAPIENS.

---

# 4. MÓDULOS INCLUIDOS

## MDM

- Business Partner
- Persona
- Organización
- Ubicación
- Catálogos
- Enterprise Structure

---

## CORE

- Usuarios
- Roles
- Permisos
- Menús
- Seguridad
- Configuración

---

## SD

### Marketing

- Lead
- Fuente Lead
- Campaña

### Ventas

- Oportunidad
- Actividad Comercial
- Pipeline
- Seguimiento

---

## TRAVEL AGENCY

- Expediente
- Visa
- Pasaporte
- Cita Consular
- Seguimiento Operativo

---

# 5. PROCESOS MVP

## Comercial

```text
Lead
↓
Oportunidad
↓
Seguimiento
```

---

## Operativo

```text
Oportunidad
↓
Expediente
↓
Visa / Pasaporte
↓
Cita Consular
```

---

# 6. PANTALLAS MVP

- Login
- Dashboard
- Business Partner
- Leads
- Oportunidades
- Pipeline
- Expedientes
- Seguimiento
- Administración

---

# 7. REPORTES MVP

## Comercial

- Leads
- Oportunidades
- Conversión
- Pipeline

---

## Operaciones

- Expedientes
- Visas
- Pasaportes
- Citas

---

# 8. ANALYTICS MVP

Analytics descriptivo básico.

Objetivo:

Convertir datos operativos en información visible.

No incluye:

- IA
- Machine Learning
- Predicción
- Automatización Inteligente

---

# 9. MÓDULOS EXCLUIDOS

## MM

- Compras
- Inventario
- Abastecimiento

---

## EAM

- Activos
- Asignaciones
- Mantenimiento

---

## EREC

- Reclutamiento

---

## HCM Avanzado

- Nómina
- Vacaciones
- Evaluación

---

## FICO

- CxP
- Contabilidad
- Impuestos
- Conciliación

---

## IA

- Asistentes
- Predicciones
- Recomendaciones

---

# 10. CRITERIOS DE ÉXITO

El MVP se considera exitoso cuando:

1. Un prospecto puede registrarse.

2. Puede convertirse en oportunidad.

3. Puede convertirse en expediente.

4. El expediente puede gestionarse completamente.

5. La gerencia puede visualizar indicadores.

6. La operación puede ejecutarse sin depender de Excel externo para controlar el proceso.

---

# 11. RESULTADO ESPERADO

Al finalizar el MVP existirá un ERP funcional capaz de operar el núcleo comercial y operativo de WordClass y RapiVisa.

El MVP representa el nacimiento oficial de la plataforma ERP.

Las capacidades financieras, administrativas, analíticas avanzadas e inteligentes serán incorporadas en releases posteriores definidos en:

07_IMPLEMENTATION_ROADMAP_V1.md
