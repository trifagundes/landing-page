window.useTable = function (props) {
    const search = Vue.ref('');
    const perPage = Vue.ref(5);
    const currentPage = Vue.ref(1);
    const currentSort = Vue.ref(null);
    const currentSortDir = Vue.ref('asc');
    const selected = Vue.ref([]);

    const getItemKey = (item) => item.id || item.email;

    const filteredItems = Vue.computed(() => {
        let list = props.items || [];
        if (search.value) {
            const term = search.value.toLowerCase();
            list = list.filter(i => Object.values(i).some(v => String(v).toLowerCase().includes(term)));
        }
        return list;
    });

    const sortedItems = Vue.computed(() => {
        return [...filteredItems.value].sort((a, b) => {
            let modifier = 1;
            if (currentSortDir.value === 'desc') modifier = -1;
            if (!currentSort.value) return 0;

            const valA = a[currentSort.value];
            const valB = b[currentSort.value];

            if (valA < valB) return -1 * modifier;
            if (valA > valB) return 1 * modifier;
            return 0;
        });
    });

    const totalPages = Vue.computed(() => Math.ceil(sortedItems.value.length / perPage.value));

    const paginatedItems = Vue.computed(() => {
        const start = (currentPage.value - 1) * perPage.value;
        if (start >= sortedItems.value.length && currentPage.value > 1) {
            currentPage.value = 1;
        }
        return sortedItems.value.slice(start, start + perPage.value);
    });

    const allSelected = Vue.computed(() => {
        if (paginatedItems.value.length === 0) return false;
        const pageIds = paginatedItems.value.map(getItemKey);
        return pageIds.every(id => selected.value.includes(id));
    });

    const sort = (column) => {
        if (column === currentSort.value) {
            currentSortDir.value = currentSortDir.value === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.value = column;
            currentSortDir.value = 'asc';
        }
    };

    const toggleSelectAll = () => {
        if (allSelected.value) {
            const pageIds = paginatedItems.value.map(getItemKey);
            selected.value = selected.value.filter(id => !pageIds.includes(id));
        } else {
            const pageIds = paginatedItems.value.map(getItemKey);
            const newIds = pageIds.filter(id => !selected.value.includes(id));
            selected.value = [...selected.value, ...newIds];
        }
    };

    const toggleSelect = (item) => {
        const key = getItemKey(item);
        if (selected.value.includes(key)) {
            selected.value = selected.value.filter(id => id !== key);
        } else {
            selected.value.push(key);
        }
    };

    const clearSelection = () => {
        selected.value = [];
    };

    return {
        search,
        perPage,
        currentPage,
        currentSort,
        currentSortDir,
        selected,
        filteredItems,
        sortedItems,
        totalPages,
        paginatedItems,
        allSelected,
        sort,
        toggleSelectAll,
        toggleSelect,
        clearSelection,
        getItemKey
    };
};
