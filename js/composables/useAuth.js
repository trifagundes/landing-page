window.useAuth = function (router, notifications) {
    // Usa o GASAPIService para gerenciar estado inicial

    // Proteção contra falha no carregamento da API
    if (!window.GASAPIService) {
        console.error("CRÍTICO: GASAPIService não foi carregado.");
        if (notifications) notifications.add("Erro crítico: API não disponível", "error");
        // Retorna um mock seguro para não quebrar a UI
        return { auth: Vue.reactive({ isAuthenticated: false, user: null }), can: () => false };
    }

    const user = window.GASAPIService.getCurrentUser();
    const token = window.GASAPIService.getToken();

    const auth = Vue.reactive({
        user: user,
        isAuthenticated: !!(token && user),
        token: token,

        async attemptLogin(email, password) {
            try {
                const response = await window.GASAPIService.login(email, password);
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

        async register(email, password, name, phone) {
            try {
                const response = await window.GASAPIService.registerUser(name, phone, email, password);
                if (response.success) {
                    notifications.add(response.message || "Cadastro realizado com sucesso!", "success");
                    return { success: true };
                } else {
                    notifications.add(response.message || "Erro no cadastro.", "error");
                    return { success: false };
                }
            } catch (e) {
                notifications.add("Erro ao cadastrar usuário.", "error");
                return { success: false };
            }
        },

        async resetPassword(email) {
            try {
                const response = await window.GASAPIService.requestPasswordReset(email);
                if (response.success) {
                    notifications.add(response.message || "Instruções enviadas para seu e-mail.", "success");
                    return { success: true };
                } else {
                    notifications.add(response.message || "Erro ao solicitar reset.", "error");
                    return { success: false };
                }
            } catch (e) {
                notifications.add("Erro na solicitação.", "error");
                return { success: false };
            }
        },

        async changePassword(email, oldPassword, newPassword) {
            try {
                const response = await window.GASAPIService.changePasswordAndLogin(email, oldPassword, newPassword);
                if (response.success) {
                    notifications.add("Senha alterada com sucesso!", "success");
                    this.login(response.user, response.token, { redirect: true });
                    return { success: true };
                } else {
                    notifications.add(response.message || "Erro ao alterar senha.", "error");
                    return { success: false };
                }
            } catch (e) {
                notifications.add("Erro técnico ao alterar senha.", "error");
                return { success: false };
            }
        },

        login(user, token, options = { redirect: true }) {
            this.user = user;
            this.token = token;
            this.isAuthenticated = true;

            if (options.redirect) {
                notifications.add(`Bem-vindo, ${user.name}!`);
                router.pushContext('public');
            }
        },

        updateUser(userData) {
            if (!this.user) return;
            this.user = { ...this.user, ...userData };
            // Nota: GASAPIService não tem update local explícito exposto, 
            // mas o estado reativo do Vue cuidará da UI até o próximo reload
        },

        logout() {
            window.GASAPIService.logout();
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            notifications.add("Logout realizado com sucesso.");
            router.pushContext('public');
        },

        can(permission) {
            if (!this.isAuthenticated || !this.user) return false;
            const permsSource = window.APP_CONSTANTS?.PERMISSIONS || {
                'dev': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings', 'view_dev_tools', 'manage_system'],
                'admin': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings'],
                'editor': ['view_dashboard', 'manage_events'],
                'user': ['view_dashboard']
            };
            const rolePerms = permsSource[this.user.role] || [];
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
