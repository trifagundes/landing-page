/**
 * useHeroSlider - Composable para gerenciar hero slider
 * Responsável apenas por: lógica de navegação, auto-play e sincronização de slides
 */
window.useHeroSlider = function (events, settings, ui) {
    const CONSTANTS = window.APP_CONSTANTS || {};
    // Auto-play do hero slider
    const startAutoPlay = () => {
        const slideInterval = CONSTANTS.HERO_SLIDE_INTERVAL || 5000;
        const interval = setInterval(() => {
            if (settings.hero.mode === 'slider') {
                ui.nextHeroSlide();
            }
        }, slideInterval);

        return () => clearInterval(interval);
    };

    // Setup inicial quando eventos carregam
    const setupHeroSlides = () => {
        if (!events || !events.value) return;
        if (settings.hero.mode === 'slider' && events.value && events.value.length > 0) {
            ui.totalHeroSlides = events.value.length;
        }
    };

    // Sincronizar quando eventos mudam
    Vue.watch(events, setupHeroSlides, { deep: true });
    Vue.onMounted(setupHeroSlides);

    // Iniciar auto-play
    let stopAutoPlay = null;
    Vue.onMounted(() => {
        stopAutoPlay = startAutoPlay();
    });

    Vue.onUnmounted(() => {
        if (stopAutoPlay) stopAutoPlay();
    });

    return {
        currentSlide: () => ui.currentHeroSlide,
        totalSlides: () => ui.totalHeroSlides,
        nextSlide: () => ui.nextHeroSlide(),
        prevSlide: () => ui.prevHeroSlide(),
        goToSlide: (index) => ui.setHeroSlide(index)
    };
};
