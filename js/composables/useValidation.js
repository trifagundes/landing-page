/**
 * useValidation - Composable para validação de formulários
 * Implementa SRP: responsabilidade única de validar dados
 */
window.useValidation = function () {
    const { ref, computed } = Vue;

    const errors = ref({});
    const touched = ref({});

    /**
     * Valida um único campo
     * @param {string} fieldKey - Chave do campo
     * @param {any} value - Valor do campo
     * @param {Object} rules - Regras de validação
     * @returns {string|null} - Mensagem de erro ou null se válido
     */
    const validateField = (fieldKey, value, rules) => {
        if (!rules) return null;

        // Required
        if (rules.required) {
            if (value === undefined || value === null ||
                (typeof value === 'string' && value.trim() === '')) {
                return `${rules.label || fieldKey} é obrigatório`;
            }
        }

        // Min Length
        if (rules.minLength && typeof value === 'string') {
            if (value.length < rules.minLength) {
                return `${rules.label || fieldKey} deve ter no mínimo ${rules.minLength} caracteres`;
            }
        }

        // Max Length
        if (rules.maxLength && typeof value === 'string') {
            if (value.length > rules.maxLength) {
                return `${rules.label || fieldKey} deve ter no máximo ${rules.maxLength} caracteres`;
            }
        }

        // Email
        if (rules.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return `${rules.label || fieldKey} deve ser um email válido`;
            }
        }

        // URL
        if (rules.url && value) {
            try {
                new URL(value);
            } catch {
                return `${rules.label || fieldKey} deve ser uma URL válida`;
            }
        }

        // Custom validation
        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value);
            if (customError) return customError;
        }

        return null;
    };

    /**
     * Valida um modelo completo baseado em fields
     * @param {Object} model - Modelo a validar
     * @param {Array} fields - Array de definições de campos
     * @returns {Object} - { isValid: boolean, errors: Object }
     */
    const validateModel = (model, fields) => {
        const validationErrors = {};

        fields.forEach(field => {
            if (!field.form) return; // Ignora campos que não aparecem no form

            const value = model[field.key];
            const error = validateField(field.key, value, {
                required: field.required,
                minLength: field.minLength,
                maxLength: field.maxLength,
                email: field.type === 'email',
                url: field.type === 'url',
                label: field.label,
                custom: field.validate
            });

            if (error) {
                validationErrors[field.key] = error;
            }
        });

        errors.value = validationErrors;
        return {
            isValid: Object.keys(validationErrors).length === 0,
            errors: validationErrors
        };
    };

    /**
     * Valida campos obrigatórios (formato legado para compatibilidade)
     * @param {Object} model - Modelo a validar
     * @param {Array} fields - Array de definições de campos
     * @returns {Object} - { isValid: boolean, message: string }
     */
    const validateRequired = (model, fields) => {
        const requiredFields = fields.filter(f => f.required && f.form);
        const missingFields = [];

        requiredFields.forEach(field => {
            const value = model[field.key];
            if (value === undefined || value === null ||
                (typeof value === 'string' && value.trim() === '')) {
                missingFields.push(field.label);
            }
        });

        if (missingFields.length > 0) {
            return {
                isValid: false,
                message: `Os seguintes campos são obrigatórios:\n- ${missingFields.join('\n- ')}`
            };
        }

        return { isValid: true, message: '' };
    };

    /**
     * Marca campo como tocado
     */
    const touchField = (fieldKey) => {
        touched.value[fieldKey] = true;
    };

    /**
     * Reseta erros e campos tocados
     */
    const resetValidation = () => {
        errors.value = {};
        touched.value = {};
    };

    /**
     * Verifica se um campo tem erro e foi tocado
     */
    const getFieldError = (fieldKey) => {
        return touched.value[fieldKey] ? errors.value[fieldKey] : null;
    };

    const isValid = computed(() => Object.keys(errors.value).length === 0);

    return {
        errors,
        touched,
        isValid,
        validateField,
        validateModel,
        validateRequired,
        touchField,
        resetValidation,
        getFieldError
    };
};
