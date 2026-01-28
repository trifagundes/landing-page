/**
 * LocalStorageDB - Emula o comportamento do Google Sheets + PropertiesService
 * Persistência local via localStorage
 */

const LocalStorageDB = (() => {
    const STORAGE_KEY = 'atst_db_v1';
    const PROPS_KEY = 'atst_props_v1';
    const SESSION_KEY = 'atst_session_v1';

    // Configurações iniciais (Baseado no INSTALL_CONFIG do code.js)
    const INITIAL_DATA = {
        events: [
            { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', title: '202 Anos: Fernando & Sorocaba e Revoada Cultural', date: '2026-07-29', porte: 'nacional', public: 40000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 50, revenueEstimate: 200000, languages: 'Música, Cultura Popular', image: 'https://scontent.fpoa2-1.fna.fbcdn.net/v/t39.30808-6/526941599_1099802145659821_2011634534119359604_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=tlfpp92iuT4Q7kNvwECH5GR&_nc_oc=AdkpX5J2X5cDU4nQKntIK3abmh0O0DhA1K5L8V4fZChcGDAAB7-Bqnc95VbJnY36R-8&_nc_zt=23&_nc_ht=scontent.fpoa2-1.fna&_nc_gid=B6N3Uzd-yj49mOVdYqFDLQ&oh=00_Afqz3fP4D9FLDYpa11AUrfOjva4mheJv6GRRqAYS4bEfSg&oe=697858D0', status: 'active', gallery: '["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3"]' },
            { id: '2c9d6bcd-ccfd-4b3d-9b6d-bc9dfbbd5cff', title: '201 Anos: Zezé Di Camargo', date: '2025-07-29', porte: 'nacional', public: 35000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 45, revenueEstimate: 180000, languages: 'Música', image: 'https://tchesaogabriel.com.br/images/noticias/1646/19065358_IMG_9637.jpeg', status: 'active', gallery: '["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"]' },
            { id: '3d9d6bcd-ddfd-4b4d-9b7d-cd0dfbbd6d00', title: 'Bicentenário (200 Anos): Raça Negra', date: '2023-07-29', porte: 'nacional', public: 50000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 60, revenueEstimate: 250000, languages: 'Música, Patrimônio', image: 'https://www.alegretetudo.com.br/wp-content/uploads/2023/07/alegretetudo-nos-200-anos-de-livramento-prefeitura-apresenta-raca-negra-em-praca-publica-raca-ele.jpg', status: 'active', gallery: '["https://www.alegretetudo.com.br/wp-content/uploads/2023/07/alegretetudo-nos-200-anos-de-livramento-prefeitura-apresenta-raca-negra-em-praca-publica-raca-ele.jpg"]' }
        ],
        users: [
            { id: '198305ff-1c73-4217-91a6-89617d91979b', name: 'Admin Master', email: 'admin@cultura.gov.br', phone: '912 345 678', role: 'admin', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', birthDate: '1985-05-15', status: 'active', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', forceReset: false },
            { id: '243a7566-3473-41f2-9844-e2af492572e9', name: 'Colaborador', email: 'user@cultura.pt', phone: '966 555 444', role: 'user', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', birthDate: '1990-10-20', status: 'active', password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', forceReset: false }
        ],
        testimonials: [
            { id: 'test-a1b2c3d4-e5f6-4a1b-9c3d-8e7f6a5b4c2d', author: 'João Silva', role: 'Visitante', text: 'O evento foi incrível, organização nota 10!', date: '2024-01-15', type: 'texto', videoUrl: '', imageUrl: '', context: 'evento', eventName: 'Bicentenário', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', status: 'active' }
        ],
        team: [
            { id: 'team-d4e5f6a1-b2c3-4d4e-2f6a-1b0c9d8e7f5a', name: 'Ana Luiza Moura Tarouco', position: 'Prefeita', email: 'gabinete@santana.rs.gov.br', bio: 'Delegada da Polícia Civil e primeira mulher eleita prefeita.', photo: 'https://scontent.fpoa2-1.fna.fbcdn.net/v/t39.30808-6/494352981_1241319994668081_8666884412925397847_n.jpg?stp=cp6_dst-jpg_p526x296_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MdjK_RmDzS4Q7kNvwE0XUDW&_nc_oc=AdkeUJWGC-aCOgT8UG3H0P3naSiQraV_nfcRjksK0wFcE5zHVo7j-804nOMTNXUZHh0&_nc_zt=23&_nc_ht=scontent.fpoa2-1.fna&_nc_gid=2YgX2W1vMBPGC3235YXZVg&oh=00_AfpsTZ0DzXcmoxsXIes5J1ior-Je4L0q7MMUEgcOfzVbgw&oe=69786944', highlight: true, status: 'active' }
        ],
        clipping: [
            { id: 'clip-b2c3d4e5-f6a1-4b2c-0d4e-9f8a7b6c5d3e', title: 'Santana investe 2 milhões em cultura e ganha destaque estadual', source: 'Diário Regional', date: '2024-03-15', url: '#', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c', status: 'active' }
        ]
    };

    // --- Core Methods ---

    const getFullDB = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            saveFullDB(INITIAL_DATA);
            return INITIAL_DATA;
        }
        return JSON.parse(data);
    };

    const saveFullDB = (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const getCollection = (name) => {
        const db = getFullDB();
        return db[name] || [];
    };

    const saveToCollection = (name, item, idField = 'id') => {
        const db = getFullDB();
        if (!db[name]) db[name] = [];
        
        let id = item[idField];
        if (!id) {
            id = crypto.randomUUID();
            item[idField] = id;
        }

        const index = db[name].findIndex(i => i[idField] === id);
        if (index !== -1) {
            db[name][index] = { ...db[name][index], ...item };
        } else {
            if (!item.createdAt) item.createdAt = new Date().toISOString();
            db[name].push(item);
        }

        saveFullDB(db);
        return item;
    };

    const removeFromCollection = (name, id, idField = 'id') => {
        const db = getFullDB();
        if (!db[name]) return false;
        db[name] = db[name].filter(i => i[idField] !== id);
        saveFullDB(db);
        return true;
    };

    // --- Properties Service Mock ---
    const getProperty = (key) => {
        const props = JSON.parse(localStorage.getItem(PROPS_KEY) || '{}');
        return props[key];
    };

    const setProperty = (key, value) => {
        const props = JSON.parse(localStorage.getItem(PROPS_KEY) || '{}');
        props[key] = value;
        localStorage.setItem(PROPS_KEY, JSON.stringify(props));
    };

    // --- Auth Helpers ---
    const computeHash = async (input) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const createSession = (user) => {
        const token = crypto.randomUUID();
        const sessionData = {
            token,
            user,
            expires: Date.now() + (6 * 60 * 60 * 1000) // 6 hours
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        return token;
    };

    const getSession = () => {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;
        const session = JSON.parse(data);
        if (Date.now() > session.expires) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    };

    const removeSession = () => {
        localStorage.removeItem(SESSION_KEY);
    };

    return {
        getCollection,
        saveToCollection,
        removeFromCollection,
        getProperty,
        setProperty,
        computeHash,
        createSession,
        getSession,
        removeSession,
        resetDB: () => saveFullDB(INITIAL_DATA)
    };
})();
