window.BaseFormModal = {
    components: {
        'base-icon': window.BaseIcon,
        'base-form-field': window.BaseFormField
    },
    props: ['title', 'show', 'fields', 'modelValue', 'saving', 'collection'],
    emits: ['close', 'save', 'update:modelValue'],
    data() {
        return {
            touched: {},
            attemptedSave: false,
            activeGroup: null,
            showPasswords: {},
            initialModelSnapshot: null
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.touched = {};
                this.attemptedSave = false;
                if (this.availableGroups.length > 0) {
                    this.activeGroup = this.availableGroups[0];
                }
                this.$nextTick(() => {
                    this.initialModelSnapshot = JSON.stringify(this.modelValue);
                });
            } else {
                this.initialModelSnapshot = null;
            }
        }
    },
    computed: {
        isEditingSelf() {
            const currentUser = window.App?.auth?.user;
            if (!currentUser || !this.modelValue || !this.modelValue.id) return false;
            return String(currentUser.id) === String(this.modelValue.id);
        },
        availableGroups() {
            if (!this.collection || !window.DATA_MODELS[this.collection]) return [];
            return window.DATA_MODELS[this.collection].groups || [];
        },
        visibleFields() {
            const headerFields = ['status', 'highlight'];
            let fields = this.availableGroups.length === 0 ? this.fields : this.fields.filter(f => f.group === this.activeGroup);
            fields = fields.filter(f =>
                (!f.showIf || f.showIf(this.modelValue || {})) &&
                !headerFields.includes(f.key)
            );
            const currentUser = window.App?.auth?.user;
            if (currentUser && currentUser.role !== 'dev') {
                fields = fields.map(f => {
                    if (f.key === 'role' && f.options) {
                        return { ...f, options: f.options.filter(o => o.value !== 'dev') };
                    }
                    return f;
                });
            }
            return fields;
        },
        hasStatusField() {
            return this.fields.some(f => f.key === 'status');
        },
        hasHighlightField() {
            return this.fields.some(f => f.key === 'highlight');
        }
    },
    methods: {
        updateField(key, value, maskPattern) {
            let finalValue = value;
            if (maskPattern) {
                finalValue = window.Formatters.mask(value, maskPattern);
            }
            this.$emit('update:modelValue', {
                ...this.modelValue,
                [key]: finalValue
            });
        },
        markTouched(key) {
            this.touched[key] = true;
        },
        hasError(field) {
            if (!field.required && !field.equals) return false;
            const value = this.modelValue ? this.modelValue[field.key] : '';
            if (field.required && (this.touched[field.key] || this.attemptedSave) && !value) return true;
            if (field.equals && value) {
                const targetValue = this.modelValue[field.equals];
                if (value !== targetValue) return 'mismatch';
            }
            return false;
        },
        togglePassword(key) {
            this.showPasswords[key] = !this.showPasswords[key];
        },
        toggleStatus() {
            const newStatus = this.modelValue.status === 'active' ? 'inactive' : 'active';
            this.updateField('status', newStatus);
        },
        toggleHighlight() {
            this.updateField('highlight', !this.modelValue.highlight);
        },
        handleSave() {
            this.attemptedSave = true;
            const payload = { ...this.modelValue };
            if (this.collection === 'users') {
                if (!payload.password) delete payload.password;
                if (!payload.password_confirmation) delete payload.password_confirmation;
            }
            const errors = this.fields.filter(f => {
                const value = payload[f.key];
                if (f.required && !value) return true;
                if (f.equals && value !== payload[f.equals]) return true;
                return false;
            });
            if (errors.length > 0) {
                const firstErrorField = errors[0];
                if (firstErrorField.group && this.activeGroup !== firstErrorField.group) {
                    this.activeGroup = firstErrorField.group;
                }
                if (window.notify) {
                    const msg = firstErrorField.group
                        ? `Verifique o erro na aba "${firstErrorField.group}": ${firstErrorField.label}`
                        : `Verifique o campo: ${firstErrorField.label}`;
                    window.notify("Validação", msg, "error");
                }
                return;
            }
            this.$emit('update:modelValue', payload);
            this.$emit('save', payload);
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
        isFieldDisabled(field) {
            if (this.saving) return true;
            if (field.readonlyOnEdit && this.modelValue && this.modelValue.id) {
                return true;
            }
            if (this.isEditingSelf && ['role', 'status'].includes(field.key)) {
                return true;
            }
            return false;
        }
    },
    template: `
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-brand-900/40 backdrop-blur-sm transition-opacity" @click="handleClose"></div>
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in duration-300"
             :class="availableGroups.length > 0 ? 'max-w-6xl' : 'max-w-3xl'">
            <div class="p-4 md:p-8 border-b border-brand-50 flex justify-between items-center bg-brand-50/50 shrink-0">
                <div class="flex items-center gap-4 flex-1">
                    <slot name="header">
                        <h3 class="text-xl font-bold text-brand-800">{{ title }}</h3>
                    </slot>
                    <div class="flex items-center gap-2 ml-4 pl-4 border-l border-brand-200">
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
                    </div>
                </div>
                <button type="button" @click="handleClose" :disabled="saving" class="w-10 h-10 rounded-full bg-white border border-brand-200 flex items-center justify-center text-brand-400 hover:text-danger hover:border-danger-light transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-4">
                    <base-icon name="x" icon-class="w-5 h-5"></base-icon>
                </button>
            </div>
            <div class="p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
                <div v-if="saving" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center animate-in fade-in duration-200 cursor-wait">
                    <div class="bg-white w-20 h-20 rounded-full shadow-xl border border-primary-light animate-in zoom-in duration-300 flex items-center justify-center">
                        <base-icon name="loader-2" icon-class="w-8 h-8 text-primary animate-spin"></base-icon>
                    </div>
                </div>
                <div :class="{'grid lg:grid-cols-[18rem_1fr] gap-8 items-start': availableGroups.length > 0}">
                    <div class="w-full">
                        <slot name="before-fields"></slot>
                    </div>
                    <div class="w-full">
                        <div v-if="availableGroups.length > 0" class="flex items-center gap-1 mb-6 border-b border-brand-100 overflow-x-auto">
                            <button v-for="group in availableGroups" :key="group"
                                @click="activeGroup = group"
                                class="px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap"
                                :class="activeGroup === group 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-brand-400 hover:text-brand-600 hover:border-brand-200'">
                                {{ group }}
                            </button>
                        </div>
                        <div v-if="visibleFields" class="grid grid-cols-1 md:grid-cols-2 gap-6" 
                            :class="[{ 'content-disabled': saving }]">
                            <div v-for="field in visibleFields" :key="field ? field.key : Math.random()" 
                                 class="space-y-2"
                                 :class="[(field.cols === 2 || ['textarea', 'tags'].includes(field.type)) ? 'md:col-span-2' : '']"> 
                             <template v-if="field">
                                 <div v-if="field.key === 'role' && modelValue[field.key] === 'dev' && (!window.App?.auth?.user || window.App?.auth?.user?.role !== 'dev')">
                                     <label class="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">{{ field.label }}</label>
                                     <div class="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-500 font-bold text-sm flex items-center justify-between cursor-not-allowed">
                                         <span>Desenvolvedor (Protegido)</span>
                                         <base-icon name="lock" icon-class="w-4 h-4 text-brand-400"></base-icon>
                                     </div>
                                 </div>
                                 <base-form-field v-else
                                     :field="field"
                                     :model-value="modelValue ? modelValue[field.key] : ''"
                                     :error="hasError(field)"
                                     :disabled="isFieldDisabled(field)"
                                     :show-password="showPasswords[field.key]"
                                     @update:model-value="updateField(field.key, $event)"
                                     @toggle-password="togglePassword"
                                     @blur="markTouched"
                                 ></base-form-field>
                             </template>
                        </div>
                    </div>
                </div>
                </div>
                <slot name="after-fields"></slot>
            </div>
            <div class="p-6 md:p-8 border-t border-brand-50 bg-white shrink-0 flex justify-end gap-3 z-10">
                <slot name="footer">
                    <button type="button" @click="handleClose" class="px-6 py-3 rounded-xl border border-brand-200 text-brand-500 font-bold text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">Cancelar</button>
                    <button type="button" @click="handleSave" :disabled="saving" class="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary-shadow hover:bg-primary-hover hover:shadow-primary-hover/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2">
                        <base-icon v-if="saving" name="loader-2" icon-class="w-4 h-4 animate-spin"></base-icon>
                        <base-icon v-else name="save" icon-class="w-4 h-4"></base-icon>
                        {{ saving ? 'Salvando...' : 'Salvar Registro' }}
                    </button>
                </slot>
            </div>
        </div>
    </div>
    `
};
