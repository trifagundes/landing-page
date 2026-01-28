/**
 * useAuthGuards - Composable para autorização e proteção de rotas
 * Responsável apenas por: verificar permissões e executar guards de acesso
 */
window.useAuthGuards = function(auth, router, notifications) {
    // Definição de rotas e suas permissões requeridas
    const ROUTE_GUARDS = {
        'dashboard': 'view_dashboard',
        'dev': 'view_dev_tools',
        'settings': 'manage_settings',
        'users': 'manage_users',
        'team': 'manage_users'
    };
    
    /**
     * Verifica se o usuário tem acesso ao contexto admin
     */
    const canAccessAdmin = () => {
        if (!auth.isAuthenticated) return false;
        if (auth.user?.forceReset) return false;
        return true;
    };
    
    /**
     * Verifica se o usuário pode acessar uma rota específica
     */
    const canAccessRoute = (route) => {
        const requiredPermission = ROUTE_GUARDS[route];
        if (!requiredPermission) return true; // Rota pública
        
        if (!auth.isAuthenticated || !auth.user) {
            return false;
        }
        
        return auth.can(requiredPermission);
    };
    
    /**
     * Protege acesso ao contexto admin
     * Redireciona para login se não autenticado
     */
    const protectAdminAccess = (context) => {
        if (context !== 'admin') return;
        
        if (!auth.isAuthenticated) {
            router.pushContext('auth');
            return;
        }
        
        if (auth.user?.forceReset) {
            router.pushContext('auth');
            return;
        }
    };
    
    /**
     * Protege acesso a rotas específicas
     * Redireciona para dashboard se sem permissão
     */
    const protectRoute = (newRoute) => {
        if (router.currentContext !== 'admin') return;
        
        if (!canAccessRoute(newRoute)) {
            notifications.add("Acesso não autorizado.", "error");
            router.push('dashboard');
        }
    };
    
    /**
     * Bloqueia usuários não-admin em modo manutenção
     */
    const enforceMaintenanceMode = (maintenanceActive) => {
        if (maintenanceActive && auth.isAuthenticated && !['admin', 'dev'].includes(auth.user?.role)) {
            auth.logout();
        }
    };
    
    return {
        canAccessAdmin,
        canAccessRoute,
        protectAdminAccess,
        protectRoute,
        enforceMaintenanceMode
    };
};
