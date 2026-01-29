/**
 * ============================================================
 * Code.gs - Google Apps Script Backend
 * API Completa com Autenticação, Permissões e Auditoria
 * ============================================================
 * 
 * CARACTERÍSTICAS:
 * ✅ Login com email/senha (hash SHA-256)
 * ✅ Token de sessão com expiração 24h
 * ✅ Controle de acesso por role (dev/admin/editor/user)
 * ✅ CRUD com validação de permissões
 * ✅ Auditoria completa em _logs
 * ✅ LockService anti-conflito
 * ✅ Headers CORS
 * ✅ Tratamento de erros robusto
 * 
 * ABAS OBRIGATÓRIAS NO GOOGLE SHEETS:
 * 1. users (id, email, name, phone, password_hash, role, status, photo)
 * 2. events (id, title, date, ...)
 * 3. testimonials, team, documents, clipping, oscs (suas coleções)
 * 4. _auth_tokens (email, token, role, expires_at)
 * 5. _logs (timestamp, user, action, collection, details)
 * 
 * ENDPOINTS:
 * GET  /?: Verifica se API está online
 * POST /?action=login (body: {email, password})
 * POST /?action=logout (body: {token})
 * GET  /?action=getData&collection=events&token=XXX
 * POST /?action=saveData&collection=events&token=XXX (body: {item})
 * POST /?action=deleteData&collection=events&token=XXX (body: {id})
 * POST /?action=bulkDelete&collection=events&token=XXX (body: {ids})
 * POST /?action=bulkStatus&collection=events&token=XXX (body: {ids, status})
 * 
 * DEPLOY:
 * 1. Copiar este código para Apps Script
 * 2. Substituir SPREADSHEET_ID pelo seu
 * 3. Deploy como Web App: Executar como "Você", Acessível a "Qualquer pessoa"
 * 4. Copiar URL de implantação para APP_CONFIG.GAS_SCRIPT_URL no frontend
 */

// ============================================================
// 1. CONFIGURAÇÃO
// ============================================================

// O ID da planilha é gerenciado dinamicamente via PropertiesService pela função getSpreadsheetId()

// Configuração de sessão
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

// Definição de roles e permissões
const ROLE_PERMISSIONS = {
    'dev': {
        read: ['*'],
        write: ['*'],
        delete: ['*'],
        canManageUsers: true,
        canViewLogs: true,
        canManageSystem: true
    },
    'admin': {
        read: ['*'],
        write: ['*'],
        delete: ['events', 'documents', 'testimonials'],
        canManageUsers: true,
        canViewLogs: true,
        canManageSystem: false
    },
    'editor': {
        read: ['*'],
        write: ['events', 'team', 'documents', 'testimonials', 'clipping'],
        delete: [],
        canManageUsers: false,
        canViewLogs: false,
        canManageSystem: false
    },
    'user': {
        read: ['*'],
        write: [],
        delete: [],
        canManageUsers: false,
        canViewLogs: false,
        canManageSystem: false
    },
    'guest': {
        read: ['events', 'testimonials', 'team', 'clipping', 'oscs'],
        write: [],
        delete: [],
        canManageUsers: false,
        canViewLogs: false,
        canManageSystem: false
    }
};

