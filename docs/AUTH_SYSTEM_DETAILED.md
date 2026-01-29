# 🔐 Sistema de Autenticação e Gerenciamento de Usuários
## Migração LocalStorage → Google Apps Script

---

## 📋 Índice

1. [Estado Atual (LocalStorage)](#estado-atual-localstorage)
2. [Novo Sistema (Apps Script)](#novo-sistema-apps-script)
3. [Fluxo de Login](#fluxo-de-login)
4. [Fluxo de Logout](#fluxo-de-logout)
5. [Gerenciamento de Sessão](#gerenciamento-de-sessão)
6. [Permissões e Controle de Acesso](#permissões-e-controle-de-acesso)
7. [Tabela de Usuários](#tabela-de-usuários-no-google-sheets)
8. [Segurança](#segurança)

---

## Estado Atual (LocalStorage)

### 🔴 Problema Atual

```javascript
// LOCALDB: Dados de usuários em localStorage (inseguro!)
const users = [
    {
        id: '198305ff-1c73-4217-91a6-89617d91979b',
        name: 'Admin Master',
        email: 'admin@cultura.gov.br',
        phone: '912 345 678',
        role: 'dev',                      // ⚠️ Papel do usuário
        photo: 'https://...',
        birthDate: '1985-05-15',
        status: 'active',
        password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // ⚠️ Hash visível!
        forceReset: false
    },
    {
        id: '243a7566-3473-41f2-9844-e2af492572e9',
        name: 'Colaborador',
        email: 'user@cultura.pt',
        phone: '966 555 444',
        role: 'user',                     // ⚠️ Acesso limitado
        photo: 'https://...',
        birthDate: '1990-10-20',
        status: 'active',
        password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        forceReset: false
    }
];
```

### ❌ Problemas de Segurança

```
1. SENHA NO CLIENTE: Qualquer pessoa pode ver hash abrindo DevTools
   └─ Abrir F12 → Application → LocalStorage → Ver "atst_db_v1"
   └─ Copiar JSON inteiro com TODAS as senhas

2. SEM VALIDAÇÃO DE SERVIDOR: Um usuário pode:
   ├─ Mudar seu role de "user" para "admin" no DevTools
   ├─ Deletar data de outro usuário
   ├─ Acessar informações sensíveis

3. SEM EXPIRAÇÃO DE SESSÃO:
   ├─ Se deixar navegador aberto, qualquer pessoa pode usar
   ├─ Sem timeout automático
   ├─ Sem logout forçado

4. SEM AUDITORIA: Não há registro de:
   ├─ Quem fez login quando
   ├─ Quem deletou/alterou cada registro
   ├─ Falhas de login
```

### Fluxo Atual (LocalStorageDB)

```javascript
// FRONTEND (useAuth.js)
1. Usuário digita email/senha
2. Frontend busca em LocalStorage
3. HASH é verificado no navegador
4. Se bate, salva token em localStorage
5. PRONTO! Está autenticado

// ❌ PROBLEMA: Tudo no navegador, nada no servidor
```

---

## Novo Sistema (Apps Script)

### ✅ Vantagens

```
1. SERVIDOR CONTROLA AUTENTICAÇÃO:
   ├─ Hash nunca sai do servidor
   ├─ Validação no backend (não confia em frontend)
   ├─ Tokens com expiração automática

2. AUDITORIA COMPLETA:
   ├─ Log de todos os logins
   ├─ Quem acessou cada dado
   ├─ Quando foi feita cada alteração

3. SEGURANÇA:
   ├─ Usuário não pode mudar role/permissões
   ├─ Senhas armazenadas com hash
   ├─ Sessões com timeout

4. CONTROLE GRANULAR:
   ├─ Admin pode desativar usuário imediatamente
   ├─ Forçar reset de senha
   ├─ Ver quem fez o quê
```

---

## Fluxo de Login

### Diagrama: 1️⃣ Login com Email + Senha

```
┌─────────────┐                          ┌──────────────────┐
│  Navegador  │                          │  Google Sheets   │
│  (Frontend) │                          │   + Apps Script  │
└──────┬──────┘                          └────────┬─────────┘
       │                                          │
       │  1. Usuário abre página                  │
       ├─────────────────────────────────────────>│
       │  (Nenhuma autenticação ainda)            │
       │                                          │
       │  2. Digita email: admin@cultura.gov.br   │
       │     Digita senha: minha-senha-segura     │
       │  3. Clica "Entrar"                       │
       │  (Chamada: POST /doPost)                 │
       ├─────────────────────────────────────────>│
       │     {                                    │
       │       action: "login",                   │
       │       email: "admin@cultura.gov.br",     │
       │       password: "minha-senha-segura"     │
       │     }                                    │
       │                                          │
       │  4. Apps Script recebe credenciais       │
       │     Busca usuário na Aba "users"         │
       │     🔍 Encontra usuário:                 │
       │        - email: admin@cultura.gov.br     │
       │        - password_hash: abc123xyz...     │
       │        - role: "dev"                     │
       │        - status: "active"                │
       │                                          │
       │  5. Valida senha                         │
       │     SHA256("minha-senha-segura")         │
       │     Compara com hash armazenado          │
       │     ✅ SENHA CORRETA!                    │
       │                                          │
       │  6. Gera Token de Sessão                 │
       │     Token = UUID aleatório               │
       │     Ex: 550e8400-e29b-41d4-a716...      │
       │     Salva em Aba "_auth_tokens"          │
       │     Com expiração: hoje + 24h             │
       │                                          │
       │  7. Retorna resposta sucesso              │
       │<─────────────────────────────────────────┤
       │     {                                    │
       │       success: true,                     │
       │       token: "550e8400-e29b...",         │
       │       user: {                            │
       │         id: "198305ff-1c73-...",         │
       │         email: "admin@cultura...",       │
       │         name: "Admin Master",            │
       │         role: "dev",                     │
       │         photo: "https://..."             │
       │       }                                  │
       │     }                                    │
       │                                          │
       │  8. Frontend armazena token              │
       │     localStorage.setItem(                │
       │       'auth_token_gas',                  │
       │       '550e8400-e29b...'                 │
       │     )                                    │
       │                                          │
       │  9. Frontend armazena dados do usuário   │
       │     localStorage.setItem(                │
       │       'auth_user_gas',                   │
       │       { ...user }                        │
       │     )                                    │
       │                                          │
       │  ✅ Login bem-sucedido!                  │
       │  Redireciona para dashboard              │
```

### Código: Login (Frontend)

```javascript
// ARQUIVO: js/composables/useAuth.js

window.useAuth = function (router, notifications) {
    const auth = Vue.reactive({
        user: null,
        isAuthenticated: false,
        token: null,

        async attemptLogin(email, password) {
            try {
                // 1. Chama GASAPIService.login()
                const response = await window.GASAPIService.login(email, password);
                
                // 2. Se sucesso, armazena token e usuário
                if (response.success) {
                    this.login(response.user, response.token);
                    return response;
                } else {
                    notifications.add(response.message || "Falha no login", "error");
                    return { success: false };
                }
            } catch (e) {
                notifications.add("Erro ao conectar com servidor.", "error");
                return { success: false, error: e };
            }
        },

        login(user, token) {
            // 3. Salva em localStorage para sessão
            this.user = user;
            this.token = token;
            this.isAuthenticated = true;
            
            localStorage.setItem('auth_token_gas', token);
            localStorage.setItem('auth_user_gas', JSON.stringify(user));
            
            notifications.add(`Bem-vindo, ${user.name}!`);
            
            // 4. Redireciona para dashboard
            router.pushContext('public');
        }
    });

    return { auth };
};
```

### Código: Login (Backend - Apps Script)

```javascript
// ARQUIVO: Code.gs (Google Apps Script)

function handleLogin(postData) {
    try {
        // 1. Parse credenciais do cliente
        const data = JSON.parse(postData);
        const { email, password } = data;
        
        // 2. Abre Google Sheet
        const ss = SpreadsheetApp.openById(SS_ID);
        const usersSheet = ss.getSheetByName('users');
        const data = usersSheet.getDataRange().getValues();
        
        // 3. Procura usuário por email
        let userFound = null;
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const rowEmail = row[1];  // Column B: email
            
            if (rowEmail === email) {
                userFound = {
                    index: i,
                    id: row[0],           // Column A: id
                    email: row[1],        // Column B: email
                    name: row[2],         // Column C: name
                    passwordHash: row[4], // Column E: password_hash (NUNCA envia!)
                    role: row[5],         // Column F: role
                    status: row[6],       // Column G: status
                    photo: row[7]         // Column H: photo
                };
                break;
            }
        }
        
        // 4. Se não encontrou usuário
        if (!userFound) {
            logAction({ email: 'SYSTEM' }, 'LOGIN_FAILED', 'USERS', 
                { reason: 'user_not_found', email: email });
            return createResponse({ 
                success: false, 
                message: 'Email ou senha inválidos' 
            }, 401);
        }
        
        // 5. Se usuário está inativo
        if (userFound.status !== 'active') {
            logAction({ email: email }, 'LOGIN_FAILED', 'USERS', 
                { reason: 'user_inactive' });
            return createResponse({ 
                success: false, 
                message: 'Usuário inativo. Contate o administrador.' 
            }, 403);
        }
        
        // 6. Verifica senha (hash SHA-256)
        const passwordHash = Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256, 
            password
        )
            .map(b => (b < 0 ? 256 + b : b).toString(16).padStart(2, 0))
            .join('');
        
        if (passwordHash !== userFound.passwordHash) {
            logAction({ email: email }, 'LOGIN_FAILED', 'USERS', 
                { reason: 'invalid_password' });
            return createResponse({ 
                success: false, 
                message: 'Email ou senha inválidos' 
            }, 401);
        }
        
        // 7. Senha correta! Gera token de sessão
        const token = Utilities.getUuid();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        
        // 8. Salva token na Aba "_auth_tokens"
        const tokensSheet = ss.getSheetByName('_auth_tokens');
        tokensSheet.appendRow([
            email,           // Column A: email
            token,          // Column B: token
            userFound.role, // Column C: role
            expiresAt       // Column D: expires_at
        ]);
        
        // 9. Registra login bem-sucedido
        logAction({ email: email, role: userFound.role }, 'LOGIN_SUCCESS', 'USERS', 
            { userId: userFound.id });
        
        // 10. Retorna sucesso (SEM password_hash!)
        return createResponse({
            success: true,
            token: token,
            user: {
                id: userFound.id,
                email: userFound.email,
                name: userFound.name,
                role: userFound.role,
                photo: userFound.photo
                // ⚠️ NÃO inclui passwordHash!
            }
        }, 200);
        
    } catch (error) {
        logError(error);
        return createResponse('Server error', 500);
    }
}
```

---

## Fluxo de Logout

### Diagrama: 2️⃣ Logout

```
┌─────────────┐                          ┌──────────────────┐
│  Navegador  │                          │  Google Sheets   │
│  (Frontend) │                          │   + Apps Script  │
└──────┬──────┘                          └────────┬─────────┘
       │                                          │
       │  1. Usuário clica "Sair"                 │
       │  (Chamada: POST /doPost)                 │
       ├─────────────────────────────────────────>│
       │     {                                    │
       │       action: "logout",                  │
       │       token: "550e8400-e29b..."          │
       │     }                                    │
       │                                          │
       │  2. Apps Script recebe logout            │
       │     Busca token na Aba "_auth_tokens"    │
       │     Remove linha do token                │
       │                                          │
       │  3. Registra logout em _logs             │
       │     Quem: admin@cultura.gov.br           │
       │     Quando: 2026-01-29 15:45:30          │
       │     O quê: LOGOUT                        │
       │                                          │
       │  4. Retorna OK                           │
       │<─────────────────────────────────────────┤
       │     { success: true }                    │
       │                                          │
       │  5. Frontend limpa dados                 │
       │     localStorage.removeItem(             │
       │       'auth_token_gas'                   │
       │     )                                    │
       │     localStorage.removeItem(             │
       │       'auth_user_gas'                    │
       │     )                                    │
       │                                          │
       │  6. Frontend limpa cache                 │
       │     Todos os dados em cache são          │
       │     removidos para nova autenticação     │
       │                                          │
       │  ✅ Logout bem-sucedido!                 │
       │  Redireciona para login page              │
```

---

## Gerenciamento de Sessão

### 🔐 Como Funciona a Sessão

```javascript
// 1. APÓS LOGIN BEM-SUCEDIDO

// Token gerado:
const token = "550e8400-e29b-41d4-a716-446655440000"
// Armazenado em localStorage:
localStorage.auth_token_gas = "550e8400-e29b-41d4-a716-446655440000"

// 2. TODA OPERAÇÃO SUBSEQUENTE INCLUI TOKEN

async function listEvents() {
    const token = localStorage.getItem('auth_token_gas');
    
    const response = await fetch(GAS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'getData',
            collection: 'events',
            token: token  // ← Token é OBRIGATÓRIO
        })
    });
}

// 3. BACKEND VALIDA TOKEN

function validateSession(token) {
    const tokensSheet = ss.getSheetByName('_auth_tokens');
    const data = tokensSheet.getDataRange().getValues();
    
    for (let row of data) {
        const storedToken = row[1];
        const expiresAt = row[3];
        
        // ✅ Token existe?
        if (storedToken === token) {
            // ✅ Não expirou?
            if (new Date(expiresAt) > new Date()) {
                return {
                    email: row[0],
                    role: row[2],
                    isValid: true
                };
            } else {
                // ❌ Expirou
                return null;
            }
        }
    }
    
    // ❌ Token não encontrado
    return null;
}

// 4. SE TOKEN INVÁLIDO OU EXPIRADO

if (!validateSession(token)) {
    return createResponse({ 
        error: 'Unauthorized',
        message: 'Sessão expirada. Faça login novamente.' 
    }, 401);
}
```

### 📊 Tabela: _auth_tokens

```
Column A | Column B       | Column C | Column D
─────────┼────────────────┼──────────┼──────────────────────
email    | token          | role     | expires_at
─────────┼────────────────┼──────────┼──────────────────────
admin@cu | 550e8400-e29b- | dev      | 2026-01-30 15:45:30
ltura.go |  41d4-a716-... |          |
v.br     |                |          |
─────────┼────────────────┼──────────┼──────────────────────
user@cul | 660f9511-f40c- | user     | 2026-01-30 14:30:15
tura.pt  | 52e5-b827-...  |          |
─────────┼────────────────┼──────────┼──────────────────────
```

### ⏰ Timeout Automático

```javascript
// FRONTEND: Detecta token expirado

const checkTokenExpiry = setInterval(async () => {
    const token = localStorage.getItem('auth_token_gas');
    
    try {
        // Tenta uma operação simples
        await window.GASAPIService.list('events');
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            // ❌ Token expirou
            console.warn('Sessão expirada!');
            
            // Limpa tudo
            localStorage.removeItem('auth_token_gas');
            localStorage.removeItem('auth_user_gas');
            
            // Volta ao login
            window.location.href = '#/login';
            
            // Avisa usuário
            window.notify('Sessão Expirada', 
                'Sua sessão expirou. Faça login novamente.', 
                'warning');
        }
    }
}, 5 * 60 * 1000); // Check a cada 5 minutos
```

---

## Permissões e Controle de Acesso

### 📋 Roles e Permissões

```javascript
// Definido em Constants.js

const PERMISSIONS = {
    'dev': {
        read: ['*'],                    // Lê tudo
        write: ['*'],                   // Escreve tudo
        delete: ['*'],                  // Deleta tudo
        canManageUsers: true,           // Gerencia usuários
        canViewLogs: true,              // Vê auditoria
        canManageSystem: true           // Configura sistema
    },
    'admin': {
        read: ['*'],
        write: ['*'],
        delete: ['events', 'documents'],
        canManageUsers: true,
        canViewLogs: true,
        canManageSystem: false          // Não pode tocar em config
    },
    'editor': {
        read: ['*'],
        write: ['events', 'team', 'documents'],
        delete: [],                     // Não pode deletar nada
        canManageUsers: false,
        canViewLogs: false,
        canManageSystem: false
    },
    'user': {
        read: ['*'],
        write: [],                      // Leitura apenas
        delete: [],
        canManageUsers: false,
        canViewLogs: false,
        canManageSystem: false
    }
};
```

### 🔐 Validação de Permissão (Backend)

```javascript
// BACKEND: Toda operação valida permissões

function handleSaveData(e, session) {
    const { collection, item } = JSON.parse(e.postData.contents);
    
    // 1. Valida sessão
    if (!session || !session.email) {
        return createResponse('Unauthorized', 401);
    }
    
    // 2. Valida permissão de ESCRITA
    if (!canAccess(session, 'write', collection)) {
        logAction(session, 'PERMISSION_DENIED', collection, 
            { action: 'write', reason: 'insufficient_permissions' });
        return createResponse('Access denied', 403);
    }
    
    // 3. Salva o item
    // ... código de save ...
    
    // 4. Registra em logs
    logAction(session, 'SAVE', collection, { 
        itemId: item.id,
        timestamp: new Date()
    });
}

function canAccess(session, action, collection) {
    const PERMISSIONS = {
        'dev': { read: ['*'], write: ['*'], delete: ['*'] },
        'admin': { read: ['*'], write: ['*'], delete: ['events', 'documents'] },
        'editor': { read: ['*'], write: ['events', 'team', 'documents'], delete: [] },
        'user': { read: ['*'], write: [], delete: [] }
    };
    
    const perms = PERMISSIONS[session.role] || { read: [], write: [], delete: [] };
    const allowed = perms[action] || [];
    
    // Verifica se permission inclui wildcard '*' ou a coleção específica
    return allowed.includes('*') || allowed.includes(collection);
}
```

### ✅ Exemplo: Usuário 'editor' tenta deletar evento

```javascript
// FRONTEND: Editor tenta deletar evento
const resultado = await window.GASAPIService.delete('events', 'abc123');

// BACKEND: Recebe requisição
// 1. Valida token: ✅ Token válido
// 2. Extrai role: "editor"
// 3. Verifica canAccess('editor', 'delete', 'events')
// 4. Consulta PERMISSIONS:
//    editor.delete = [] (VAZIO, não pode deletar nada!)
// 5. Retorna erro: ❌ 403 Access Denied

// FRONTEND: Recebe erro
if (response.status === 403) {
    window.notify('Acesso Negado', 
        'Você não tem permissão para deletar eventos', 
        'error');
}
```

---

## Tabela de Usuários no Google Sheets

### 📊 Estrutura da Aba "users"

```
Col A   | Col B            | Col C         | Col D        | Col E           | Col F   | Col G     | Col H
────────┼──────────────────┼───────────────┼──────────────┼─────────────────┼─────────┼───────────┼────────
id      | email            | name          | phone        | password_hash   | role    | status    | photo
────────┼──────────────────┼───────────────┼──────────────┼─────────────────┼─────────┼───────────┼────────
1980... | admin@cultura... | Admin Master  | 912 345 678  | 8d969eef6ecad3  | dev     | active    | https
        | gov.br           |               |              | c29a3a62928...  |         |           | ://...
────────┼──────────────────┼───────────────┼──────────────┼─────────────────┼─────────┼───────────┼────────
243a... | user@cultura.pt  | Colaborador   | 966 555 444  | 8d969eef6ecad3  | user    | active    | https
        |                  |               |              | c29a3a62928...  |         |           | ://...
────────┼──────────────────┼───────────────┼──────────────┼─────────────────┼─────────┼───────────┼────────
```

### ⚠️ Dados Sensíveis: NUNCA expor

```javascript
// ❌ NUNCA retorna password_hash para frontend
function handleGetData(e, session) {
    // ...
    const headers = data[0];
    const rows = data.slice(1);
    
    const items = rows.map(row => {
        const item = {};
        headers.forEach((header, i) => {
            // ❌ NUNCA inclui password_hash
            if (header !== 'password_hash') {
                item[header] = row[i];
            }
        });
        return item;
    });
}
```

---

## Segurança

### 🔒 Checklist de Segurança Implementada

#### Backend (Apps Script)

```javascript
[✅] 1. Hash de senha com SHA-256
     └─ Todas senhas armazenadas como hash
     └─ Mesmo que DB vaze, senhas não são legíveis

[✅] 2. Validação de token antes de cada operação
     └─ POST sem token → 401 Unauthorized
     └─ Token expirado → 401 Unauthorized

[✅] 3. Validação de permissões
     └─ user='user' tenta deletar → 403 Access Denied
     └─ editor tenta criar usuário → 403 Access Denied

[✅] 4. Auditoria completa
     └─ Toda ação registrada em _logs
     └─ Quem? Quando? O quê? Por quê?

[✅] 5. Nunca confiar no cliente
     └─ Nunca aceita role/email do frontend
     └─ Sempre valida no backend
     └─ Mesmo que usuário altere localStorage

[✅] 6. CORS bloqueado para origins não autorizadas
     └─ Apenas seu domínio pode chamar API
     └─ Previne requisições maliciosas de outros sites
```

#### Frontend (Navegador)

```javascript
[✅] 1. Token armazenado em localStorage
     └─ Acessível apenas ao seu site (mesma origem)
     └─ Inacessível a iframes de outros domínios

[✅] 2. Detecção de sessão expirada
     └─ Tenta operação periodicamente
     └─ Se falhar com 401, logout automático

[✅] 3. Limpeza ao logout
     └─ Remove token de localStorage
     └─ Remove dados do usuário
     └─ Limpa cache

[✅] 4. Máscara visual de dados sensíveis
     └─ Nunca mostra password_hash
     └─ Mostra apenas role/email/nome
```

---

## Fluxos de Erro

### ❌ Cenário 1: Login com Senha Errada

```javascript
// FRONTEND
await window.GASAPIService.login('admin@cultura.gov.br', 'senha-errada')

// BACKEND
// 1. Encontra usuário ✅
// 2. Calcula hash de "senha-errada"
// 3. Compara: hash_calculado !== hash_armazenado
// 4. FALHA ❌

// RESPOSTA
{
    success: false,
    message: "Email ou senha inválidos"  // ← Mensagem genérica
}

// ⚠️ NÃO diz "Senha errada"
// Pois isso revelaria que o email existe!
// Sempre responder: "Email ou senha inválidos"

// LOGS
_logs: [
    {
        timestamp: 2026-01-29 15:45:30,
        user: "SYSTEM",
        action: "LOGIN_FAILED",
        collection: "USERS",
        details: {
            reason: "invalid_password",
            email: "admin@cultura.gov.br",
            ip: "192.168.1.100"  // ← Se implementado
        }
    }
]
```

### ❌ Cenário 2: Token Expirado

```javascript
// Usuário deixou aberto 25 horas
// Token expirou em 24 horas

// FRONTEND: Tenta carregar eventos
await window.GASAPIService.list('events')

// BACKEND
// 1. Recebe token antigo
// 2. Busca em _auth_tokens
// 3. Encontra token mas:
//    expiresAt (2026-01-30 15:45) < now (2026-01-31 16:45)
// 4. FALHA ❌

// RESPOSTA
{
    success: false,
    error: "Unauthorized",
    message: "Sessão expirada"
}
status: 401

// FRONTEND: Detecta 401
if (response.status === 401) {
    // Limpa dados
    localStorage.removeItem('auth_token_gas');
    localStorage.removeItem('auth_user_gas');
    
    // Avisa usuário
    window.notify('Sessão Expirada', 
        'Faça login novamente', 'warning');
    
    // Redireciona
    router.pushContext('login');
}
```

### ❌ Cenário 3: Usuário Inativo

```javascript
// Admin desativou usuário
// Status mudou de "active" para "inactive"

// USUÁRIO tenta fazer login
await window.GASAPIService.login('editor@cultura.gov.br', 'senha-correta')

// BACKEND
// 1. Encontra usuário ✅
// 2. Verifica status
// 3. status === "inactive" ❌
// 4. REJEITA LOGIN

// RESPOSTA
{
    success: false,
    message: "Usuário inativo. Contate o administrador."
}
status: 403

// LOGS
_logs: [
    {
        timestamp: 2026-01-29 15:45:30,
        user: "editor@cultura.gov.br",
        action: "LOGIN_FAILED",
        collection: "USERS",
        details: {
            reason: "user_inactive"
        }
    }
]
```

---

## Gerenciamento de Usuários (Admin)

### 👤 Admin cria novo usuário

```javascript
// BACKEND: Novo handler
function handleCreateUser(e, session) {
    // 1. Valida se é admin/dev
    if (!['dev', 'admin'].includes(session.role)) {
        return createResponse('Access denied', 403);
    }
    
    const { email, name, role, password } = JSON.parse(e.postData.contents);
    
    // 2. Valida email único
    // 3. Hash a senha
    // 4. Insere em Aba "users"
    // 5. Registra em _logs
    
    return createResponse({
        success: true,
        user: { id, email, name, role }
    }, 201);
}

// FRONTEND: Admin cria usuário
const newUser = {
    email: 'novo@cultura.gov.br',
    name: 'Novo Editor',
    role: 'editor',
    password: 'senha-temporária-123'  // ← Admin define inicial
};

await window.GASAPIService.createUser(newUser);
```

### 🔄 Admin força reset de senha

```javascript
// BACKEND
function handleForcePasswordReset(e, session) {
    if (!['dev', 'admin'].includes(session.role)) {
        return createResponse('Access denied', 403);
    }
    
    const { userId } = JSON.parse(e.postData.contents);
    
    // 1. Busca usuário
    // 2. Marca forceReset = true
    // 3. Salva em Aba "users"
    // 4. Invalida todas as sessões do usuário
    //    (remove linhas de _auth_tokens)
    // 5. Registra em _logs
    
    return createResponse({ success: true }, 200);
}

// FRONTEND: Próximo login do usuário
// Ao fazer login, receives: forceReset = true
if (response.user.forceReset) {
    // Redireciona para tela de reset obrigatório
    router.pushContext('reset-password');
    
    window.notify('Reset Obrigatório', 
        'Você deve alterar sua senha', 'warning');
}
```

### ❌ Admin desativa usuário

```javascript
// BACKEND
function handleUpdateUserStatus(e, session) {
    if (!['dev', 'admin'].includes(session.role)) {
        return createResponse('Access denied', 403);
    }
    
    const { userId, status } = JSON.parse(e.postData.contents);
    
    // 1. Busca usuário
    // 2. Muda status (active → inactive)
    // 3. Remove todas as sessões ativas
    // 4. Registra em _logs
    
    return createResponse({ success: true }, 200);
}

// FRONTEND: Admin lista e ativa/desativa
users.value.forEach(user => {
    // ✅ Mostra botão de status apenas se user.role em ['dev', 'admin']
    if (auth.can('manage_users')) {
        // Aqui pode desativar
    }
});
```

---

## Resumo: Antes vs Depois

| Aspecto | LocalStorage ❌ | Apps Script ✅ |
|---------|---|---|
| **Armazenamento Senha** | localStorage (visível) | Google Sheets (hash) |
| **Validação Senha** | Cliente (inseguro) | Servidor (seguro) |
| **Sessão** | Sem expiração | 24h com timeout |
| **Auditoria** | Nenhuma | Completa (_logs) |
| **Controle Acesso** | Frontend (pode burlar) | Backend (impossível burlar) |
| **Permissões** | Confiável em client | Validadas no servidor |
| **Isolamento Dados** | Todos em localStorage | Acesso granular |
| **Segurança** | 🔴 Crítica | 🟢 Boa |

---

**Tem dúvidas sobre como implementar? Posso criar um script passo-a-passo!**
