# Arquitectura Semántica de Almacenamiento en Google Drive
## Análisis Comparativo: SAP S/4HANA, Salesforce y Propuesta para el ERP

Para garantizar un sistema robusto, escalable y seguro en nuestro ERP, debemos planificar cómo organizaremos y guardaremos los archivos (imágenes de empleados, fotos de equipos, hojas de vida, facturas PDF/XML del SRI, etc.) en nuestro sistema de almacenamiento (Google Drive). 

A continuación, analizamos la idea de una carpeta plana `/upload/` y la contrastamos con los estándares de la industria (**SAP S/4HANA** y **Salesforce**), para luego presentar la propuesta oficial de arquitectura.

---

## 1. El Antipatrón de la Carpeta Plana `/upload`

La idea inicial de tener una carpeta global `/upload/` con subcarpetas para cada tipo de archivo (ej: `/upload/fotos_empleados/`, `/upload/hojas_vida/`, `/upload/facturas/`) es común en aplicaciones pequeñas o MVP, pero introduce graves problemas de arquitectura en un ERP empresarial:

1. **Vulnerabilidad de Seguridad y Permisos (Segregación de Funciones):**
   * En Google Drive, los permisos se heredan de arriba hacia abajo. Si un usuario tiene acceso a la carpeta `/upload/` para subir una foto de un equipo, podría tener acceso de lectura/escritura a carpetas altamente sensibles como `/upload/hojas_vida/` o `/upload/facturas/` a menos que se rompa la herencia archivo por archivo, lo cual degrada drásticamente el rendimiento y es inmanejable.
   * **Riesgo:** Un técnico de mantenimiento no debería poder ver las hojas de vida de Recursos Humanos ni las facturas de contabilidad.

2. **Límites de Escalabilidad de Google Drive:**
   * Google Drive tiene límites físicos de rendimiento. Cuando una sola carpeta supera los 1,000 - 5,000 elementos, las operaciones de listado, indexación y búsqueda a través del API se vuelven extremadamente lentas.
   * Si guardamos todas las hojas de vida o facturas en una única carpeta global, el sistema se ralentizará con el tiempo.

3. **Ciclo de Vida y Depuración de Datos (Lifecycle Management):**
   * Si se elimina un empleado o un equipo, el sistema tendría que buscar archivos dispersos en múltiples carpetas globales. No hay una forma limpia de archivar, exportar o eliminar el expediente completo de un registro.

---

## 2. ¿Cómo lo resuelven los Gigantes de la Industria?

### 🏢 SAP S/4HANA: Document Management System (DMS) y KPRO
* **Almacenamiento Centrado en Objetos de Negocio:** SAP no guarda archivos en "carpetas físicas" según su formato. Cada archivo está asociado a un **Document Info Record (DIR)** y vinculado directamente a un objeto de negocio (`Business Object`).
  * Ej: Un currículum se vincula al objeto de empleado (`PREL`).
  * Ej: Un XML del SRI se vincula al documento de factura financiera (`BUS2081`).
* **Storage Categories y Repositorios:** Físicamente, los archivos se envían a repositorios de contenido específicos (Content Servers) organizados por el ID de la transacción y el área de negocio, permitiendo aplicar políticas de retención de datos y encriptación según el tipo de objeto.

### ☁️ Salesforce: Salesforce Files, Content Libraries y Links
* **Arquitectura Desacoplada Relacional:** Salesforce utiliza un modelo relacional de archivos. Los documentos no están físicamente dentro de registros:
  * `ContentDocument`: Representa el archivo físico.
  * `ContentVersion`: Almacena el historial de versiones del archivo.
  * `ContentDocumentLink`: Una tabla de unión que asocia el archivo a múltiples registros (un Lead, un Account, un Caso, un Empleado).
* **Librerías de Contenido (Content Libraries):** Los archivos se agrupan en contenedores lógicos con permisos estrictos (ej. Librería de Marketing, Librería de Finanzas, Librería de HCM), garantizando la segregación de accesos a nivel de perfil de usuario.

---

## 3. Propuesta de Arquitectura Semántica para el ERP (Estructura Híbrida)

Para aprovechar la estructura de carpetas nativa de Google Drive y mantener el orden, implementamos un enfoque **orientado a Módulos, Entidades y Registros (Enfoque SAP)**. 

En lugar de clasificar por *tipo de archivo*, clasificamos por *ámbito de negocio* y *dueño del registro*.

### 📂 Mapa de la Jerarquía de Carpetas

