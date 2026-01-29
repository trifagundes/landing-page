/**
 * useUIState - Composable para estado visual e UI
 * Responsável apenas por: sidebar, hero slider, modals, dropdowns
 */
window.useUIState = function () {
    const ui = Vue.reactive({
        // Sidebar & Navigation
        isSidebarOpen: true,
        isMobile: window.innerWidth < 1024,
        adminMenuView: true,

        // User Menu
        userMenuOpen: false,
        hideHeader: false,

        // Hero Slider
        currentHeroSlide: 0,
        totalHeroSlides: 0,

        nextHeroSlide() {
            this.currentHeroSlide = (this.currentHeroSlide + 1) % (this.totalHeroSlides || 1);
        },

        prevHeroSlide() {
            this.currentHeroSlide = (this.currentHeroSlide - 1 + (this.totalHeroSlides || 1)) % (this.totalHeroSlides || 1);
        },

        setHeroSlide(index) {
            if (index >= 0 && index < this.totalHeroSlides) {
                this.currentHeroSlide = index;
            }
        },

        scrollTo(selector) {
            const el = document.querySelector(selector);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Detectar mudanças de resize
    Vue.onMounted(() => {
        const handleResize = () => {
            ui.isMobile = window.innerWidth < 1024;
            if (!ui.isMobile) ui.isSidebarOpen = true;
        };
        window.addEventListener('resize', handleResize);
        Vue.onUnmounted(() => window.removeEventListener('resize', handleResize));
    });

    return { ui };
};
