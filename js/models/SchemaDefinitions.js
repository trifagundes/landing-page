/**
 * SCHEMA DEFINITIONS (DRY SOURCE OF TRUTH)
 * Centralizes configuration for Tables (columns) and Forms (fields).
 */
window.DATA_MODELS = {
    events: {
        singular: 'Evento',
        plural: 'Eventos',
        groups: ['Informações Gerais', 'Impactos & Detalhes', 'Linguagens & Áreas'],
        fields: [
            { key: 'image', label: 'Capa', type: 'text', table: true, form: false, cols: 2, group: 'Informações Gerais' },
            { key: 'title', label: 'Nome do Evento', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Informações Gerais' },
            { key: 'date', label: 'Data', type: 'date', table: true, form: true, required: true, cols: 1, group: 'Informações Gerais' },
            { key: 'porte', label: 'Porte', type: 'select', table: true, form: true, options: [{ value: 'nacional', label: 'Nacional' }, { value: 'regional', label: 'Regional' }, { value: 'local', label: 'Local' }], cols: 1, group: 'Informações Gerais' },
            { key: 'highlight', label: 'Destaque', type: 'boolean', table: true, form: true, cols: 1, group: 'Informações Gerais' },

            { key: 'public', label: 'Público Estimado', type: 'number', table: true, form: true, cols: 1, group: 'Impactos & Detalhes' },
            { key: 'revenueEstimate', label: 'Impacto Financeiro', type: 'currency', table: true, form: true, cols: 1, group: 'Impactos & Detalhes' },
            { key: 'foodArea', label: 'Praça de Alimentação', type: 'text', table: false, form: true, cols: 2, group: 'Impactos & Detalhes' },
            { key: 'vendorsCount', label: 'Nº Ambulantes', type: 'number', table: false, form: true, cols: 1, group: 'Impactos & Detalhes' },
            { key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }], cols: 1, group: 'Impactos & Detalhes' },

            { key: 'languages', label: 'Linguagens Culturais', type: 'tags', table: false, form: true, cols: 2, group: 'Linguagens & Áreas' }
        ]
    },
    users: {
        singular: 'Usuário',
        plural: 'Usuários',
        groups: ['Informações Pessoais', 'Acesso & Permissões', 'Segurança', 'Preferências'],
        fields: [
            { key: 'photo', label: 'Foto', type: 'text', table: true, form: false, cols: 2, group: 'Informações Pessoais' },
            { key: 'name', label: 'Nome Completo', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Informações Pessoais' },
            { key: 'email', label: 'E-mail', type: 'email', table: true, form: true, required: true, cols: 1, group: 'Informações Pessoais', readonlyOnEdit: true, hint: 'O e-mail não pode ser alterado após a criação.' },
            { key: 'phone', label: 'Telefone', type: 'text', table: false, form: true, mask: '(##) #####-####', cols: 1, group: 'Informações Pessoais' },
            { key: 'birthDate', label: 'Data de Nascimento', type: 'date', table: false, form: true, cols: 1, group: 'Informações Pessoais' },
            { key: 'gender', label: 'Gênero', type: 'select', table: false, form: true, cols: 1, options: [{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Feminino' }, { value: 'other', label: 'Outro' }, { value: 'pref', label: 'Prefiro não dizer' }], group: 'Informações Pessoais' },

            { key: 'role', label: 'Permissão', type: 'select', table: true, form: true, options: [{ value: 'admin', label: 'Administrador' }, { value: 'user', label: 'Colaborador' }, { value: 'dev', label: 'Desenvolvedor' }], cols: 2, group: 'Acesso & Permissões' },
            { key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }], cols: 2, group: 'Acesso & Permissões' },

            { key: 'password', label: 'Nova Senha', type: 'password', table: false, form: true, cols: 2, group: 'Segurança' },
            { key: 'password_confirmation', label: 'Confirmar Senha', type: 'password', table: false, form: true, cols: 2, group: 'Segurança', equals: 'password' },

            { key: 'theme', label: 'Tema da Interface', type: 'select', table: false, form: true, cols: 2, group: 'Preferências', options: [{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro (Em breve)' }, { value: 'system', label: 'Sistema' }] },
            { key: 'language', label: 'Idioma', type: 'select', table: false, form: true, cols: 2, group: 'Preferências', options: [{ value: 'pt', label: 'Português' }, { value: 'en', label: 'English' }] }
        ]
    },
    team: {
        singular: 'Membro',
        plural: 'Equipe',
        groups: ['Ficha Profissional', 'Conteúdo & Bio'],
        fields: [
            { key: 'photo', label: 'Foto', type: 'text', table: true, form: false, cols: 2, group: 'Ficha Profissional' },
            { key: 'name', label: 'Nome Completo', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Ficha Profissional' },
            { key: 'position', label: 'Cargo', type: 'text', table: true, form: true, cols: 1, group: 'Ficha Profissional' },
            { key: 'email', label: 'E-mail Profissional', type: 'email', table: true, form: true, cols: 1, group: 'Ficha Profissional' },

            { key: 'bio', label: 'Mini Biografia', type: 'textarea', table: false, form: true, cols: 2, group: 'Conteúdo & Bio' },
            { key: 'highlight', label: 'Destaque', type: 'boolean', table: true, form: true, cols: 1, group: 'Conteúdo & Bio' },
            { key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }], cols: 1, group: 'Conteúdo & Bio' }
        ]
    },
    testimonials: {
        singular: 'Depoimento',
        plural: 'Depoimentos',
        groups: ['Autor & Mídia', 'Conteúdo & Contexto'],
        fields: [
            { key: 'photo', label: 'Foto da Pessoa', type: 'text', table: true, form: false, cols: 2, group: 'Autor & Mídia' },
            { key: 'author', label: 'Autor', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Autor & Mídia' },
            { key: 'role', label: 'Papel (Ex: Visitante)', type: 'text', table: false, form: true, cols: 1, group: 'Autor & Mídia' },
            { key: 'type', label: 'Tipo de Mídia', type: 'select', table: true, form: true, options: [{ value: 'texto', label: 'Texto' }, { value: 'video', label: 'Vídeo' }, { value: 'imagem', label: 'Print/Foto' }], cols: 1, group: 'Autor & Mídia' },

            { key: 'text', label: 'Depoimento', type: 'textarea', table: false, form: true, cols: 2, group: 'Conteúdo & Contexto' },
            { key: 'context', label: 'Contexto', type: 'select', table: true, form: true, options: [{ value: 'evento', label: 'Evento Específico' }, { value: 'geral', label: 'Geral' }], cols: 1, group: 'Conteúdo & Contexto' },
            { key: 'eventName', label: 'Nome do Evento', type: 'text', table: false, form: true, cols: 1, group: 'Conteúdo & Contexto' },
            { key: 'date', label: 'Data', type: 'date', table: true, form: true, cols: 1, group: 'Conteúdo & Contexto' },
            { key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }], cols: 1, group: 'Conteúdo & Contexto' },

            { key: 'videoUrl', label: 'URL do Vídeo (YouTube/Vimeo)', type: 'url', table: false, form: true, cols: 2, group: 'Conteúdo & Contexto', showIf: (d) => d.type === 'video' },
            { key: 'imageUrl', label: 'URL da Imagem (Print)', type: 'url', table: false, form: true, cols: 2, group: 'Conteúdo & Contexto', showIf: (d) => d.type === 'imagem' },
            { key: 'highlight', label: 'Destaque', type: 'boolean', table: true, form: true, cols: 1, group: 'Conteúdo & Contexto' }
        ]
    },
    clipping: {
        singular: 'Matéria',
        plural: 'Clipping',
        groups: ['Conteúdo da Matéria', 'Publicação & Links'],
        fields: [
            { key: 'image', label: 'Capa', type: 'text', table: true, form: false, cols: 2, group: 'Conteúdo da Matéria' },
            { key: 'title', label: 'Título da Matéria', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Conteúdo da Matéria' },
            { key: 'source', label: 'Veículo/Fonte', type: 'text', table: true, form: true, cols: 1, group: 'Conteúdo da Matéria' },

            { key: 'date', label: 'Publicação', type: 'date', table: true, form: true, cols: 1, group: 'Publicação & Links' },
            { key: 'url', label: 'Link da Matéria', type: 'text', table: false, form: true, cols: 2, group: 'Publicação & Links' },
            { key: 'highlight', label: 'Destaque', type: 'boolean', table: true, form: true, cols: 1, group: 'Publicação & Links' },
            { key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }], cols: 1, group: 'Publicação & Links' }
        ]
    },

    getTableColumns(collection) {
        const model = this[collection];
        if (!model || !model.fields) return [];
        return model.fields
            .filter(f => f && f.key && f.table)
            .map(f => ({
                key: f.key,
                label: f.label || f.key,
                type: f.type || 'text',
                options: f.options
            }));
    }
};
