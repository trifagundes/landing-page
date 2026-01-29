/**
 * useUI - Composable refatorado para orquestrar settings, estado e notifica��es
 * Utiliza composables especializados (SRP): useUISettings, useUIState, useLocalStorage
 */
window.useUI = function (events) {
    const CONSTANTS = window.APP_CONSTANTS || {};

    // 1. Carregar settings via useUISettings (persist�ncia)
    const { settings } = window.useUISettings(events);

    // 2. Carregar estado visual via useUIState (sidebar, modals, slider)
    const { ui } = window.useUIState();

    // 3. Sistema de notifica��es (independente)
    const notifications = Vue.reactive({
        toasts: [],
        add(msg, type = 'success') {
            const id = Date.now();
            const duration = CONSTANTS.TOAST_DURATION || 3000;
            // Tornamos o brinde reativo individualmente para garantir updates fluidos
            const toast = Vue.reactive({ id, message: msg, type, progress: 100, duration });
            this.toasts.push(toast);

            const interval = 16; // ~60fps para fluidez total
            const step = 100 / (duration / interval);
            const timer = setInterval(() => {
                toast.progress -= step;
                if (toast.progress <= 0) {
                    clearInterval(timer);
                    this.remove(id);
                }
            }, interval);
        },
        remove(id) {
            const index = this.toasts.findIndex(t => t.id === id);
            if (index > -1) this.toasts.splice(index, 1);
        }
    });

    // 4. Integra��o: Hero slider com eventos
    const setupHeroSlider = () => {
        if (!events || !events.value) return;
        if (settings.hero.mode === 'slider' && events.value && events.value.length > 0) {
            ui.totalHeroSlides = events.value.length;
        }
    };

    Vue.watch(events, setupHeroSlider, { deep: true });
    Vue.onMounted(setupHeroSlider);

    // 5. Aplicar tema inicial e observar mudan�as
    window.AppUtils.applyTheme(settings.activeTheme);
    window.AppUtils.applyDarkMode(settings.darkMode);

    Vue.watch(() => settings.activeTheme, (newTheme) => {
        window.AppUtils.applyTheme(newTheme);
    });

    Vue.watch(() => settings.darkMode, (isDark) => {
        window.AppUtils.applyDarkMode(isDark);
    });

    // 6. Helper global para notifica��es
    window.notify = (title, msg, type = 'success') => {
        notifications.add(`${title}: ${msg}`, type);
    };

    // 7. Reset de se��es (delegado de UI_DEFAULTS via settings)
    ui.resetSection = (sectionKey) => {
        const defaults = {
            hero: settings.hero,
            portfolio: settings.portfolio,
            clipping: settings.clipping,
            testimonials: settings.testimonials,
            team: settings.team,
            footer: settings.footer
        };

        if (defaults[sectionKey]) {
            Object.keys(defaults[sectionKey]).forEach(key => {
                settings[sectionKey][key] = defaults[sectionKey][key];
            });
            window.notify("Sistema", "Se��o restaurada para o padr�o!", "success");
        }
    };

    return { settings, notifications, ui };
};
