window.BaseConfirmDialog = {
    components: { 'base-icon': window.BaseIcon },
    props: {
        show: Boolean,
        title: { type: String, default: 'Confirmar Ação' },
        message: { type: String, default: 'Tem certeza que deseja prosseguir?' },
        confirmLabel: { type: String, default: 'Confirmar' },
        cancelLabel: { type: String, default: 'Cancelar' },
        type: { type: String, default: 'warning' }
    },
    emits: ['confirm', 'cancel'],
    computed: {
        iconName() {
            const map = {
                'warning': 'alert-triangle',
                'danger': 'alert-octagon',
                'info': 'info'
            };
            return map[this.type] || 'help-circle';
        },
        iconClass() {
            const map = {
                'warning': 'text-warning bg-warning-light',
                'danger': 'text-danger bg-danger-light',
                'info': 'text-primary bg-primary-light'
            };
            return map[this.type] || 'text-brand-600 bg-brand-100';
        },
        confirmBtnClass() {
            const map = {
                'warning': 'bg-warning hover:bg-warning-hover shadow-warning-light/30',
                'danger': 'bg-danger hover:bg-danger-hover shadow-danger-light/30',
                'info': 'bg-primary hover:bg-primary-hover shadow-primary-light/30'
            };
            return map[this.type] || 'bg-primary hover:bg-primary-hover shadow-primary-light/30';
        }
    },
    template: `
    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-brand-900/40 backdrop-blur-sm transition-opacity" @click="$emit('cancel')"></div>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in duration-300 border border-brand-100">
            <div class="p-8 text-center">
                <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" :class="iconClass">
                    <base-icon :name="iconName" icon-class="w-8 h-8"></base-icon>
                </div>
                <h3 class="text-xl font-bold text-brand-800 mb-2">{{ title }}</h3>
                <p class="text-brand-500 text-sm leading-relaxed mb-8">{{ message }}</p>
                <div class="flex gap-3 justify-center">
                    <button @click="$emit('cancel')" 
                        class="px-6 py-3 rounded-xl border border-brand-200 text-brand-600 font-bold text-sm hover:bg-brand-50 hover:border-brand-300 transition-all">
                        {{ cancelLabel }}
                    </button>
                    <button @click="$emit('confirm')" 
                        class="px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
                        :class="confirmBtnClass">
                        {{ confirmLabel }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `
};
