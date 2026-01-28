window.BaseLoginPage = {
    components: { 'base-icon': window.BaseIcon },
    props: ['auth', 'router', 'notifications', 'settings'],
    data() {
        return {
            isRegistering: false,
            form: { email: '', password: '', confirmPassword: '', name: '', phone: '' },
            resetModal: { isOpen: false, email: '' },
            forceChangeModal: { isOpen: false, newPassword: '', confirmPassword: '' },
            currentUser: null,
            isLoading: false,
            showPassword: {
                login: false,
                register: false,
                registerConfirm: false,
                force: false,
                forceConfirm: false
            }
        };
    },
    methods: {
        async handleSubmit() {
            if (!this.form.email || !this.form.password) {
                this.notifications.add("Preencha todos os campos obrigatórios.", "error");
                return;
            }
            if (this.isRegistering) {
                if (!this.form.name || !this.form.phone) {
                    this.notifications.add("Nome e Telefone são obrigatórios.", "error");
                    return;
                }
                if (this.form.password !== this.form.confirmPassword) {
                    this.notifications.add("As senhas não conferem.", "error");
                    return;
                }
            }
            this.isLoading = true;
            if (this.isRegistering) {
                try {
                    const result = await window.AppUtils.runBackend('registerUser', this.form.email, this.form.password, this.form.name, this.form.phone);
                    if (result.success) {
                        this.notifications.add(result.message, "success");
                        this.isRegistering = false;
                        this.form.password = '';
                        this.form.confirmPassword = '';
                    } else {
                        this.notifications.add(result.message || "Erro ao cadastrar.", "error");
                    }
                } catch (e) {
                    this.notifications.add("Erro de conexão.", "error");
                }
            } else {
                const response = await this.auth.attemptLogin(this.form.email, this.form.password);
                if (response.success) {
                    this.auth.login(response.user, response.token, { redirect: true });
                } else if (response.requireReset) {
                    this.currentUser = response.user || { email: this.form.email };
                    this.forceChangeModal.isOpen = true;
                    this.notifications.add("Por segurança, você deve alterar sua senha.", "warning");
                } else {
                    this.notifications.add(response.message || "Erro ao entrar.", "error");
                }
            }
            this.isLoading = false;
        },
        async handleForgotSubmit() {
            if (!this.resetModal.email) {
                this.notifications.add("Digite seu e-mail.", "error");
                return;
            }
            this.isLoading = true;
            try {
                const result = await window.AppUtils.runBackend('requestPasswordReset', this.resetModal.email);
                if (result.success) {
                    this.notifications.add(result.message, "success");
                    this.resetModal.isOpen = false;
                } else {
                    this.notifications.add(result.message, "error");
                }
            } catch (e) {
                this.notifications.add("Erro ao solicitar senha.", "error");
            }
            this.isLoading = false;
        },
        async handleForceChange() {
            if (this.forceChangeModal.newPassword !== this.forceChangeModal.confirmPassword) {
                this.notifications.add("As senhas não conferem.", "error");
                return;
            }
            if (this.forceChangeModal.newPassword.length < 6) {
                this.notifications.add("A senha deve ter no mínimo 6 caracteres.", "error");
                return;
            }
            this.isLoading = true;
            try {
                const oldPass = this.form.password;
                const result = await window.AppUtils.runBackend('changePasswordAndLogin',
                    this.currentUser.email,
                    oldPass,
                    this.forceChangeModal.newPassword
                );
                if (result.success) {
                    this.notifications.add("Senha alterada com sucesso!", "success");
                    this.auth.login(result.user, result.token, { redirect: true });
                    this.forceChangeModal.isOpen = false;
                } else {
                    throw new Error(result.message);
                }
            } catch (e) {
                this.notifications.add("Erro: " + e.message, "error");
            }
            this.isLoading = false;
        },
        toggleMode() {
            this.isRegistering = !this.isRegistering;
            this.form = { email: '', password: '', confirmPassword: '', name: '', phone: '' };
        },
        openResetModal() {
            this.resetModal.email = this.form.email || '';
            this.resetModal.isOpen = true;
        }
    },
    template: `
    <div class="min-h-screen bg-brand-50 flex items-center justify-center p-6 bg-gradient-to-br from-primary-light/20 to-white">
        <div class="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div v-if="settings.isMaintenance" class="mb-8 p-4 bg-warning-light text-warning rounded-2xl flex items-center gap-3 border border-warning-light/30 animate-in fade-in slide-in-from-top-4">
                <div class="p-2 bg-warning/10 rounded-lg shrink-0">
                     <base-icon name="alert-triangle" icon-class="w-5 h-5"></base-icon>
                </div>
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider mb-0.5">Sistema em Manutenção</h3>
                    <p class="text-[10px] leading-tight opacity-80">O acesso está restrito apenas a administradores.</p>
                </div>
            </div>
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary-light/30">
                    <base-icon :name="settings.brandIcon" icon-class="w-8 h-8"></base-icon>
                </div>
                <h1 class="text-2xl font-bold text-brand-800 mb-2">{{ isRegistering ? 'Criar Conta' : 'Bem-vindo de volta!' }}</h1>
                <p class="text-brand-400 text-sm">{{ isRegistering ? 'Preencha os dados abaixo para solicitar acesso.' : 'Acesse o painel de gestão para continuar.' }}</p>
            </div>
            <form @submit.prevent="handleSubmit" class="space-y-6" :class="{ 'opacity-70': isLoading }">
                <template v-if="isRegistering">
                    <div>
                        <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">Nome Completo</label>
                        <div class="relative">
                            <input v-model="form.name" type="text" required placeholder="Ex: João da Silva" :disabled="isLoading" class="pl-12 pr-4 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                            <base-icon name="user" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">Telefone / WhatsApp</label>
                        <div class="relative">
                            <input v-model="form.phone" type="tel" required placeholder="(00) 00000-0000" :disabled="isLoading" class="pl-12 pr-4 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                            <base-icon name="phone" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                        </div>
                    </div>
                </template>
                <div>
                    <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">E-mail Profissional</label>
                    <div class="relative">
                        <input v-model="form.email" type="email" required placeholder="seu@email.com" :disabled="isLoading" class="pl-12 pr-4 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                        <base-icon name="mail" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-2 px-1">
                        <label class="block text-[10px] font-bold text-brand-400 uppercase">Senha</label>
                        <a v-if="!isRegistering" href="#" @click.prevent="openResetModal" :class="{ 'pointer-events-none opacity-50': isLoading }" class="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-widest">Esqueci a senha</a>
                    </div>
                    <div class="relative">
                        <input v-model="form.password" :type="showPassword.login ? 'text' : 'password'" required placeholder="••••••••" :disabled="isLoading" class="pl-12 pr-12 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                        <base-icon name="lock" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                        <button type="button" @click="showPassword.login = !showPassword.login" tabindex="-1" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-primary transition-colors">
                            <base-icon :name="showPassword.login ? 'eye-off' : 'eye'" icon-class="w-5 h-5"></base-icon>
                        </button>
                    </div>
                </div>
                <div v-if="isRegistering">
                    <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">Confirmar Senha</label>
                    <div class="relative">
                        <input v-model="form.confirmPassword" :type="showPassword.registerConfirm ? 'text' : 'password'" required placeholder="••••••••" :disabled="isLoading" class="pl-12 pr-12 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                        <base-icon name="lock" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                        <button type="button" @click="showPassword.registerConfirm = !showPassword.registerConfirm" tabindex="-1" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-primary transition-colors">
                            <base-icon :name="showPassword.registerConfirm ? 'eye-off' : 'eye'" icon-class="w-5 h-5"></base-icon>
                        </button>
                    </div>
                </div>
                <button type="submit" :disabled="isLoading" class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-light/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    <span v-if="isLoading">Processando...</span>
                    <span v-else>{{ isRegistering ? 'Solicitar Acesso' : 'Acessar Painel' }}</span>
                    <base-icon v-if="!isLoading" name="arrow-right" icon-class="w-5 h-5"></base-icon>
                    <base-icon v-else name="loader-2" icon-class="w-5 h-5 animate-spin"></base-icon>
                </button>
                <button type="button" @click="toggleMode" :disabled="isLoading" class="w-full text-primary hover:text-primary-hover text-xs font-bold uppercase tracking-widest transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-primary-light/50 rounded-xl hover:bg-primary-light/10">
                    {{ isRegistering ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se' }}
                </button>
                <button type="button" @click="router.pushContext('public')" :disabled="isLoading" class="w-full text-brand-400 text-xs font-bold uppercase tracking-widest hover:text-brand-600 transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    Voltar ao Site
                </button>
            </form>
        </div>
        <div v-if="resetModal.isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" @click="resetModal.isOpen = false"></div>
            <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm relative z-10 text-center animate-in zoom-in duration-300 shadow-2xl">
                <div class="w-16 h-16 bg-primary-light/30 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <base-icon name="key" icon-class="w-8 h-8"></base-icon>
                </div>
                <h3 class="text-xl font-bold text-brand-800 mb-2">Recuperar Senha</h3>
                <p class="text-brand-500 text-xs mb-6 mx-auto w-3/4 leading-relaxed">Digite seu e-mail profissional.</p>
                <form @submit.prevent="handleForgotSubmit">
                    <div class="relative mb-6 text-left">
                        <input v-model="resetModal.email" type="email" required placeholder="seu@email.com" :disabled="isLoading" class="pl-12 pr-4 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                        <base-icon name="mail" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-light/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                         <base-icon v-if="!isLoading" name="arrow-right" icon-class="w-4 h-4"></base-icon>
                         <base-icon v-else name="loader-2" icon-class="w-4 h-4 animate-spin"></base-icon>
                        <span>{{ isLoading ? 'Enviando...' : 'Enviar Senha' }}</span>
                    </button>
                </form>
            </div>
        </div>
        <div v-if="forceChangeModal.isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-brand-900/90 backdrop-blur-md"></div>
            <div class="bg-white rounded-[2rem] p-8 w-full max-w-lg relative z-10 text-center animate-in zoom-in duration-500 shadow-2xl shadow-primary-light/20 border border-brand-100">
                <div class="w-16 h-16 bg-warning-light text-warning rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-warning-light/20">
                    <base-icon name="shield-alert" icon-class="w-8 h-8"></base-icon>
                </div>
                <h3 class="text-xl font-bold text-brand-800 mb-1">Redefinir Senha</h3>
                <p class="text-brand-400 text-xs mb-1">Conta: <span class="font-bold text-primary">{{ currentUser?.email }}</span></p>
                <p class="text-brand-500 text-sm mb-6 mx-auto leading-relaxed">Sua senha atual é temporária. Por favor, crie uma nova senha segura para continuar.</p>
                <form @submit.prevent="handleForceChange" class="space-y-4 text-left">
                    <div>
                        <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">Nova Senha</label>
                        <div class="relative">
                            <input v-model="forceChangeModal.newPassword" :type="showPassword.force ? 'text' : 'password'" required placeholder="Nova Senha Segura" :disabled="isLoading" class="pl-12 pr-12 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-warning-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                            <base-icon name="lock" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                            <button type="button" @click="showPassword.force = !showPassword.force" tabindex="-1" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-warning transition-colors">
                                <base-icon :name="showPassword.force ? 'eye-off' : 'eye'" icon-class="w-5 h-5"></base-icon>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-brand-400 uppercase mb-2 ml-1">Confirmar Nova Senha</label>
                        <div class="relative">
                            <input v-model="forceChangeModal.confirmPassword" :type="showPassword.forceConfirm ? 'text' : 'password'" required placeholder="Confirme a Senha" :disabled="isLoading" class="pl-12 pr-12 py-4 w-full bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-warning-light outline-none transition-all font-medium text-brand-600 disabled:bg-brand-100 disabled:text-brand-400">
                            <base-icon name="check-circle" icon-class="w-5 h-5 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2"></base-icon>
                            <button type="button" @click="showPassword.forceConfirm = !showPassword.forceConfirm" tabindex="-1" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-warning transition-colors">
                                <base-icon :name="showPassword.forceConfirm ? 'eye-off' : 'eye'" icon-class="w-5 h-5"></base-icon>
                            </button>
                        </div>
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-warning hover:bg-warning-hover text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-warning-light/20 active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                         <base-icon v-if="!isLoading" name="save" icon-class="w-5 h-5"></base-icon>
                         <base-icon v-else name="loader-2" icon-class="w-5 h-5 animate-spin"></base-icon>
                        <span>{{ isLoading ? 'Atualizando...' : 'Definir Nova Senha' }}</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
    `
};
