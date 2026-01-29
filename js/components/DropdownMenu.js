/**
 * DropdownMenu - Componente reutilizável para menus dropdown
 * Single Responsibility: Apenas renderizar dropdown com backdrop
 */
window.DropdownMenu = {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        }
    },
    emits: ['update:show'],
    inheritAttrs: false,
    template: `
        <!-- Backdrop -->
        <div v-if="show" 
            @click="$emit('update:show', false)" 
            class="dropdown-backdrop-responsive fixed inset-0 z-40 cursor-default"></div>
        
        <!-- Menu -->
        <div v-if="show" 
            v-bind="$attrs"
            class="dropdown-menu-responsive dropdown-menu-right bg-white rounded-xl shadow-xl border border-brand-100 overflow-hidden z-[10001]">
            <!-- Header -->
            <div v-if="title" class="p-3 border-b border-brand-50 bg-brand-50/50">
                <span class="text-xs font-bold text-brand-500 uppercase tracking-widest">{{ title }}</span>
            </div>
            
            <!-- Content Slot -->
            <div class="p-2 space-y-1.5">
                <slot></slot>
            </div>
        </div>
    `
};
