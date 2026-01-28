/**
 * MockGAS - Intercepta chamadas de google.script.run
 * Redireciona para LocalStorageDB para permitir execução local
 */

window.google = window.google || {};
window.google.script = window.google.script || {};

window.google.script.run = (() => {
    let successHandler = null;
    let failureHandler = null;

    const runAction = async (methodName, args) => {
        try {
            console.log(`[MockGAS] Chamando ${methodName}`, args);
            let result;

            switch (methodName) {
                case 'login':
                    result = await mockLogin(args[0], args[1]);
                    break;
                case 'logout':
                    LocalStorageDB.removeSession();
                    result = true;
                    break;
                case 'getData':
                    // args: [token, collection]
                    result = LocalStorageDB.getCollection(args[1]);
                    break;
                case 'saveData':
                    // args: [token, collection, item, idField]
                    result = LocalStorageDB.saveToCollection(args[1], args[2], args[3] || 'id');
                    break;
                case 'deleteData':
                    // args: [token, collection, id, idField]
                    result = LocalStorageDB.removeFromCollection(args[1], args[2], args[3] || 'id');
                    break;
                case 'getSystemInfo':
                    result = {
                        database: { status: 'connected', id: 'local', url: '#' },
                        drive: { status: 'connected', id: 'local', url: '#' },
                        env: { user: 'local@user', scriptId: 'local' }
                    };
                    break;
                case 'getAppUrl':
                    result = window.location.href;
                    break;
                default:
                    console.warn(`[MockGAS] Método ${methodName} não implementado no mock.`);
                    result = { success: false, message: `Método ${methodName} não implementado.` };
            }

            if (successHandler) successHandler(result);
            return result;
        } catch (error) {
            console.error(`[MockGAS] Erro em ${methodName}:`, error);
            if (failureHandler) failureHandler(error);
        }
    };

    const mockLogin = async (email, password) => {
        const users = LocalStorageDB.getCollection('users');
        const inputHash = await LocalStorageDB.computeHash(password);

        const userFound = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === inputHash &&
            u.status === 'active'
        );

        if (userFound) {
            const { password, ...userWithoutPassword } = userFound;
            const token = LocalStorageDB.createSession(userWithoutPassword);
            return { success: true, token, user: userWithoutPassword };
        }

        return { success: false, message: 'Credenciais inválidas ou usuário inativo.' };
    };

    const proxy = {
        withSuccessHandler: (handler) => {
            successHandler = handler;
            return proxy;
        },
        withFailureHandler: (handler) => {
            failureHandler = handler;
            return proxy;
        }
    };

    // Criar dinamicamente os métodos que o frontend espera
    const availableMethods = [
        'login', 'logout', 'getData', 'saveData', 'deleteData',
        'getSystemInfo', 'getAppUrl', 'registerUser', 'resetSystemDatabase'
    ];

    availableMethods.forEach(method => {
        proxy[method] = (...args) => runAction(method, args);
    });

    return proxy;
})();