// Dados Iniciais para Reset de Fábrica (Sincronizado com LocalStorageDB.js)
const INITIAL_DATA = {
    events: [
        { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', title: '202 Anos: Fernando & Sorocaba e Revoada Cultural', date: '2026-07-29', porte: 'nacional', public: 40000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 50, revenueEstimate: 200000, languages: 'Música, Cultura Popular', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', status: 'active', gallery: '["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3"]' },
        { id: '2c9d6bcd-ccfd-4b3d-9b6d-bc9dfbbd5cff', title: '201 Anos: Zezé Di Camargo', date: '2025-07-29', porte: 'nacional', public: 35000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 45, revenueEstimate: 180000, languages: 'Música', image: 'https://tchesaogabriel.com.br/images/noticias/1646/19065358_IMG_9637.jpeg', status: 'active', gallery: '["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"]' },
        { id: '3d9d6bcd-ddfd-4b4d-9b7d-cd0dfbbd6d00', title: 'Bicentenário (200 Anos): Raça Negra', date: '2023-07-29', porte: 'nacional', public: 50000, foodArea: 'Largo Hugolino Andrade', vendorsCount: 60, revenueEstimate: 250000, languages: 'Música, Patrimônio', image: 'https://www.alegretetudo.com.br/wp-content/uploads/2023/07/alegretetudo-nos-200-anos-de-livramento-prefeitura-apresenta-raca-negra-em-praca-publica-raca-ele.jpg', status: 'active', gallery: '["https://www.alegretetudo.com.br/wp-content/uploads/2023/07/alegretetudo-nos-200-anos-de-livramento-prefeitura-apresenta-raca-negra-em-praca-publica-raca-ele.jpg"]' }
    ],
    users: [
        { id: '198305ff-1c73-4217-91a6-89617d91979b', name: 'Admin Master', email: 'admin@cultura.gov.br', phone: '912 345 678', role: 'dev', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', birthDate: '1985-05-15', status: 'active', salt: '', password_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' }, // senha: 123456
        { id: '243a7566-3473-41f2-9844-e2af492572e9', name: 'Colaborador', email: 'user@cultura.pt', phone: '966 555 444', role: 'user', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', birthDate: '1990-10-20', status: 'active', salt: '', password_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' }
    ],
    testimonials: [
        { id: 'test-a1b2c3d4-e5f6-4a1b-9c3d-8e7f6a5b4c2d', author: 'João Silva', role: 'Visitante', text: 'O evento foi incrível, organização nota 10!', date: '2024-01-15', type: 'texto', videoUrl: '', imageUrl: '', context: 'evento', eventName: 'Bicentenário', photo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', status: 'active' }
    ],
    team: [
        { id: 'team-d4e5f6a1-b2c3-4d4e-2f6a-1b0c9d8e7f5a', name: 'Ana Luiza Moura Tarouco', position: 'Prefeita', email: 'gabinete@santana.rs.gov.br', bio: 'Delegada da Polícia Civil e primeira mulher eleita prefeita.', photo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', highlight: true, status: 'active' }
    ],
    documents: [
        {
            id: 'doc-a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
            title: 'Certificado de Participação - Bicentenário',
            template: 'certificate',
            generatedAt: '2024-08-15T14:30:00.000Z',
            status: 'generated',
            templateData: JSON.stringify({ recipientName: 'João Silva', eventName: 'Bicentenário (200 Anos): Raça Negra', eventDate: '2023-07-29', hours: 8 }),
            notes: 'Certificado emitido para participante do evento comemorativo'
        }
    ],
    clipping: [
        { id: 'clip-b2c3d4e5-f6a1-4b2c-0d4e-9f8a7b6c5d3e', title: 'Santana investe 2 milhões em cultura e ganha destaque estadual', source: 'Diário Regional', date: '2024-03-15', url: '#', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c', status: 'active' }
    ],
    oscs: [
        {
            id: 'osc-1111-2222-3333',
            nome: 'Instituto Cultural Raízes do Pampa',
            cnpj: '12.345.678/0001-90',
            email: 'contato@raizespampa.org.br',
            telefone: '(55) 3242-1000',
            endereco: 'Rua das Camélias, 123, Centro, Santana do Livramento/RS',
            representante_nome: 'Carlos Eduardo Ferreira',
            representante_cpf: '123.456.789-00',
            representante_rg: '1098765432 SSP/RS',
            representante_cargo: 'Diretor Presidente',
            status: 'active'
        },
        {
            id: 'osc-4444-5555-6666',
            nome: 'Associação Educacional Mãos dadas',
            cnpj: '98.765.432/0001-10',
            email: 'secretaria@maosdadas.edu.br',
            telefone: '(55) 3243-2000',
            endereco: 'Av. João Belchior Goulart, 456, Armour, Santana do Livramento/RS',
            representante_nome: 'Mariana Santos Luz',
            representante_cpf: '987.654.321-99',
            representante_rg: '2030405060 SSP/RS',
            representante_cargo: 'Coordenadora Geral',
            status: 'active'
        }
    ]
};

// Helper para acesso centralizado ao DB (DRY)
function getDatabase() {
    return SpreadsheetApp.openById(getSpreadsheetId());
}

// ============================================================
// 2. ROTEAMENTO PRINCIPAL
// ============================================================

/**
 * Manipula requisições GET
 * Retorna dados de forma pública (sem autenticação obrigatória para leitura)
 */
function doGet(e) {
    try {
        // Se nenhuma ação, retorna Dashboard HTML (Gerenciamento)
        if (!e.parameter.action) {
            return getDashboardHtml();
        }

        const action = e.parameter.action;
        const collection = e.parameter.collection;
        const token = e.parameter.token;
        const id = e.parameter.id;

        // 1. GET System Info (Protegido - Requer Login Admin/Dev)
        if (action === 'getSystemInfo') {
            if (!token || token === 'null' || token === 'undefined') {
                return sendJSON({ status: 'error', message: 'ERRO_AUTH_01: Token não fornecido para SystemInfo' }, 401);
            }
            const session = validateSession(token);
            if (!session) {
                return sendJSON({ status: 'error', message: 'ERRO_AUTH_02: Sessão expirada ou inválida' }, 401);
            }
            return sendJSON(handleGetSystemInfo(token), 200);
        }

        // 2. GET Data (Público ou Privado)
        if (action === 'getData') {
            if (!collection) {
                return sendJSON({ status: 'error', message: 'ERRO_DATA_01: Parâmetro collection obrigatório' }, 400);
            }

            const PUBLIC_COLLECTIONS = ['events', 'testimonials', 'team', 'clipping', 'oscs'];
            
            let session = null;
            // Só tenta validar se houver um token que pareça real
            if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
                session = validateSession(token);
            }

            // Fallback: Se não tem sessão mas a coleção é pública, assume 'guest'
            if (!session && PUBLIC_COLLECTIONS.includes(collection)) {
                session = { role: 'guest', email: 'public' };
            } 
            
            // Se ainda não tem sessão (coleção privada ou token inválido), bloqueia
            if (!session) {
                return sendJSON({ status: 'error', message: 'ERRO_AUTH_03: Token obrigatório para esta coleção' }, 401);
            }

            // Valida permissão de leitura via ACL (ROLE_PERMISSIONS)
            if (!canAccess(session, 'read', collection)) {
                if (session.email !== 'public') logAction(session, 'PERMISSION_DENIED', collection, { action: 'read' });
                return sendJSON({ status: 'error', message: 'ERRO_ACL_01: Acesso negado para esta função' }, 403);
            }

            try {
                const data = getCollectionData(collection, id);
                if (session.email !== 'public') logAction(session, 'READ', collection, { count: data.length });
                return sendJSON({ status: 'success', data: data }, 200);
            } catch (err) {
                logError(err);
                return sendJSON({ status: 'error', message: 'ERRO_DB_01: ' + err.toString() }, 500);
            }
        }

        // 3. Outras ações GET
        if (action === 'getChanges') {
            const since = e.parameter.since;
            return sendJSON({ status: 'success', changes: handleGetChanges(since) }, 200);
        }

    } catch (err) {
        logError(err);
        return sendJSON({ status: 'error', message: 'ERRO_FATAL_01: ' + err.toString() }, 500);
    }
}

/**
 * Manipula requisições POST
 * Login, logout, criar, atualizar, deletar
 */
function doPost(e) {
    const lock = LockService.getScriptLock();
    
    try {
        // Tenta adquirir lock (30 segundos de timeout)
        lock.waitLock(30000);
    } catch (lockErr) {
        return sendJSON(
            { status: 'error', message: 'Servidor ocupado. Tente novamente.' },
            503
        );
    }

    try {
        const action = e.parameter.action;

        // Parsing do JSON do body
        let payload = null;
        if (e.postData && e.postData.contents) {
            try {
                payload = JSON.parse(e.postData.contents);
            } catch (jsonErr) {
                return sendJSON(
                    { status: 'error', message: 'JSON inválido no corpo da requisição' },
                    400
                );
            }
        }

        // ==================== AÇÕES SEM AUTENTICAÇÃO ====================

        // Login: email + password → token
        if (action === 'login') {
            if (!payload || !payload.email || !payload.password) {
                return sendJSON(
                    { status: 'error', message: 'Email e senha obrigatórios' },
                    400
                );
            }

            try {
                const result = handleLogin(payload.email, payload.password);
                logAction(
                    { email: payload.email, role: 'system' },
                    'LOGIN_SUCCESS',
                    'AUTH',
                    { userId: result.user.id }
                );
                return sendJSON(result, 200);
            } catch (err) {
                logAction(
                    { email: payload.email, role: 'system' },
                    'LOGIN_FAILED',
                    'AUTH',
                    { reason: err.toString() }
                );
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    401
                );
            }
        }

        // Register User (Public)
        if (action === 'registerUser') {
            if (!payload || !payload.email || !payload.password) {
                return sendJSON({ status: 'error', message: 'Dados incompletos' }, 400);
            }
            const result = handleRegisterUser(payload);
            return sendJSON(result, 200);
        }

        // Request Password Reset (Public)
        if (action === 'requestPasswordReset') {
            if (!payload || !payload.email) {
                return sendJSON({ status: 'error', message: 'Email obrigatório' }, 400);
            }
            // Simula envio de email ou gera log
            logAction({ email: payload.email, role: 'system' }, 'PASSWORD_RESET_REQUEST', 'AUTH', {});
            return sendJSON({ status: 'success', message: 'Se o email existir, as instruções serão enviadas.' }, 200);
        }

        // Change Password and Login (Public/Auth-transition)
        if (action === 'changePasswordAndLogin') {
            if (!payload || !payload.email || !payload.oldPassword || !payload.newPassword) {
                return sendJSON({ status: 'error', message: 'Dados incompletos para troca de senha' }, 400);
            }
            try {
                const result = handleChangePasswordAndLogin(payload.email, payload.oldPassword, payload.newPassword);
                return sendJSON(result, 200);
            } catch (err) {
                return sendJSON({ status: 'error', message: err.toString() }, 401);
            }
        }

        // ==================== AÇÕES COM AUTENTICAÇÃO ====================

        const token = e.parameter.token || (payload ? payload.token : null);

        // Logout: invalida token
        if (action === 'logout') {
            if (!token) return sendJSON({ status: 'error', message: 'Token obrigatório' }, 401);
            const session = validateSession(token);
            if (!session) return sendJSON({ status: 'error', message: 'Token inválido' }, 401);
            try {
                invalidateToken(token);
                logAction(session, 'LOGOUT', 'AUTH', {});
                return sendJSON(
                    { status: 'success', message: 'Logout realizado' },
                    200
                );
            } catch (err) {
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    500
                );
            }
        }

        const collection = e.parameter.collection;
        if (!collection) {
            return sendJSON(
                { status: 'error', message: 'Parâmetro collection obrigatório' },
                400
            );
        }

        // Save: criar ou atualizar
        if (action === 'saveData') {
            if (!token) return sendJSON({ status: 'error', message: 'Token obrigatório' }, 401);
            const session = validateSession(token);
            if (!session) return sendJSON({ status: 'error', message: 'Token inválido' }, 401);

            if (!payload || !payload.item) {
                return sendJSON(
                    { status: 'error', message: 'Payload.item obrigatório' },
                    400
                );
            }

            // Valida permissão de escrita
            if (!canAccess(session, 'write', collection)) {
                logAction(session, 'PERMISSION_DENIED', collection, { action: 'write' });
                return sendJSON(
                    { status: 'error', message: 'Acesso negado' },
                    403
                );
            }

            try {
                const result = handleSaveData(collection, payload.item);
                logAction(session, 'SAVE', collection, { id: result.item.id });
                SpreadsheetApp.flush();
                return sendJSON(result, 200);
            } catch (err) {
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    500
                );
            }
        }

        // Delete: remover um item
        if (action === 'deleteData') {
            if (!payload || !payload.id) {
                return sendJSON(
                    { status: 'error', message: 'Payload.id obrigatório' },
                    400
                );
            }

            // Valida permissão de deleção
            if (!canAccess(session, 'delete', collection)) {
                logAction(session, 'PERMISSION_DENIED', collection, { action: 'delete' });
                return sendJSON(
                    { status: 'error', message: 'Acesso negado' },
                    403
                );
            }

            try {
                const result = handleDeleteData(collection, payload.id);
                logAction(session, 'DELETE', collection, { id: payload.id });
                SpreadsheetApp.flush();
                return sendJSON(result, 200);
            } catch (err) {
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    500
                );
            }
        }

        // Bulk Delete: remover múltiplos
        if (action === 'bulkDelete') {
            if (!payload || !payload.ids || !Array.isArray(payload.ids)) {
                return sendJSON(
                    { status: 'error', message: 'Payload.ids (array) obrigatório' },
                    400
                );
            }

            if (!canAccess(session, 'delete', collection)) {
                logAction(session, 'PERMISSION_DENIED', collection, { action: 'bulkDelete' });
                return sendJSON(
                    { status: 'error', message: 'Acesso negado' },
                    403
                );
            }

            try {
                const result = handleBulkDelete(collection, payload.ids);
                logAction(session, 'BULK_DELETE', collection, { count: payload.ids.length });
                SpreadsheetApp.flush();
                return sendJSON(result, 200);
            } catch (err) {
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    500
                );
            }
        }

        // Bulk Status: atualizar status de múltiplos
        if (action === 'bulkStatus') {
            if (!payload || !payload.ids || !payload.status) {
                return sendJSON(
                    { status: 'error', message: 'Payload.ids e Payload.status obrigatórios' },
                    400
                );
            }

            if (!canAccess(session, 'write', collection)) {
                logAction(session, 'PERMISSION_DENIED', collection, { action: 'bulkStatus' });
                return sendJSON(
                    { status: 'error', message: 'Acesso negado' },
                    403
                );
            }

            try {
                const result = handleBulkStatus(collection, payload.ids, payload.status);
                logAction(session, 'BULK_STATUS', collection, 
                    { count: payload.ids.length, status: payload.status });
                SpreadsheetApp.flush();
                return sendJSON(result, 200);
            } catch (err) {
                return sendJSON(
                    { status: 'error', message: err.toString() },
                    500
                );
            }
        }

        return sendJSON(
            { status: 'error', message: 'Ação desconhecida' },
            400
        );

    } catch (err) {
        logError(err);
        return sendJSON(
            { status: 'error', message: err.toString() },
            500
        );
    } finally {
        lock.releaseLock();
    }
}

