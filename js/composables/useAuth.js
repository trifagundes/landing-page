window.useAuth = function (router, notifications) {
    const getStoredUser = () => {
        try {
            const stored = localStorage.getItem('auth_user');
            if (!stored || stored === 'undefined' || stored === 'null') return null;
            return JSON.parse(stored);
        } catch (e) {
            localStorage.removeItem('auth_user');
            return null;
        }
    };

    const user = getStoredUser();
    const token = localStorage.getItem('auth_token');

    const auth = Vue.reactive({
        user: user,
        isAuthenticated: !!(token && user),
        token: token,

        async attemptLogin(email, password) {
            try {
                const response = await window.AppUtils.runBackend('login', email, password);
                if (response.success) {
                    return { success: true, user: response.user, token: response.token };
                } else if (response.requireReset) {
                    return { success: false, requireReset: true, user: response.user };
                } else {
                    notifications.add(response.message || "Credenciais inválidas.", "error");
                    return { success: false };
                }
            } catch (e) {
                notifications.add("Erro ao conectar com servidor.", "error");
                return { success: false, error: e };
            }
        },

        login(user, token, options = { redirect: true }) {
            this.user = user;
            this.token = token;
            this.isAuthenticated = true;
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);

            if (options.redirect) {
                notifications.add(`Bem-vindo, ${user.name}!`);
                router.pushContext('public');
            }
        },

        updateUser(userData) {
            if (!this.user) return;
            this.user = { ...this.user, ...userData };
            localStorage.setItem('auth_user', JSON.stringify(this.user));
        },

        logout() {
            if (this.token) window.AppUtils.runBackend('logout', this.token);
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            notifications.add("Logout realizado com sucesso.");
            router.pushContext('public');
        },

        can(permission) {
            if (!this.isAuthenticated || !this.user) return false;
            const PERMISSIONS = {
                'dev': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings', 'view_dev_tools', 'manage_system'],
                'admin': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings'],
                'editor': ['view_dashboard', 'manage_events'],
                'user': ['view_dashboard']
            };
            const rolePerms = PERMISSIONS[this.user.role] || [];
            return rolePerms.includes(permission);
        }
    });

    if (!auth.user && auth.isAuthenticated) {
        auth.logout();
    }

    // Wrapper para can que preserva o contexto
    const can = (permission) => auth.can(permission);

    return { auth, can };
};
