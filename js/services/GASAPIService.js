/**
 * GASAPIService.js
 * Serviço de comunicação com o backend Google Apps Script
 * Substitui a persistência local pelo Google Sheets
 */

window.GASAPIService = (() => {
    // ⚠️ CONFIGURAÇÃO: Substitua pela URL do seu Web App (Deploy > Nova implantação > Web App)
    // Exemplo: https://script.google.com/macros/s/AKfycbx.../exec
    const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2PXPhisYLfDbeY8icrovc9H-KMdDyi1aw6VQEG_y0X9BQvl7nZZg6Ghd4ujWnaJqS/exec';

    const TOKEN_KEY = 'auth_token_gas';
    const USER_KEY = 'auth_user_gas';
    const CACHE_KEY_PREFIX = 'gas_cache_';
    const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos de cache para leituras

    // ===== CAMADA DE CACHE (LocalStorage Temporário) =====
    const cache = {
        set(key, value) {
            try {
                const cacheData = { value, timestamp: Date.now() };
                localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
            } catch (e) { console.warn('Cache full', e); }
        },
        get(key) {
            const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
            if (!cached) return null;

            try {
                const { value, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp > CACHE_EXPIRY) {
                    localStorage.removeItem(CACHE_KEY_PREFIX + key);
                    return null;
                }
                return value;
            } catch (e) { return null; }
        },
        invalidate(key) {
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
        },
        clear() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        }
    };

    // ===== LÓGICA DE RETRY (Resiliência de Rede) =====
    async function retryFetch(url, options, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                });

                if (response.ok) {
                    return await response.json();
                }

                if (response.status === 401) {
                    window.GASAPIService.logout();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }

                if (response.status >= 500 && attempt < maxRetries) {
                    const backoff = Math.pow(2, attempt - 1) * 1000;
                    await new Promise(r => setTimeout(r, backoff));
                    continue;
                }

                const errorBody = await response.text();
                throw new Error(`API Error ${response.status}: ${errorBody}`);
            } catch (error) {
                if (attempt === maxRetries) throw error;
                const backoff = Math.pow(2, attempt - 1) * 1000;
                console.warn(`Tentativa ${attempt}/${maxRetries} falhou: ${error.message}. Retry em ${backoff}ms...`);
                await new Promise(r => setTimeout(r, backoff));
            }
        }
    }

    // ===== API PÚBLICA =====
    return {
        // --- Métodos Auxiliares ---
        async fetchAPI(action, data = {}) {
            try {
                const token = this.getToken();
                const body = { action, ...data };
                if (token) body.token = token;

                const response = await retryFetch(`${GAS_SCRIPT_URL}?action=${action}`, {
                    method: 'POST',
                    body: JSON.stringify(body)
                });
                return response;
            } catch (error) {
                console.error(`API call for action '${action}' failed:`, error);
                return { status: 'error', message: error.message || 'Erro de comunicação com o servidor.' };
            }
        },

        setSession(token, user) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            cache.clear();
        },

        // --- Autenticação ---
        async login(email, password) {
            const response = await this.fetchAPI('login', { email, password });
            if (response.status === 'success') {
                this.setSession(response.token, response.user);
                return { success: true, token: response.token, user: response.user };
            }
            if (response.requireReset) {
                return { success: false, requireReset: true, user: response.user };
            }
            return { success: false, message: response.message };
        },

        async registerUser(name, phone, email, password) {
            const response = await this.fetchAPI('registerUser', { name, phone, email, password });
            if (response.status === 'success') {
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        },

        async requestPasswordReset(email) {
            const response = await this.fetchAPI('requestPasswordReset', { email });
            if (response.status === 'success') {
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        },

        async changePasswordAndLogin(email, oldPassword, newPassword) {
            const response = await this.fetchAPI('changePasswordAndLogin', { email, oldPassword, newPassword });
            if (response.status === 'success') {
                this.setSession(response.token, response.user);
                return { success: true, token: response.token, user: response.user };
            }
            return { success: false, message: response.message };
        },

        logout() {
            const token = this.getToken();
            if (token) {
                fetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'logout', token })
                }).catch(() => { });
            }

            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            cache.clear();
        },

        getToken() { return localStorage.getItem(TOKEN_KEY); },
        getCurrentUser() {
            const u = localStorage.getItem(USER_KEY);
            return u ? JSON.parse(u) : null;
        },

        // --- Operações de Dados (CRUD) ---
        async list(collection) {
            const cached = cache.get(`list_${collection}`);
            if (cached) return cached;

            const token = this.getToken();
            const tokenQuery = (token && token !== 'null' && token !== 'undefined') ? `&token=${token}` : '';
            const response = await retryFetch(`${GAS_SCRIPT_URL}?action=getData&collection=${collection}${tokenQuery}`);

            if (response.status === 'success') {
                cache.set(`list_${collection}`, response.data);
                return response.data;
            }
            throw new Error(response.message || 'Erro ao carregar dados');
        },

        async save(collection, item) {
            const token = this.getToken();
            if (!token) throw new Error('Não autenticado');

            const response = await retryFetch(`${GAS_SCRIPT_URL}?action=saveData&collection=${collection}&token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveData', collection, item, token })
            });

            if (response.status === 'success') {
                cache.invalidate(`list_${collection}`);
                return response.item;
            }
            throw new Error(response.message || 'Erro ao salvar');
        },

        async delete(collection, id) {
            const token = this.getToken();
            if (!token) throw new Error('Não autenticado');

            const response = await retryFetch(`${GAS_SCRIPT_URL}?action=deleteData&collection=${collection}&token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteData', collection, id, token })
            });

            if (response.status === 'success') {
                cache.invalidate(`list_${collection}`);
                return true;
            }
            throw new Error(response.message || 'Erro ao deletar');
        },

        async bulkDelete(collection, ids) {
            const token = this.getToken();
            const response = await retryFetch(`${GAS_SCRIPT_URL}?action=bulkDelete&collection=${collection}&token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ action: 'bulkDelete', collection, ids, token })
            });

            if (response.status === 'success') {
                cache.invalidate(`list_${collection}`);
                return { success: true, count: response.deleted };
            }
            throw new Error(response.message);
        },

        async bulkUpdateStatus(collection, ids, status) {
            const token = this.getToken();
            const response = await retryFetch(`${GAS_SCRIPT_URL}?action=bulkStatus&collection=${collection}&token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ action: 'bulkStatus', collection, ids, status, token })
            });

            if (response.status === 'success') {
                cache.invalidate(`list_${collection}`);
                return { success: true };
            }
            throw new Error(response.message);
        },

        async getSystemInfo() {
            const token = this.getToken();
            if (!token) return null;
            try {
                const response = await retryFetch(`${GAS_SCRIPT_URL}?action=getSystemInfo&token=${token}`);
                if (response.status === 'success') return response;
                return response;
            } catch (e) { return null; }
        },

        clearCache() { cache.clear(); }
    };
})();