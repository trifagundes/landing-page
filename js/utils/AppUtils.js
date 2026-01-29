window.AppUtils = {
    isValidUrl(string) {
        try { new URL(string); return true; } catch (_) { return false; }
    },
    prompt(message, defaultValue) {
        return window.prompt(message, defaultValue);
    },
    getYoutubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },
    getYoutubeStartTime(url) {
        if (!url) return 0;
        const match = url.match(/[?&]t=([^&]+)/);
        if (!match) return 0;

        const timeStr = match[1];
        if (!isNaN(timeStr)) return parseInt(timeStr);

        let seconds = 0;
        const h = timeStr.match(/(\d+)h/);
        const m = timeStr.match(/(\d+)m/);
        const s = timeStr.match(/(\d+)s/);

        if (h) seconds += parseInt(h[1]) * 3600;
        if (m) seconds += parseInt(m[1]) * 60;
        if (s) seconds += parseInt(s[1]);

        return seconds > 0 ? seconds : 0;
    },
    resolveImageUrl(url) {
        if (!url) return '';
        const driveRegex = /https?:\/\/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/uc\?id=)([-a-zA-Z0-9_-]+)/;
        const driveMatch = url.match(driveRegex);
        if (driveMatch && driveMatch[1]) {
            return 'https://lh3.googleusercontent.com/d/' + driveMatch[1];
        }
        const imgurPageRegex = /^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/;
        if (imgurPageRegex.test(url)) {
            return url.replace(imgurPageRegex, 'https://i.imgur.com/$1.png');
        }
        return url;
    },
    applyTheme(themeKey) {
        const themes = window.ThemePresets;
        if (!themes || !themes[themeKey]) return;
        const theme = themes[themeKey];
        const root = document.documentElement;

        Object.keys(theme).forEach(key => {
            if (key === 'label') return;
            const cssVar = key.startsWith('slate') ? `--${key}` : `--${key}`;
            // Mapeamento direto das chaves do preset para variáveis CSS
            root.style.setProperty(`--${key}`, theme[key]);
        });

        console.log(`[Theme] Tema aplicado: ${theme.label}`);
    },
    applyDarkMode(isDark) {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        console.log(`[Theme] Dark Mode: ${isDark ? 'ON' : 'OFF'}`);
    },
    getBadgeColor(porte) {
        if (porte === 'nacional') return 'bg-primary';
        if (porte === 'regional') return 'bg-info';
        return 'bg-success';
    },
    getTestimonialStyle(testimonial) {
        if (!testimonial) return '';
        if (testimonial.type !== 'texto') {
            return 'text-sm md:text-base leading-relaxed italic opacity-90 text-left';
        }
        let classes = 'flex-1 flex items-center justify-center text-center italic opacity-95 ';
        const len = testimonial.text ? testimonial.text.length : 0;
        if (len < 60) classes += 'text-2xl md:text-3xl font-light leading-snug opacity-100 py-4';
        else if (len < 120) classes += 'text-xl md:text-2xl leading-relaxed py-2';
        else if (len < 250) classes += 'text-lg md:text-xl leading-relaxed';
        else classes += 'text-base leading-relaxed opacity-90';
        return classes;
    },
    async runBackend(funcName, ...args) {
        switch (funcName) {
            case 'getSystemInfo':
                if (window.GASAPIService && window.GASAPIService.getSystemInfo) {
                    return await window.GASAPIService.getSystemInfo();
                }
                return {
                    database: { status: 'disconnected', id: 'unknown', url: '#' },
                    drive: { status: 'disconnected', id: 'unknown', url: '#' },
                    env: { user: 'offline', scriptId: 'offline' }
                };
            case 'getAppUrl':
                return window.location.href;
            default:
                console.warn(`[AppUtils] Método ${funcName} não implementado ou movido para GASAPIService.`);
                return { success: false, message: `Método ${funcName} não disponível localmente.` };
        }
    }
};
