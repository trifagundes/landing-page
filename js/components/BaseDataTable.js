window.BaseDataTable = {
    components: { 'base-icon': window.BaseIcon, 'dropdown-menu': window.DropdownMenu },
    props: ['columns', 'items', 'actions', 'title', 'loading', 'context', 'processingIds'],
    emits: ['edit', 'delete', 'create', 'status-change', 'bulk-delete', 'bulk-status-change', 'refresh'],
    setup(props) {
        const formatters = window.Formatters;
        const tableLogic = window.useTable(props);
        const columnLogic = window.useColumnVisibility(props);

        return {
            formatters,
            ...tableLogic,
            ...columnLogic
        };
    },
    data() {
        return {
            showColumnMenu: false,
            showExportMenu: false
        };
    },
    methods: {
        showProAlert(type) {
            window.notify("Recurso Pro", `O recurso de exportação para ${type} está disponível apenas na versão Pro/Enterprise. Contate o administrador.`, "warning");
            this.showExportMenu = false;
        },
        handleBulkDelete() {
            this.$emit('bulk-delete', this.selected);
            this.clearSelection();
        },
        handleBulkStatus(status) {
            this.$emit('bulk-status-change', { ids: [...this.selected], status });
            this.clearSelection();
        },
        exportToCsv() {
            window.ExportService.toCsv(
                this.filteredItems,
                this.displayColumns,
                this.title || 'export'
            );
            this.showExportMenu = false;
        }
    },
    computed: {
        isBusy() {
            return this.loading || (this.processingIds && this.processingIds.length > 0);
        }
    },
    template: `
    <div class="bg-white rounded-[2rem] shadow-sm border border-brand-100 animate-in fade-in duration-500">
        <div class="p-8 border-b border-brand-50 space-y-6" :class="{ 'card-processing': isBusy }">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 class="text-xl font-bold text-brand-800 flex items-center gap-2">
                        {{ title }}
                        <span v-if="isBusy" class="text-xs font-normal text-brand-400 flex items-center gap-1 animate-pulse ml-2">
                            <base-icon name="loader-2" icon-class="w-3 h-3 animate-spin"></base-icon> Processando...
                        </span>
                    </h2>
                </div>
                 <div class="flex items-center gap-2 w-full md:w-auto relative">
                     <div class="relative">
                         <button @click="showColumnMenu = !showColumnMenu"
                            :disabled="isBusy"
                            class="bg-white hover:bg-brand-50 text-brand-600 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-brand-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            title="Configurar Colunas">
                            <base-icon name="layout" icon-class="w-4 h-4"></base-icon>
                        </button>
                        <dropdown-menu :show="showColumnMenu" @update:show="showColumnMenu = $event" title="Exibir Colunas">
                            <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                <div v-for="col in columns" :key="col ? col.key : Math.random()">
                                    <label v-if="col && col.key" 
                                           class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-50 cursor-pointer transition-colors"
                                           :class="visibleKeys.includes(col.key) ? 'text-primary font-medium' : 'text-brand-400'">
                                        <input type="checkbox" 
                                               :checked="visibleKeys.includes(col.key)" 
                                               @change="toggleColumn(col.key)"
                                               class="rounded border-brand-300 text-primary focus:ring-primary w-4 h-4 transition-all"
                                               :disabled="visibleKeys.length <= 1 && visibleKeys.includes(col.key)">
                                        <span class="text-sm">{{ col.label }}</span>
                                    </label>
                                </div>
                            </div>
                        </dropdown-menu>
                    </div>

                    <div class="relative">
                         <button @click="showExportMenu = !showExportMenu"
                            :disabled="isBusy"
                            class="bg-white hover:bg-brand-50 text-brand-600 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-brand-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            title="Opções de Exportação">
                            <base-icon name="download" icon-class="w-4 h-4"></base-icon>
                        </button>
                        <dropdown-menu :show="showExportMenu" @update:show="showExportMenu = $event" title="Exportar Dados">
                            <button @click="exportToCsv(); showExportMenu = false" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors text-brand-600 text-sm font-medium">
                                 <base-icon name="file-text" icon-class="w-4 h-4 text-success"></base-icon> CSV (Excel)
                            </button>
                            <button @click="showProAlert('Excel')" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors text-brand-400 text-sm group cursor-not-allowed opacity-70">
                                 <base-icon name="file-spreadsheet" icon-class="w-4 h-4 group-hover:text-success transition-colors"></base-icon> 
                                 <div class="flex flex-col">
                                    <span>Excel Formatado</span>
                                    <span class="text-[9px] uppercase font-bold text-primary group-hover:text-primary-hover w-fit px-1.5 py-0.5 bg-primary-light rounded">Pro</span>
                                 </div>
                            </button>
                             <button @click="showProAlert('PDF')" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors text-brand-400 text-sm group cursor-not-allowed opacity-70">
                                 <base-icon name="file" icon-class="w-4 h-4 group-hover:text-danger transition-colors"></base-icon> 
                                 <div class="flex flex-col">
                                    <span>Relatório PDF</span>
                                    <span class="text-[9px] uppercase font-bold text-primary group-hover:text-primary-hover w-fit px-1.5 py-0.5 bg-primary-light rounded">Pro</span>
                                 </div>
                            </button>
                        </dropdown-menu>
                    </div>

                    <button @click="$emit('refresh')" 
                        :disabled="isBusy || selected.length > 0"
                        class="bg-white hover:bg-brand-50 text-brand-600 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-brand-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="Atualizar dados">
                        <base-icon name="refresh-cw" :icon-class="['w-4 h-4', isBusy ? 'animate-spin' : '']"></base-icon>
                    </button>
                    <button @click="$emit('create')" 
                        :disabled="selected.length > 0 || isBusy"
                        class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-shadow flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                        <base-icon name="plus" icon-class="w-4 h-4"></base-icon> Novo Registro
                    </button>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4">
                <div class="relative flex-1">
                    <input v-model="search" :disabled="isBusy" placeholder="Buscar por qualquer termo..." class="pl-10 pr-4 py-3 bg-brand-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-light outline-none w-full transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    <base-icon name="search" icon-class="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2"></base-icon>
                </div>
                <div class="relative w-full md:w-48">
                        <select v-model="perPage" :disabled="isBusy" class="w-full pl-4 pr-8 py-3 bg-brand-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-light outline-none appearance-none font-bold text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        <option :value="5">Mostrar: 5</option>
                        <option :value="10">Mostrar: 10</option>
                        <option :value="20">Mostrar: 20</option>
                    </select>
                    <base-icon name="chevron-down" icon-class="w-4 h-4 text-brand-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></base-icon>
                </div>
            </div>

            <div v-if="selected.length > 0" class="flex flex-col md:flex-row justify-between items-center gap-4 bg-primary-light p-4 rounded-xl border border-primary-light/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                        {{ selected.length }}
                    </div>
                    <span class="text-brand-900 font-bold text-sm">Itens selecionados</span>
                    <button @click="selected = []" :disabled="isBusy" class="text-xs text-primary/60 hover:text-primary font-bold ml-2 transition-colors disabled:opacity-50">Cancelar</button>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button @click="handleBulkStatus('active')" :disabled="isBusy" class="flex-1 md:flex-none bg-success-light text-success hover:bg-success border border-success/10 px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <base-icon name="check-circle" icon-class="w-4 h-4"></base-icon> Ativar
                    </button>
                    <button @click="handleBulkStatus('inactive')" :disabled="isBusy" class="flex-1 md:flex-none bg-brand-100 text-brand-600 hover:bg-brand-200 border border-brand-200 px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <base-icon name="x-circle" icon-class="w-4 h-4"></base-icon> Inativar
                    </button>
                    <div class="w-px h-6 bg-primary-light mx-1 hidden md:block"></div>
                    <button @click="handleBulkDelete" :disabled="isBusy" class="flex-1 md:flex-none bg-white text-danger hover:bg-danger-light hover:text-danger border border-danger/10 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <base-icon name="trash-2" icon-class="w-4 h-4"></base-icon> Excluir
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="p-12 text-center text-brand-400 animate-pulse">
            <div class="w-12 h-12 bg-brand-100 rounded-full mx-auto mb-4"></div>
            <p class="text-xs font-bold uppercase">Carregando dados...</p>
        </div>

        <div v-else>
            <div v-if="filteredItems.length === 0" class="py-16 px-6 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <div class="w-20 h-20 bg-brand-50 text-brand-300 rounded-full flex items-center justify-center mb-6">
                    <base-icon name="search" icon-class="w-8 h-8 opacity-50"></base-icon>
                </div>
                <h3 class="text-brand-800 font-bold text-xl mb-2">Nenhum registro encontrado</h3>
                <p v-if="search" class="text-brand-500 text-sm mb-8 max-w-xs mx-auto">Não conseguimos encontrar nada relacionado a "<span class="font-bold text-brand-700">{{ search }}</span>".</p>
                <p v-else class="text-brand-500 text-sm mb-8 max-w-xs mx-auto">Não há dados para exibir nesta lista no momento.</p>
                <button v-if="search" @click="search = ''" class="px-6 py-3 bg-white border border-brand-200 text-brand-600 hover:bg-brand-50 hover:text-primary rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2">
                    <base-icon name="x" icon-class="w-4 h-4"></base-icon> Limpar Filtros
                </button>
                <button v-else @click="$emit('create')" class="px-6 py-3 bg-primary text-white hover:bg-primary-hover rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-shadow flex items-center gap-2">
                    <base-icon name="plus" icon-class="w-4 h-4"></base-icon> Criar Novo Registro
                </button>
            </div>

            <div v-else class="overflow-x-auto px-8 custom-scrollbar pb-6">
                <table class="w-full text-left border-collapse" :class="{ 'card-processing': isBusy }">
                    <thead>
                        <tr class="text-[10px] font-bold text-brand-400 uppercase tracking-widest border-b border-brand-50">
                            <th class="py-6 pr-6 w-10 text-left">
                                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" :disabled="isBusy" class="rounded border-brand-300 text-primary focus:ring-primary cursor-pointer w-4 h-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            </th>
                            <th v-for="col in displayColumns" :key="col ? col.key : Math.random()" @click="!isBusy && sort(col.key)" class="p-6 cursor-pointer hover:bg-brand-50 transition-colors select-none group/header" :class="{ 'cursor-not-allowed': isBusy }">
                                <div class="flex items-center gap-1" v-if="col">
                                    {{ col.label }}
                                    <div class="flex flex-col ml-1">
                                         <base-icon v-if="currentSort === col.key && currentSortDir === 'asc'" name="chevron-up" icon-class="w-3 h-3 text-primary"></base-icon>
                                         <base-icon v-else-if="currentSort === col.key && currentSortDir === 'desc'" name="chevron-down" icon-class="w-3 h-3 text-primary"></base-icon>
                                         <base-icon v-else name="chevrons-up-down" icon-class="w-3 h-3 text-brand-300 group-hover/header:text-brand-500"></base-icon>
                                    </div>
                                </div>
                            </th>
                            <th class="py-6 pl-6 text-right">Gestão</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-brand-50">
                        <tr v-for="(item, index) in paginatedItems" :key="getItemKey(item)" class="hover:bg-brand-50/50 transition-colors group" :class="selected.includes(getItemKey(item)) ? 'bg-primary-light/30 hover:bg-primary-light/60' : ''">
                            <td class="py-6 pr-6 text-left">
                                <input type="checkbox" :checked="selected.includes(getItemKey(item))" @change="toggleSelect(item)" :disabled="isBusy" class="rounded border-brand-300 text-primary focus:ring-primary cursor-pointer w-4 h-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            </td>
                            <td v-for="col in displayColumns" :key="col ? col.key : index" class="p-6 text-sm text-brand-600 font-medium">
                                <div v-if="col">
                                    <slot :name="'cell-' + col.key" :item="item" :val="item[col.key]" :col="col" :is-busy="isBusy">
                                        <span v-if="col.type === 'currency'" class="font-bold text-success">{{ formatters.formatCurrency(item[col.key]) }}</span>
                                        <span v-else-if="col.type === 'number'" class="font-mono text-brand-500">{{ formatters.formatNumber(item[col.key]) }}</span>
                                        <span v-else-if="col.type === 'date'">{{ formatters.formatDate(item[col.key]) }}</span>
                                        <span v-else-if="col.type === 'select'">
                                            {{ col.options?.find(o => o.value === item[col.key])?.label || item[col.key] }}
                                        </span>
                                        <span v-else>{{ item[col.key] }}</span>
                                    </slot>
                                </div>
                            </td>
                            <td class="py-6 pl-6 text-right">
                                <div class="flex justify-end gap-2 transition-all duration-300"
                                     :class="(selected.length > 0 || isBusy) ? 'opacity-30 cursor-not-allowed grayscale' : 'opacity-30 grayscale group-hover:opacity-100 group-hover:grayscale-0'">
                                    <slot name="actions" :item="item" :is-busy="isBusy">
                                        <button @click="$emit('edit', item)" :disabled="selected.length > 0 || isBusy" class="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors disabled:pointer-events-none" title="Editar">
                                            <base-icon name="edit-2" icon-class="w-4 h-4"></base-icon>
                                        </button>
                                        <button @click="$emit('delete', item)" :disabled="selected.length > 0 || isBusy" class="p-2 text-danger hover:bg-danger-light rounded-lg transition-colors disabled:pointer-events-none" title="Excluir">
                                            <base-icon name="trash-2" icon-class="w-4 h-4"></base-icon>
                                        </button>
                                    </slot>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="!loading && filteredItems.length > 0" class="p-6 border-t border-brand-50 bg-brand-50/50 flex justify-between items-center text-xs text-brand-500 font-medium" :class="{ 'opacity-50 pointer-events-none': isBusy }">
            <span>Mostrando {{ paginatedItems.length }} de {{ sortedItems.length }} registros</span>
            <div class="flex gap-2">
                <button @click="currentPage--" :disabled="currentPage === 1 || isBusy" class="px-4 py-2 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-sm">Anterior</button>
                <div class="flex items-center gap-1 px-2">
                    <button v-for="p in totalPages" :key="p" @click="currentPage = p" :disabled="isBusy" class="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="currentPage === p ? 'bg-primary text-white shadow-md' : 'text-brand-600 hover:bg-brand-200'">{{ p }}</button>
                </div>
                <button @click="currentPage++" :disabled="currentPage === totalPages || isBusy" class="px-4 py-2 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-sm">Próximo</button>
            </div>
        </div>
    </div>
    `
};
