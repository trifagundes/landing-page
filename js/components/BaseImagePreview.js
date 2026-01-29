window.BaseImagePreview = {
    components: {
        'base-icon': window.BaseIcon
    },
    props: {
        src: { type: String, default: '' },
        fallbackIcon: { type: String, default: 'image' },
        fallbackText: { type: String, default: '' },
        imgClass: { type: String, default: 'w-full h-full object-cover' },
        containerClass: { type: String, default: 'w-full h-full' }
    },
    data() {
        return {
            loading: false,
            error: false,
            currentSrc: ''
        }
    },
    watch: {
        src: {
            immediate: true,
            handler(newSrc) {
                if (newSrc && newSrc !== this.currentSrc) {
                    this.loading = true;
                    this.error = false;
                    this.currentSrc = newSrc;
                } else if (!newSrc) {
                    this.loading = false;
                    this.error = false;
                    this.currentSrc = '';
                }
            }
        }
    },
    methods: {
        onLoad() {
            this.loading = false;
            this.error = false;
        },
        onError() {
            this.loading = false;
            this.error = true;
        }
    },
    template: `
    <div :class="['relative overflow-hidden flex items-center justify-center bg-brand-50', containerClass]">
        <!-- LOADING SPINNER -->
        <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-brand-50/80 backdrop-blur-[2px] animate-in fade-in duration-300">
            <base-icon name="loader-2" icon-class="w-6 h-6 text-primary animate-spin"></base-icon>
        </div>

        <!-- IMAGE -->
        <img v-if="src && !error" 
             :src="src" 
             :class="[imgClass, { 'opacity-0': loading }]" 
             @load="onLoad" 
             @error="onError"
             class="transition-opacity duration-300">

        <!-- FALLBACK / ERROR -->
        <div v-if="(!src || error) && !loading" 
             class="w-full h-full flex items-center justify-center bg-brand-100 text-brand-300 animate-in zoom-in duration-300">
            <span v-if="fallbackText" class="text-4xl font-black uppercase">{{ fallbackText }}</span>
            <base-icon v-else :name="error ? 'image-off' : fallbackIcon" icon-class="w-8 h-8 opacity-40"></base-icon>
        </div>
    </div>
    `
};
