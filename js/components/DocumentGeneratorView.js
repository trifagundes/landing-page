/**
 * DOCUMENT GENERATOR VIEW - MODERN SIDEBAR EDITION
 * Design inspired by the provided customization panel: 
 * Sidebar navigation + Focused content area.
 */
window.DocumentGeneratorView = {
    components: {
        'base-icon': window.BaseIcon,
        'base-data-table': window.BaseDataTable
    },

    props: {
        documents: { type: Array, default: () => [] },
        oscs: { type: Array, default: () => [] },
        isLoading: Boolean,
        processingIds: Array,
        dataActions: Object,
        auth: Object,
        ui: Object
    },

    emits: ['refresh'],

    data() {
        return {
            showTemplateSelector: false,
            showGenerator: false,
            currentTemplate: null,
            formData: {},
            selectedDocument: null,
            saving: false,
            touched: {},
            attemptedSave: false,
            activeGroup: null,
            activeSubGroup: 'DADOS CADASTRAIS',
            expandedGroups: {},
            isAccordionView: false // Default to sidebar view
        };
    },

    watch: {
        showGenerator(val) {
            if (this.ui) {
                this.ui.isSidebarOpen = !val;
                this.ui.hideHeader = val;
            }
        }
    },

    beforeUnmount() {
        if (this.ui) {
            this.ui.hideHeader = false;
            // Só forçamos a abertura da sidebar se não estivermos em mobile
            if (!this.ui.isMobile) {
                this.ui.isSidebarOpen = true;
            }
        }
    },

    computed: {
        templates() { return window.DOCUMENT_TEMPLATES || {}; },
        templatesList() { return Object.values(this.templates); },
        currentTemplateConfig() { return this.currentTemplate ? this.templates[this.currentTemplate] : null; },
        availableGroups() { return this.currentTemplateConfig?.groups || []; },
        columns() {
            return [
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'template', label: 'Tipo', type: 'select', options: this.templatesList.map(t => ({ value: t.id, label: t.name })) },
                { key: 'generatedAt', label: 'Criado em', type: 'datetime' },
                { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Rascunho' }, { value: 'generated', label: 'Gerado' }] }
            ];
        }
    },

    methods: {
        openGenerator(templateId = null) {
            if (!templateId) {
                this.showTemplateSelector = true;
                this.showGenerator = false;
                return;
            }
            this.currentTemplate = templateId;
            const config = this.templates[templateId];
            this.formData = {
                template: templateId,
                status: 'draft',
                osc_save_new: true,
                ...(config.getDefaults ? config.getDefaults(this.auth?.user) : {})
            };
            this.selectedDocument = null;
            this.touched = {};
            this.attemptedSave = false;
            this.showTemplateSelector = false;
            this.activeGroup = 'ID'; // Iniciar sempre pela identificação do projeto (requested)
            this.showGenerator = true;
        },

        editDocument(doc) {
            this.selectedDocument = doc;
            this.currentTemplate = doc.template;
            try {
                const templateData = doc.templateData ? JSON.parse(doc.templateData) : {};
                this.formData = { id: doc.id, title: doc.title, template: doc.template, status: doc.status, notes: doc.notes, osc_save_new: true, ...templateData };
            } catch (e) {
                this.formData = { ...doc, osc_save_new: true };
            }
            this.activeGroup = 'ID'; // Iniciar sempre pela identificação do projeto (requested)
            this.showGenerator = true;
        },

        closeGenerator() {
            this.showTemplateSelector = false;
            this.showGenerator = false;
            this.currentTemplate = null;
            this.formData = {};
        },

        setActiveGroup(group) {
            this.activeGroup = group;
            // Scroll to top of main panel when changing sections
            this.$nextTick(() => {
                const mainPanel = this.$refs.mainPanel;
                if (mainPanel) {
                    mainPanel.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        },

        updateField(key, value) {
            this.formData[key] = value;
            this.touched[key] = true;
            if (key === 'osc_id') {
                if (value) {
                    const osc = (this.oscs || []).find(o => String(o.id) === String(value));
                    if (osc) {
                        ['nome', 'cnpj', 'telefone', 'email', 'endereco', 'apresentacao', 'image'].forEach(f => {
                            let targetKey = f === 'apresentacao' ? 'apresentacao_osc' : `osc_${f}`;
                            if (f === 'image') targetKey = 'osc_logo';
                            this.formData[targetKey] = osc[f];
                        });
                        ['nome', 'cpf', 'rg', 'cargo'].forEach(f => this.formData[`representante_${f}`] = osc[`representante_${f}`]);
                    }
                } else {
                    // Limpar campos caso o usuário queira preencher um novo cadastro (requested)
                    ['osc_nome', 'osc_cnpj', 'osc_telefone', 'osc_email', 'osc_endereco', 'apresentacao_osc', 'osc_logo',
                        'representante_nome', 'representante_cpf', 'representante_rg', 'representante_cargo'
                    ].forEach(key => this.formData[key] = '');
                }
                this.formData.osc_save_new = true;
            }
        },

        triggerImageModal(key, title = 'Alterar Imagem') {
            if (window.App && window.App.imageInputModal) {
                window.App.imageInputModal.open(
                    this.formData[key],
                    (url) => this.updateField(key, url),
                    title
                );
            }
        },


        hasError(field) {
            if (!field.required) return false;
            const value = this.formData[field.key];
            return (this.touched[field.key] || this.attemptedSave) && (!value || (typeof value === 'string' && !value.trim()));
        },

        getFieldsByGroup(group) {
            const config = this.currentTemplateConfig;
            if (!config?.fields) return [];
            return config.fields.filter(f => f.group === group).map(f => {
                if (f.key === 'osc_id') {
                    return { ...f, options: [{ value: '', label: 'Preencher Novo Cadastro...' }, ...(this.oscs || []).map(o => ({ value: o.id, label: `${o.nome} (${o.cnpj})` }))] };
                }
                return f;
            });
        },

        async saveDocument() {
            this.attemptedSave = true;
            if (!this.formData.title?.trim()) { window.notify('Atenção', 'Título obrigatório', 'warning'); return; }
            this.saving = true;
            try {
                const { title, template, status, notes, id, osc_save_new, ...templateData } = this.formData;
                if (osc_save_new) {
                    const oscPayload = {
                        id: templateData.osc_id || undefined,
                        nome: templateData.osc_nome, cnpj: templateData.osc_cnpj,
                        email: templateData.osc_email, telefone: templateData.osc_telefone,
                        endereco: templateData.osc_endereco,
                        image: templateData.osc_logo,
                        apresentacao: templateData.apresentacao_osc,
                        representante_nome: templateData.representante_nome,
                        representante_cpf: templateData.representante_cpf, representante_rg: templateData.representante_rg,
                        representante_cargo: templateData.representante_cargo, status: 'active'
                    };
                    await this.dataActions.save('oscs', oscPayload, { showLoading: false, silent: true });
                }
                const payload = { id, title: title.trim(), template, status: status || 'draft', templateData: JSON.stringify(templateData), notes, generatedAt: id ? undefined : new Date().toISOString() };
                await this.dataActions.save('documents', payload, { showLoading: false, silent: true });
                window.notify('Sucesso', 'Documento salvo.', 'success');
                this.closeGenerator();
                this.$emit('refresh');
            } catch (error) { window.notify('Erro', error.message, 'error'); } finally { this.saving = false; }
        }
    },

    template: `
    <div class="max-w-7xl mx-auto px-4" :class="showGenerator ? 'h-[calc(100vh-4rem)] flex flex-col' : 'pb-10'">

        <!-- SELECTOR -->
        <div v-if="showTemplateSelector" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <button v-for="template in templatesList" :key="template.id" @click="openGenerator(template.id)"
                class="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl transition-all text-left group">
                <div class="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110" :class="'bg-' + template.color + '-light text-' + template.color">
                    <base-icon :name="template.icon" icon-class="w-7 h-7"></base-icon>
                </div>
                <h3 class="font-bold text-brand-800 text-base mb-2 group-hover:text-primary transition-colors">{{ template.name }}</h3>
                <p class="text-xs text-brand-400 font-medium leading-relaxed">{{ template.description }}</p>
            </button>
        </div>

        <!-- GENERATOR (SIDEBAR LAYOUT) -->
        <div v-if="showGenerator" class="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 animate-in fade-in zoom-in-95 duration-500 min-h-0">
            
            <!-- NAVIGATION (Horizontal em mobile, Sidebar em desktop) -->
            <div class="w-full lg:w-64 shrink-0 lg:h-full lg:overflow-y-auto custom-scrollbar order-first">
                <div class="bg-surface/60 backdrop-blur-md rounded-xl lg:rounded-2xl border-main p-3 lg:p-4 shadow-sm">
                    <!-- Header com botão voltar (mobile) -->
                    <div class="flex items-center justify-between mb-2 lg:mb-3 px-1">
                        <button @click="closeGenerator" class="lg:hidden flex items-center gap-2 text-brand-500 hover:text-primary transition-colors">
                            <base-icon name="arrow-left" icon-class="w-4 h-4"></base-icon>
                            <span class="text-[10px] font-bold uppercase tracking-wide">Voltar</span>
                        </button>
                        <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] hidden lg:block px-1">Escolha o que editar</label>
                    </div>
                    
                    <!-- Mobile: Horizontal scrollable tabs -->
                    <nav class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 custom-scrollbar scrollbar-none lg:space-y-2">
                        <!-- Identificação Item -->
                        <button @click="setActiveGroup('ID')" 
                            class="flex items-center gap-2 lg:gap-4 px-4 py-2.5 lg:p-4 rounded-xl lg:rounded-2xl transition-all text-left whitespace-nowrap lg:whitespace-normal lg:w-full shrink-0"
                            :class="activeGroup === 'ID' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-brand-50 lg:bg-transparent text-brand-500 lg:text-brand-400 hover:bg-brand-100 lg:hover:bg-brand-50'">
                            <base-icon name="edit-3" icon-class="w-4 h-4 lg:w-5 lg:h-5"></base-icon>
                            <span class="text-xs lg:text-sm font-bold uppercase tracking-tight">ID</span>
                            <span class="hidden lg:inline text-[9px] font-bold opacity-60 uppercase ml-auto">{{ formData.title ? 'OK' : '...' }}</span>
                        </button>

                        <div class="hidden lg:block h-px border-main my-2 lg:my-4 mx-4"></div>

                        <!-- Template Groups -->
                        <button v-for="group in availableGroups" :key="group" @click="setActiveGroup(group)"
                            class="flex items-center gap-2 lg:gap-4 px-4 py-2.5 lg:p-4 rounded-xl lg:rounded-2xl transition-all text-left whitespace-nowrap lg:whitespace-normal lg:w-full shrink-0"
                            :class="activeGroup === group ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-brand-50 lg:bg-transparent text-brand-500 lg:text-brand-400 hover:bg-brand-100 lg:hover:bg-brand-50'">
                            <base-icon :name="(typeof group === 'string' && group.toLowerCase().includes('instituição')) ? 'building-2' : 'layout'" icon-class="w-4 h-4 lg:w-5 lg:h-5"></base-icon>
                            <span class="text-xs lg:text-sm font-bold uppercase tracking-tight truncate max-w-[120px] lg:max-w-none">{{ group.replace(/^[0-9.\\s]*/, '').substring(0, 15) }}{{ group.length > 15 ? '...' : '' }}</span>
                        </button>
                    </nav>
                </div>
            </div>

            <!-- MAIN PANEL (Form + Botões) -->
            <div class="flex-1 min-w-0 flex flex-col min-h-0">
                
                <!-- Área de Form/Aba (com scroll) -->
                <div class="flex-1 overflow-y-auto pr-1 pb-4 lg:pb-6 custom-scrollbar" ref="mainPanel">
                    

                    <!-- Fields Grid (Style exactly like print) -->
                    <div class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" :key="activeGroup">
                        
                        <!-- Identificação Case -->
                        <div v-if="activeGroup === 'ID'" class="bg-surface rounded-2xl lg:rounded-[2.5rem] border-main p-5 md:p-8 lg:p-10 shadow-xl space-y-5 lg:space-y-6">
                            <div class="flex items-center gap-3 lg:gap-5 mb-3 lg:mb-4 border-b border-main pb-4 lg:pb-6">
                                <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <base-icon name="edit-3" icon-class="w-6 h-6"></base-icon>
                                </div>
                                <div>
                                    <h3 class="text-lg font-black text-brand-800 uppercase tracking-tight">Identificação do Registro</h3>
                                    <p class="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Título e notas do documento</p>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-3 px-1">Título em Destaque</label>
                                <input v-model="formData.title" type="text" placeholder="Ex: Nome do Documento ou Projeto" 
                                    class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                            </div>
                            <div>
                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-3 px-1">Notas de Rodapé / Observações</label>
                                <textarea v-model="formData.notes" rows="4" placeholder="Alguma observação importante para este registro?" 
                                    class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all resize-none outline-none"></textarea>
                            </div>
                        </div>

                        <!-- Template Fields Case Wrapper -->
                        <div v-else class="space-y-12">
                            <!-- SPECIAL OSC SECTION INTEGRATION -->
                            <!-- SPECIAL OSC SECTION INTEGRATION -->
                            <!-- SPECIAL INSTITUTION MODULE (Dados + Representante + Apresentação) -->
                            <template v-if="activeGroup && activeGroup.includes('Instituição')">
                                <div class="bg-surface rounded-3xl border-main p-8 md:p-10 shadow-xl shadow-brand-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    
                                    <!-- INTERNAL TABS FOR OSC SECTION (As requested in image) -->
                                    <div class="flex items-center gap-8 mb-10 border-b border-brand-100 overflow-x-auto custom-scrollbar scrollbar-none">
                                        <button v-for="sub in ['DADOS CADASTRAIS', 'REPRESENTANTE LEGAL', 'APRESENTAÇÃO INSTITUCIONAL']" 
                                            :key="sub" @click="activeSubGroup = sub"
                                            class="pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative"
                                            :class="activeSubGroup === sub ? 'text-primary' : 'text-brand-400 hover:text-brand-600'">
                                            {{ sub }}
                                            <div v-if="activeSubGroup === sub" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-300"></div>
                                        </button>
                                    </div>

                                    <!-- CASE 1: DADOS CADASTRAIS -->
                                    <div v-if="activeSubGroup === 'DADOS CADASTRAIS'" class="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div class="md:col-span-2 bg-brand-50 border border-brand-200/40 p-6 rounded-2xl mb-4">
                                                <label class="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] block mb-4">Vincular Registro Existente</label>
                                                <div class="relative">
                                                    <select :value="formData.osc_id" @change="e => updateField('osc_id', e.target.value)" 
                                                        class="w-full bg-surface border border-brand-200/40 rounded-xl px-5 py-4 text-sm font-bold text-brand-800 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                                        <option v-for="opt in (getFieldsByGroup(activeGroup).find(f => f.key === 'osc_id')?.options || [])" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                                    </select>
                                                    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none bg-brand-50 p-1.5 rounded-lg border border-brand-100 shadow-sm"><base-icon name="database" icon-class="w-4 h-4"></base-icon></div>
                                                </div>
                                            </div>

                                            <div class="md:col-span-2 flex flex-col items-center justify-center py-8 bg-brand-50/50 border-2 border-dashed border-brand-200 rounded-3xl mb-4 group/img relative overflow-hidden">
                                                <div v-if="formData.osc_logo" class="absolute inset-0 z-0">
                                                    <img :src="formData.osc_logo" class="w-full h-full object-cover opacity-20 blur-sm">
                                                </div>
                                                <div class="relative z-10 flex flex-col items-center">
                                                    <div class="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 overflow-hidden border-4 border-white">
                                                        <img v-if="formData.osc_logo" :src="formData.osc_logo" class="w-full h-full object-cover">
                                                        <base-icon v-else name="building-2" icon-class="w-10 h-10 text-brand-300"></base-icon>
                                                    </div>
                                                    <button @click="triggerImageModal('osc_logo', 'Alterar Logotipo')" 
                                                        class="px-4 py-2 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
                                                        {{ formData.osc_logo ? 'Alterar Logotipo' : 'Adicionar Logotipo' }}
                                                    </button>
                                                </div>
                                            </div>

                                            <div class="md:col-span-2">
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">Nome da OSC (Razão Social)</label>
                                                <input v-model="formData.osc_nome" type="text" placeholder="Nome da OSC (Razão Social)"
                                                    class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                            
                                            <div>
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">CNPJ</label>
                                                <input v-model="formData.osc_cnpj" type="text" placeholder="00.000.000/0000-00" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>

                                            <div>
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">Telefone</label>
                                                <input v-model="formData.osc_telefone" type="text" placeholder="(00) 00000-0000" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>

                                            <div class="md:col-span-2">
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">E-mail Institucional</label>
                                                <input v-model="formData.osc_email" type="text" placeholder="contato@instituicao.org"
                                                    class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>

                                            <div class="md:col-span-2">
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">Endereço Completo</label>
                                                <input v-model="formData.osc_endereco" type="text" placeholder="Rua, Número, Bairro, Cidade/UF" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- CASE 2: REPRESENTANTE LEGAL -->
                                    <div v-if="activeSubGroup === 'REPRESENTANTE LEGAL'" class="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div class="md:col-span-2">
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">Nome Completo</label>
                                                <input v-model="formData.representante_nome" type="text" placeholder="Nome do representante legal" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                            <div>
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">CPF</label>
                                                <input v-model="formData.representante_cpf" type="text" placeholder="000.000.000-00" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                            <div>
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">RG</label>
                                                <input v-model="formData.representante_rg" type="text" placeholder="Número do RG" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                            <div class="md:col-span-2">
                                                <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-2 px-1">Cargo / Função</label>
                                                <input v-model="formData.representante_cargo" type="text" placeholder="Ex: Presidente, Diretor" class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- CASE 3: APRESENTAÇÃO INSTITUCIONAL -->
                                    <div v-if="activeSubGroup === 'APRESENTAÇÃO INSTITUCIONAL'" class="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div>
                                            <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-4 px-1">Histórico, Missão e Visão</label>
                                            <textarea v-model="formData.apresentacao_osc" rows="12" placeholder="Descreva a missão, visão, histórico e principais realizações da OSC..."
                                                class="w-full bg-brand-50/40 border border-brand-200/40 rounded-3xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all resize-none outline-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- REGULAR FIELDS -->
                            <div v-else class="bg-surface rounded-[2.5rem] border-main p-8 md:p-10 shadow-xl">
                                <div class="flex items-center gap-5 mb-10 border-b border-main pb-6">
                                    <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                        <base-icon name="zap" icon-class="w-6 h-6"></base-icon>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-black text-brand-800 uppercase tracking-tight">{{ activeGroup ? activeGroup.replace(/^[0-9.\\s]*/, '') : 'Selecione um Grupo' }}</h3>
                                        <p class="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em]">Preencha os campos abaixo</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div v-for="field in getFieldsByGroup(activeGroup)" :key="field.key" :class="field.cols === 2 || field.type === 'textarea' ? 'md:col-span-2' : ''">
                                    <label class="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] block mb-3 px-1">{{ field.label }}</label>
                                    
                                    <div class="relative">
                                        <select v-if="field.type === 'select'" :value="formData[field.key]" @change="e => updateField(field.key, e.target.value)" 
                                            class="w-full bg-brand-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold text-brand-800 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                            <option value="" disabled>{{ field.placeholder || 'Selecione uma opção...' }}</option>
                                            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                        </select>

                                        <textarea v-else-if="field.type === 'textarea'" v-model="formData[field.key]" rows="5" 
                                            class="w-full bg-brand-50/40 border border-brand-200/40 rounded-[2rem] px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"></textarea>

                                        <div v-else-if="field.type === 'boolean'" class="flex items-center justify-between p-6 bg-brand-50 border border-brand-200/40 rounded-2xl">
                                            <span class="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Habilitar Recurso?</span>
                                            <button @click="updateField(field.key, !formData[field.key])" class="w-12 h-6 rounded-full relative transition-all" :class="formData[field.key] ? 'bg-primary' : 'bg-brand-200'">
                                                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all" :class="{ 'translate-x-6': formData[field.key] }"></div>
                                            </button>
                                        </div>

                                        <input v-else v-model="formData[field.key]" :type="field.type" 
                                            class="w-full bg-brand-50/40 border border-brand-200/40 rounded-2xl px-6 py-5 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                
                <!-- Botões de Ação (fixos no fundo) -->
                <div class="shrink-0 pt-3 lg:pt-4 flex flex-row justify-between items-center gap-3">
                    <button @click="closeGenerator" class="hidden sm:flex px-6 py-3 bg-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-brand-200 hover:bg-danger-light hover:text-danger hover:border-danger-light transition-all text-center">
                        Descartar
                    </button>
                    <button @click="saveDocument" :disabled="saving" class="flex-1 sm:flex-none px-8 py-3 bg-brand-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-brand-900/10 hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70">
                        <base-icon v-if="saving" name="loader-2" icon-class="w-4 h-4 animate-spin"></base-icon>
                        <base-icon v-else name="check-circle" icon-class="w-4 h-4"></base-icon>
                        {{ saving ? 'Salvando...' : 'Salvar' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="!showTemplateSelector && !showGenerator" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <base-data-table title="Biblioteca de Documentos" :columns="columns" :items="documents" :loading="isLoading" :processing-ids="processingIds" @create="openGenerator()" @edit="editDocument" @delete="dataActions.delete('documents', $event)" @refresh="$emit('refresh')">
                <template #actions="{ item }">
                    <div class="flex items-center gap-2 px-2 opacity-50 hover:opacity-100 transition-opacity">
                        <button @click="openGenerator(item.template)" class="p-2.5 text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><base-icon name="printer" icon-class="w-4.5 h-4.5"></base-icon></button>
                        <button @click="editDocument(item)" class="p-2.5 text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><base-icon name="edit-3" icon-class="w-4.5 h-4.5"></base-icon></button>
                    </div>
                </template>
            </base-data-table>
        </div>
    </div>
    `
};