/**
 * Manipula preflight requests do navegador (CORS OPTIONS)
 */
function doOptions(e) {
    return ContentService.createTextOutput('');
}

// ============================================================
// 3. AUTENTICAÇÃO & SESSÃO
// ============================================================

/**
 * Manipula login com email e senha
 * Retorna token + dados do usuário
 */
function handleLogin(email, password) {
    checkRateLimit(email); // Proteção contra Brute Force

    const ss = getDatabase();
    const usersSheet = ss.getSheetByName('users');
    
    if (!usersSheet) {
        throw new Error('Aba "users" não encontrada');
    }

    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];

    // Encontra índices das colunas
    const emailIdx = headers.indexOf('email');
    const passwordHashIdx = headers.indexOf('password_hash');
    const roleIdx = headers.indexOf('role');
    const statusIdx = headers.indexOf('status');
    const saltIdx = headers.indexOf('salt');

    if (emailIdx === -1 || passwordHashIdx === -1) {
        throw new Error('Colunas "email" ou "password_hash" não encontradas em users');
    }

    // Busca usuário por email
    let userFound = null;
    let userRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][emailIdx]).trim() === email.trim()) {
            userFound = data[i];
            userRowIndex = i;
            break;
        }
    }

    if (!userFound) {
        incrementRateLimit(email);
        throw new Error('Email ou senha inválidos');
    }

    // Verifica se usuário está ativo
    if (statusIdx !== -1 && userFound[statusIdx] !== 'active') {
        incrementRateLimit(email);
        throw new Error('Usuário inativo');
    }

    // Valida senha (hash SHA-256 com Salt)
    const salt = (saltIdx !== -1 && userFound[saltIdx]) ? userFound[saltIdx] : '';
    const passwordHash = computeHash(password, salt);
    
    if (!secureCompare(passwordHash, userFound[passwordHashIdx])) {
        incrementRateLimit(email);
        throw new Error('Email ou senha inválidos');
    }

    // Gera token único
    const token = Utilities.getUuid();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Salva token em _auth_tokens
    const tokensSheet = ss.getSheetByName('_auth_tokens');
    if (!tokensSheet) {
        throw new Error('Aba "_auth_tokens" não encontrada');
    }

    tokensSheet.appendRow([
        email,
        token,
        userFound[roleIdx] || 'user',
        expiresAt.toISOString()
    ]);

    clearRateLimit(email); // Sucesso limpa o contador

    // Retorna token + dados do usuário (SEM password_hash!)
    return {
        status: 'success',
        token: token,
        user: {
            id: userFound[0],
            email: userFound[emailIdx],
            name: userFound[headers.indexOf('name')] || '',
            role: userFound[roleIdx] || 'user',
            photo: userFound[headers.indexOf('photo')] || ''
        }
    };
}

