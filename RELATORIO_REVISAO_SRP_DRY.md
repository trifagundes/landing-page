# 📋 Relatório de Revisão SRP e DRY

**Data:** 28 de janeiro de 2026  
**Escopo:** Análise completa do projeto ATST  
**Status:** ✅ Concluído

---

## 📊 Resumo Executivo

O projeto segue uma **arquitetura razoável**, mas apresenta **múltiplas violações** tanto de **SRP (Single Responsibility Principle)** quanto de **DRY (Don't Repeat Yourself)**. A maior parte dos problemas está concentrada em:

1. **Composables oversized** - Fazem mais de uma coisa
2. **Duplicação de padrões** - Mesmo código em vários locais
3. **Componentes multipropósito** - Responsabilidades demais
4. **Lógica espalhada** - Em vários níveis da aplicação

**Severidade:** 🔴 MÉDIA a ALTA  
**Impacto:** Manutenção difícil, testes complexos, refatoração arriscada

---

## 🔴 VIOLAÇÕES DE SRP (Single Responsibility Principle)

### 1. **`useUI.js` - Composable Gigante** ⭐ CRÍTICO

**Responsabilidades atuais (8+):**
- Persistência de configurações UI (localStorage)
- Gerenciamento de estado de navegação visual (hero slider, sidebar)
- Gerenciamento de notificações
- Gerenciamento de tema/dark mode
- Gerenciamento de modais e dropdowns
- Configuração de seções (hero, portfolio, clipping, team, etc.)
- Gerenciamento de estado mobile
- Lógica de paginação

**Problema:**
```javascript
// 282 linhas fazendo TUDO
window.useUI = function (events) {
    // Helper functions
    const getStr = (...) => {...}
    const getBool = (...) => {...}
    const getNum = (...) => {...}
    // + 15 seções de configuração padrão
    // + métodos de paginação
    // + métodos de slider
    // + métodos de persistência
    // ...
}
```

**Recomendação:** Dividir em 4 composables:
- `useUISettings` - Apenas persistência de configurações
- `useNavigation` - (já existe, mas recebe dados do useUI)
- `useNotifications` - Sistema de notificações
- `useUIState` - Estado visual (sidebar, modals, etc)

---

### 2. **`useData.js` - Múltiplas Responsabilidades**

**Responsabilidades atuais (5):**
- Carregar dados de todas as coleções (5 tipos)
- Fazer atualizações otimistas
- Gerenciar estado de carregamento
- Executar ações CRUD
- Sincronizar dados com usuário logado

**Problema:**
```javascript
const _applyOptimisticUpdate = (collection, action, payload) => {
    // Sabe sobre: events, users, testimonials, team, clipping
    // Sabe sobre: schema discovery
    // Sabe sobre: sync com auth.user
    // 50+ linhas fazendo demais
}
```

**Recomendação:**
- `useDataLoading` - Apenas carregar dados
- `useOptimisticUpdates` - Apenas atualizar estado otimista
- `useCRUDActions` - Apenas ações de negócio

---

### 3. **`BaseDataTable.js` - Componente Faz Demais**

**Responsabilidades atuais (6):**
- Renderizar tabela
- Gerenciar seleção de itens
- Gerenciar visibilidade de colunas
- Gerenciar exportação de dados
- Gerenciar paginação
- Mostrar/esconder menus dropdown

**Problema:**
```javascript
// Tudo em 1 componente
methods: {
    showProAlert(...) {...}
    handleBulkDelete(...) {...}
    handleBulkStatus(...) {...}
    exportToCsv(...) {...}
    clearSelection(...) {...} // Herdado de useTable
    toggleColumn(...) {...}    // Herdado de useColumnVisibility
}
```

**Recomendação:**
- `<BaseDataTable>` - Apenas renderizar tabela e filas
- `<TableColumnSelector>` - Gerenciar colunas visíveis
- `<TableBulkActions>` - Gerenciar ações em massa
- `<TableExportMenu>` - Gerenciar exportação

---

### 4. **`main.js` - Orquestrador Complexo**

**Responsabilidades (5+):**
- Inicializar app
- Gerenciar scroll listener
- Gerenciar auto-play de slider
- Gerenciar redirecionamentos de segurança
- Expor todas as functions globalmente

**Problema:**
```javascript
setup() {
    // ... carrega 6 composables
    
    // Scroll listener inline
    const isScrolled = ref(false);
    const handleScroll = () => { isScrolled.value = window.scrollY > 50; };
    onMounted(() => window.addEventListener('scroll', handleScroll));
    
    // Auto-play slider inline
    onMounted(() => {
        setInterval(() => {
            if (settings.hero.mode === 'slider') {
                ui.nextHeroSlide();
            }
        }, 5000);
    });
    
    // Lógica de redirect
    if (router.currentContext === 'admin') {
        if (!auth.isAuthenticated) router.pushContext('auth');
        // ...
    }
    
    // ... retorna 60+ properties
}
```

**Recomendação:**
- Extrair listeners em `useScrollNavigation()` e `useHeroSlider()`
- Extrair segurança em `useAuthGuards()`
- Manter `main.js` apenas como orquestrador

---

### 5. **`SettingsPanel.js` - Super Componente**

**Responsabilidades (4+):**
- Renderizar 7 abas diferentes (general, hero, portfolio, clipping, testimonials, team, footer)
- Gerenciar estado de aba ativa
- Salvar configurações
- Renderizar forms complexos internos
- Conter sub-componentes inline (section-editor, etc.)

**Problema:**
```javascript
window.SettingsPanel = {
    components: {
        'base-icon': window.BaseIcon,
        'section-editor': {
            template: `...` // 500+ linhas inline
        }
    },
    // 800+ linhas de template com 7 abas diferentes
}
```

**Recomendação:** Dividir em componentes específicos:
- `<SettingsHeroTab>`
- `<SettingsPortfolioTab>`
- `<SettingsClippingTab>`
- etc.

---

## 🟠 VIOLAÇÕES DE DRY (Don't Repeat Yourself)

### 1. **Padrão de Persistência Repetido** 🔴 ALTA

**Ocorrências:** 3 vezes

**Em `useUI.js`:**
```javascript
const getStr = (key, fallback) => {
    const val = localStorage.getItem(key);
    return (val !== null) ? val : fallback;
};
const getBool = (key, fallback) => {
    const val = localStorage.getItem(key);
    return (val !== null) ? val === 'true' : fallback;
};
const getNum = (key, fallback) => {
    const val = localStorage.getItem(key);
    return (val !== null && !isNaN(parseInt(val))) ? parseInt(val) : fallback;
};
```

**Em `useData.js` (similar):**
- Mesmo padrão de try/catch para carregar dados

**Recomendação:**
```javascript
// Criar useLocalStorage.js
window.useLocalStorage = function() {
    const get = (key, fallback, type = 'string') => {
        const val = localStorage.getItem(key);
        if (val === null) return fallback;
        
        if (type === 'bool') return val === 'true';
        if (type === 'number') return !isNaN(parseInt(val)) ? parseInt(val) : fallback;
        return val;
    };
    
    const set = (key, value) => localStorage.setItem(key, String(value));
    
    return { get, set };
};
```

---

### 2. **Dropdowns/Menus - Padrão Duplicado** 🔴 ALTA

**Ocorrências:** 5+ locais

**Em `index.html` (User Menu):**
```html
<div v-if="showExportMenu" class="dropdown-backdrop-responsive fixed inset-0..."></div>
<div v-if="showExportMenu" class="dropdown-menu-responsive dropdown-menu-right...">
    <div class="p-3 border-b border-brand-50 bg-brand-50/50">
        <span class="text-xs font-bold text-brand-500 uppercase...">Exportar</span>
    </div>
    <div class="p-2 space-y-1.5">
        <!-- Items -->
    </div>
</div>
```

**Em `BaseDataTable.js` (Export Menu):**
```html
<div v-if="showExportMenu" @click="showExportMenu = false" class="dropdown-backdrop-responsive..."></div>
<div v-if="showExportMenu" class="dropdown-menu-responsive dropdown-menu-right...">
    <!-- EXATO MESMO HTML -->
</div>
```

**Recomendação:** Criar componente `<DropdownMenu>`:
```javascript
window.DropdownMenu = {
    props: ['title', 'items', 'modelValue'],
    emits: ['update:modelValue'],
    template: `
        <div v-if="modelValue" @click="$emit('update:modelValue', false)" 
            class="dropdown-backdrop-responsive..."></div>
        <div v-if="modelValue" class="dropdown-menu-responsive...">
            <div class="p-3 border-b...">
                <span>{{ title }}</span>
            </div>
            <div class="p-2 space-y-1.5">
                <slot></slot>
            </div>
        </div>
    `
}
```

---

### 3. **Padrão de Formatadores Duplicado** 🟠 MÉDIA

**Em `BaseFormField.js`:**
```javascript
updateValue(value) {
    let finalValue = value;
    if (this.field.mask && window.Formatters && window.Formatters.mask) {
        finalValue = window.Formatters.mask(value, this.field.mask);
    }
    // ...
    this.$emit('update:modelValue', finalValue);
}
```

**Em `BaseDataTable.js` (diferente):**
```javascript
// Usa formatters mas de forma diferente
return {
    formatters,
    ...tableLogic,
    ...columnLogic
};
```

**Recomendação:** Consolidar lógica de formatação em utils:
```javascript
// Formatters.js - Expandir
window.formatValue = (value, field) => {
    if (field.type === 'currency') return `R$ ${value}`;
    if (field.mask) return window.Formatters.mask(value, field.mask);
    if (field.type === 'date') return formatters.formatDate(value);
    return value;
};
```

---

### 4. **Configurações Padrão - Repetidas** 🟠 MÉDIA

**Em `useUI.js`:**
```javascript
const UI_DEFAULTS = {
    appTitle: "...",
    hero: { show: true, icon: 'zap', ... },
    portfolio: { show: true, icon: 'briefcase', ... },
    clipping: { show: true, icon: 'newspaper', ... },
    testimonials: { show: true, icon: 'quote', ... },
    // PADRÃO REPETIDO 5 VEZES!
};
```

Cada seção segue: `{ show, icon, title, subtitle, bgColor, itemsLimit, ctaShow, ctaText, ctaLink }`

**Recomendação:**
```javascript
// Criar factory
const createSectionDefaults = (icon, title, subtitle = '') => ({
    show: true,
    icon,
    title,
    subtitle,
    bgColor: 'bg-white',
    itemsLimit: 4,
    ctaShow: false,
    ctaText: '',
    ctaLink: ''
});

// Usar
const UI_DEFAULTS = {
    hero: createSectionDefaults('zap', 'Lazer como Política...'),
    portfolio: createSectionDefaults('briefcase', 'Grandes Entregas...'),
    // ...
};
```

---

### 5. **Padrão de Modal - Repetido** 🟠 MÉDIA

**Em `useModal.js`:**
```javascript
function open(collection, item = null) {
    const model = window.DATA_MODELS[collection];
    if (!model) {
        console.error("Schema não encontrado...");
        return;
    }
    state.collection = collection;
    state.isEditing = !!item;
    // ...
}
```

**Em `index.html` (User Edit Modal):**
```html
<base-form-modal 
    :show="modal.visible" 
    :title="modal.state.title"
    :fields="modal.state.fields"
    ...
/>
```

Padrão repetido em vários lugares com variações menores.

---

## 🟢 PONTOS POSITIVOS

✅ **Boa separação de concerns:** CSS/JS/HTML estão bem divididos  
✅ **Sistema de schemas:** Reduz duplicação de models  
✅ **Composables pattern:** Boa abstração (apesar de oversized)  
✅ **Sem dependências externas:** Zero coupling com libs  
✅ **Temas centralizados:** CSS variables bem aplicadas

---

## 📋 PLANO DE AÇÃO (Priorizado)

| Prioridade | Violação | Tipo | Esforço | Impacto |
|-----------|----------|------|---------|---------|
| 🔴 P1 | Dividir `useUI.js` | SRP | Alto | Alto |
| 🔴 P1 | Extrair `useLocalStorage` | DRY | Médio | Alto |
| 🔴 P1 | Criar `<DropdownMenu>` | DRY | Médio | Alto |
| 🟠 P2 | Dividir `SettingsPanel` | SRP | Alto | Médio |
| 🟠 P2 | Refatorar `BaseDataTable` | SRP | Alto | Médio |
| 🟠 P2 | Consolidar formatadores | DRY | Médio | Médio |
| 🟠 P2 | Factory de defaults | DRY | Baixo | Médio |
| 🟡 P3 | Extrair `useHeroSlider` | SRP | Médio | Baixo |
| 🟡 P3 | Extrair `useAuthGuards` | SRP | Médio | Baixo |

---

## 💡 RECOMENDAÇÕES ESPECÍFICAS

### Curto Prazo (Impacto Imediato)

**1. Criar `useLocalStorage.js`:**
```javascript
window.useLocalStorage = function() {
    return {
        get: (key, fallback, type = 'string') => {
            const val = localStorage.getItem(key);
            if (val === null) return fallback;
            if (type === 'bool') return val === 'true';
            if (type === 'number') return !isNaN(parseInt(val)) ? parseInt(val) : fallback;
            return val;
        },
        set: (key, value) => localStorage.setItem(key, String(value))
    };
};
```

**2. Criar `<DropdownMenu>` component:**
```javascript
window.DropdownMenu = {
    props: ['title', 'show'],
    emits: ['update:show'],
    template: `
        <div v-if="show" @click="$emit('update:show', false)" class="dropdown-backdrop-responsive..."></div>
        <div v-if="show" class="dropdown-menu-responsive...">
            <div class="p-3 border-b..."><span class="text-xs font-bold...">{{ title }}</span></div>
            <div class="p-2 space-y-1.5"><slot></slot></div>
        </div>
    `
};
```

### Médio Prazo (Refatoração Estruturada)

**3. Dividir `useUI.js`:**
```
useUI.js → useUIState.js (sidebar, hero, modals)
        → useUISettings.js (persistência de settings)
        → useNotifications.js (toasts)
        → (useNavigation.js já existe)
```

**4. Extrair handlers de `main.js`:**
```
main.js → useHeroSlider.js
       → useScrollNavigation.js
       → useAuthGuards.js
```

### Longo Prazo (Arquitetura)

**5. Componentes segmentados:**
- Manter `BaseDataTable` apenas para renderização
- Criar `<DataTableActions>`, `<DataTableFilters>`, etc.

**6. Consolidar lógica de forms:**
- Padrão único para masks, validação, formatação

---

## ✅ CONCLUSÃO

O código está **funcional e bem organizado em alto nível**, mas apresenta **vulnerabilidades de manutenção** por:

1. ❌ Composables fazendo demais
2. ❌ Padrões repetidos em vários locais
3. ❌ Componentes com múltiplas responsabilidades
4. ❌ Falta de abstrações reutilizáveis

**Recomendação:** Implementar refatorações em **3 fases** (P1, P2, P3) para melhorar **testabilidade**, **reusabilidade** e **manutenibilidade**.

---

**Gerado em:** 28 de janeiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para implementação