```
[Raíz_ERP_WorldClass]/              (Carpeta Raíz del Entorno, ej. ERP_WorldClass_PROD)
├── CORE/                           (Administración y Configuración del Sistema)
│   ├── Logos/                      (Logos del ERP oficial y sociedades)
│   ├── Plantillas/                 (Formatos HTML, plantillas de correo)
│   └── Backups/                    (Respaldos JSON/CSV del sistema)
│
├── HCM/                            (Recursos Humanos / Human Capital Management)
│   ├── Empleados/
│   │   └── EMP-0001_Juan_Perez/    (Una subcarpeta única por empleado)
│   │       ├── Foto_Perfil/        (Foto oficial expuesta en el organigrama/perfil)
│   │       ├── Hojas_Vida/         (CVs, certificados de estudios)
│   │       └── Documentos/         (Contratos firmados, cédula, pasaporte)
│   └── Onboarding/                 (Documentación general de nuevos ingresos)
│
├── EREC/                           (Reclutamiento / e-Recruitment)
│   └── Vacantes/
│       └── VAC-2026-0001_Desarrollador_JS/
│           └── Postulante_DPI_123456/
│               ├── cv_candidato.pdf
│               └── documento_identidad.jpg
│
├── EAM/                            (Gestión de Activos Físicos / Enterprise Asset Management)
│   └── Equipos/
│       └── EQP-0042_Laptop_Dell/   (Una subcarpeta única por Activo)
│           ├── Fotos/              (Fotos de entrega, estado físico, daños)
│           └── Fichas_Tecnicas/    (Manuales, especificaciones del fabricante)
│
├── FICO/                           (Finanzas y Control)
│   ├── Nomina/                     (Boletas de pago mensuales)
│   └── Facturacion/
│       └── FAC-2026-0012_SRI/      (Una subcarpeta única por Comprobante)
│           ├── PDF/                (Representación impresa de la factura)
│           └── XML_SRI/            (XML firmado y autorizado por el SRI)
│
└── MM/                             (Gestión de Materiales / Compras)
    ├── Proveedores/                (RUT, RIF, certificaciones del proveedor)
    └── OrdenesCompra/              (Órdenes firmadas)
```

---

## 4. Estándar de Implementación en Código

Para evitar código repetido o acoplamiento (deuda técnica), el backend del ERP utiliza un servicio único `DriveService` que interactúa con la infraestructura. Los desarrolladores no crean carpetas manualmente; envían la ruta lógica en un array (`pathArray`):

### Ejemplos Prácticos de Invocación (DRY Upload):

1. **Subir Foto de Empleado (Módulo HCM):**
   ```javascript
   // El controlador de HCM sube la foto a la carpeta específica del empleado
   const url = DriveService.subirArchivoBase64(
     base64Data, 
     "foto_perfil.jpg", 
     "image/jpeg", 
     ["HCM", "Empleados", "EMP-0001_Juan_Perez"], // Ruta de destino
     "Foto_Perfil"                                 // Subcarpeta específica
   );
   ```

2. **Subir Comprobante XML del SRI (Módulo FICO):**
   ```javascript
   // El módulo de facturación sube el XML autorizado por el SRI
   const url = DriveService.subirArchivoBase64(
     xmlBase64, 
     "autorizacion_sri_123456.xml", 
     "text/xml", 
     ["FICO", "Facturacion", "FAC-2026-0012_SRI"], 
     "XML_SRI"
   );
   ```

3. **Subir Foto de un Equipo (Módulo EAM):**
   ```javascript
   // El módulo de mantenimiento sube la foto de inspección de una laptop
   const url = DriveService.subirArchivoBase64(
     base64Data, 
     "inspeccion_teclado.png", 
     "image/png", 
     ["EAM", "Equipos", "EQP-0042_Laptop_Dell"], 
     "Fotos"
   );
   ```

---

## 5. Ventajas Técnicas de esta Estructura

1. **Seguridad Nativa por Módulo:**
   * La carpeta raíz `/HCM/` en Google Drive puede compartirse **únicamente** con las cuentas de correo del equipo de Recursos Humanos.
   * La carpeta `/FICO/` se comparte con Contabilidad.
   * Los empleados o contratistas externos que interactúan con el sistema solo ven archivos públicos o aquellos en los que son dueños directos del registro, previniendo fugas de información.

2. **Rendimiento de Búsqueda y Navegación:**
   * Al segmentar los archivos por ID de registro (ej. `/EMP-0001_Juan_Perez/`), cada carpeta contiene como máximo 5 a 15 archivos.
   * Esto previene que Google Drive experimente cuellos de botella al listar archivos y facilita la sincronización local o copias de seguridad de carpetas específicas.

3. **Independencia de Proveedor (Vendor Locking):**
   * Al encapsular toda la lógica de rutas en `DriveService` y usar `pathArray`, si en el futuro migramos de Google Drive a **Amazon S3**, **Azure Blob Storage** o **Salesforce Files**, la lógica de negocio del ERP no cambia en absoluto. Solo actualizamos el adaptador en `INFRA_GDriveFileProvider.js`.
