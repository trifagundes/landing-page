/**
 * useUISettings - Composable para configurações persistidas de UI
 * Responsável apenas por: carregar, salvar e gerenciar settings
 */
window.useUISettings = function(events) {
    const localStorage = window.useLocalStorage();
    
    const UI_DEFAULTS = {
        appTitle: "Syldio | Gestão de Lazer",
        brandIcon: "clapperboard",
        activeTheme: "indigo",
        isMaintenance: false,
        isCompactMode: false,
        parallax: {
            show: true,
            title: 'Tradição & Futuro',
            subtitle: 'Construindo uma cidade mais viva através da cultura e do esporte.',
            image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1920&auto=format&fit=crop'
        },
        hero: {
            show: true,
            icon: 'zap',
            title: 'Lazer como Política de Resultados',
            subtitle: 'Transformando espaços públicos em convivência, segurança e desenvolvimento econômico para o município.',
            bgColor: 'bg-white',
            mode: 'slider',
            fixedImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
            animation: 'fade',
            ctaShow: true,
            ctaText: 'Explorar Eventos',
            ctaLink: '#eventos'
        },
        stats: {
            show: true,
            icon: 'bar-chart-3',
            title: 'Nossos Números',
            subtitle: 'O impacto real das atividades no município.',
            bgColor: 'bg-brand-50',
            events: true,
            public: true,
            revenue: true,
            approval: true
        },
        portfolio: {
            show: true,
            icon: 'briefcase',
            title: 'Grandes Entregas',
            subtitle: 'A capacidade operacional de realizar eventos de massa com segurança e organização.',
            bgColor: 'bg-white',
            itemsLimit: 6,
            ctaShow: false,
            viewAllShow: true,
            viewAllLabel: 'Ver Todos os Eventos',
            viewAllLink: '#arquivo'
        },
        clipping: {
            show: true,
            icon: 'newspaper',
            title: 'Repercussão da Gestão',
            subtitle: 'O reconhecimento público e midiático do trabalho desenvolvido.',
            bgColor: 'bg-brand-50',
            itemsLimit: 4,
            ctaShow: false,
            viewAllShow: true,
            viewAllLabel: 'Ver Mais Clipping',
            viewAllLink: '#arquivo-clipping'
        },
        testimonials: {
            show: true,
            icon: 'quote',
            title: 'O que dizem os cidadãos',
            subtitle: 'A voz da comunidade sobre nossas entregas.',
            bgColor: 'bg-white',
            itemsLimit: 3,
            ctaShow: true,
            ctaText: 'Deixar Depoimento',
            ctaLink: '#contato'
        },
        team: {
            show: true,
            icon: 'users',
            title: 'Time de Especialistas',
            subtitle: 'Os profissionais que fazem acontecer.',
            bgColor: 'bg-brand-50',
            itemsLimit: 4,
            ctaShow: false,
            viewAllShow: false
        },
        footer: {
            show: true,
            text: '© 2026 Cultura Viva. Prefeitura Municipal de Sant\'Ana do Livramento.',
            links: [
                { label: 'Instagram', url: '#', icon: 'instagram' },
                { label: 'Facebook', url: '#', icon: 'facebook' }
            ]
        }
    };
    
    const settings = Vue.reactive({
        appTitle: localStorage.get('appTitle', UI_DEFAULTS.appTitle),
        brandIcon: localStorage.get('brandIcon', UI_DEFAULTS.brandIcon),
        activeTheme: localStorage.get('activeTheme', UI_DEFAULTS.activeTheme),
        isMaintenance: localStorage.get('isMaintenance', UI_DEFAULTS.isMaintenance, 'bool'),
        isCompactMode: localStorage.get('isCompactMode', UI_DEFAULTS.isCompactMode, 'bool'),
        unreadNotifications: 0,
        
        parallax: { ...UI_DEFAULTS.parallax },
        hero: { ...UI_DEFAULTS.hero },
        stats: { ...UI_DEFAULTS.stats },
        portfolio: { ...UI_DEFAULTS.portfolio },
        clipping: { ...UI_DEFAULTS.clipping },
        testimonials: { ...UI_DEFAULTS.testimonials },
        team: { ...UI_DEFAULTS.team },
        footer: { ...UI_DEFAULTS.footer }
    });
    
    // Salvar automaticamente quando settings mudam
    Vue.watch(() => settings.appTitle, (val) => localStorage.set('appTitle', val));
    Vue.watch(() => settings.activeTheme, (val) => localStorage.set('activeTheme', val));
    Vue.watch(() => settings.isMaintenance, (val) => localStorage.set('isMaintenance', val));
    Vue.watch(() => settings.isCompactMode, (val) => localStorage.set('isCompactMode', val));
    
    // Deep watch para configurações de seções
    Vue.watch(() => settings.hero, (val) => localStorage.set('hero_config', JSON.stringify(val)), { deep: true });
    Vue.watch(() => settings.portfolio, (val) => localStorage.set('portfolio_config', JSON.stringify(val)), { deep: true });
    
    return { settings };
};
