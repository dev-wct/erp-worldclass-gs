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
├── erp_diretorio.md
├── erp_dir_structure.md
├── .git
│   ├── COMMIT_EDITMSG
│   ├── config
│   ├── description
│   ├── FETCH_HEAD
│   ├── gk
│   │   └── config
│   ├── HEAD
│   ├── hooks
│   │   ├── applypatch-msg.sample
│   │   ├── commit-msg.sample
│   │   ├── fsmonitor-watchman.sample
│   │   ├── post-update.sample
│   │   ├── pre-applypatch.sample
│   │   ├── pre-commit.sample
│   │   ├── pre-merge-commit.sample
│   │   ├── prepare-commit-msg.sample
│   │   ├── pre-push.sample
│   │   ├── pre-rebase.sample
│   │   ├── pre-receive.sample
│   │   ├── push-to-checkout.sample
│   │   ├── sendemail-validate.sample
│   │   └── update.sample
│   ├── index
│   ├── info
│   │   └── exclude
│   ├── logs
│   │   ├── HEAD
│   │   └── refs
│   │       ├── heads
│   │       │   └── main
│   │       └── remotes
│   │           └── origin
│   │               ├── HEAD
│   │               └── main




## Mòdulos
Asitencia
crm 
activos
