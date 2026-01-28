window.BaseImageInputModal = {
    components: { 'base-icon': window.BaseIcon },
    props: ['show', 'url', 'title'],
    emits: ['close', 'save'],
    data() {
        return {
            localUrl: ''
        }
    },
    watch: {
        show: {
            handler(val) {
                if (val) this.localUrl = this.url || '';
            },
            immediate: true
        },
        url(newVal) {
            if (this.show) this.localUrl = newVal || '';
        }
    },
    computed: {
        previewUrl() {
            if (!this.localUrl) return null;
            if (window.AppUtils && typeof window.AppUtils.resolveImageUrl === 'function') {
                return window.AppUtils.resolveImageUrl(this.localUrl);
            }
            return this.localUrl;
        },
        isValid() {
            return !!this.previewUrl;
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleSave() {
            if (!this.localUrl) return;
            this.$emit('save', this.previewUrl);
            this.closeModal();
        },
        handleBackdropClick() {
            this.closeModal();
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
    },
    template: `
    <teleport to="body">
        <transition name="modal" appear>
            <div v-if="show" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-900/60 backdrop-blur-sm" @click="handleBackdropClick">
                <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300" @click.stop>
                    <div class="px-6 py-5 border-b border-brand-100 flex items-center justify-between bg-white relative z-10">
                        <h3 class="text-lg font-black text-brand-800 tracking-tight">{{ title || 'Alterar Imagem' }}</h3>
                        <button @click="closeModal" class="p-2 text-brand-400 hover:text-danger hover:bg-danger-light rounded-full transition-colors">
                            <base-icon name="x" icon-class="w-5 h-5"></base-icon>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-2">
                            <label class="text-xs font-bold text-brand-400 uppercase tracking-widest pl-1">URL da Imagem</label>
                            <div class="relative group">
                                <input 
                                    type="text" 
                                    v-model="localUrl" 
                                    ref="urlInput"
                                    placeholder="Cole o link da imagem aqui..." 
                                    @keydown.enter="handleSave"
                                    class="w-full pl-10 pr-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm font-medium text-brand-600 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-brand-400"
                                >
                                <base-icon name="link" icon-class="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors"></base-icon>
                            </div>
                            <p class="text-[10px] text-brand-400 pl-1">Suporta links diretos, Google Drive, e Imgur.</p>
                        </div>
                    </div>
                    <div class="px-6 py-4 bg-brand-50 border-t border-brand-100 flex justify-end gap-3">
                        <button @click="closeModal" class="px-5 py-2.5 rounded-xl text-xs font-bold text-brand-500 hover:text-brand-700 hover:bg-white border border-transparent hover:border-brand-200 transition-all">
                            Cancelar
                        </button>
                        <button 
                            @click="handleSave" 
                            :disabled="!isValid"
                            class="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary-shadow hover:bg-primary-hover hover:shadow-primary-hover/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                            <base-icon name="check" icon-class="w-4 h-4"></base-icon>
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
    `
};
