/**
 * AdminUserMenu - Menu dropdown específico para o header do admin
 * Single Responsibility: Menu do usuário APENAS no contexto admin
 * Não compartilha CSS com o menu público para evitar conflitos
 */
window.AdminUserMenu = {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        user: {
            type: Object,
            required: true
        },
        currentContext: {
            type: String,
            default: 'admin'
        },
        isCompactMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close', 'navigate-context', 'open-profile', 'toggle-compact', 'logout'],
    template: `
        <!-- Backdrop -->
        <div v-if="show" 
            @click="$emit('close')" 
            class="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm"></div>
        
        <!-- Admin User Menu -->
        <div v-if="show" 
<<<<<<< HEAD
            class="admin-user-menu overflow-hidden flex flex-col">
            <!-- Mobile Handle -->
            <div class="lg:hidden w-full flex justify-center pt-3 pb-1">
                <div class="w-12 h-1.5 bg-brand-200 rounded-full opacity-50"></div>
            </div>
=======
            class="admin-user-menu">
>>>>>>> 8532de7f6c2a12b20c4083c1297af93d53b4e545
            <!-- Header: User Identity -->
            <div class="px-5 py-4 bg-brand-50/50 border-b border-brand-100 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border border-white shrink-0 relative">
                    <img v-if="user.photo" :src="user.photo" class="w-full h-full object-cover rounded-full">
                    <span v-else>{{ user.name.charAt(0) }}</span>
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="text-sm font-bold text-brand-800 truncate text-left">{{ user.name }}</span>
                    <span class="text-[10px] text-brand-400 font-medium truncate text-left">{{ user.email }}</span>
                </div>
            </div>

            <!-- Menu Items -->
            <div class="p-2 space-y-1.5">
                <button v-if="['admin', 'dev', 'editor'].includes(user?.role)"
                    @click="$emit('navigate-context', currentContext === 'admin' ? 'public' : 'admin'); $emit('close')"
                    class="w-full text-left px-4 py-2.5 rounded-xl bg-primary-light text-primary font-bold text-xs flex items-center justify-between transition-colors hover:bg-primary/10 group cursor-pointer">
                    <div class="flex items-center gap-3">
                        <base-icon :name="currentContext === 'admin' ? 'globe' : 'layout-dashboard'" icon-class="w-4 h-4"></base-icon>
                        {{ currentContext === 'admin' ? 'Ver Site Público' : 'Painel Administrativo' }}
                    </div>
                </button>
                <div v-if="['admin', 'dev', 'editor'].includes(user?.role)" class="h-px bg-brand-50 my-0.5 mx-2"></div>

                <button @click="$emit('open-profile'); $emit('close')"
                    class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-brand-50 text-brand-600 font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer">
                    <base-icon name="user" icon-class="w-4 h-4 text-brand-400"></base-icon>
                    Meu Perfil
                </button>

                <button @click="$emit('toggle-compact')"
                    class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-between group transition-colors cursor-pointer">
                    <div class="flex items-center gap-3">
                        <base-icon :name="isCompactMode ? 'maximize' : 'minimize'" icon-class="w-4 h-4 text-brand-400 group-hover:text-primary"></base-icon>
                        <span>Modo Compacto</span>
                    </div>
                    <div class="w-8 h-4 rounded-full relative transition-colors" :class="isCompactMode ? 'bg-primary' : 'bg-brand-200'">
                        <div class="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" :style="{ left: isCompactMode ? '1.1rem' : '0.15rem' }"></div>
                    </div>
                </button>

                <div class="h-px bg-brand-50 my-0.5 mx-2"></div>

                <button @click="$emit('logout'); $emit('close')"
                    class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-danger-light text-danger font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer">
                    <base-icon name="log-out" icon-class="w-4 h-4 text-danger"></base-icon>
                    Sair
                </button>
            </div>
        </div>
    `
};
