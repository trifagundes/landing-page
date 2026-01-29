/**
 * Constants.js - Constantes centralizadas do sistema
 * Evita "magic numbers" e centraliza configurações
 */

window.APP_CONSTANTS = {
    // Durations & Intervals
    TOAST_DURATION: 3000,
    TOAST_PROGRESS_INTERVAL: 10,
    HERO_SLIDE_INTERVAL: 5000,
    SESSION_DURATION: 6 * 60 * 60 * 1000, // 6 hours

    // Storage Keys
    STORAGE_KEY: 'atst_db_v1',
    PROPS_KEY: 'atst_props_v1',
    SESSION_KEY: 'atst_session_v1',
    AUTH_USER_KEY: 'auth_user',
    AUTH_TOKEN_KEY: 'auth_token',

    // UI
    MOBILE_BREAKPOINT: 768,
    STICKY_NAVBAR_THRESHOLD: 50,
    SIDEBAR_WIDTH_EXPANDED: 280,
    SIDEBAR_WIDTH_COLLAPSED: 80,

    // Data Limits
    DEFAULT_ITEMS_LIMIT: 4,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

    // Permissions
    PERMISSIONS: {
        'dev': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings', 'view_dev_tools', 'manage_system'],
        'admin': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings'],
        'editor': ['view_dashboard', 'manage_events'],
        'user': ['view_dashboard']
    },

    // Status
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    },

    // Animation Durations
    ANIMATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500
    }
};
