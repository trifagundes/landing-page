/**
 * EventCard - Componente reutilizável para cards de eventos
 * Elimina duplicação de código e aplica DRY
 */
window.EventCard = {
    name: 'EventCard',
    props: {
        event: {
            type: Object,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div 
            class="bg-brand-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col group hover:-translate-y-2 transition-all duration-500 relative aspect-[4/5] isolate"
            :class="event.highlight ? 'scale-105 z-10 shadow-[0_25px_60px_-12px_rgba(251,191,36,0.5)] ring-1 ring-white/10' : ''"
        >
            <!-- Admin Edit Button -->
            <button 
                v-if="canEdit"
                @click.stop="$emit('edit', event)"
                class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-primary shadow-lg rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
                title="Editar Evento"
            >
                <base-icon name="edit" icon-class="w-5 h-5"></base-icon>
            </button>

            <!-- Full Background Image -->
            <div class="absolute inset-0">
                <img 
                    :src="event.image" 
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                >
                <!-- Gradient Overlay -->
                <div 
                    class="absolute inset-0 transition-opacity duration-500"
                    :class="event.highlight ? 'bg-gradient-to-t from-amber-950 via-black/60 to-transparent opacity-90 group-hover:opacity-100' : 'bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-100'"
                >
                </div>
            </div>

            <!-- Floating Badges Container -->
            <div class="absolute top-6 left-6 flex flex-row items-center gap-3 z-20">
                <!-- Highlight Star (Minimal) -->
                <div 
                    v-if="event.highlight"
                    class="w-8 h-8 rounded-full bg-warning text-warning-light flex items-center justify-center shadow-[0_0_15px_var(--warning)] backdrop-blur-md animate-in zoom-in duration-500"
                >
                    <base-icon name="star" icon-class="w-4 h-4 fill-current"></base-icon>
                </div>
                <!-- Porte Badge -->
                <span
                    class="text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md ring-1 ring-white/20 tracking-wider"
                    :class="getPorteBadgeColor(event.porte)"
                >
                    {{ event.porte }}
                </span>
            </div>

            <!-- Content at Bottom -->
            <div
                class="absolute bottom-0 left-0 right-0 p-8 flex flex-col z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
            >
                <h3 class="text-2xl font-bold mb-4 text-white leading-tight drop-shadow-md">
                    {{ event.title }}
                </h3>

                <div
                    class="pt-4 border-t border-white/10 flex justify-between items-center text-brand-300 text-xs font-medium"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"
                        >
                            <base-icon name="users" icon-class="w-3 h-3 text-primary"></base-icon>
                        </div>
                        {{ event.public.toLocaleString() }}
                    </div>
                    <span class="text-primary text-[10px] font-bold uppercase tracking-widest">
                        {{ formatDate(event.date) }}
                    </span>
                </div>
            </div>
        </div>
    `,
    methods: {
        getPorteBadgeColor(porte) {
            const colorMap = {
                'nacional': 'bg-primary/20',
                'estadual': 'bg-success/20',
                'regional': 'bg-warning/20',
                'local': 'bg-info/20'
            };
            return colorMap[porte] || 'bg-brand-700/50';
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            if (window.Formatters && window.Formatters.formatDate) {
                return window.Formatters.formatDate(dateStr);
            }
            // Fallback básico
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }
    },
    emits: ['edit']
};
