const { createApp, computed, reactive, watch, ref, onMounted, onUnmounted } = Vue;
const AppUtils = window.AppUtils || {};
const SCHEMAS = window.SCHEMAS || {};
const useData = window.useData;
const useAuth = window.useAuth;
const useNavigation = window.useNavigation;
const useUI = window.useUI;
const usePublicFilter = window.usePublicFilter;
const useModal = window.useModal;
const useConfirm = window.useConfirm;

// Components
const BaseIcon = window.BaseIcon;
const BaseDataTable = window.BaseDataTable;
const BaseFormModal = window.BaseFormModal;
const BaseImageInputModal = window.BaseImageInputModal;
const BaseMediaModal = window.BaseMediaModal;
const BaseLoginPage = window.BaseLoginPage;
const BasePublicArchive = window.BasePublicArchive;
const SettingsPanel = window.SettingsPanel;
const BaseConfirmDialog = window.BaseConfirmDialog;
const DropdownMenu = window.DropdownMenu;
const AdminUserMenu = window.AdminUserMenu;
<<<<<<< HEAD
const BaseAutoForm = window.BaseAutoForm;
const BaseImagePreview = window.BaseImagePreview;

// ✅ SOLID REFACTOR: Novos Componentes Reutilizáveis
const StatsCard = window.StatsCard;
const EventCard = window.EventCard;
=======
>>>>>>> 8532de7f6c2a12b20c4083c1297af93d53b4e545

