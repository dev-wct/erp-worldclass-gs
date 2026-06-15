.
├── 01_infra
│   ├── INFRA_BaseRepository.js
│   └── INFRA_ErrorHandler.js
├── 02_core
│   ├── CORE_AIService.js
│   ├── CORE_Bootstrap.js
│   ├── CORE_Config.js
│   ├── CORE_Customizing.js
│   ├── CORE_DataAdapter.js
│   ├── CORE_DesignSystem.html
│   ├── CORE_DriveOrganizer.js
│   ├── CORE_DriveService.js
│   ├── CORE_EmailService.js
│   ├── CORE_FormHandler.html
│   ├── CORE_Gateway.js
│   ├── CORE_SetupEngine.js
│   ├── CORE_StorageService.js
│   ├── CORE_TestSeeder.js
│   ├── CORE_Utils.js
│   └── CORE_WhatsAppService.js
├── 03_mdm
│   ├── MDM_Schema.js
│   └── MDM_Setup.js
├── 04_rrhh
│   ├── empleado
│   │   ├── RRHH_Empleado_Controller.js
│   │   ├── RRHH_Empleado_DTO.js
│   │   ├── RRHH_Empleado_Entity.js
│   │   ├── RRHH_Empleado_Repository.js
│   │   ├── RRHH_Empleado_Service.js
│   │   ├── RRHH_Empleado_UseCases.js
│   │   ├── RRHH_Empleado_Validator.js
│   │   └── RRHH_FormEmpleado.html
│   ├── entrypoint.js
│   ├── nomina
│   │   ├── RRHH_Nomina_DTO.js
│   │   ├── RRHH_Nomina_UseCases.js
│   │   └── RRHH_Nomina_Validator.js
│   ├── postulante
│   │   ├── RRHH_FormPostulante.html
│   │   ├── RRHH_Postulante_Controller.js
│   │   ├── RRHH_Postulante_DTO.js
│   │   ├── RRHH_Postulante_Entity.js
│   │   ├── RRHH_Postulante_Repository.js
│   │   ├── RRHH_Postulante_UseCases.js
│   │   └── RRHH_Postulante_Validator.js
│   └── RRHH_Schema.js
├── 05_mm
│   ├── asignacion
│   │   ├── MM_Asignacion_Controller.js
│   │   ├── MM_Asignacion_DTO.js
│   │   ├── MM_Asignacion_Entity.js
│   │   ├── MM_Asignacion_Repository.js
│   │   ├── MM_Asignacion_Service.js
│   │   ├── MM_Asignacion_UseCases.js
│   │   ├── MM_Asignacion_Validator.js
│   │   └── MM_FormAsignacion.html
│   ├── chip
│   │   ├── MM_Chip_Controller.js
│   │   ├── MM_Chip_DTO.js
│   │   ├── MM_Chip_Entity.js
│   │   ├── MM_Chip_Repository.js
│   │   ├── MM_Chip_Service.js
│   │   ├── MM_Chip_UseCases.js
│   │   ├── MM_Chip_Validator.js
│   │   └── MM_FormChip.html
│   ├── equipo
│   │   ├── MM_Equipo_Controller.js
│   │   ├── MM_Equipo_DTO.js
│   │   ├── MM_Equipo_Entity.js
│   │   ├── MM_Equipo_Repository.js
│   │   ├── MM_Equipo_Service.js
│   │   ├── MM_Equipo_UseCases.js
│   │   ├── MM_Equipo_Validator.js
│   │   └── MM_FormEquipo.html
│   ├── MM_Schema.js
│   └── MM_Setup.js
├── 06_sd
│   ├── campana
│   │   ├── SD_Campana_Controller.js
│   │   ├── SD_Campana_DTO.js
│   │   ├── SD_Campana_Entity.js
│   │   ├── SD_Campana_Repository.js
│   │   ├── SD_Campana_UseCases.js
│   │   ├── SD_Campana_Validator.js
│   │   └── SD_FormCampana.html
│   ├── cita
│   │   ├── SD_Cita_Controller.js
│   │   ├── SD_Cita_DTO.js
│   │   ├── SD_Cita_Entity.js
│   │   ├── SD_Cita_Repository.js
│   │   ├── SD_Cita_UseCases.js
│   │   ├── SD_Cita_Validator.js
│   │   └── SD_FormCita.html
│   ├── lead
│   │   ├── SD_FormLead.html
│   │   ├── SD_Lead_Controller.js
│   │   ├── SD_Lead_DTO.js
│   │   ├── SD_Lead_Entity.js
│   │   ├── SD_Lead_Repository.js
│   │   ├── SD_Lead_UseCases.js
│   │   └── SD_Lead_Validator.js
│   ├── llamada
│   │   ├── SD_FormLlamada.html
│   │   ├── SD_Llamada_Controller.js
│   │   ├── SD_Llamada_DTO.js
│   │   ├── SD_Llamada_Entity.js
│   │   ├── SD_Llamada_Repository.js
│   │   ├── SD_Llamada_UseCases.js
│   │   └── SD_Llamada_Validator.js
│   └── SD_Schema.js
├── 07_fico
│   ├── costo_chip
│   │   ├── FICO_CostoChip_Entity.js
│   │   ├── FICO_CostoChip_Repository.js
│   │   └── FICO_CostoChip_UseCases.js
│   ├── FICO_Schema.js
│   └── pago_nomina
│       ├── FICO_FormPago.html
│       ├── FICO_Pago_Controller.js
│       ├── FICO_Pago_DTO.js
│       ├── FICO_Pago_Entity.js
│       ├── FICO_Pago_Repository.js
│       ├── FICO_Pago_UseCases.js
│       └── FICO_Pago_Validator.js
├── 08_erec
│   ├── entrypoint.js
│   ├── EREC_Schema.js
│   ├── EREC_Setup.js
│   └── vacante
│       ├── EREC_Entrevista_Repository.js
│       ├── EREC_FormPostulante.html
│       ├── EREC_FormVacante.html
│       ├── EREC_Vacante_Controller.js
│       ├── EREC_Vacante_DTO.js
│       ├── EREC_Vacante_Entity.js
│       ├── EREC_Vacante_Repository.js
│       ├── EREC_Vacante_UseCases.js
│       └── EREC_Vacante_Validator.js
├── appsscript.json
├── .clasp.json
├── docs
│   ├── 01_foundation
│   │   ├── 00_Metodología Sapiens V1.md
│   │   ├── 01_VISION_AND_PRINCIPLES_V1.md
│   │   ├── 02_Requisitos No Funcionales V1.0.md
│   │   ├── 04_Arquitectura Técnica V1.0.md
│   │   ├── 05_ESTRUCTURA_FISICA_DEL_PROYECTO_V1.md
│   │   ├── 06_ESTANDARES_DE_DESARROLLO_V1.md
│   │   ├── 07_IMPLEMENTATION_ROADMAP_V1.md
│   │   ├── 08_MVP_DEFINITIVO_V1.md
│   │   ├── 09_RELEASE_PLANNING_V1.md
│   │   ├── 10_UI_UX_DESIGN_SYSTEM_V1.md
│   │   ├── 11_TARGET_ARCHITECTURE_V1.md
│   │   ├── 12_ANALYTICS_STRATEGY_V1.md
│   │   ├── 13_SECURITY_AND_GOVERNANCE_V1.md
│   │   ├── 14_AI_STRATEGY_V1.md
│   │   └── archive
│   │       ├── 00_Metodología Sapiens V1.docx
│   │       ├── 00_Metodología Sapiens V1.pdf
│   │       ├── 01_ERP Core Map V1.docx
│   │       ├── 01_ERP Core Map V1.pdf
│   │       ├── 01_ERP Core Map V2.0.docx
│   │       ├── 01_ERP Core Map V2.0.pdf
│   │       ├── 01_ERP Core Map V3.0.docx
│   │       ├── 01_ERP Core Map V3.0.pdf
│   │       ├── 01_ERP Core Map V4.0.docx
│   │       ├── 01_ERP Core Map V4.0.pdf
│   │       ├── 01_ERP Core Map V5.0.docx
│   │       ├── 01_ERP Core Map V5.0.md
│   │       ├── 01_ERP Core Map V5.0.pdf
│   │       ├── 01_VISION_AND_PRINCIPLES_V1.docx
│   │       ├── 01_VISION_AND_PRINCIPLES_V1.pdf
│   │       ├── 02_Requisitos No Funcionales V1.0.docx
│   │       ├── 02_Requisitos No Funcionales V1.0.pdf
│   │       ├── 04_Arquitectura Técnica V1.0.docx
│   │       ├── 04_Arquitectura Técnica V1.0.pdf
│   │       ├── 08_MVP_DEFINITIVO_V1.docx
│   │       ├── 08_MVP_DEFINITIVO_V1.pdf
│   │       ├── 09_RELEASE_PLANNING_V1.docx
│   │       ├── 09_RELEASE_PLANNING_V1.pdf
│   │       ├── 10_UI_UX_DESIGN_SYSTEM_V1.docx
│   │       ├── 10_UI_UX_DESIGN_SYSTEM_V1.pdf
│   │       ├── 11_TARGET_ARCHITECTURE_V1.docx
│   │       ├── 11_TARGET_ARCHITECTURE_V1.pdf
│   │       ├── 12_ANALYTICS_STRATEGY_V1.docx
│   │       ├── 12_ANALYTICS_STRATEGY_V1.pdf
│   │       ├── 13_SECURITY_AND_GOVERNANCE_V1.docx
│   │       ├── 13_SECURITY_AND_GOVERNANCE_V1.md.pdf
│   │       ├── 14_AI_STRATEGY_V1.docx
│   │       └── 14_AI_STRATEGY_V1.pdf
│   ├── 02_enterprise_architecture
│   │   ├── 01_ERP Core Map V5.0.md
│   │   ├── CAPABILITY_MAP_V1.docx
│   │   ├── CAPABILITY_MAP_V1.pdf
│   │   ├── CAPABILITY_MATURITY_MODEL_V1.docx
│   │   ├── CAPABILITY_MATURITY_MODEL_V1.pdf
│   │   ├── DOMAIN_MODEL_V1.docx
│   │   ├── DOMAIN_MODEL_V1.pdf
│   │   ├── Enterprise Glossary.docx
│   │   ├── Enterprise Glossary.pdf
│   │   ├── Enterprise Process Map V1.0.docx
│   │   └── Enterprise Process Map V1.0.pdf
│   ├── 03_adrs
│   │   ├── ADR-001_FRONTEND_STRATEGY.docx
│   │   ├── ADR-001_FRONTEND_STRATEGY.pdf
│   │   ├── ADR-002_CHARTING_STRATEGY.md.docx
│   │   ├── ADR-002_CHARTING_STRATEGY.md.pdf
│   │   ├── ADR-003_ARCHITECTURAL_STYLE.docx
│   │   ├── ADR-003_ARCHITECTURAL_STYLE.pdf
│   │   ├── ADR-004_DATA_STRATEGY.md.docx
│   │   ├── ADR-004_DATA_STRATEGY.pdf
│   │   ├── ADR-005_INTEGRATION_STRATEGY.md.docx
│   │   ├── ADR-005_INTEGRATION_STRATEGY.md.pdf
│   │   ├── ADR-006_MOBILE_STRATEGY.docx
│   │   ├── ADR-006_MOBILE_STRATEGY.pdf
│   │   ├── ADR-007_BACKEND_EVOLUTION_STRATEGY.md.docx
│   │   ├── ADR-007_BACKEND_EVOLUTION_STRATEGY.md.pdf
│   │   ├── ADR-008 Hosting and Deployment Strategy.docx
│   │   ├── ADR-008 Hosting and Deployment Strategy.pdf
│   │   ├── ADR-009_AI_PROVIDER_STRATEGY.docx
│   │   ├── ADR-009_AI_PROVIDER_STRATEGY.pdf
│   │   ├── ADR-010_ENTERPRISE_ANALYTICS_ARCHITECTURE.md.docx
│   │   ├── ADR-010_ENTERPRISE_ANALYTICS_ARCHITECTURE.md.pdf
│   │   ├── ADR-011_MULTI_COMPANY_STRATEGY.docx
│   │   ├── ADR-011_MULTI_COMPANY_STRATEGY.pdf
│   │   ├── ADR-012_DOCUMENT_MANAGEMENT_STRATEGY.docx
│   │   ├── ADR-012_DOCUMENT_MANAGEMENT_STRATEGY.pdf
│   │   └── README.md
│   ├── 04_releases
│   │   ├── BACKLOG.md
│   │   ├── KPIS.md
│   │   ├── R0_FOUNDATION
│   │   │   ├── R0_FOUNDATION.md
│   │   │   └── RELEASE.md
│   │   ├── R1_OPERATIONAL_CORE
│   │   │   ├── BACKLOG.md
│   │   │   ├── Business Use Cases.docx
│   │   │   ├── BUSINESS_USE_CASES.md
│   │   │   ├── Business Use Cases.pdf
│   │   │   ├── KPIS.md
│   │   │   ├── PLATFORM_USE_CASES.docx
│   │   │   ├── PLATFORM_USE_CASES.pdf
│   │   │   ├── R1_OPERATIONAL_CORE_RELEASE.docx
│   │   │   ├── R1 Operational Core Release.pdf
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI Map.docx
│   │   │   ├── UI_MAP.md
│   │   │   └── UI Map.pdf
│   │   ├── R2_FINANCIAL_CONTROL
│   │   │   ├── BACKLOG.md
│   │   │   ├── KPIS.md
│   │   │   ├── R2_FINANCIAL_CONTROL.md
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI_MAP.md
│   │   │   └── USE_CASES.md
│   │   ├── R3_INTERNAL_CONTROL
│   │   │   ├── BACKLOG.md
│   │   │   ├── KPIS.md
│   │   │   ├── R3_INTERNAL_CONTROL.md
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI_MAP.md
│   │   │   └── USE_CASES.md
│   │   ├── R4_CORPORATE_CONTROL
│   │   │   ├── BACKLOG.md
│   │   │   ├── KPIS.md
│   │   │   ├── R4_CORPORATE_CONTROL.md
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI_MAP.md
│   │   │   └── USE_CASES.md
│   │   ├── R5_INTELLIGENCE
│   │   │   ├── BACKLOG.md
│   │   │   ├── KPIS.md
│   │   │   ├── R5_INTELLIGENCE.md
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI_MAP.md
│   │   │   └── USE_CASES.md
│   │   ├── R6_REGIONAL_EXPANSION
│   │   │   ├── BACKLOG.md
│   │   │   ├── KPIS.md
│   │   │   ├── R6_REGIONAL_EXPANSION.md
│   │   │   ├── README.md
│   │   │   ├── RELEASE.md
│   │   │   ├── UI_MAP.md
│   │   │   └── USE_CASES.md
│   │   ├── README.md
│   │   ├── RELEASE.md
│   │   ├── UI_MAP.md
│   │   └── USE_CASES.md
│   ├── 05_runbooks
│   ├── 06_backlog
│   └── backup
│       ├── 01_ERP_Core_Map_V1.md
│       ├── erp_diretorio.md
│       ├── erp_dir_structure.md
│       ├── ERP_WorldClass_Architecture.md
│       ├── estructura_actual.md
│       ├── kiro-cli-chat.md
│       ├── pendiente.md
│       └── prompt.md