/**
 * Valida se token é válido e não expirou
 * Retorna { email, role } se válido, null se inválido
 */
function validateSession(token) {
    const ss = getDatabase();
    const tokensSheet = ss.getSheetByName('_auth_tokens');

    if (!tokensSheet) {
        return null;
    }

    const data = tokensSheet.getDataRange().getValues();
    const headers = data[0];

    const emailIdx = headers.indexOf('email');
    const tokenIdx = headers.indexOf('token');
    const roleIdx = headers.indexOf('role');
    const expiresAtIdx = headers.indexOf('expires_at');

    // Procura token
    for (let i = 1; i < data.length; i++) {
        if (data[i][tokenIdx] === token) {
            // Verifica expiração
            const expiresAt = new Date(data[i][expiresAtIdx]);
            if (expiresAt > new Date()) {
                return {
                    email: data[i][emailIdx],
                    role: data[i][roleIdx],
                    token: token,
                    expiresAt: expiresAt
                };
            } else {
                // Token expirou, remove
                tokensSheet.deleteRow(i + 1);
                return null;
            }
        }
    }

    return null;
}

/**
 * Invalida um token (remove de _auth_tokens)
 */
function invalidateToken(token) {
    const ss = getDatabase();
    const tokensSheet = ss.getSheetByName('_auth_tokens');

    if (!tokensSheet) {
        throw new Error('Aba "_auth_tokens" não encontrada');
    }

    const data = tokensSheet.getDataRange().getValues();
    const tokenIdx = data[0].indexOf('token');

    for (let i = 1; i < data.length; i++) {
        if (data[i][tokenIdx] === token) {
            tokensSheet.deleteRow(i + 1);
            return;
        }
    }
}

/**
 * Calcula hash SHA-256 de um string
 */
function computeHash(input, salt = '') {
    const digest = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        input + salt
    );
    return digest
        .map(b => (b < 0 ? 256 + b : b).toString(16).padStart(2, '0'))
        .join('');
}

// ============================================================
// 4. CONTROLE DE ACESSO
// ============================================================

/**
 * Verifica se usuário tem permissão para ação em coleção
 */
function canAccess(session, action, collection) {
    // Nunca permitir acesso direto a abas sensíveis
    if (collection === '_auth_tokens' || collection === '_logs') {
        return session.role === 'dev';
    }

    const rolePerms = ROLE_PERMISSIONS[session.role];
    if (!rolePerms) {
        return false;
    }

    const allowedCollections = rolePerms[action];
    if (!allowedCollections) {
        return false;
    }

    // Verifica se inclui wildcard '*' ou coleção específica
    return allowedCollections.includes('*') || allowedCollections.includes(collection);
}

// ============================================================
// 5. OPERAÇÕES CRUD
// ============================================================

/**
 * Retorna dados de uma coleção
 */
function getCollectionData(collectionName, idFilter) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(collectionName);

    if (!sheet) {
        throw new Error(`Coleção "${collectionName}" não encontrada`);
    }

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) {
        return [];
    }

    const headers = data[0];
    const rows = data.slice(1);

    const result = rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            const key = header.trim();
            if (key !== 'password_hash' && key !== 'salt') {
                obj[key] = row[i];
            }
        });
        return obj;
    });

    // Filtra por ID se fornecido
    if (idFilter) {
        const idKey = headers[0].trim();
        return result.filter(item => String(item[idKey]) === String(idFilter));
    }

    return result;
}

/**
 * Salva ou atualiza um item em uma coleção
 */
