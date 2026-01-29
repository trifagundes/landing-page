window.BaseAutoForm = {
    components: {
        'base-icon': window.BaseIcon,
        'base-form-field': window.BaseFormField
    },
    props: {
        modelValue: { type: Object, default: () => ({}) },
        fields: { type: Array, default: () => [] },
        collection: { type: String, default: '' },
        saving: { type: Boolean, default: false },
        attemptedSave: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            touched: {},
            activeGroup: null,
            showPasswords: {}
        }
    },
    created() {
        this.window = window;
    },
    watch: {
        fields: {
            immediate: true,
            handler() {
                if (this.availableGroups.length > 0 && !this.activeGroup) {
                    this.activeGroup = this.availableGroups[0];
                }
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
        isFieldDisabled(field) {
            if (this.saving) return true;
            if (field.readonlyOnEdit && this.modelValue && this.modelValue.id) return true;
            if (this.isEditingSelf && ['role', 'status'].includes(field.key)) return true;
            return false;
        }
    },
    template: `
    <div class="w-full">
        <!-- TABS AT TOP -->
        <div v-if="availableGroups.length > 0" class="flex items-center gap-8 mb-8 border-b border-brand-100 overflow-x-auto custom-scrollbar scrollbar-none">
            <button v-for="group in availableGroups" :key="group"
                @click="activeGroup = group"
                class="pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative group/tab"
                :class="activeGroup === group 
                    ? 'text-primary' 
                    : 'text-brand-400 hover:text-brand-600'">
                {{ group }}
                <div v-if="activeGroup === group" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-300"></div>
            </button>
        </div>

        <div v-if="visibleFields" class="grid grid-cols-1 md:grid-cols-2 gap-6" 
            :class="[{ 'content-disabled': saving }]">
            <div v-for="field in visibleFields" :key="field ? field.key : 'field-' + Math.random()" 
                 class="space-y-2"
                 :class="[(field.cols === 2 || ['textarea', 'tags'].includes(field.type)) ? 'md:col-span-2' : '']"> 
             <template v-if="field">
                 <!-- Protected Dev Role Label -->
                 <div v-if="field.key === 'role' && modelValue && modelValue[field.key] === 'dev' && (!window.App?.auth?.user || window.App?.auth?.user?.role !== 'dev')">
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
    `
};
