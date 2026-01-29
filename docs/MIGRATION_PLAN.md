# 📋 Plano de Implementação: Migração LocalStorage → Google Apps Script

**Data:** 29 de janeiro de 2026  
**Versão:** 1.0  
**Escopo:** Migração de persistência de dados para API Google Apps Script  
**Usuários-alvo:** 5 pessoas (Admin + 4 colaboradores)  
**Risco:** MÉDIO | Duração estimada: 3 semanas

---

## 📊 Índice

1. [Preparação Pré-Implementação](#fase-0-preparação)
2. [Fase 1: Setup Infraestrutura](#fase-1-setup-infraestrutura)
3. [Fase 2: Desenvolvimento Backend](#fase-2-desenvolvimento-backend)
4. [Fase 3: Refatoração Frontend](#fase-3-refatoração-frontend)
5. [Fase 4: Migração de Dados](#fase-4-migração-de-dados)
6. [Fase 5: Testes Integrados](#fase-5-testes-integrados)
7. [Fase 6: Deploy & Monitoring](#fase-6-deploy--monitoring)
8. [Contingências](#contingências)

---

## FASE 0: Preparação

### 0.1 Checklist Pré-Implementação

- [ ] **Backup de dados**
  ```bash
  # Exportar localStorage atual
  - Abrir DevTools (F12)
  - Application → LocalStorage
  - Copiar JSON para arquivo: backup_$(date).json
  ```

- [ ] **Conta Google segregada**
  ```
  [ ] Criar email: app.cultura@gmail.com
  [ ] Configurar 2FA
  [ ] Criar pasta no Drive: /Apps Script Projects
  [ ] Ativar Google Sheets API (será usado em Phase 2)
  ```

- [ ] **Ambiente de testes**
  ```
  [ ] Criar branch Git: feature/gas-migration
  [ ] Criar planilha de testes: "Cultura Viva - DEV"
  [ ] Criar planilha de staging: "Cultura Viva - STAGING"
  [ ] Manter planilha de produção intacta
  ```

- [ ] **Documentação**
  - [ ] Documento de design da API GAS
  - [ ] Guia de segurança (validações backend)
  - [ ] Runbook de rollback
  - [ ] Documentação de quotas/limites

### 0.2 Validações Iniciais

```javascript
// VALIDAÇÃO 1: Dados atuais íntegros
TEST: validateLocalStorageData()
├─ Verificar: events[] não vazio
├─ Verificar: users[] tem pelo menos admin
├─ Verificar: documents[] inteiros
└─ FALHA: Restaurar do backup ANTES de continuar

// VALIDAÇÃO 2: Configuração Google
TEST: validateGoogleSetup()
├─ Verificar: Conta criada e 2FA ativado
├─ Verificar: Google Sheets API habilitada
├─ Verificar: Permissões de Drive OK
└─ FALHA: Não avançar para Fase 1
```

---

## FASE 1: Setup Infraestrutura

**Duração:** 2 dias  
**Responsável:** Você (setup inicial)  
**Contingência:** Reverter para LocalStorage se erros críticos

### 1.1 Criar Google Sheet para Dados

```
Planilha: "Cultura Viva - DEV"
├─ Aba "events" (estrutura: id, title, date, ...)
├─ Aba "users" (estrutura: id, email, name, password_hash, ...)
├─ Aba "testimonials"
├─ Aba "team"
├─ Aba "documents"
├─ Aba "clipping"
├─ Aba "_logs" (auditoria: timestamp, user, action, data)
└─ Aba "_auth_tokens" (tokens de sessão temporários)
```

**Validação 1.1:**
```javascript
CHECKPOINT_1A: Estrutura de Abas Criada
├─ [ ] Todas as 8 abas criadas
├─ [ ] Cabeçalhos (headers) corretos em cada aba
├─ [ ] Formato de dados validado
└─ FALHA: Deletar planilha e recomeçar
```

### 1.2 Criar Apps Script Básico

**Arquivo: Code.gs** (Google Apps Script)

```javascript
/**
 * Google Apps Script - Backend Cultura Viva
 * Executar como: Owner (Você)
 * Acessível: Qualquer pessoa
 */

// ===== CONFIG =====
const SS_ID = 'SEU_SPREADSHEET_ID';
const ALLOWED_ORIGINS = ['https://seu-site.com', 'http://localhost:3000'];
const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// ===== SECURITY =====
function validateSession(token) {
    if (!token) return null;
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const tokensSheet = ss.getSheetByName('_auth_tokens');
    const data = tokensSheet.getDataRange().getValues();
    
    for (let row of data) {
        if (row[1] === token && new Date(row[3]) > new Date()) {
            return { email: row[0], role: row[2], createdAt: row[3] };
        }
    }
    return null;
}

function validateCORS(e) {
    const origin = e.parameter.origin || e.headers['origin'];
    return ALLOWED_ORIGINS.includes(origin);
}

// ===== MAIN HANDLERS =====
function doGet(e) {
    return createResponse('GET OK', 200);
}

function doPost(e) {
    if (!validateCORS(e)) {
        return createResponse('CORS blocked', 403);
    }
    
    try {
        const action = e.parameter.action;
        const token = e.parameter.token;
        
        // Ações públicas (não requerem autenticação)
        if (action === 'login') {
            return handleLogin(e.postData.contents);
        }
        
        // Ações autenticadas
        const session = validateSession(token);
        if (!session) {
            return createResponse('Unauthorized', 401);
        }
        
        switch (action) {
            case 'getData':
                return handleGetData(e, session);
            case 'saveData':
                return handleSaveData(e, session);
            case 'deleteData':
                return handleDeleteData(e, session);
            default:
                return createResponse('Unknown action', 400);
        }
    } catch (error) {
        logError(error);
        return createResponse('Server error: ' + error.message, 500);
    }
}

function handleLogin(postData) {
    try {
        const data = JSON.parse(postData);
        const { email, password } = data;
        
        // Buscar usuário
        const ss = SpreadsheetApp.openById(SS_ID);
        const usersSheet = ss.getSheetByName('users');
        const users = usersSheet.getDataRange().getValues();
        
        for (let row of users) {
            if (row[1] === email) {
                // Validar senha com hash
                if (verifyPassword(password, row[4])) {
                    const token = generateToken();
                    saveToken(token, email, row[5]); // role está em col 5
                    
                    return createResponse({
                        success: true,
                        token: token,
                        user: {
                            id: row[0],
                            email: row[1],
                            name: row[2],
                            role: row[5],
                            photo: row[6]
                        }
                    }, 200);
                }
            }
        }
        
        return createResponse({ success: false, message: 'Invalid credentials' }, 401);
    } catch (error) {
        logError(error);
        return createResponse('Login error', 500);
    }
}

function handleGetData(e, session) {
    const collection = e.parameter.collection;
    
    if (!canAccess(session, 'read', collection)) {
        return createResponse('Access denied', 403);
    }
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(collection);
    
    if (!sheet) {
        return createResponse('Collection not found', 404);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const items = rows.map(row => {
        const item = {};
        headers.forEach((header, i) => {
            item[header] = row[i];
        });
        return item;
    });
    
    logAction(session, 'READ', collection, { count: items.length });
    return createResponse({ success: true, data: items }, 200);
}

function handleSaveData(e, session) {
    const { collection, item } = JSON.parse(e.postData.contents);
    
    if (!canAccess(session, 'write', collection)) {
        return createResponse('Access denied', 403);
    }
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(collection);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Encontrar ou criar
    let found = false;
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === item.id) {
            // Update
            const row = i + 1;
            const values = headers.map(h => item[h] !== undefined ? item[h] : '');
            sheet.getRange(row, 1, 1, headers.length).setValues([values]);
            found = true;
            break;
        }
    }
    
    if (!found) {
        // Insert
        if (!item.id) item.id = Utilities.getUuid();
        const values = headers.map(h => item[h] !== undefined ? item[h] : '');
        sheet.appendRow(values);
    }
    
    logAction(session, found ? 'UPDATE' : 'CREATE', collection, { id: item.id });
    return createResponse({ success: true, item: item }, 200);
}

function handleDeleteData(e, session) {
    const { collection, id } = JSON.parse(e.postData.contents);
    
    if (!canAccess(session, 'delete', collection)) {
        return createResponse('Access denied', 403);
    }
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(collection);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i + 1);
            logAction(session, 'DELETE', collection, { id: id });
            return createResponse({ success: true }, 200);
        }
    }
    
    return createResponse('Item not found', 404);
}

// ===== UTILITIES =====
function createResponse(content, status = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(content));
    output.setMimeType(ContentService.MimeType.JSON);
    
    // CORS Headers
    output.addHeader('Access-Control-Allow-Origin', '*');
    output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return output;
}

function generateToken() {
    return Utilities.getUuid();
}

function saveToken(token, email, role) {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('_auth_tokens');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    sheet.appendRow([email, token, role, expiresAt]);
}

function verifyPassword(plaintext, hash) {
    // Usar hashcode simples para teste (REPLACE COM BCRYPT EM PRODUÇÃO)
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plaintext)
        .map(b => (b < 0 ? 256 + b : b).toString(16).padStart(2, 0))
        .join('') === hash;
}

function canAccess(session, action, collection) {
    const rolePerms = {
        'dev': { read: ['*'], write: ['*'], delete: ['*'] },
        'admin': { read: ['*'], write: ['*'], delete: ['events', 'users'] },
        'editor': { read: ['*'], write: ['events'], delete: [] },
        'user': { read: ['*'], write: [], delete: [] }
    };
    
    const perms = rolePerms[session.role] || { read: [], write: [], delete: [] };
    const allowed = perms[action] || [];
    
    return allowed.includes('*') || allowed.includes(collection);
}

function logAction(session, action, collection, details) {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('_logs');
    sheet.appendRow([
        new Date(),
        session.email,
        action,
        collection,
        JSON.stringify(details)
    ]);
}

function logError(error) {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('_logs');
    sheet.appendRow([
        new Date(),
        'SYSTEM',
        'ERROR',
        error.name,
        error.message
    ]);
}
```

**Validação 1.2:**
```javascript
CHECKPOINT_1B: Apps Script Deploy
├─ [ ] Code.gs criado e sem erros de sintaxe
├─ [ ] Deploy como Web App configurado
├─ [ ] Executar como: Owner (Você)
├─ [ ] Quem tem acesso: Qualquer pessoa
├─ [ ] Nota o URL de implantação: https://script.google.com/macros/d/{SCRIPT_ID}/usercallsv2
└─ FALHA: Deletar deploy e recomeçar
```

### 1.3 Testar Conexão Básica

```javascript
// Teste manual no console do navegador
const TEST_SCRIPT_URL = 'SEU_URL_DO_WEB_APP';

async function testConnection() {
    try {
        const response = await fetch(TEST_SCRIPT_URL + '?action=test', {
            method: 'GET'
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
        return response.status === 200;
    } catch (error) {
        console.error('Erro de conexão:', error);
        return false;
    }
}

// Executar
testConnection();
```

**Validação 1.3:**
```
CHECKPOINT_1C: Conectividade Básica
├─ [ ] Consegue fazer GET request sem erros
├─ [ ] CORS funcionando (sem "blocked by CORS" error)
├─ [ ] Resposta em JSON válido
└─ FALHA: Revisar headers CORS no Code.gs
```

---

## FASE 2: Desenvolvimento Backend

**Duração:** 3-4 dias  
**Validação:** Testes unitários de cada handler

### 2.1 Implementar Handlers Completos

**Adicionar ao Code.gs:**

```javascript
// ===== EXTENDED HANDLERS =====

function handleBulkDelete(e, session) {
    const { collection, ids } = JSON.parse(e.postData.contents);
    
    if (!canAccess(session, 'delete', collection)) {
        return createResponse('Access denied', 403);
    }
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(collection);
    const data = sheet.getDataRange().getValues();
    
    let deleted = 0;
    for (let i = data.length - 1; i >= 1; i--) {
        if (ids.includes(data[i][0])) {
            sheet.deleteRow(i + 1);
            deleted++;
        }
    }
    
    logAction(session, 'BULK_DELETE', collection, { count: deleted });
    return createResponse({ success: true, deleted }, 200);
}

function handleBulkStatus(e, session) {
    const { collection, ids, status } = JSON.parse(e.postData.contents);
    
    if (!canAccess(session, 'write', collection)) {
        return createResponse('Access denied', 403);
    }
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(collection);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusIdx = headers.indexOf('status');
    
    if (statusIdx === -1) {
        return createResponse('Collection has no status field', 400);
    }
    
    let updated = 0;
    for (let i = 1; i < data.length; i++) {
        if (ids.includes(data[i][0])) {
            sheet.getRange(i + 1, statusIdx + 1).setValue(status);
            updated++;
        }
    }
    
    logAction(session, 'BULK_STATUS', collection, { count: updated, status });
    return createResponse({ success: true, updated }, 200);
}

function handleGetChanges(e, session) {
    const { since } = e.parameter;
    const sinceDate = new Date(since);
    
    const ss = SpreadsheetApp.openById(SS_ID);
    const logsSheet = ss.getSheetByName('_logs');
    const logs = logsSheet.getDataRange().getValues().slice(1);
    
    const changes = logs.filter(row => {
        return new Date(row[0]) > sinceDate;
    }).map(row => ({
        timestamp: row[0],
        user: row[1],
        action: row[2],
        collection: row[3],
        details: JSON.parse(row[4] || '{}')
    }));
    
    return createResponse({ success: true, changes }, 200);
}
```

**Validação 2.1:**
```javascript
CHECKPOINT_2A: Handlers Implementados
├─ [ ] handleLogin funciona
├─ [ ] handleGetData retorna dados
├─ [ ] handleSaveData cria/atualiza
├─ [ ] handleDeleteData remove
├─ [ ] handleBulkDelete remove múltiplos
├─ [ ] handleBulkStatus atualiza status
└─ [ ] Todos loguem em _logs
```

### 2.2 Testes de Segurança

```javascript
// TESTE 1: Acesso não autenticado é bloqueado
TEST: loginRequired()
├─ Tentar getData SEM token
└─ ESPERADO: 401 Unauthorized

// TESTE 2: Token expirado é rejeitado
TEST: tokenExpiration()
├─ Criar token com expiração 1 segundo atrás
├─ Tentar getData COM token expirado
└─ ESPERADO: 401 Unauthorized

// TESTE 3: CORS funciona apenas com origins permitidas
TEST: corsValidation()
├─ Requisição de origin não permitida
└─ ESPERADO: 403 CORS blocked

// TESTE 4: Permissões são respeitadas
TEST: permissionControl()
├─ User com role='user' tenta deletar
└─ ESPERADO: 403 Access denied
```

**Executar testes:**
```javascript
// No console do Apps Script:
testSuite = [
    { name: 'Login', fn: testLogin },
    { name: 'TokenValidation', fn: testTokenExpiry },
    { name: 'CORSBlocking', fn: testCorsBlocking },
    { name: 'PermissionControl', fn: testPermissions }
];

testSuite.forEach(test => {
    try {
        test.fn();
        Logger.log(`✅ ${test.name} PASSED`);
    } catch (e) {
        Logger.log(`❌ ${test.name} FAILED: ${e.message}`);
    }
});
```

---

## FASE 3: Refatoração Frontend

**Duração:** 3-4 dias  
**Validação:** Compatibilidade com API

### 3.1 Criar GASAPIService.js

**Arquivo: js/services/GASAPIService.js**

```javascript
/**
 * GASAPIService - Camada de acesso a Google Apps Script
 * Substitui LocalStorageDB.js
 */

window.GASAPIService = (() => {
    const GAS_SCRIPT_URL = window.APP_CONFIG?.GAS_SCRIPT_URL || 'https://script.google.com/macros/d/...';
    const TOKEN_KEY = 'auth_token_gas';
    const USER_KEY = 'auth_user_gas';
    const CACHE_KEY_PREFIX = 'gas_cache_';
    const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

    // ===== CACHE LAYER =====
    const cache = {
        set(key, value) {
            const cacheData = {
                value,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
        },
        get(key) {
            const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
            if (!cached) return null;
            
            const { value, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(CACHE_KEY_PREFIX + key);
                return null;
            }
            return value;
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

    // ===== RETRY LOGIC =====
    async function retryFetch(url, options, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    timeout: 10000 // 10 segundos
                });
                
                if (response.ok) {
                    return await response.json();
                }
                
                if (response.status === 401) {
                    // Token expirado
                    logout();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                
                if (response.status >= 500 && attempt < maxRetries) {
                    // Retry em erros 5xx
                    const backoff = Math.pow(2, attempt - 1) * 1000;
                    await new Promise(r => setTimeout(r, backoff));
                    continue;
                }
                
                throw new Error(`API Error: ${response.status}`);
            } catch (error) {
                if (attempt === maxRetries) throw error;
                
                const backoff = Math.pow(2, attempt - 1) * 1000;
                console.warn(`Tentativa ${attempt}/${maxRetries} falhou, retry em ${backoff}ms...`);
                await new Promise(r => setTimeout(r, backoff));
            }
        }
    }

    // ===== PUBLIC API =====
    return {
        // Auth
        async login(email, password) {
            try {
                const response = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'login',
                        email,
                        password
                    })
                });
                
                if (response.success) {
                    localStorage.setItem(TOKEN_KEY, response.token);
                    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
                    cache.clear();
                    return { success: true, user: response.user, token: response.token };
                }
                
                return { success: false, message: response.message || 'Falha no login' };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: error.message };
            }
        },

        logout() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            cache.clear();
        },

        getToken() {
            return localStorage.getItem(TOKEN_KEY);
        },

        getCurrentUser() {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        },

        // Data Operations
        async list(collection) {
            try {
                // Verificar cache primeiro
                const cached = cache.get(`list_${collection}`);
                if (cached) {
                    console.log(`[GASAPIService] Cache hit: ${collection}`);
                    return cached;
                }
                
                const token = this.getToken();
                if (!token) throw new Error('Não autenticado');
                
                console.log(`[GASAPIService] Fetching ${collection}...`);
                
                const data = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'getData',
                        collection,
                        token
                    })
                });
                
                if (data.success) {
                    cache.set(`list_${collection}`, data.data);
                    return data.data;
                }
                
                throw new Error(data.error || 'Erro ao carregar dados');
            } catch (error) {
                console.error(`[GASAPIService] List error (${collection}):`, error);
                // Fallback para cache se offline
                const fallback = cache.get(`list_${collection}`);
                if (fallback) {
                    console.warn('Usando cache offline para:', collection);
                    return fallback;
                }
                throw error;
            }
        },

        async save(collection, item) {
            try {
                const token = this.getToken();
                if (!token) throw new Error('Não autenticado');
                
                console.log('[GASAPIService] Saving:', collection, item);
                
                const data = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'saveData',
                        collection,
                        item,
                        token
                    })
                });
                
                if (data.success) {
                    cache.invalidate(`list_${collection}`);
                    return data.item;
                }
                
                throw new Error(data.error || 'Erro ao salvar');
            } catch (error) {
                console.error('[GASAPIService] Save error:', error);
                throw error;
            }
        },

        async delete(collection, id) {
            try {
                const token = this.getToken();
                if (!token) throw new Error('Não autenticado');
                
                console.log('[GASAPIService] Deleting:', collection, id);
                
                const data = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'deleteData',
                        collection,
                        id,
                        token
                    })
                });
                
                if (data.success) {
                    cache.invalidate(`list_${collection}`);
                    return true;
                }
                
                throw new Error(data.error || 'Erro ao deletar');
            } catch (error) {
                console.error('[GASAPIService] Delete error:', error);
                throw error;
            }
        },

        async bulkDelete(collection, ids) {
            try {
                const token = this.getToken();
                const data = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'bulkDelete',
                        collection,
                        ids,
                        token
                    })
                });
                
                if (data.success) {
                    cache.invalidate(`list_${collection}`);
                    return { success: true, count: data.deleted };
                }
                
                throw new Error(data.error || 'Erro em bulk delete');
            } catch (error) {
                console.error('[GASAPIService] Bulk delete error:', error);
                throw error;
            }
        },

        async bulkUpdateStatus(collection, ids, status) {
            try {
                const token = this.getToken();
                const data = await retryFetch(GAS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'bulkStatus',
                        collection,
                        ids,
                        status,
                        token
                    })
                });
                
                if (data.success) {
                    cache.invalidate(`list_${collection}`);
                    return { success: true };
                }
                
                throw new Error(data.error || 'Erro ao atualizar status');
            } catch (error) {
                console.error('[GASAPIService] Bulk status error:', error);
                throw error;
            }
        },

        // Cache management
        clearCache() {
            cache.clear();
        }
    };
})();
```

**Validação 3.1:**
```javascript
CHECKPOINT_3A: GASAPIService Implementado
├─ [ ] Login funciona (retorna token)
├─ [ ] list() busca dados com cache
├─ [ ] save() insere/atualiza
├─ [ ] delete() remove itens
├─ [ ] bulkDelete() remove múltiplos
├─ [ ] Retry logic funciona (testa desligando internet)
└─ [ ] Cache funciona (2ª requisição é instantânea)
```

### 3.2 Adaptar DataService.js

**Editar: js/services/DataService.js**

```javascript
// Mudar de LocalStorageDB para GASAPIService

window.DataService = {
    // Usar GASAPIService internamente
    async list(collection) {
        return window.GASAPIService.list(collection);
    },

    async save(collection, item) {
        return window.GASAPIService.save(collection, item);
    },

    async delete(collection, id) {
        return window.GASAPIService.delete(collection, id);
    },

    async bulkDelete(collection, ids) {
        return window.GASAPIService.bulkDelete(collection, ids);
    },

    async bulkUpdateStatus(collection, ids, status) {
        return window.GASAPIService.bulkUpdateStatus(collection, ids, status);
    },

    _getIdField(collection) {
        if (window.SCHEMAS) {
            for (const k in window.SCHEMAS) {
                if (window.SCHEMAS[k].collection === collection) {
                    return window.SCHEMAS[k].idField;
                }
            }
        }
        return 'id';
    }
};
```

### 3.3 Adaptar useAuth.js

**Editar: js/composables/useAuth.js**

```javascript
// Mudar fluxo de autenticação

window.useAuth = function (router, notifications) {
    const auth = Vue.reactive({
        user: window.GASAPIService.getCurrentUser(),
        isAuthenticated: !!window.GASAPIService.getToken(),
        token: window.GASAPIService.getToken(),

        async attemptLogin(email, password) {
            try {
                const response = await window.GASAPIService.login(email, password);
                return response;
            } catch (e) {
                notifications.add("Erro ao conectar com servidor.", "error");
                return { success: false, error: e };
            }
        },

        login(user, token) {
            this.user = user;
            this.token = token;
            this.isAuthenticated = true;
            notifications.add(`Bem-vindo, ${user.name}!`);
            router.pushContext('public');
        },

        logout() {
            window.GASAPIService.logout();
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            notifications.add("Logout realizado com sucesso.");
            router.pushContext('public');
        },

        can(permission) {
            if (!this.isAuthenticated || !this.user) return false;
            const PERMISSIONS = window.APP_CONSTANTS?.PERMISSIONS || {
                'dev': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings', 'view_dev_tools', 'manage_system'],
                'admin': ['view_dashboard', 'manage_users', 'manage_events', 'manage_settings'],
                'editor': ['view_dashboard', 'manage_events'],
                'user': ['view_dashboard']
            };
            const rolePerms = PERMISSIONS[this.user.role] || [];
            return rolePerms.includes(permission);
        }
    });

    if (!auth.user && auth.isAuthenticated) {
        auth.logout();
    }

    const can = (permission) => auth.can(permission);

    return { auth, can };
};
```

**Validação 3.2:**
```javascript
CHECKPOINT_3B: Frontend Refatorado
├─ [ ] DataService funciona com GASAPIService
├─ [ ] useAuth integra com GASAPIService
├─ [ ] Login/Logout funcionam
├─ [ ] Dados carregam depois de login
└─ [ ] Cache funciona visualmente
```

---

## FASE 4: Migração de Dados

**Duração:** 1 dia  
**Risco:** CRÍTICO - Validar integridade

### 4.1 Export de LocalStorage

```javascript
// SCRIPT: Exportar dados locais
function exportLocalStorageData() {
    const COLLECTIONS = ['events', 'users', 'testimonials', 'team', 'clipping', 'documents', 'oscs'];
    const exported = {};

    COLLECTIONS.forEach(col => {
        const db = JSON.parse(localStorage.getItem('atst_db_v1'));
        if (db[col]) {
            exported[col] = db[col];
        }
    });

    const json = JSON.stringify(exported, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString()}.json`;
    a.click();
    
    console.log('✅ Backup exportado:', json);
    return json;
}

// Executar no console:
exportLocalStorageData();
```

**Validação 4.1:**
```
CHECKPOINT_4A: Backup Local Criado
├─ [ ] Arquivo JSON criado
├─ [ ] Contém todas as 7 coleções
├─ [ ] Dados íntegros (comparar com DevTools)
└─ [ ] Guardar arquivo em local seguro
```

### 4.2 Import para Google Sheets

**Script no Apps Script para importar:**

```javascript
function importDataFromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const ss = SpreadsheetApp.openById(SS_ID);
    
    const COLLECTIONS = ['events', 'users', 'testimonials', 'team', 'clipping', 'documents', 'oscs'];
    
    for (let col of COLLECTIONS) {
        if (data[col]) {
            const sheet = ss.getSheetByName(col);
            if (!sheet) {
                Logger.log(`⚠️ Aba ${col} não existe, pulando...`);
                continue;
            }
            
            // Limpar dados antigos (manter headers)
            const lastRow = sheet.getLastRow();
            if (lastRow > 1) {
                sheet.deleteRows(2, lastRow - 1);
            }
            
            // Inserir dados novos
            const items = data[col];
            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            
            items.forEach(item => {
                const row = headers.map(h => item[h] !== undefined ? item[h] : '');
                sheet.appendRow(row);
            });
            
            Logger.log(`✅ ${col}: ${items.length} registros importados`);
        }
    }
    
    logAction({ email: 'SYSTEM', role: 'system' }, 'DATA_IMPORT', 'ALL', { collections: COLLECTIONS.length });
}

// Usar:
// 1. Abrir console do Apps Script (Ctrl+Enter)
// 2. Copiar JSON do backup
// 3. Rodar: importDataFromJSON('{ "events": [...], ... }')
```

**Validação 4.2:**
```
CHECKPOINT_4B: Dados Importados
├─ [ ] Todos os registros importados
├─ [ ] Contar linhas: SELECT COUNT(*) por aba
├─ [ ] Nenhum duplicado
└─ [ ] IDs consistentes
```

### 4.3 Validação de Integridade

```javascript
// Comparar dados antes vs depois
function validateMigration() {
    const backup = JSON.parse(/* JSON exportado */);
    
    async function checkCollection(col) {
        const gasData = await window.GASAPIService.list(col);
        const backupData = backup[col];
        
        const gasIds = gasData.map(d => d.id).sort();
        const backupIds = backupData.map(d => d.id).sort();
        
        if (gasIds.length !== backupIds.length) {
            console.error(`❌ ${col}: Contagem diferente! GAS=${gasIds.length}, Backup=${backupIds.length}`);
            return false;
        }
        
        // Verificar registros faltantes
        const missing = backupIds.filter(id => !gasIds.includes(id));
        if (missing.length > 0) {
            console.error(`❌ ${col}: Registros faltantes:`, missing);
            return false;
        }
        
        console.log(`✅ ${col}: Validado (${gasIds.length} registros)`);
        return true;
    }

    return Promise.all([
        checkCollection('events'),
        checkCollection('users'),
        checkCollection('testimonials'),
        checkCollection('team'),
        checkCollection('clipping'),
        checkCollection('documents')
    ]);
}

// Executar
validateMigration();
```

**Validação 4.3:**
```
CHECKPOINT_4C: Integridade Confirmada
├─ [ ] Nenhuma mensagem ❌
├─ [ ] Todas ✅ (todas as coleções)
└─ [ ] Counts batem entre backup e GAS
```

---

## FASE 5: Testes Integrados

**Duração:** 2-3 dias  
**Objetivo:** Validar todas as funcionalidades

### 5.1 Testes Funcionais

```javascript
// TEST SUITE
const testSuite = {
    async testLogin() {
        const result = await window.GASAPIService.login('admin@cultura.gov.br', '12345678');
        if (!result.success) throw new Error('Login failed');
        if (!result.token) throw new Error('No token returned');
        return '✅ Login test passed';
    },

    async testLoadData() {
        const events = await window.GASAPIService.list('events');
        if (!Array.isArray(events)) throw new Error('Not an array');
        if (events.length === 0) throw new Error('No events loaded');
        return `✅ Loaded ${events.length} events`;
    },

    async testSaveData() {
        const newEvent = {
            id: 'test-' + Date.now(),
            title: 'Test Event',
            date: '2026-02-01',
            status: 'active'
        };
        const saved = await window.GASAPIService.save('events', newEvent);
        if (saved.id !== newEvent.id) throw new Error('ID mismatch');
        return '✅ Save data test passed';
    },

    async testDeleteData() {
        const eventId = 'test-' + Date.now();
        // Primeiro criar
        await window.GASAPIService.save('events', { id: eventId, title: 'Temp', status: 'active' });
        // Depois deletar
        await window.GASAPIService.delete('events', eventId);
        return '✅ Delete data test passed';
    },

    async testCache() {
        const t1 = Date.now();
        await window.GASAPIService.list('events');
        const duration1 = Date.now() - t1;
        
        const t2 = Date.now();
        await window.GASAPIService.list('events');
        const duration2 = Date.now() - t2;
        
        if (duration2 > duration1 * 0.5) {
            throw new Error('Cache não está funcionando');
        }
        return `✅ Cache test passed (1st: ${duration1}ms, 2nd: ${duration2}ms)`;
    }
};

// Executar todos os testes
async function runTests() {
    for (const [name, testFn] of Object.entries(testSuite)) {
        try {
            const result = await testFn();
            console.log(`[${name}] ${result}`);
        } catch (error) {
            console.error(`[${name}] ❌ ${error.message}`);
        }
    }
}

// NO CONSOLE:
runTests();
```

**Validação 5.1:**
```
CHECKPOINT_5A: Testes Funcionais
├─ [ ] testLogin: ✅
├─ [ ] testLoadData: ✅
├─ [ ] testSaveData: ✅
├─ [ ] testDeleteData: ✅
└─ [ ] testCache: ✅
```

### 5.2 Testes de Compatibilidade

```javascript
// Testar que aplicação funciona sem LocalStorageDB

TEST: ensureNoLocalStorageDB()
├─ Remover temporariamente LocalStorageDB.js do index.html
├─ Recarregar página
├─ Tentar fazer login
├─ Tentar carregar dados
├─ Tentar criar evento
└─ ESPERADO: Tudo funciona com GASAPIService

TEST: mockConnectionLoss()
├─ Desligar internet (DevTools → Offline)
├─ Tentar fetch (deve falhar com retry)
├─ Ligar internet novamente
├─ Tentar fetch (deve recuperar)
└─ ESPERADO: Retry logic funciona, dados vêm do cache
```

### 5.3 Teste de Carga

```javascript
// Simular múltiplos usuários

async function testConcurrentLoads() {
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(window.GASAPIService.list('events'));
    }
    const results = await Promise.all(promises);
    console.log('✅ 5 requisições simultâneas completadas');
    return results;
}

// Executar
testConcurrentLoads();
```

---

## FASE 6: Deploy & Monitoring

**Duração:** 2 dias  
**Objetivo:** Passar para produção com segurança

### 6.1 Deploy em Produção

```
PASSOS:
1. Duplicar Google Sheets DEV → PROD
2. Duplicar Apps Script → Novo deploy PROD
3. Copiar dados de staging para PROD
4. Atualizar URL no frontend:
   └─ APP_CONFIG.GAS_SCRIPT_URL = 'URL_NOVO'
5. Testar uma vez com URL PROD
6. Ativar para todos os usuários
```

**Validação 6.1:**
```
CHECKPOINT_6A: Deploy PROD
├─ [ ] URL PROD diferente de DEV
├─ [ ] Google Sheets PROD separada
├─ [ ] Apps Script PROD separado
├─ [ ] Dados copiados para PROD
├─ [ ] Login testa com PROD
├─ [ ] Dados carregam de PROD
└─ [ ] Logs aparecem em PROD
```

### 6.2 Monitoring & Logging

```javascript
// Adicionar monitoring ao GASAPIService

window.GASAPIService.metrics = {
    requests: [],
    
    logRequest(method, collection, duration, success) {
        this.requests.push({
            timestamp: new Date(),
            method,
            collection,
            duration,
            success
        });
        
        // Enviar para apps script para análise
        if (this.requests.length % 10 === 0) {
            this.flushMetrics();
        }
    },
    
    flushMetrics() {
        // Enviar métricas para _logs no Apps Script
        window.fetch(GAS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'logMetrics',
                metrics: this.requests
            })
        }).catch(e => console.warn('Metrics flush failed:', e));
        
        this.requests = [];
    }
};
```

### 6.3 Health Check Dashboard

```javascript
// Criar página de status

async function createHealthCheckDashboard() {
    const health = {
        timestamp: new Date(),
        gasConnection: false,
        authentication: false,
        database: false,
        cacheStatus: 'unknown'
    };
    
    try {
        // Testar GAS
        const gasTest = await window.GASAPIService.list('events');
        health.database = gasTest.length > 0;
        
        // Testar auth
        health.authentication = !!window.GASAPIService.getToken();
        
        // Testar conexão
        health.gasConnection = true;
        
        // Cache
        const cached = localStorage.getItem('gas_cache_list_events');
        health.cacheStatus = cached ? 'hot' : 'cold';
    } catch (error) {
        health.gasConnection = false;
    }
    
    console.log('SYSTEM HEALTH:', health);
    return health;
}

// Executar periodicamente
setInterval(createHealthCheckDashboard, 60000); // A cada 1 min
```

---

## CONTINGÊNCIAS

### ❌ FALHA CRÍTICA 1: Apps Script não responde

**Sintomas:**
- Timeout em todas as requisições
- 503 Service Unavailable
- Cold start > 10 segundos

**Ação Imediata:**
```javascript
// 1. Ativar fallback para LocalStorageDB
window.DataService = {
    async list(collection) {
        try {
            return await window.GASAPIService.list(collection);
        } catch (error) {
            console.warn('GAS falhou, usando LocalStorage:', error);
            return LocalStorageDB.getCollection(collection);
        }
    }
};

// 2. Notificar usuários
window.notify('Aviso', 'Usando dados locais. Sincronização será feita quando servidor voltar.', 'warning');

// 3. Investigar no Apps Script
// - Verificar quotas em Script Executions
// - Ver console de erros
// - Revisar últimas mudanças
```

**Plano B - Rollback Total:**
```
1. Remover GASAPIService.js do index.html
2. Restaurar carregamento de LocalStorageDB.js
3. Recarregar página
4. Dados voltam a funcionar offline
5. Investigar problema no Apps Script
```

---

### ❌ FALHA CRÍTICA 2: Dados corrompidos durante migração

**Sintomas:**
- IDs duplicados
- Campos ausentes
- Dados em branco

**Ação Imediata:**
```javascript
// 1. Parar todos os usuários
// 2. Restaurar do backup:
window.GASAPIService.clearCache();
// 3. Re-executar import com backup anterior
// 4. Validar novamente
// 5. Liberar acesso
```

**Checklist de Recuperação:**
```
[ ] Identificar qual coleção foi corrompida
[ ] Restaurar dados do backup antes da corrupção
[ ] Re-validar integridade
[ ] Testar com usuário de teste
[ ] Notificar usuários que foram afetados
[ ] Documentar causa root
```

---

### ⚠️ FALHA MÉDIA 1: Usuário com sessão expirada

**Sintomas:**
- 401 Unauthorized em operações
- Token desaparece

**Ação Automática:**
```javascript
// GASAPIService já trata:
if (response.status === 401) {
    window.GASAPIService.logout();
    window.notify('Sessão expirada', 'Faça login novamente', 'warning');
    router.pushContext('login');
}
```

---

### ⚠️ FALHA MÉDIA 2: Problema de CORS

**Sintomas:**
- "Access-Control-Allow-Origin" error
- Requisição bloqueada pelo navegador

**Solução:**
```javascript
// 1. Verificar headers no Apps Script Code.gs
output.addHeader('Access-Control-Allow-Origin', '*');
output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
output.addHeader('Access-Control-Allow-Headers', 'Content-Type');

// 2. Se usar origem específica:
const allowedOrigins = ['https://seu-site.com'];
const origin = e.parameter.origin;
if (allowedOrigins.includes(origin)) {
    output.addHeader('Access-Control-Allow-Origin', origin);
}

// 3. Implementar handler OPTIONS
function doOptions(e) {
    const output = ContentService.createTextOutput('');
    output.addHeader('Access-Control-Allow-Origin', '*');
    output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
    return output;
}
```

---

### 🟠 FALHA LEVE 1: Cache desatualizado

**Sintomas:**
- Outro usuário atualizou, mas você vê dado antigo
- Dados de 5 minutos atrás

**Solução:**
```javascript
// Limpar cache manualmente:
window.GASAPIService.clearCache();

// Ou reduzir tempo de expiração:
// No GASAPIService, mudar CACHE_EXPIRY de 5min para 1min
const CACHE_EXPIRY = 1 * 60 * 1000; // 1 minuto
```

---

### 🟠 FALHA LEVE 2: Muitos erros de rede

**Sintomas:**
- Retry acontecendo frequentemente
- Requisições lentas

**Ação:**
```javascript
// Aumentar timeout e retries:
async function retryFetch(url, options, maxRetries = 5) { // De 3 para 5
    // ...
    const backoff = Math.pow(2, attempt - 1) * 2000; // De 1000 para 2000
```

---

## 📋 Checklist Final de Lançamento

**Semana 1: Setup**
- [ ] Conta Google criada
- [ ] Planilha DEV/STAGING criada
- [ ] Apps Script básico deploy
- [ ] Teste de conexão OK

**Semana 2: Desenvolvimento**
- [ ] GASAPIService.js completo
- [ ] Todos os handlers implementados
- [ ] Testes de segurança passando
- [ ] Refatoração frontend OK

**Semana 3: Migração**
- [ ] Dados exportados e validados
- [ ] Import em STAGING OK
- [ ] Testes integrados passando
- [ ] Documentação concluída

**Antes do Deploy PROD:**
- [ ] Revisão de código
- [ ] Teste com 5 usuários em STAGING
- [ ] Plano de rollback documentado
- [ ] Alertas de monitoring configurados
- [ ] Backup feito da última versão LocalStorage

---

**Status atual:** ⏳ Aguardando seu feedback para iniciar Fase 0

Quer que eu comece a implementar alguma fase específica?
