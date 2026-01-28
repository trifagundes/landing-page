window.SettingsPanel = {
    components: {
        'base-icon': window.BaseIcon,
        'section-editor': {
            props: ['title', 'data', 'icon', 'canLimit'],
            components: { 'base-icon': window.BaseIcon },
            template: `
                <div class="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-brand-100 space-y-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-50 pb-6 gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-brand-50 text-primary flex items-center justify-center border border-brand-100 shadow-sm shrink-0">
                                <base-icon :name="icon || 'layout'" icon-class="w-6 h-6"></base-icon>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-brand-800 leading-tight">{{ title }}</h3>
                                <p class="text-[10px] text-brand-400 uppercase font-bold tracking-widest mt-0.5">Configurações da Seção</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <!-- Section Controls Group -->
                            <div class="flex items-center gap-1 bg-brand-50 p-1 rounded-2xl border border-brand-100/50 shadow-sm grow sm:grow-0 justify-between">
                                <!-- Botão Restaurar -->
                                <button @click="$parent.ui.resetSection($parent.activeTab)" 
                                    class="w-10 h-10 rounded-xl hover:bg-white text-brand-400 hover:text-primary transition-all flex items-center justify-center group/reset shrink-0"
                                    title="Restaurar Padrões">
                                    <base-icon name="rotate-ccw" icon-class="w-5 h-5 group-hover/reset:animate-spin-slow"></base-icon>
                                </button>
                                
                                <div class="h-6 w-px bg-brand-200 mx-1 hidden sm:block"></div>

                                <div class="flex items-center gap-3 px-3 py-1">
                                    <span class="text-[10px] font-bold uppercase tracking-wider" :class="data.show ? 'text-primary' : 'text-brand-400'">
                                        {{ data.show ? 'Visível' : 'Oculta' }}
                                    </span>
                                    <button @click="data.show = !data.show" 
                                        class="w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shadow-inner" 
                                        :class="data.show ? 'bg-primary' : 'bg-brand-200'">
                                        <div class="w-3 h-3 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300 shadow-sm" 
                                            :class="data.show ? 'translate-x-5' : 'translate-x-0'"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="data.show" class="space-y-8 animate-in fade-in duration-300">
                        <!-- Conteúdo Base -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Título em Destaque</label>
                                <input v-model="data.title" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-medium">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Ícone da Seção</label>
                                <div class="flex gap-4 items-center">
                                    <input v-model="data.icon" class="flex-1 p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-medium" placeholder="Ex: star, zap, users...">
                                    <div class="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-light/20 transition-all shrink-0">
                                        <base-icon :name="data.icon || (data.icon === '' ? '' : (icon || 'layout'))" icon-class="w-6 h-6"></base-icon>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Subtítulo / Descrição</label>
                            <textarea v-model="data.subtitle" rows="2" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-medium resize-none"></textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <!-- Opções de Layout -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Cor de Fundo</label>
                                <select v-model="data.bgColor" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-bold appearance-none cursor-pointer">
                                    <option value="bg-white">Branco Puro</option>
                                    <option value="bg-brand-50">Cinza Suave (Brand 50)</option>
                                    <option value="bg-primary-light/10">Primária Ultra Leve</option>
                                </select>
                            </div>
                            <!-- Limite de Itens -->
                            <div v-if="canLimit" class="space-y-2">
                                <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Quantidade de Itens</label>
                                <input type="number" v-model.number="data.itemsLimit" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-bold">
                            </div>
                        </div>

                        <!-- Configuração de Botões -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brand-50">
                            <!-- CTA Principal -->
                            <div class="p-6 bg-brand-50/50 rounded-[2rem] border border-brand-100/50 space-y-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-[10px] font-bold text-brand-500 uppercase">Botão Principal (CTA)</span>
                                    <button @click="data.ctaShow = !data.ctaShow" class="w-8 h-4 rounded-full relative transition-colors focus:outline-none" :class="data.ctaShow ? 'bg-primary' : 'bg-brand-200'">
                                        <div class="w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] left-[3px] transition-transform" :class="data.ctaShow ? 'translate-x-4' : 'translate-x-0'"></div>
                                    </button>
                                </div>
                                <div v-if="data.ctaShow" class="space-y-4 animate-in fade-in duration-300">
                                    <input v-model="data.ctaText" class="w-full p-3 bg-white border border-brand-100 rounded-xl text-xs font-medium" placeholder="Texto do Botão">
                                    <input v-model="data.ctaLink" class="w-full p-3 bg-white border border-brand-100 rounded-xl text-xs font-medium" placeholder="Link/ID (Ex: #contato)">
                                </div>
                            </div>

                            <!-- Link de Arquivo -->
                            <div class="p-6 bg-brand-50/50 rounded-[2rem] border border-brand-100/50 space-y-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-[10px] font-bold text-brand-500 uppercase">Link "Veja Todos"</span>
                                    <button @click="data.viewAllShow = !data.viewAllShow" class="w-8 h-4 rounded-full relative transition-colors focus:outline-none" :class="data.viewAllShow ? 'bg-primary' : 'bg-brand-200'">
                                        <div class="w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] left-[3px] transition-transform" :class="data.viewAllShow ? 'translate-x-4' : 'translate-x-0'"></div>
                                    </button>
                                </div>
                                <div v-if="data.viewAllShow" class="space-y-4 animate-in fade-in duration-300">
                                    <input v-model="data.viewAllLabel" class="w-full p-3 bg-white border border-brand-100 rounded-xl text-xs font-medium" placeholder="Texto do Link">
                                    <input v-model="data.viewAllLink" class="w-full p-3 bg-white border border-brand-100 rounded-xl text-xs font-medium" placeholder="Link (Ex: #arquivo)">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="py-8 text-center bg-brand-50/50 rounded-[2rem] border border-dashed border-brand-200">
                        <p class="text-xs text-brand-400 font-bold uppercase tracking-widest italic">A seção está oculta na página pública</p>
                    </div>
                </div>
            `
        }
    },
    props: ['settings'],
    setup() {
        const uiState = window.useUI();
        return {
            utils: window.AppUtils,
            themes: window.ThemePresets,
            ui: uiState.ui
        }
    },
    data() { return { activeTab: 'general' } },
    methods: {
        selectTab(tab) {
            this.activeTab = tab;
            if (this.ui.isMobile) {
                this.ui.adminMenuView = false;
            }
        }
    },
    computed: {
        maintenanceToggleClass() { return this.settings.isMaintenance ? 'bg-primary' : 'bg-brand-200'; },
        maintenanceBallClass() { return this.settings.isMaintenance ? 'translate-x-6' : 'translate-x-1'; }
    },
    template: `
    <div class="w-full max-w-7xl lg:mx-auto space-y-6 md:space-y-8 px-0 md:px-0 pt-6 md:pt-0">
        <!-- HEADER DO PAINEL -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 px-4 md:px-0">
            <div class="flex items-center gap-4">
                <!-- Botão Voltar (Mobile Only) -->
                <button v-if="ui.isMobile && !ui.adminMenuView" @click="ui.adminMenuView = true" 
                    class="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm transition-all active:scale-95">
                    <base-icon name="chevron-left" icon-class="w-6 h-6"></base-icon>
                </button>
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-brand-800 tracking-tight">
                        {{ ui.isMobile && !ui.adminMenuView ? 'Configurar Seção' : 'Personalização' }}
                    </h1>
                    <p class="text-brand-500 text-xs md:text-sm mt-1">
                        {{ ui.isMobile && !ui.adminMenuView ? 'Ajuste os detalhes abaixo' : 'Gerencie a identidade e conteúdo' }}
                    </p>
                </div>
            </div>
            
            <!-- Badge de Status Global -->
            <div v-if="settings.isMaintenance" class="flex items-center gap-2 px-4 py-2 bg-warning-light text-warning rounded-2xl border border-warning-light/50 animate-pulse self-start md:self-auto">
                <base-icon name="alert-triangle" icon-class="w-4 h-4"></base-icon>
                <span class="text-[10px] font-bold uppercase tracking-widest">Modo Manutenção</span>
            </div>
        </div>

        <!-- LAYOUT SPLIT VIEW / DRILL DOWN -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">
            
            <!-- SIDEBAR DE CONFIGURAÇÕES -->
            <aside v-show="!ui.isMobile || ui.adminMenuView" class="w-full lg:w-80 shrink-0 space-y-2 sticky top-24 animate-in fade-in zoom-in-95 duration-300">
                <div class="bg-white/50 backdrop-blur-md rounded-3xl md:rounded-[2.5rem] border border-brand-100 p-3 shadow-sm">
                    <div class="px-5 py-4 border-b border-brand-50 mb-2">
                        <span class="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Escolha o que editar</span>
                    </div>
                    
                    <nav class="space-y-1">
                        <!-- Botão Geral -->
                        <button @click="selectTab('general')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="settings-2" :icon-class="activeTab === 'general' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Identidade & Cores</div>
                                <div class="text-[10px] opacity-70 font-medium" :class="activeTab === 'general' ? 'text-white' : 'text-brand-400'">Nome, Ícone e Temas</div>
                            </div>
                        </button>

                        <div class="h-px bg-brand-50 mx-4 my-2"></div>

                        <!-- Botão Hero -->
                        <button @click="selectTab('hero')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'hero' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="zap" :icon-class="activeTab === 'hero' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Destaque (Hero)</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'hero' ? 'text-white' : (settings.hero.show ? 'text-primary' : 'text-brand-300')">
                                    {{ settings.hero.show ? 'Ativada' : 'Oculta' }}
                                </div>
                            </div>
                        </button>

                        <!-- Botão Portfolio -->
                        <button @click="selectTab('portfolio')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'portfolio' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="briefcase" :icon-class="activeTab === 'portfolio' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Galeria de Entregas</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'portfolio' ? 'text-white' : (settings.portfolio.show ? 'text-primary' : 'text-brand-300')">
                                    {{ settings.portfolio.show ? 'Ativada' : 'Oculta' }}
                                </div>
                            </div>
                        </button>

                        <!-- Botão Clipping -->
                        <button @click="selectTab('clipping')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'clipping' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="newspaper" :icon-class="activeTab === 'clipping' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Notícias & Clipping</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'clipping' ? 'text-white' : (settings.clipping.show ? 'text-primary' : 'text-brand-300')">
                                    {{ settings.clipping.show ? 'Ativada' : 'Oculta' }}
                                </div>
                            </div>
                        </button>

                        <!-- Botão Feedback -->
                        <button @click="selectTab('testimonials')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'testimonials' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="quote" :icon-class="activeTab === 'testimonials' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Depoimentos</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'testimonials' ? 'text-white' : (settings.testimonials.show ? 'text-primary' : 'text-brand-300')">
                                    {{ settings.testimonials.show ? 'Ativada' : 'Oculta' }}
                                </div>
                            </div>
                        </button>

                        <!-- Botão Time -->
                        <button @click="selectTab('team')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'team' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="users-2" :icon-class="activeTab === 'team' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Time & Especialistas</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'team' ? 'text-white' : (settings.team.show ? 'text-primary' : 'text-brand-300')">
                                    {{ settings.team.show ? 'Ativada' : 'Oculta' }}
                                </div>
                            </div>
                        </button>

                        <div class="h-px bg-brand-50 mx-4 my-2"></div>

                        <!-- Botão Rodapé -->
                        <button @click="selectTab('footer')" 
                            class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group"
                            :class="activeTab === 'footer' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-brand-600 hover:bg-brand-50'">
                            <base-icon name="layout" :icon-class="activeTab === 'footer' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-brand-400 group-hover:text-primary'"></base-icon>
                            <div class="text-left">
                                <div class="text-sm font-bold">Rodapé</div>
                                <div class="text-[10px] font-medium uppercase tracking-wider" :class="activeTab === 'footer' ? 'text-white' : 'text-brand-400'">Configurar Links</div>
                            </div>
                        </button>
                    </nav>
                </div>
            </aside>

            <!-- CONTEÚDO PRINCIPAL (EDITOR) -->
            <main v-show="!ui.isMobile || !ui.adminMenuView" class="flex-1 w-full min-w-0 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <!-- TAB: Geral -->
                <div v-show="activeTab === 'general'">
                    <div class="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-brand-100 space-y-12 shadow-sm">
                        
                        <!-- Identidade Section -->
                        <div class="space-y-8">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-50 pb-6 gap-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-brand-50 text-primary flex items-center justify-center border border-brand-100 shrink-0">
                                        <base-icon name="id-card" icon-class="w-6 h-6"></base-icon>
                                    </div>
                                    <h3 class="text-xl font-bold text-brand-800 tracking-tight">Identidade Visual</h3>
                                </div>
                                <button @click="ui.resetSection('appTitle'); ui.resetSection('brandIcon')" 
                                    class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-brand-400 hover:text-primary hover:bg-brand-50 transition-all font-bold text-[10px] uppercase tracking-widest border border-brand-100/50 bg-brand-50">
                                    <base-icon name="rotate-ccw" icon-class="w-4 h-4"></base-icon>
                                    Restaurar Identidade
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Nome do Ecossistema</label>
                                    <input v-model="settings.appTitle" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-bold">
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold text-brand-400 uppercase ml-1">Ícone Principal (Lucide)</label>
                                    <div class="flex gap-4 items-center">
                                        <input v-model="settings.brandIcon" class="flex-1 p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-bold" placeholder="clapperboard">
                                        <div class="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-light/20 transition-all shrink-0">
                                            <base-icon :name="settings.brandIcon" icon-class="w-6 h-6"></base-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Temas Section -->
                        <div class="space-y-8 pt-4">
                            <div class="flex items-center gap-4 border-b border-brand-50 pb-6">
                                <div class="w-12 h-12 rounded-2xl bg-brand-50 text-secondary flex items-center justify-center border border-brand-100">
                                    <base-icon name="palette" icon-class="w-6 h-6 text-primary"></base-icon>
                                </div>
                                <h3 class="text-xl font-bold text-brand-800 tracking-tight">Esquema de Cores</h3>
                            </div>
                            
                            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                <button v-for="(theme, key) in themes" :key="key" 
                                    @click="settings.activeTheme = key"
                                    class="p-5 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all active:scale-95 relative overflow-hidden flex flex-col items-center gap-4"
                                    :class="settings.activeTheme === key ? 'border-primary bg-primary-light/5 shadow-xl shadow-primary/10' : 'border-brand-50 bg-white hover:border-brand-100 text-brand-500 shadow-sm'">
                                    <div class="flex -space-x-3">
                                        <div class="w-10 h-10 rounded-full border-4 border-white shadow-lg" :style="{ backgroundColor: theme.primary }"></div>
                                        <div class="w-10 h-10 rounded-full border-4 border-white shadow-lg" :style="{ backgroundColor: theme['brand-900'] || theme['slate-900'] }"></div>
                                    </div>
                                    <span class="text-[10px] font-bold uppercase tracking-widest text-brand-800">{{ theme.label.split(' ')[0] }}</span>
                                    <div v-if="settings.activeTheme === key" class="absolute top-3 right-3 text-primary"><base-icon name="check-circle" icon-class="w-4 h-4"></base-icon></div>
                                </button>
                            </div>
                        </div>

                        <!-- Sistema Section -->
                        <div class="space-y-8 pt-4">
                            <div class="flex items-center gap-4 border-b border-brand-50 pb-6">
                                <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center border border-brand-100">
                                    <base-icon name="power" icon-class="w-6 h-6"></base-icon>
                                </div>
                                <h3 class="text-xl font-bold text-brand-800 tracking-tight">Estado do Portal</h3>
                            </div>
                            
                            <div class="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-brand-50 rounded-[2rem] md:rounded-[2.5rem] border border-brand-100 gap-6">
                                <div class="flex items-center gap-6 text-center md:text-left">
                                    <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-warning shrink-0 hidden md:flex">
                                        <base-icon name="wrench" icon-class="w-6 h-6"></base-icon>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-brand-800">Modo de Manutenção Ativo</h4>
                                        <p class="text-xs text-brand-400 font-medium max-w-sm mt-1">Bloqueia o acesso público ao conteúdo do portal.</p>
                                    </div>
                                </div>
                                <button @click="settings.isMaintenance = !settings.isMaintenance" 
                                    class="w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none shadow-inner" 
                                    :class="settings.isMaintenance ? 'bg-primary' : 'bg-brand-200'">
                                    <div class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300 shadow-md" 
                                        :class="settings.isMaintenance ? 'translate-x-[1.5rem]' : 'translate-x-0'"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TABS DINÂMICAS (Usando o SectionEditor) -->
                <section-editor v-show="activeTab === 'hero'" 
                    title="Seção Destaque (Hero)" icon="zap" :data="settings.hero" />
                
                <section-editor v-show="activeTab === 'portfolio'" 
                    title="Galeria de Entregas" icon="briefcase" :data="settings.portfolio" :can-limit="true" />
                
                <section-editor v-show="activeTab === 'clipping'" 
                    title="Notícias & Clipping" icon="newspaper" :data="settings.clipping" :can-limit="true" />
                
                <section-editor v-show="activeTab === 'testimonials'" 
                    title="Depoimentos & Apoio" icon="quote" :data="settings.testimonials" :can-limit="true" />
                
                <section-editor v-show="activeTab === 'team'" 
                    title="Time de Especialistas" icon="users-2" :data="settings.team" :can-limit="true" />

                <!-- TAB: Rodapé (Customizada) -->
                <div v-show="activeTab === 'footer'">
                    <div class="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-brand-100 space-y-10 shadow-sm">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-50 pb-6 gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-2xl bg-brand-50 text-primary flex items-center justify-center border border-brand-100 shadow-sm shrink-0">
                                    <base-icon name="layout" icon-class="w-6 h-6"></base-icon>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-brand-800 tracking-tight leading-tight">Rodapé & Institucional</h3>
                                    <p class="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-0.5">Visibilidade e copyright</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                <!-- Section Controls Group -->
                                <div class="flex items-center gap-1 bg-brand-50 p-1 rounded-2xl border border-brand-100/50 shadow-sm grow sm:grow-0 justify-between">
                                    <!-- Botão Restaurar -->
                                    <button @click="ui.resetSection('footer')" 
                                        class="w-10 h-10 rounded-xl hover:bg-white text-brand-400 hover:text-primary transition-all flex items-center justify-center group/reset shrink-0"
                                        title="Restaurar Padrões">
                                        <base-icon name="rotate-ccw" icon-class="w-5 h-5 group-hover/reset:animate-spin-slow"></base-icon>
                                    </button>
                                    
                                    <div class="h-6 w-px bg-brand-200 mx-1 hidden sm:block"></div>

                                    <div class="flex items-center gap-3 px-3 py-1">
                                        <span class="text-[10px] font-bold uppercase tracking-wider" :class="settings.footer.show ? 'text-primary' : 'text-brand-400'">
                                            {{ settings.footer.show ? 'Visível' : 'Oculto' }}
                                        </span>
                                        <button @click="settings.footer.show = !settings.footer.show" 
                                            class="w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shadow-inner" 
                                            :class="settings.footer.show ? 'bg-primary' : 'bg-brand-200'">
                                            <div class="w-3 h-3 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300 shadow-sm" 
                                                :class="settings.footer.show ? 'translate-x-5' : 'translate-x-0'"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="settings.footer.show" class="space-y-8 animate-in fade-in duration-300">
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold uppercase text-brand-400 ml-1">Texto de Copyright</label>
                                <textarea v-model="settings.footer.text" rows="2" class="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all text-brand-900 font-bold resize-none"></textarea>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center bg-brand-50/50 rounded-[2rem] border border-dashed border-brand-200">
                            <p class="text-xs text-brand-400 font-bold uppercase tracking-widest italic">O rodapé está oculto na página pública</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    `

};
