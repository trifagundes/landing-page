/**
 * useErrorHandler - Composable para tratamento padronizado de erros
 * Centraliza lógica de erro e logging
 */
window.useErrorHandler = function (notifications) {
    /**
     * Trata erro de forma padronizada
     * @param {Error|string} error - Erro a tratar
     * @param {Object} options - Opções de tratamento
     */
    const handleError = (error, options = {}) => {
        const {
            title = 'Erro',
            defaultMessage = 'Ocorreu um erro inesperado',
            showNotification = true,
            logToConsole = true,
            context = ''
        } = options;

        // Extrai mensagem do erro
        let errorMessage = defaultMessage;
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.error) {
            errorMessage = error.error;
        }

        // Log para debug
        if (logToConsole) {
            console.error(`[${context || 'ErrorHandler'}]`, error);
        }

        // Exibe notificação se necessário
        if (showNotification && notifications) {
            notifications.add(`${title}: ${errorMessage}`, 'error');
        }

        return {
            handled: true,
            message: errorMessage,
            originalError: error
        };
    };

    /**
     * Wrapper para operações assíncronas com tratamento de erro
     * @param {Function} operation - Função assíncrona a executar
     * @param {Object} errorOptions - Opções de erro
     */
    const withErrorHandling = async (operation, errorOptions = {}) => {
        try {
            return await operation();
        } catch (error) {
            handleError(error, errorOptions);
            throw error; // Re-throw para permitir tratamento adicional se necessário
        }
    };

    /**
     * Trata erros de API/Backend
     */
    const handleApiError = (error, context = 'API') => {
        let message = 'Erro ao conectar com o servidor';

        if (error?.response) {
            // Erro com resposta do servidor
            message = error.response.message || error.response.error || message;
        } else if (error?.message === 'Network Error') {
            message = 'Erro de conexão. Verifique sua internet.';
        }

        return handleError(error, {
            title: 'Erro de Conexão',
            defaultMessage: message,
            context
        });
    };

    /**
     * Trata erros de validação
     */
    const handleValidationError = (validationResult) => {
        if (!validationResult.isValid) {
            handleError(validationResult.message || 'Dados inválidos', {
                title: 'Validação',
                defaultMessage: 'Por favor, verifique os dados informados'
            });
        }
        return validationResult;
    };

    /**
     * Trata erros de autenticação
     */
    const handleAuthError = (error) => {
        return handleError(error, {
            title: 'Autenticação',
            defaultMessage: 'Credenciais inválidas ou sessão expirada',
            context: 'Auth'
        });
    };

    /**
     * Trata erros de permissão
     */
    const handlePermissionError = (action = '') => {
        return handleError(
            `Você não tem permissão para ${action || 'executar esta ação'}`,
            {
                title: 'Acesso Negado',
                context: 'Permission'
            }
        );
    };

    return {
        handleError,
        withErrorHandling,
        handleApiError,
        handleValidationError,
        handleAuthError,
        handlePermissionError
    };
};
