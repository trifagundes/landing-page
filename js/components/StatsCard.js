/**
 * StatsCard - Componente reutilizável para cards de estatísticas
 * Elimina duplicação de código no index.html
 */
window.StatsCard = {
    name: 'StatsCard',
    props: {
        icon: {
            type: String,
            required: true
        },
        value: {
            type: [String, Number],
            required: true
        },
        label: {
            type: String,
            required: true
        },
        color: {
            type: String,
            default: 'primary',
            validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        delay: {
            type: Number,
            default: 0
        }
    },
    template: `
        <div 
            class="w-[calc(50%-0.75rem)] md:w-64 bg-white p-6 rounded-[2rem] shadow-xl border border-brand-100 text-center group hover:-translate-y-2 transition-transform duration-300"
            :style="{ transitionDelay: delay + 'ms' }"
        >
            <div
                class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors"
                :class="getIconClasses()"
            >
                <base-icon :name="icon" icon-class="w-6 h-6"></base-icon>
            </div>
            
            <div v-if="isLoading" class="h-9 w-16 bg-brand-200 rounded animate-pulse mx-auto mb-1"></div>
            <div v-else class="text-3xl font-bold text-brand-800">{{ value }}</div>
            
            <div class="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">
                {{ label }}
            </div>
        </div>
    `,
    methods: {
        getIconClasses() {
            const baseClasses = 'group-hover:text-white transition-colors';
            const colorMap = {
                primary: `bg-primary-light text-primary group-hover:bg-primary ${baseClasses}`,
                success: `bg-success-light text-success group-hover:bg-success ${baseClasses}`,
                warning: `bg-warning-light text-warning group-hover:bg-warning ${baseClasses}`,
                danger: `bg-danger-light text-danger group-hover:bg-danger ${baseClasses}`,
                info: `bg-info-light text-info group-hover:bg-info ${baseClasses}`
            };
            return colorMap[this.color] || colorMap.primary;
        }
    }
};