function handleSaveData(collectionName, item) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(collectionName);

    if (!sheet) {
        throw new Error(`Coleção "${collectionName}" não encontrada`);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Gera ID se não existir
    if (!item.id) {
        item.id = Utilities.getUuid();
    }

    // Procura linha existente
    let foundRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(item.id)) {
            foundRowIndex = i;
            break;
        }
    }

    // Prepara valores para inserção
    const values = headers.map((header, idx) => {
        const key = header.trim();
        if (key === 'id' && !foundRowIndex) {
            return item.id;
        }
        let val = (item[key] !== undefined) ? item[key] : (foundRowIndex !== -1 ? data[foundRowIndex][idx] : '');
        
        const sanitized = sanitizeForSheets(val); // Proteção contra Formula Injection
        
        // Atualiza o item de retorno com o valor sanitizado para refletir o que foi salvo
        if (item[key] !== undefined) {
            item[key] = sanitized;
        }
        
        return sanitized;
    });

    if (foundRowIndex !== -1) {
        // Update
        sheet.getRange(foundRowIndex + 1, 1, 1, headers.length).setValues([values]);
    } else {
        // Insert
        sheet.appendRow(values);
    }

    return {
        status: 'success',
        action: foundRowIndex !== -1 ? 'update' : 'create',
        item: item
    };
}

/**
 * Deleta um item de uma coleção
 */
function handleDeleteData(collectionName, id) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(collectionName);

    if (!sheet) {
        throw new Error(`Coleção "${collectionName}" não encontrada`);
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
            sheet.deleteRow(i + 1);
            return {
                status: 'success',
                action: 'delete',
                id: id
            };
        }
    }

    throw new Error('Item não encontrado');
}

/**
 * Deleta múltiplos itens
 */
function handleBulkDelete(collectionName, ids) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(collectionName);

    if (!sheet) {
        throw new Error(`Coleção "${collectionName}" não encontrada`);
    }

    const data = sheet.getDataRange().getValues();
    let deletedCount = 0;

    // Itera de trás para frente para não perder índices
    for (let i = data.length - 1; i >= 1; i--) {
        if (ids.includes(String(data[i][0]))) {
            sheet.deleteRow(i + 1);
            deletedCount++;
        }
    }

    return {
        status: 'success',
        action: 'bulkDelete',
        deleted: deletedCount
    };
}

/**
 * Atualiza status de múltiplos itens
 */
function handleBulkStatus(collectionName, ids, status) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(collectionName);

    if (!sheet) {
        throw new Error(`Coleção "${collectionName}" não encontrada`);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusIdx = headers.indexOf('status');

    if (statusIdx === -1) {
        throw new Error(`Coleção "${collectionName}" não tem coluna "status"`);
    }

    let updatedCount = 0;

    for (let i = 1; i < data.length; i++) {
        if (ids.includes(String(data[i][0]))) {
            sheet.getRange(i + 1, statusIdx + 1).setValue(status);
            updatedCount++;
        }
    }

    return {
        status: 'success',
        action: 'bulkStatus',
        updated: updatedCount
    };
}

// ============================================================
// 6. EXTENDED HANDLERS (New Features)
// ============================================================

/**
 * Registra um novo usuário
 */
function handleRegisterUser(payload) {
    const ss = getDatabase();
    const usersSheet = ss.getSheetByName('users');
    
    if (!usersSheet) throw new Error('Aba users não encontrada');
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    
    // Verificar duplicidade
    for (let i = 1; i < data.length; i++) {
        if (data[i][emailIdx] === payload.email) {
            throw new Error('Email já cadastrado');
        }
    }
    
    const salt = Utilities.getUuid();
    // Criar usuário
    const newUser = {
        id: Utilities.getUuid(),
        email: sanitizeForSheets(payload.email),
        name: sanitizeForSheets(payload.name || ''),
        phone: sanitizeForSheets(payload.phone || ''),
        salt: salt,
        password_hash: computeHash(payload.password, salt),
        role: 'user', // Default role
        status: 'active',
        photo: ''
    };
    
    const values = headers.map(h => newUser[h] !== undefined ? newUser[h] : '');
    usersSheet.appendRow(values);
    
    return { status: 'success', message: 'Usuário cadastrado com sucesso' };
}

/**
 * Altera senha e realiza login
 */
function handleChangePasswordAndLogin(email, oldPassword, newPassword) {
    // 1. Verificar credenciais antigas
    const loginResult = handleLogin(email, oldPassword);
    
    // 2. Atualizar senha
    const ss = getDatabase();
    const usersSheet = ss.getSheetByName('users');
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    const passIdx = headers.indexOf('password_hash');
    const saltIdx = headers.indexOf('salt');
    
    let userRow = -1;
    for (let i = 1; i < data.length; i++) {
        if (data[i][emailIdx] === email) {
            userRow = i + 1;
            break;
        }
    }
    
    if (userRow === -1) throw new Error('Usuário não encontrado para atualização');
    
    const newSalt = Utilities.getUuid();
    const newHash = computeHash(newPassword, newSalt);
    
    usersSheet.getRange(userRow, passIdx + 1).setValue(newHash);
    if (saltIdx !== -1) {
        usersSheet.getRange(userRow, saltIdx + 1).setValue(newSalt);
    }
    
    // 3. Retornar novo token (loginResult já tem um token novo gerado pelo handleLogin, 
    // mas como mudamos a senha, é bom garantir que o login seja válido para a nova senha.
    // Na verdade, o handleLogin já gerou o token validando a senha ANTIGA.
    // O fluxo correto seria validar antiga -> trocar -> gerar token.
    // Como handleLogin já gera token, podemos reutilizá-lo ou gerar outro.
    // Vamos retornar o do handleLogin pois a sessão é válida.)
    
    return {
        status: 'success',
        token: loginResult.token,
        user: loginResult.user
    };
}

/**
 * Retorna os últimos logs do sistema (Admin/Dev)
 */
function handleGetLogs(token, limit) {
    limit = limit || 50;
    const session = validateSession(token);
    
    if (!session || !ROLE_PERMISSIONS[session.role] || !ROLE_PERMISSIONS[session.role].canViewLogs) {
        throw new Error('Acesso negado: Permissão insuficiente');
    }

    const ss = getDatabase();
    const logsSheet = ss.getSheetByName('_logs');
    if (!logsSheet) return [];

    const lastRow = logsSheet.getLastRow();
    if (lastRow < 2) return [];

    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;

    const data = logsSheet.getRange(startRow, 1, numRows, 5).getValues();
    
    return data.reverse().map(row => ({
        timestamp: row[0],
        user: row[1],
        action: row[2],
        collection: row[3],
        details: row[4]
    }));
}

/**
 * Retorna informações do sistema
 */
