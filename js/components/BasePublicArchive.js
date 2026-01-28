window.BasePublicArchive = {
    components: { 'base-icon': window.BaseIcon },
    props: ['title', 'items', 'schema', 'searchPlaceholder', 'backLabel', 'emptyMessage', 'modelSearch', 'modelSort'],
    emits: ['back', 'update:search', 'update:sortBy', 'open-link'],
    setup() { return { formatters: window.Formatters, utils: window.AppUtils } },
    template: `
    <div class="pt-32 pb-24 px-6 min-h-screen bg-brand-50">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <button @click="$emit('back')" class="text-primary font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2 hover:underline">
                        <base-icon name="arrow-left" icon-class="w-4 h-4"></base-icon> {{ backLabel || 'Voltar' }}
                    </button>
                    <h2 class="text-4xl font-bold text-brand-800">{{ title }}</h2>
                </div>
                <div class="flex flex-wrap gap-4 w-full md:w-auto">
                    <div class="relative flex-1 md:flex-none">
                        <input :value="modelSearch" @input="$emit('update:search', $event.target.value)" 
                             class="pl-10 pr-4 py-3 rounded-xl border-none shadow-sm w-full md:w-64 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                        <base-icon name="search" icon-class="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2"></base-icon>
                    </div>
                    <select :value="modelSort" @change="$emit('update:sortBy', $event.target.value)"
                        class="px-4 py-3 rounded-xl border-none shadow-sm text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                        <option value="">Ordenar por</option>
                        <option value="date">Data</option>
                        <option value="name">Nome / Título</option>
                        <option v-if="schema.collection === 'events'" value="public">Público</option>
                        <option v-if="schema.collection === 'events'" value="revenue">Rendimento</option>
                        <option v-if="schema.collection === 'clipping'" value="source">Veículo</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="item in items" :key="item.id"
                    class="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-brand-100 flex flex-col group hover:shadow-xl transition-all duration-300">
                    <div class="h-48 overflow-hidden relative">
                        <img :src="item.image" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <span v-if="schema.collection === 'events'" class="absolute top-4 left-4 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full shadow-lg" :class="utils.getBadgeColor(item.porte)">
                            {{ item.porte }}
                        </span>
                        <span v-if="schema.collection === 'clipping'" class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                            {{ item.source }}
                        </span>
                    </div>
                    <div class="p-6 flex flex-col flex-1">
                        <span class="text-primary text-[10px] font-bold uppercase tracking-widest block mb-1">
                            {{ formatters.formatDate(item.date) }}
                        </span>
                        <h3 class="text-lg font-bold mb-2 tracking-tight group-hover:text-primary transition">
                            {{ item.title }}
                        </h3>
                        <span v-if="schema.collection === 'events'" class="text-brand-500 text-xs flex items-center gap-1">
                            <base-icon name="users" icon-class="w-3 h-3"></base-icon> 
                            {{ item.public.toLocaleString() }} pessoas
                        </span>
                        <div v-if="schema.collection === 'clipping'" class="mt-auto pt-4 border-t border-brand-50 flex items-center justify-between">
                            <span class="text-xs font-medium text-brand-500">Ler matéria completa</span>
                            <a :href="item.url" target="_blank" class="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center hover:bg-primary hover:text-white transition">
                                <base-icon name="external-link" icon-class="w-4 h-4"></base-icon>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="items.length === 0" class="text-center py-24">
                    <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-400">
                    <base-icon :name="schema.icon" icon-class="w-8 h-8"></base-icon>
                </div>
                <h3 class="text-brand-900 font-bold text-lg">{{ emptyMessage || 'Nenhum registro encontrado' }}</h3>
                <p class="text-brand-500 text-sm mt-1">Tente ajustar seus filtros de busca.</p>
            </div>
        </div>
    </div>
    `
};
