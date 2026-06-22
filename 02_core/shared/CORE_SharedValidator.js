/**
 * CORE_SharedValidator
 * Motor de validación de formatos isomórfico y catálogo de reglas del holding.
 * Se ejecuta idénticamente en Servidor (Validadores de UseCase) y Cliente (FormHandler).
 */
function SharedValidatorScope() {
  
  // Configuración regional de documentos
  let docConfig = {
    label: 'DPI',
    regex: /^[0-9]{13}$/,
    message: 'El DPI debe contener exactamente 13 dígitos numéricos.'
  };

  let corporateDocConfig = {
    label: 'NIT',
    regex: /^[0-9]{5,12}-[0-9Kk]$/i,
    message: 'El NIT no es válido.'
  };

  const COUNTRY_DOC_CONFIGS = {
    'GT': { label: 'DPI', regex: /^[0-9]{13}$/, message: 'El DPI debe contener exactamente 13 dígitos numéricos.' },
    'SV': { label: 'DUI', regex: /^[0-9]{9}$/, message: 'El DUI debe contener exactamente 9 dígitos numéricos.' },
    'HN': { label: 'DNI', regex: /^[0-9]{13}$/, message: 'El DNI debe contener exactamente 13 dígitos numéricos.' },
    'MX': { label: 'CURP', regex: /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$/i, message: 'El CURP debe tener un formato válido de 18 caracteres alfanuméricos.' },
    'CO': { label: 'Cédula', regex: /^[0-9]{8,10}$/, message: 'La Cédula de Ciudadanía debe contener entre 8 y 10 dígitos.' },
    'AR': { label: 'DNI', regex: /^[0-9]{7,8}$/, message: 'El DNI debe contener entre 7 y 8 dígitos.' },
    'ES': { label: 'DNI/NIE', regex: /^[0-9XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i, message: 'El DNI o NIE debe ser válido.' },
    'US': { label: 'SSN', regex: /^[0-9]{9}$/, message: 'El SSN debe contener exactamente 9 dígitos.' },
    'EC': { label: 'Cédula', regex: /^[0-9]{10}$/, message: 'La Cédula debe contener exactamente 10 dígitos numéricos.' }
  };

  const COUNTRY_CORP_CONFIGS = {
    'GT': { label: 'NIT', regex: /^[0-9]{5,12}-[0-9Kk]$/i, message: 'El NIT debe ser válido.' },
    'SV': { label: 'NIT', regex: /^[0-9]{14}$/, message: 'El NIT debe contener exactamente 14 dígitos.' },
    'HN': { label: 'RTN', regex: /^[0-9]{14}$/, message: 'El RTN debe contener exactamente 14 dígitos.' },
    'MX': { label: 'RFC', regex: /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/i, message: 'El RFC debe ser válido.' },
    'CO': { label: 'NIT', regex: /^[0-9]{9}-[0-9]$/, message: 'El NIT debe tener formato 123456789-0.' },
    'AR': { label: 'CUIT', regex: /^[0-9]{11}$/, message: 'El CUIT debe contener exactamente 11 dígitos.' },
    'ES': { label: 'CIF', regex: /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i, message: 'El CIF debe ser válido.' },
    'US': { label: 'EIN', regex: /^[0-9]{9}$/, message: 'El EIN debe contener exactamente 9 dígitos.' },
    'EC': { label: 'RUC', regex: /^[0-9]{13}$/, message: 'El RUC debe contener exactamente 13 dígitos numéricos.' }
  };

  this.configure = function(isoCodeOrIdEmpresa) {
    let code = 'GT';
    if (isoCodeOrIdEmpresa) {
      if (String(isoCodeOrIdEmpresa).length === 2) {
        code = String(isoCodeOrIdEmpresa).toUpperCase();
      } else {
        try {
          if (typeof Customizing !== 'undefined') {
            const ctx = Customizing.getContextoEmpresa(isoCodeOrIdEmpresa);
            if (ctx && ctx.codigo_iso && ctx.codigo_iso !== 'XX') {
              code = ctx.codigo_iso;
            }
          }
        } catch(e) {}
      }
    } else {
      try {
        if (typeof Customizing !== 'undefined') {
          const ctx = Customizing.getContextoEmpresa(1);
          if (ctx && ctx.codigo_iso && ctx.codigo_iso !== 'XX') {
            code = ctx.codigo_iso;
          }
        }
      } catch(e) {}
    }

    if (COUNTRY_DOC_CONFIGS[code]) {
      docConfig = Object.assign({}, COUNTRY_DOC_CONFIGS[code]);
    }
    if (COUNTRY_CORP_CONFIGS[code]) {
      corporateDocConfig = Object.assign({}, COUNTRY_CORP_CONFIGS[code]);
    }
  };

  // Diccionario de reglas y mensajes estándar
  const RULES = {
    required: {
      validate: (val) => val !== undefined && val !== null && String(val).trim() !== "",
      message: "Este campo es obligatorio."
    },
    dpi: {
      validate: (val) => {
        const clean = String(val).replace(/[^0-9A-Za-z]/g, '');
        if (docConfig.regex instanceof RegExp) {
          return docConfig.regex.test(clean);
        }
        return true;
      },
      message: () => docConfig.message
    },
    email: {
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()),
      message: "El correo electrónico no tiene un formato válido."
    },
    telefono: {
      validate: (val) => /^[0-9]{8,15}$/.test(String(val).replace(/[^0-9]/g, '')),
      message: "El teléfono debe contener entre 8 y 15 dígitos."
    },
    nit: {
      validate: (val) => {
        if (corporateDocConfig.regex instanceof RegExp) {
          return corporateDocConfig.regex.test(String(val).trim());
        }
        return true;
      },
      message: () => corporateDocConfig.message
    }
  };

  /**
   * Valida un objeto de datos frente a un esquema de reglas de campos.
   * @param {object} data - Datos a validar.
   * @param {object} schema - Reglas aplicables.
   * @returns {{ isValid: boolean, errors: object }}
   */
  this.validate = function(data, schema) {
    const errors = {};
    let isValid = true;

    Object.keys(schema).forEach(field => {
      const fieldRules = schema[field];
      const val = data[field];

      for (let i = 0; i < fieldRules.length; i++) {
        const ruleName = fieldRules[i];
        const rule = RULES[ruleName];

        if (rule) {
          const isFilled = val !== undefined && val !== null && String(val).trim() !== "";
          // 'required' siempre valida. Otras reglas solo si el campo está lleno.
          if (ruleName === 'required' || isFilled) {
            if (!rule.validate(val)) {
              errors[field] = typeof rule.message === 'function' ? rule.message(val) : rule.message;
              isValid = false;
              break; // Detenerse en el primer error del campo
            }
          }
        }
      }
    });

    return { isValid, errors };
  };
}

// Inicialización del validador global en servidor
const SharedValidator = new SharedValidatorScope();

/** Serialización para inyección en el cliente (HTML) */
function getSharedValidatorClientCode() {
  return SharedValidatorScope.toString() + 
         "\nconst SharedValidator = new SharedValidatorScope();";
}
