window.useColumnVisibility = function (props) {
    const { ref, computed, watch, onMounted } = Vue;

    const visibleKeys = ref([]);

    const getStorageKey = () => `lazer_datatable_cols_${props.context || 'default'}`;

    function initColumns() {
        if (!props.columns || !Array.isArray(props.columns)) {
            visibleKeys.value = [];
            return;
        }

        const saved = localStorage.getItem(getStorageKey());

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const validKeys = parsed.filter(key => props.columns.some(c => c && c.key === key));

                if (validKeys.length > 0) {
                    visibleKeys.value = validKeys;
                    return;
                }
            } catch (e) {
                console.error('Error parsing column settings', e);
            }
        }

        visibleKeys.value = props.columns.map(c => c.key);
    }

    function toggleColumn(key) {
        if (visibleKeys.value.includes(key)) {
            if (visibleKeys.value.length <= 1) return;
            visibleKeys.value = visibleKeys.value.filter(k => k !== key);
        } else {
            visibleKeys.value.push(key);
            const originalOrder = props.columns.map(c => c.key);
            visibleKeys.value.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
        }

        localStorage.setItem(getStorageKey(), JSON.stringify(visibleKeys.value));
    }

    const displayColumns = computed(() => {
        if (!props.columns) return [];
        return props.columns.filter(c => visibleKeys.value.includes(c.key));
    });

    watch(() => props.columns, () => initColumns(), { deep: true });

    onMounted(() => initColumns());

    return {
        visibleKeys,
        displayColumns,
        toggleColumn,
        initColumns
    };
};
