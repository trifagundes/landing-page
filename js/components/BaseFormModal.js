window.BaseFormModal = {
    components: {
        'base-icon': window.BaseIcon
    },
    props: {
        title: String,
        show: Boolean,
        saving: Boolean,
        modelValue: { type: Object, default: () => ({}) },
        collection: { type: String, default: '' },
        fields: { type: Array, default: () => [] }, // Backward compatibility for field-based header actions
        showFooter: { type: Boolean, default: true }
    },
    emits: ['close', 'save', 'update:modelValue'],
    data() {
        return {
            initialModelSnapshot: null
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.$nextTick(() => {
                    this.initialModelSnapshot = JSON.stringify(this.modelValue);
                });
            } else {
                this.initialModelSnapshot = null;
            }
        }
    },
    computed: {
        hasStatusField() {
            return (this.fields || []).some(f => f.key === 'status');
        },
        hasHighlightField() {
            return (this.fields || []).some(f => f.key === 'highlight');
        }
    },
    methods: {
        updateField(key, value) {
            this.$emit('update:modelValue', {
                ...this.modelValue,
                [key]: value
            });
        },
        toggleStatus() {
            const newStatus = this.modelValue.status === 'active' ? 'inactive' : 'active';
            this.updateField('status', newStatus);
        },
        toggleHighlight() {
            this.updateField('highlight', !this.modelValue.highlight);
        },
        async handleClose() {
            if (this.initialModelSnapshot) {
                const currentSnapshot = JSON.stringify(this.modelValue);
                if (currentSnapshot !== this.initialModelSnapshot) {
                    const confirmed = await window.App.askConfirm(
                        'Descartar alterações?',
                        'Existem dados não salvos neste formulário. Se você sair agora, suas alterações serão perdidas.',
                        {
                            type: 'warning',
                            confirmLabel: 'Sair sem Salvar',
                            cancelLabel: 'Continuar Editando'
                        }
                    );
                    if (!confirmed) return;
                }
            }
            this.$emit('close');
        },
        handleSave() {
            this.$emit('save');
        }
    },
    template: `
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-brand-900/40 backdrop-blur-sm transition-opacity" @click="handleClose"></div>
        
        <div class="bg-surface rounded-[2rem] shadow-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in duration-300 max-w-5xl">
            
            <!-- HEADER -->
            <div class="p-4 md:p-8 border-b border-main flex justify-between items-center bg-brand-50/50 shrink-0">
                <div class="flex items-center gap-4 flex-1">
                    <slot name="header">
                        <h3 class="text-xl font-bold text-brand-800">{{ title }}</h3>
                    </slot>
                    
                    <!-- DEFAULT HEADER ACTIONS (Status/Highlight) -->
                    <div class="flex items-center gap-2 ml-4 pl-4 border-l border-brand-200">
                         <slot name="header-actions">
                             <button v-if="hasHighlightField" type="button" @click="toggleHighlight"
                                 class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide"
                                 :class="modelValue.highlight 
                                     ? 'bg-warning-light border-warning-light/50 text-warning hover:bg-warning/20' 
                                     : 'bg-brand-50 border-brand-200 text-brand-400 hover:bg-brand-100 hover:text-brand-600'">
                                 <base-icon name="star" :icon-class="modelValue.highlight ? 'w-4 h-4 fill-current' : 'w-4 h-4'"></base-icon>
                                 <span class="hidden sm:inline">Destaque</span>
                             </button>
                             <button v-if="hasStatusField" type="button" @click="toggleStatus"
                                 class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide"
                                 :class="modelValue.status === 'active'
                                     ? 'bg-success-light border-success-light/50 text-success hover:bg-success/20'
                                     : 'bg-danger-light border-danger-light/50 text-danger hover:bg-danger/20'">
                                 <base-icon :name="modelValue.status === 'active' ? 'check-circle' : 'slash'" icon-class="w-4 h-4"></base-icon>
                                 <span class="hidden sm:inline">{{ modelValue.status === 'active' ? 'Ativo' : 'Inativo' }}</span>
                             </button>
                         </slot>
                    </div>
                </div>
                
                <button type="button" @click="handleClose" :disabled="saving" class="w-10 h-10 rounded-full bg-surface border-main flex items-center justify-center text-brand-400 hover:text-danger hover:border-danger-light transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-4">
                    <base-icon name="x" icon-class="w-5 h-5"></base-icon>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar relative">
                <!-- LOADING OVERLAY -->
                <div v-if="saving" class="absolute inset-0 bg-surface/60 backdrop-blur-[1px] z-50 flex items-center justify-center animate-in fade-in duration-200 cursor-wait">
                    <div class="bg-surface w-20 h-20 rounded-full shadow-xl border border-primary-light animate-in zoom-in duration-300 flex items-center justify-center">
                        <base-icon name="loader-2" icon-class="w-8 h-8 text-primary animate-spin"></base-icon>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row min-h-full">
                    <!-- SIDEBAR COLUMN -->
                    <div v-if="$slots.sidebar" class="w-full md:w-80 bg-brand-50/50 border-b md:border-b-0 md:border-r border-main p-6 md:p-10 shrink-0">
                        <slot name="sidebar"></slot>
                    </div>

                    <!-- MAIN CONTENT AREA -->
                    <div class="flex-1 p-6 md:p-10 min-w-0">
                        <slot></slot>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div v-if="showFooter" class="p-6 md:p-8 border-t border-main bg-surface shrink-0 flex justify-end gap-3 z-10">
                <slot name="footer">
                    <button type="button" @click="handleClose" class="px-10 py-3.5 rounded-2xl border-main font-bold text-sm text-brand-600 hover:bg-brand-50 hover:text-primary transition-all shadow-sm">Cancelar</button>
                    <button type="button" @click="handleSave" :disabled="saving" class="px-12 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3">
                        <base-icon v-if="saving" name="loader-2" icon-class="w-5 h-5 animate-spin"></base-icon>
                        <base-icon v-else name="save" icon-class="w-5 h-5"></base-icon>
                        {{ saving ? 'Salvando...' : 'Salvar Registro' }}
                    </button>
                </slot>
            </div>
        </div>
    </div>
    `
};
