window.useNavigation = function () {
    const router = Vue.reactive({
        currentContext: 'public',
        current: 'dashboard',
        queryParams: { search: '', page: 1, perPage: 5, sortBy: '', sortOrder: 'asc' },

        pushContext(ctx) {
            router.currentContext = ctx;
            router.updateUrl();
        },
        push(pg) {
            router.current = pg;
            router.queryParams.page = 1;
            router.updateUrl();
        },
        updateUrl() {
            if (window.location.protocol === 'blob:') return;
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('ctx', router.currentContext);
                url.searchParams.set('pg', router.current);
                if (router.queryParams.search) url.searchParams.set('q', router.queryParams.search);
                else url.searchParams.delete('q');
                url.searchParams.set('page', router.queryParams.page);
                window.history.pushState({}, '', url.toString());
                window.scrollTo(0, 0);
            } catch (e) { }
        },
        loadFromUrl() {
            try {
                const params = new URLSearchParams(window.location.search);
                router.currentContext = params.get('ctx') || 'public';
                router.current = params.get('pg') || 'dashboard';
                router.queryParams.search = params.get('q') || '';
                router.queryParams.page = parseInt(params.get('page')) || 1;
            } catch (e) {
                router.currentContext = 'public';
            }
        }
    });

    Vue.watch(() => router.queryParams, () => router.updateUrl(), { deep: true });
    Vue.onMounted(() => router.loadFromUrl());

    const pageTitle = Vue.computed(() => {
        const titles = {
            'home': 'Painel Principal',
            'events': 'Gestão de Eventos',
            'users': 'Controle de Usuários',
            'team': 'Equipe do Governo',
            'testimonials': 'Depoimentos',
            'clipping': 'Clipping de Notícias',
            'dev': 'Ferramentas do Desenvolvedor'
        };
        return titles[router.current] || 'Portal';
    });

    return { router, pageTitle };
};
