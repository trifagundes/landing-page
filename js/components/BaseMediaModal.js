window.BaseMediaModal = {
    components: { 'base-icon': window.BaseIcon },
    props: ['show', 'type', 'url', 'title'],
    emits: ['close'],
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleBackdropClick() {
            this.closeModal();
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        },
        getYoutubeId(url) {
            if (!url) return '';
            if (window.AppUtils && typeof window.AppUtils.getYoutubeId === 'function') {
                const id = window.AppUtils.getYoutubeId(url);
                if (id) return id;
            }
            try {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : '';
            } catch (e) {
                return '';
            }
        },
        getEmbedUrl(url) {
            const id = this.getYoutubeId(url);
            if (!id) return '';
            let baseUrl = 'https://www.youtube.com/embed/' + id;
            let startTime = 0;
            if (window.AppUtils && typeof window.AppUtils.getYoutubeStartTime === 'function') {
                startTime = window.AppUtils.getYoutubeStartTime(url);
            } else {
                const match = url.match(/[?&]t=([^&]+)/);
                if (match && !isNaN(match[1])) startTime = parseInt(match[1]);
            }
            if (startTime > 0) baseUrl += '?start=' + startTime;
            return baseUrl;
        },
        resolveImageUrl(url) {
            if (window.AppUtils && typeof window.AppUtils.resolveImageUrl === 'function') {
                return window.AppUtils.resolveImageUrl(url);
            }
            return url;
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
            <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/80 backdrop-blur-sm" @click="handleBackdropClick">
                <div class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-brand-100" @click.stop>
                    <div class="flex items-center justify-between p-6 border-b border-brand-100">
                        <h3 class="text-lg font-bold text-brand-800">{{ title || 'Visualização de Mídia' }}</h3>
                        <button @click="closeModal" class="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                            <base-icon name="x" icon-class="w-5 h-5"></base-icon>
                        </button>
                    </div>
                    <div class="relative">
                        <div v-if="type === 'video'" class="w-full">
                            <div class="aspect-video bg-black rounded-b-2xl overflow-hidden">
                                <iframe 
                                    :src="getEmbedUrl(url)" 
                                    class="w-full h-full"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                        <div v-else-if="type === 'image'" class="flex items-center justify-center p-4 w-full">
                            <img :src="resolveImageUrl(url)" :alt="title" class="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-lg">
                        </div>
                        <div v-else class="p-8 text-center text-brand-500">
                            <base-icon name="alert-circle" icon-class="w-12 h-12 mx-auto mb-4 text-brand-200"></base-icon>
                            <p>Tipo de mídia não suportado</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
    `
};