function handleGetSystemInfo(token) {
    // Proteção: Exige token válido (seja via API ou Dashboard)
    if (!token || !validateSession(token)) throw new Error('Acesso negado: Sessão inválida');

    try {
        const id = getSpreadsheetId();
        const ss = getDatabase();
        
        // Recupera informações da pasta (Drive)
        const file = DriveApp.getFileById(id);
        const parents = file.getParents();
        const folder = parents.hasNext() ? parents.next() : null;

        return {
            status: 'success',
            database: {
                status: 'connected',
                name: ss.getName(),
                url: ss.getUrl()
            },
            drive: {
                status: 'connected',
                name: folder ? folder.getName() : 'Root',
                url: folder ? folder.getUrl() : '#'
            },
            env: {
                type: 'production' // GAS is always prod-like
            }
        };
    } catch (e) {
        return {
            status: 'error',
            database: { status: 'disconnected' },
            drive: { status: 'disconnected' }
        };
    }
}

/**
 * Retorna mudanças desde uma data (Sync)
 */
function handleGetChanges(since) {
    if (!since) return [];
    
    const ss = getDatabase();
    const logsSheet = ss.getSheetByName('_logs');
    if (!logsSheet) return [];
    
    const data = logsSheet.getDataRange().getValues();
    const sinceDate = new Date(since);
    
    // Filtra logs relevantes (SAVE, DELETE, BULK_*)
    return data.slice(1).filter(row => {
        const timestamp = new Date(row[0]);
        const action = row[2];
        return timestamp > sinceDate && ['SAVE', 'DELETE', 'BULK_DELETE', 'BULK_STATUS'].includes(action);
    }).map(row => ({
        timestamp: row[0],
        user: row[1],
        action: row[2],
        collection: row[3],
        details: JSON.parse(row[4] || '{}')
    }));
}

/**
 * Reseta o banco de dados para o estado inicial
 */
function handleResetSystemDatabase(session) {
    const ss = getDatabase();
    const collections = Object.keys(INITIAL_DATA);
    
    collections.forEach(collection => {
        let sheet = ss.getSheetByName(collection);
        
        // Se a aba não existir, cria
        if (!sheet) {
            sheet = ss.insertSheet(collection);
        } else {
            // Limpa tudo
            sheet.clear();
        }
        
        const items = INITIAL_DATA[collection];
        if (items.length === 0) return;
        
        // Determina headers baseados no primeiro item
        // Nota: Em produção idealmente teríamos um SCHEMA fixo, mas aqui inferimos dos dados
        const headers = Object.keys(items[0]);
        
        // Adiciona headers
        sheet.appendRow(headers);
        
        // Adiciona dados
        items.forEach(item => {
            const row = headers.map(h => item[h] !== undefined ? item[h] : '');
            sheet.appendRow(row);
        });
    });
    
    logAction(session, 'SYSTEM_RESET', 'ALL', { collections: collections.length });
    return { status: 'success', message: 'Banco de dados resetado com sucesso.' };
}

// ============================================================
// 6. AUDITORIA & LOGGING
// ============================================================

/**
 * Registra ação em _logs
 */
function logAction(session, action, collection, details) {
    try {
        const ss = getDatabase();
        const logsSheet = ss.getSheetByName('_logs');

        if (!logsSheet) {
            return; // Se não existir aba de logs, ignora silenciosamente
        }

        logsSheet.appendRow([
            new Date().toISOString(),
            session.email || 'SYSTEM',
            action,
            collection,
            JSON.stringify(details || {})
        ]);
    } catch (err) {
        // Não fa lha a requisição se log falhar
        console.error('Erro ao registrar log:', err);
    }
}

/**
 * Registra erro no _logs
 */
function logError(error) {
    try {
        const ss = getDatabase();
        const logsSheet = ss.getSheetByName('_logs');

        if (!logsSheet) {
            return;
        }

        logsSheet.appendRow([
            new Date().toISOString(),
            'SYSTEM_ERROR',
            'ERROR',
            error.name || 'Unknown',
            error.message || error.toString()
        ]);
    } catch (err) {
        console.error('Erro ao registrar erro:', err);
    }
}

// ============================================================
// 7. UTILITIES
// ============================================================

/**
 * Envia resposta JSON com headers apropriados
 */
function sendJSON(content, statusCode) {
    const output = ContentService.createTextOutput(JSON.stringify(content));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

/**
 * Sanitiza valores para prevenir Formula Injection no Google Sheets
 * Adiciona um apóstrofo se começar com =, +, -, @
 */
function sanitizeForSheets(value) {
    if (typeof value === 'string' && /^[\=\+\-\@]/.test(value)) {
        return "'" + value;
    }
    return value;
}

/**
 * Verifica Rate Limit para login (Brute Force Protection)
 */
function checkRateLimit(email) {
    const cache = CacheService.getScriptCache();
    const key = 'login_attempts_' + email;
    const attempts = Number(cache.get(key) || 0);
    
    if (attempts >= 5) {
        throw new Error('Muitas tentativas falhas. Tente novamente em 15 minutos.');
    }
}

function incrementRateLimit(email) {
    const cache = CacheService.getScriptCache();
    const key = 'login_attempts_' + email;
    const attempts = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(attempts), 900); // 15 min
}

function clearRateLimit(email) {
    const cache = CacheService.getScriptCache();
    cache.remove('login_attempts_' + email);
}

/**
 * Compara duas strings em tempo constante para evitar Timing Attacks
 */
function secureCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

// ============================================================
// 8. TESTES & DIAGNÓSTICO
// ============================================================

/**
 * Executa uma bateria de testes unitários e de integração
 * Verifique o menu "Execuções" ou "Logger" para ver os resultados
 */