createApp({
    components: {
        'base-icon': BaseIcon,
        'base-data-table': BaseDataTable,
        'base-form-modal': BaseFormModal,
        'base-image-input-modal': BaseImageInputModal,
        'base-media-modal': BaseMediaModal,
        'base-login-page': BaseLoginPage,
        'base-public-archive': BasePublicArchive,
        'settings-panel': SettingsPanel,
        'base-confirm-dialog': BaseConfirmDialog,
        'dropdown-menu': DropdownMenu,
<<<<<<< HEAD
        'admin-user-menu': AdminUserMenu,
        // ✅ SOLID: Componentes Reutilizáveis
        'stats-card': StatsCard,
        'event-card': EventCard,
        'base-auto-form': BaseAutoForm,
        'base-image-preview': BaseImagePreview,
        // ✅ Dedicated Views
        'document-generator-view': window.DocumentGeneratorView
=======
        'admin-user-menu': AdminUserMenu
>>>>>>> 8532de7f6c2a12b20c4083c1297af93d53b4e545
    },
    setup() {
        // 1. Initialize Composables
        const { events, users, testimonials, team, clipping, documents, oscs, isLoading, systemInfo, dataActions, processingIds } = useData();
        const { router, pageTitle } = useNavigation();
        const { settings, notifications, ui } = useUI(events);
        const { auth, can } = useAuth(router, notifications);

        // 2. Initialize Auth Guards & Hero Slider
        const authGuards = window.useAuthGuards(auth, router, notifications);
        const heroSlider = window.useHeroSlider(events, settings, ui);

        // STICKY NAVBAR LOGIC
        const isScrolled = ref(false);
        const handleScroll = () => {
            isScrolled.value = window.scrollY > 50;
        };

        onMounted(() => {
            window.addEventListener('scroll', handleScroll);
        });

        onUnmounted(() => {
            window.removeEventListener('scroll', handleScroll);
        });

        const resetState = reactive({ ready: false, url: '' });

        ui.events = events;
        ui.users = users;
        ui.team = team;
        ui.clipping = clipping;
        ui.testimonials = testimonials;
        ui.documents = documents;
        ui.oscs = oscs;

        const nav = (route) => {
            router.push(route);
            ui.isSidebarOpen = false; // Always collapse sidebar on navigation
            // Reset administrative drill-down if navigation occurs
            ui.adminMenuView = true;
        };

        const navContext = (context) => {
            authGuards.protectAdminAccess(context);
            router.pushContext(context);
            ui.userMenuOpen = false;
            ui.isSidebarOpen = false; // Collapse sidebar on context change
            if (context === 'admin') {
                router.push('dashboard');
            }
        };

        // AUTO-REDIRECT - Via authGuards
        authGuards.protectAdminAccess(router.currentContext);

        // SECURITY: Route Protection - Via authGuards
        watch(() => router.current, (newRoute) => {
            authGuards.protectRoute(newRoute);
            ui.isSidebarOpen = false; // Always collapse sidebar on navigation (requested)
        }, { immediate: true });

        // ✅ REFRESH DATA ON LOGIN
        watch(() => auth.isAuthenticated, (isAuthed) => {
            if (isAuthed) {
                console.log("[App] Usuário autenticado, recarregando dados...");
                dataActions.refresh();
            }
        });

        // Computed Data Views
        const activeEvents = computed(() => events.value.filter(e => e.status === 'active' && e.image));
        const publicEvents = computed(() => events.value
            .filter(e => e.status === 'active' && e.image)
            .sort((a, b) => {
                if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
                return new Date(b.date) - new Date(a.date);
            })
            .slice(0, settings.portfolio.itemsLimit || 4));

        const publicTestimonials = computed(() => testimonials.value
            .filter(t => t.status === 'active')
            .sort((a, b) => (a.highlight === b.highlight) ? 0 : (a.highlight ? -1 : 1)));

        const publicClipping = computed(() => clipping.value
            .filter(c => c.status === 'active')
            .sort((a, b) => {
                if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
                return new Date(b.date) - new Date(a.date);
            }));

        const publicTeam = computed(() => team.value
            .filter(t => t.status === 'active')
            .sort((a, b) => (a.highlight === b.highlight) ? 0 : (a.highlight ? -1 : 1)));

        const stats = computed(() => ({
            totalEvents: activeEvents.value.length,
            totalPublic: activeEvents.value.reduce((acc, e) => acc + (parseInt(e.public) || 0), 0),
            totalRevenue: activeEvents.value.reduce((acc, e) => acc + (parseInt(e.revenueEstimate) || 0), 0)
        }));

        const { filteredItems: filteredEvents, search: eventSearch, sortBy: eventSortBy } = usePublicFilter(activeEvents);
        const { filteredItems: filteredClipping, search: clippingSearch, sortBy: clippingSortBy } = usePublicFilter(publicClipping);

        const adminThemeClass = computed(() => auth.isAuthenticated && ['admin', 'dev'].includes(auth.user?.role) && router.currentContext === 'admin' ? 'admin-theme' : '');

        const modal = useModal(dataActions, notifications, router);

        const mediaModal = reactive({
            show: false,
            type: null,
            url: null,
            title: null,
            open(type, url, title) {
                this.type = type;
                this.url = url;
                this.title = title;
                this.show = true;
            },
            close() {
                this.show = false;
                this.type = null;
                this.url = null;
                this.title = null;
            }
        });

        const imageInputModal = reactive({
            show: false,
            url: '',
            title: '',
            callback: null,
            edit(target, prop, title = 'Alterar Imagem') {
                imageInputModal.open(target[prop], (newUrl) => {
                    target[prop] = newUrl;
                }, title);
            },
            open(url, cb, title = 'Alterar Imagem') {
                console.log(`[ImageModal] Abrindo para: ${url}`);
                this.url = url;
                this.callback = cb;
                this.title = title;
                this.show = true;
            },
            save(newUrl) {
                console.log(`[ImageModal] Salvando nova URL: ${newUrl}`);
                if (typeof imageInputModal.callback === 'function') {
                    imageInputModal.callback(newUrl);
                } else {
                    console.warn('[ImageModal] Callback não encontrado ou inválido no momento do save.');
                }
                imageInputModal.close();
            },
            close() {
                this.show = false;
                // Usamos um pequeno timeout para limpar os dados sensíveis, 
                // garantindo que eventos pendentes tenham chance de ler o callback
                setTimeout(() => {
                    this.url = '';
                    this.callback = null;
                }, 100);
            }
        });

        watch(() => router.current, () => {
            if (modal.visible) modal.close();
            if (mediaModal.show) mediaModal.close();
            if (imageInputModal.show) imageInputModal.close();
        });

        const columns = computed(() => {
            const cols = {};
            for (const key of Object.keys(window.DATA_MODELS || {})) {
                if (key === 'getTableColumns') continue;
                cols[key] = window.DATA_MODELS.getTableColumns(key);
            }
            return cols;
        });

        // MAINTENANCE MODE - Via authGuards
        watch(() => settings.isMaintenance, (maintenanceActive) => {
            authGuards.enforceMaintenanceMode(maintenanceActive);
            if (maintenanceActive && auth.isAuthenticated && !['admin', 'dev'].includes(auth.user?.role)) {
                notifications.add("O sistema entrou em manutenção.", "warning");
            }
        });

        const showMaintenanceBlock = computed(() => {
            if (router.currentContext === 'auth') return false;
            return settings.isMaintenance && !['admin', 'dev'].includes(auth.user?.role);
        });

        async function handleResetAction() {
            if (resetState.ready) {
                window.location.reload();
                return;
            }
            const result = await dataActions.resetDatabase();
            if (result?.success) {
                resetState.ready = true;
            }
        }

        const confirmModal = useConfirm();
        const globalError = ref(false);

        window.App = {
            notifications,
            auth,
            askConfirm: confirmModal.askConfirm,
            imageInputModal,
            setCriticalError: (val) => globalError.value = val
        };

        return {
            router,
            nav,
            navContext,
            globalError,
            // Data
            events, users, testimonials, team, clipping, documents, oscs, isLoading, systemInfo, processingIds,
            // UI
            settings, notifications, ui, pageTitle, adminThemeClass, showMaintenanceBlock,
            // Auth
            auth, can,
            // Filters/Sorts
            filteredEvents, eventSearch, eventSortBy,
            filteredClipping, clippingSearch, clippingSortBy,
            // Views
            activeEvents, publicEvents, publicTestimonials, publicTeam, publicClipping, stats,
            // Actions
            dataActions,
            resetState,
            handleResetAction,
            // Utils
            utils: AppUtils,
            formatters: window.Formatters,
            // Modal
            modal,
            mediaModal,
            imageInputModal,
            confirmModal,
            // Constants
            SCHEMAS, columns,
            // UI State
            isScrolled
        };
    }
}).mount('#app');
