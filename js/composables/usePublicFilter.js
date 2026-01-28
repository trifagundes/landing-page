window.usePublicFilter = function (itemsRef) {
    const search = Vue.ref('');
    const sortBy = Vue.ref('');

    const filteredItems = Vue.computed(() => {
        let list = itemsRef.value;

        if (search.value) {
            const term = search.value.toLowerCase();
            list = list.filter(item => {
                return Object.values(item).some(val => String(val).toLowerCase().includes(term));
            });
        }

        if (sortBy.value) {
            list = [...list].sort((a, b) => {
                const sortKey = sortBy.value;

                if (sortKey === 'date') return new Date(b.date) - new Date(a.date);
                if (sortKey === 'date_desc') return new Date(b.date) - new Date(a.date);
                if (sortKey === 'date_asc') return new Date(a.date) - new Date(b.date);

                if (sortKey === 'name') return (a.title || a.name || '').localeCompare(b.title || b.name || '');

                if (sortKey === 'public') return (b.public || 0) - (a.public || 0);
                if (sortKey === 'revenue') return (b.revenueEstimate || 0) - (a.revenueEstimate || 0);

                if (sortKey === 'source') return (a.source || '').localeCompare(b.source || '');

                return 0;
            });
        }

        return list;
    });

    return { filteredItems, search, sortBy };
};