function runTests() {
    Logger.log('🚀 INICIANDO SUITE DE TESTES...');
    
    const results = { passed: 0, failed: 0 };
    
    function assert(desc, condition) {
        if (condition) {
            Logger.log(`✅ PASS: ${desc}`);
            results.passed++;
        } else {
            Logger.log(`❌ FAIL: ${desc}`);
            results.failed++;
        }
    }

    try {
        // 1. Teste de Hashing
        Logger.log('\n--- 1. Criptografia ---');
        const hash1 = computeHash('123456', 'salt');
        const hash2 = computeHash('123456', 'salt');
        assert('Hash é determinístico', hash1 === hash2);
        assert('Hash tem comprimento SHA-256 (64 chars)', hash1.length === 64);

        // 2. Teste de Permissões (Lógica em Memória)
        Logger.log('\n--- 2. Controle de Acesso (ACL) ---');
        
        const dev = { role: 'dev' };
        const admin = { role: 'admin' };
        const editor = { role: 'editor' };
        const user = { role: 'user' };

        assert('Dev pode deletar tudo', canAccess(dev, 'delete', 'any_collection'));
        assert('Admin pode deletar events', canAccess(admin, 'delete', 'events'));
        assert('Admin NÃO pode deletar logs', canAccess(admin, 'delete', '_logs') === false);
        assert('Editor pode escrever events', canAccess(editor, 'write', 'events'));
        assert('Editor NÃO pode deletar events', canAccess(editor, 'delete', 'events') === false);
        assert('User pode ler', canAccess(user, 'read', 'events'));
        assert('User NÃO pode escrever', canAccess(user, 'write', 'events') === false);

        // 3. Teste de Conexão com Planilha
        Logger.log('\n--- 3. Conectividade ---');
        try {
            const ss = getDatabase();
            assert('Planilha acessível', true);
            Logger.log(`   Nome da Planilha: ${ss.getName()}`);
        } catch (e) {
            Logger.log(`⚠️ AVISO: Não foi possível conectar à planilha. Verifique SPREADSHEET_ID. (${e.message})`);
        }

    } catch (e) {
        Logger.log(`💥 ERRO FATAL: ${e.message}`);
    }

    Logger.log('\n=== RESUMO ===');
    Logger.log(`Passou: ${results.passed} | Falhou: ${results.failed}`);
}

function testConnection() {
    const result = handleGetSystemInfo();
    Logger.log('System Info: ' + JSON.stringify(result));
    return result;
}

// ============================================================
// 9. DASHBOARD HTML (Index)
// ============================================================

/**
 * Gera o Dashboard HTML para gerenciamento e verificação
 */
