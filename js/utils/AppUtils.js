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
        const driveRegex = /https?:\/\/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/uc\?id=)([-a-zA-Z0-9]+)(?:\/view)?/;
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
        console.log(`[AppUtils] Executando ${funcName} localmente.`);

        switch (funcName) {
            case 'login':
                return await this._mockLogin(args[0], args[1]);
            case 'logout':
                LocalStorageDB.removeSession();
                return true;
            case 'getData':
                return LocalStorageDB.getCollection(args[1]);
            case 'saveData':
                return LocalStorageDB.saveToCollection(args[1], args[2], args[3] || 'id');
            case 'deleteData':
                return LocalStorageDB.removeFromCollection(args[1], args[2], args[3] || 'id');
            case 'getSystemInfo':
                return {
                    database: { status: 'local', id: 'localStorage', url: '#' },
                    drive: { status: 'local', id: 'localStorage', url: '#' },
                    env: { user: 'local@user', scriptId: 'offline' }
                };
            case 'getAppUrl':
                return window.location.href;
            case 'resetSystemDatabase':
                LocalStorageDB.resetDB();
                return { success: true, message: 'Banco de dados local resetado.' };
            default:
                console.warn(`[AppUtils] Método ${funcName} não implementado.`);
                return { success: false, message: `Método ${funcName} não implementado.` };
        }
    },
    async _mockLogin(email, password) {
        const users = LocalStorageDB.getCollection('users');
        const inputHash = await LocalStorageDB.computeHash(password);
        const userFound = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === inputHash &&
            u.status === 'active'
        );
        if (userFound) {
            const { password, ...userWithoutPassword } = userFound;
            const token = LocalStorageDB.createSession(userWithoutPassword);
            return { success: true, token, user: userWithoutPassword };
        }
        return { success: false, message: 'Credenciais inválidas.' };
    }
};
