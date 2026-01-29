window.BaseFormField = {
    components: { 'base-icon': window.BaseIcon },
    props: ['field', 'modelValue', 'error', 'disabled', 'showPassword'],
    emits: ['update:modelValue', 'toggle-password', 'blur'],
    created() {
        this.window = window;
    },
    methods: {
        updateValue(value) {
            let finalValue = value;
            if (this.field.mask && window.Formatters && window.Formatters.mask) {
                finalValue = window.Formatters.mask(value, this.field.mask);
            }
            if ((this.field.key === 'image' || this.field.key === 'photo' || this.field.key === 'imageUrl') && window.AppUtils && window.AppUtils.resolveImageUrl) {
                finalValue = window.AppUtils.resolveImageUrl(finalValue);
            }
            this.$emit('update:modelValue', finalValue);
        },
        handleBlur() {
            this.$emit('blur', this.field.key);
        }
    },
    template: `
    <div class="space-y-2">
        <label class="block text-[10px] font-black uppercase tracking-[0.2em] ml-1" 
            :class="error ? 'text-danger' : 'text-brand-400'">
            {{ field.label }}<span v-if="field.required" class="text-danger ml-0.5">*</span>
        </label>
        <div v-if="['text', 'date', 'number', 'password', 'email', 'currency', 'tel', 'url'].includes(field.type)" class="relative group">
            <div v-if="field.type === 'currency'" class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400 font-bold text-xs pointer-events-none group-focus-within:text-primary transition-colors">
                R$
            </div>
            <input 
                :type="field.type === 'password' ? (showPassword ? 'text' : 'password') : (field.type === 'currency' ? 'number' : (field.type === 'url' ? 'url' : field.type))" 
                :step="field.type === 'currency' ? '0.01' : '1'"
                :value="field.type === 'date' && modelValue ? String(modelValue).substring(0, 10) : modelValue"
                @input="updateValue($event.target.value)"
                @blur="handleBlur"
                :disabled="disabled"
                :class="[
                    error ? 'border-danger-light focus:border-danger focus:ring-danger/10' : 'border-brand-200/40 focus:border-primary-light focus:ring-primary/10',
                    'w-full bg-brand-50/40 border rounded-2xl px-5 py-4 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 outline-none transition-all disabled:cursor-not-allowed',
                    { 'pl-10': field.type === 'currency' },
                    { 'pr-12': (field.type === 'password' || ['image', 'photo', 'imageUrl'].includes(field.key)) }
                ]"
                :placeholder="'Digite ' + field.label.toLowerCase() + '...'">
            
            <!-- User Helper for Images -->
            <button v-if="['image', 'photo', 'imageUrl'].includes(field.key)"
                    @click.prevent="window.App.imageInputModal.open(modelValue, (url) => updateValue(url), 'Selecionar ' + field.label)"
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-primary transition-colors"
                    title="Selecionar Imagem">
                <base-icon name="image" icon-class="w-5 h-5"></base-icon>
            </button>

            <!-- Password Toggle -->
            <button v-if="field.type === 'password'" 
                    @click.prevent="$emit('toggle-password', field.key)"
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-primary transition-colors">
                <base-icon :name="showPassword ? 'eye-off' : 'eye'" icon-class="w-5 h-5"></base-icon>
            </button>
            <p v-if="field.mask" class="text-[10px] text-brand-400 mt-1 ml-1 flex items-center gap-1">
                <base-icon name="hash" icon-class="w-3 h-3"></base-icon> Formato: {{ field.mask }}
            </p>
        </div>
        <textarea v-else-if="field.type === 'textarea'"
                :value="modelValue"
                @input="updateValue($event.target.value)"
                @blur="handleBlur"
                :disabled="disabled"
                rows="4"
            class="w-full bg-brand-50/40 border rounded-2xl px-5 py-4 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 outline-none transition-all resize-none disabled:cursor-not-allowed"
            :class="error ? 'border-danger-light focus:border-danger focus:ring-danger/10' : 'border-brand-200/40 focus:border-primary-light focus:ring-primary/10'"
            :placeholder="'Digite ' + field.label.toLowerCase() + '...'"></textarea>
        <div v-else-if="field.type === 'select'" class="relative group">
            <select :value="modelValue"
                    @change="updateValue($event.target.value)"
                    @blur="handleBlur"
                    :disabled="disabled"
                class="w-full bg-brand-50/40 border rounded-2xl px-5 py-4 text-sm font-bold text-brand-800 outline-none transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
                :class="error ? 'border-danger-light focus:border-danger focus:ring-danger/10' : 'border-brand-200/40 focus:border-primary-light focus:ring-primary/10'">
                <option value="" disabled selected>Selecione {{ field.label }}</option>
                <option v-for="opt in (field.options || [])" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <base-icon name="chevron-down" icon-class="w-4 h-4 text-brand-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary transition-colors"></base-icon>
        </div>
        <div v-else-if="field.type === 'tags'" class="relative group">
            <input :value="(modelValue && Array.isArray(modelValue)) ? modelValue.join(', ') : modelValue"
                    @input="updateValue($event.target.value.split(',').map(s => s.trim()).filter(Boolean))"
                    @blur="handleBlur"
                    :disabled="disabled"
                class="w-full bg-brand-50/40 border rounded-2xl px-5 py-4 text-sm font-bold text-brand-800 placeholder:text-brand-200/60 outline-none transition-all disabled:cursor-not-allowed"
                :class="error ? 'border-danger-light focus:border-danger focus:ring-danger/10' : 'border-brand-200/40 focus:border-primary-light focus:ring-primary/10'"
                placeholder="Separe por vírgulas (ex: Música, Dança)">
            <p class="text-[10px] text-brand-400 mt-1 ml-1 flex items-center gap-1">
                <base-icon name="tag" icon-class="w-3 h-3"></base-icon> Separe múltiplos itens com vírgula
            </p>
        </div>
        <div v-else-if="field.type === 'boolean'" class="flex items-center justify-between p-5 bg-brand-50/40 border border-brand-200/40 rounded-2xl"
             :class="error ? 'border-danger-light' : ''">
            <span class="text-sm font-bold text-brand-800">{{ modelValue ? 'Sim' : 'Não' }}</span>
            <button type="button" 
                    @click="updateValue(!modelValue)"
                    :disabled="disabled"
                    class="w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none shadow-inner"
                    :class="modelValue ? 'bg-primary' : 'bg-brand-200'">
                <div class="w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 left-1 transition-transform duration-200"
                     :class="modelValue ? 'translate-x-[1.25rem]' : 'translate-x-0'"></div>
            </button>
        </div>
        <p v-if="field.hint" class="text-[10px] text-brand-400 mt-1 ml-1 flex items-center gap-1">
            <base-icon name="info" icon-class="w-3 h-3"></base-icon> {{ field.hint }}
        </p>
        <p v-if="error === true" class="text-[10px] text-danger mt-1 ml-1 font-bold animate-in slide-in-from-top-1">Campo obrigatório</p>
        <p v-else-if="error && error !== true" class="text-[10px] text-danger mt-1 ml-1 font-bold animate-in slide-in-from-top-1">{{ error === 'mismatch' ? 'As senhas não conferem' : error }}</p>
    </div>
    `
};