function getDashboardHtml() {
    return HtmlService.createTemplateFromFile('apiadmin')
        .evaluate()
        .setTitle('Cultura Viva - Backend Status')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


// ============================================================
// 10. INSTALAÇÃO & SETUP AUTOMÁTICO
// ============================================================

/**
 * Recupera o ID da planilha do PropertiesService.
 * Se não existir, inicia a instalação do sistema.
 */
function getSpreadsheetId() {
    const props = PropertiesService.getScriptProperties();
    let id = props.getProperty('SPREADSHEET_ID');
    
    if (!id) {
        Logger.log('⚠️ ID da planilha não encontrado. Iniciando instalação...');
        id = installSystem();
    }
    
    return id;
}

/**
 * Cria a estrutura de pastas e planilhas no Google Drive
 */
function installSystem() {
    try {
        // 1. Criar ou encontrar pasta
        const folderName = "Cultura Viva App";
        const folders = DriveApp.getFoldersByName(folderName);
        let folder;
        
        if (folders.hasNext()) {
            folder = folders.next();
        } else {
            folder = DriveApp.createFolder(folderName);
        }
        
        // 2. Criar Planilha
        const ss = SpreadsheetApp.create("Cultura Viva Database");
        const file = DriveApp.getFileById(ss.getId());
        file.moveTo(folder); // Move para a pasta correta
        
        // 3. Criar Abas de Dados (Baseado em INITIAL_DATA)
        const collections = Object.keys(INITIAL_DATA);
        
        collections.forEach(collection => {
            const sheet = ss.insertSheet(collection);
            const items = INITIAL_DATA[collection];
            
            if (items.length > 0) {
                const headers = Object.keys(items[0]);
                sheet.appendRow(headers);
                items.forEach(item => {
                    const row = headers.map(h => item[h] !== undefined ? item[h] : '');
                    sheet.appendRow(row);
                });
            }
        });
        
        // Remove a 'Página1' padrão (agora que já existem outras abas)
        const sheets = ss.getSheets();
        const defaultSheet = sheets[0];
        if (sheets.length > 1 && !collections.includes(defaultSheet.getName())) {
            ss.deleteSheet(defaultSheet);
        }
        
        // 4. Criar Abas de Sistema (_auth_tokens, _logs)
        const authSheet = ss.insertSheet('_auth_tokens');
        authSheet.appendRow(['email', 'token', 'role', 'expires_at']);
        
        const logsSheet = ss.insertSheet('_logs');
        logsSheet.appendRow(['timestamp', 'user', 'action', 'collection', 'details']);
        
        // 5. Salvar ID nas Propriedades do Script
        PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
        
        Logger.log(`✅ Instalação concluída! ID: ${ss.getId()}`);
        return ss.getId();
        
    } catch (e) {
        Logger.log(`❌ Erro na instalação: ${e.toString()}`);
        throw new Error('Falha crítica na instalação do sistema: ' + e.toString());
    }
}

// ============================================================
// 11. FUNÇÕES AUXILIARES PARA O DASHBOARD
// ============================================================

/**
 * Executa diagnósticos e retorna relatório em texto para o frontend
 */
function handleRunDiagnostics(token) {
    let logBuffer = [];
    const log = (msg) => logBuffer.push(msg);

    const session = validateSession(token);
    if (!session || !['dev', 'admin'].includes(session.role)) {
        return '❌ ACESSO NEGADO: Requer permissão de Admin ou Dev.';
    }
    
    log('🚀 INICIANDO DIAGNÓSTICO DO SISTEMA...\n');
    const results = { passed: 0, failed: 0 };
    
    function assert(desc, condition) {
        if (condition) {
            log(`✅ PASS: ${desc}`);
            results.passed++;
        } else {
            log(`❌ FAIL: ${desc}`);
            results.failed++;
        }
    }

    try {
        const id = getSpreadsheetId();
        const ss = getDatabase();
        
        log('--- 1. Conectividade ---');
        assert('Planilha acessível', true);
        log(`   Nome: ${ss.getName()}`);
        
        log('\n--- 2. Estrutura de Dados ---');
        const required = ['users', 'events', '_auth_tokens', '_logs'];
        required.forEach(req => {
            const exists = ss.getSheetByName(req);
            assert(`Aba '${req}' existe`, !!exists);
        });

    } catch (e) {
        log(`💥 ERRO CRÍTICO: ${e.message}`);
    }

    log('\n=== RESUMO ===');
    log(`Passou: ${results.passed} | Falhou: ${results.failed}`);
    
    return logBuffer.join('\n');
}

/**
 * Testa as rotas da API simulando operações CRUD
 */
function handleTestApiRoutes(token) {
    let logBuffer = [];
    const log = (msg) => logBuffer.push(msg);
    
    const session = validateSession(token);
    if (!session || !['dev', 'admin'].includes(session.role)) {
        return '❌ ACESSO NEGADO: Requer permissão de Admin ou Dev.';
    }

    log('🚀 INICIANDO TESTE DE ROTAS (CRUD)...\n');
    
    const testId = 'test-route-' + Date.now();
    const collection = 'events'; // Usando events como alvo de teste
    
    try {
        // 1. CREATE
        log('1. Testando CREATE (handleSaveData)...');
        const newItem = { id: testId, title: 'Item de Teste API', status: 'test' };
        const saveRes = handleSaveData(collection, newItem);
        if (saveRes.status === 'success' && saveRes.item.id === testId) {
            log('✅ CREATE Sucesso');
        } else {
            throw new Error('Falha no CREATE: ' + JSON.stringify(saveRes));
        }

        // 2. READ
        log('2. Testando READ (getCollectionData)...');
        const items = getCollectionData(collection, testId);
        if (items.length === 1 && items[0].title === 'Item de Teste API') {
             log('✅ READ Sucesso');
        } else {
             throw new Error('Falha no READ. Item não encontrado ou incorreto.');
        }

        // 3. UPDATE
        log('3. Testando UPDATE (handleSaveData)...');
        const updateItem = { id: testId, title: 'Item de Teste ATUALIZADO', status: 'test' };
        const updateRes = handleSaveData(collection, updateItem);
        if (updateRes.status === 'success' && updateRes.item.title === 'Item de Teste ATUALIZADO') {
            log('✅ UPDATE Sucesso');
        } else {
            throw new Error('Falha no UPDATE: ' + JSON.stringify(updateRes));
        }

        // 4. DELETE
        log('4. Testando DELETE (handleDeleteData)...');
        const delRes = handleDeleteData(collection, testId);
        if (delRes.status === 'success') {
            log('✅ DELETE Sucesso');
        } else {
            throw new Error('Falha no DELETE: ' + JSON.stringify(delRes));
        }

        // 5. VERIFY DELETE
        const check = getCollectionData(collection, testId);
        if (check.length === 0) {
            log('✅ Verificação de Exclusão Sucesso');
        } else {
            throw new Error('Item ainda existe após deleção');
        }

        log('\n✨ TODOS OS TESTES DE ROTA PASSARAM!');

    } catch (e) {
        log(`\n❌ ERRO NO TESTE: ${e.message}`);
        // Tenta limpar se falhou no meio
        try { handleDeleteData(collection, testId); } catch(z) {}
    }

    return logBuffer.join('\n');
}

function handleDevReset(token) {
    const session = validateSession(token);
    if (!session || !['dev', 'admin'].includes(session.role)) {
        return { status: 'error', message: 'Acesso negado: Permissão insuficiente' };
    }
    return handleResetSystemDatabase(session);
}

/**
 * Executa testes de segurança (Pentest)
 */
function handleSecurityTests(token, testType) {
    const session = validateSession(token);
    if (!session || !['dev', 'admin'].includes(session.role)) {
        return { status: 'error', message: 'Acesso negado' };
    }

    if (testType === 'formula') {
        const collection = 'events';
        // Tenta injetar uma fórmula
        const payload = { title: '=1+1', date: '2026-01-01', status: 'test_security' };
        const result = handleSaveData(collection, payload);
        
        // Verifica se foi sanitizado
        const savedTitle = result.item.title;
        const safe = savedTitle.startsWith("'=");
        
        // Limpeza
        try { handleDeleteData(collection, result.item.id); } catch(e) {}

        return { 
            status: 'success', 
            test: 'Formula Injection', 
            payload: payload.title, 
            saved: savedTitle, 
            safe: safe,
            message: safe ? '✅ Protegido (Aspas adicionadas)' : '❌ VULNERÁVEL (Fórmula salva crua)'
        };
    }

    if (testType === 'brute') {
        const targetEmail = 'attacker_' + Date.now() + '@evil.com';
        const results = [];
        
        // Tenta 6 vezes (o limite é 5)
        for (let i = 1; i <= 6; i++) {
            try {
                handleLogin(targetEmail, 'wrong_pass');
                results.push(`Tentativa ${i}: Login Sucesso (Inesperado)`);
            } catch (e) {
                results.push(`Tentativa ${i}: ${e.message}`);
            }
        }
        
        const blocked = results.some(r => r.includes('Muitas tentativas falhas'));
        return {
            status: 'success',
            test: 'Brute Force / Rate Limit',
            logs: results,
            safe: blocked,
            message: blocked ? '✅ Protegido (Bloqueio ativado após 5 falhas)' : '❌ VULNERÁVEL (Não bloqueou)'
        };
    }
    
    return { status: 'error', message: 'Tipo de teste desconhecido' };
}

/**
 * Simula uma chamada de API vinda do Dashboard (Playground)
 */
function handleApiSimulation(request) {
    try {
        const action = request.action;
        const payload = request.payload || {};
        const token = request.token;
        
        let session = null;
        if (token) {
             session = validateSession(token);
        }

        if (action === 'login') return handleLogin(payload.email, payload.password);
        if (action === 'registerUser') return handleRegisterUser(payload);
        
        // Validação de sessão para ações protegidas
        if (!session && ['getData', 'saveData', 'deleteData', 'bulkDelete', 'bulkStatus'].includes(action)) {
             return { status: 'error', message: 'Token inválido ou expirado' };
        }

        if (action === 'getData') {
             if (!canAccess(session, 'read', payload.collection)) return { status: 'error', message: 'Acesso negado' };
             return { status: 'success', data: getCollectionData(payload.collection, payload.id) };
        }
        
        if (action === 'saveData') {
             if (!canAccess(session, 'write', payload.collection)) return { status: 'error', message: 'Acesso negado' };
             return handleSaveData(payload.collection, payload.item);
        }
        
        if (action === 'deleteData') {
             if (!canAccess(session, 'delete', payload.collection)) return { status: 'error', message: 'Acesso negado' };
             return handleDeleteData(payload.collection, payload.id);
        }
        
        throw new Error("Ação não suportada no simulador.");
    } catch (e) {
        return { status: 'error', message: e.message };
    }
}
