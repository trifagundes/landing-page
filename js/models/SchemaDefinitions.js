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
            { key: 'osc_logo', label: 'Logotipo da OSC', type: 'text', table: false, form: false, cols: 2, group: 'Informações Gerais' },
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
    documents: {
        singular: 'Documento',
        plural: 'Documentos',
        groups: ['Informações do Documento', 'Dados do Template'],
        fields: [
            { key: 'title', label: 'Título do Documento', type: 'text', table: true, form: true, required: true, cols: 2, group: 'Informações do Documento' },
            {
                key: 'template', label: 'Tipo de Documento', type: 'select', table: true, form: true, required: true, options: [
                    { value: 'certificate', label: 'Certificado' },
                    { value: 'report', label: 'Relatório de Evento' },
                    { value: 'letter', label: 'Ofício' },
                    { value: 'declaration', label: 'Declaração' },
                    { value: 'memorandum', label: 'Memorando' }
                ], cols: 1, group: 'Informações do Documento'
            },
            { key: 'generatedAt', label: 'Data de Geração', type: 'datetime', table: true, form: false, cols: 1, group: 'Informações do Documento' },
            {
                key: 'status', label: 'Status', type: 'select', table: true, form: true, options: [
                    { value: 'draft', label: 'Rascunho' },
                    { value: 'generated', label: 'Gerado' }
                ], cols: 1, group: 'Informações do Documento'
            },

            // === CAMPOS ESPECÍFICOS: MEMORANDO ===
            { key: 'memo_numero', label: 'Número do Memorando', type: 'text', table: false, form: true, cols: 1, group: 'Dados do Template', placeholder: 'Ex: 042/2024', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_data', label: 'Data de Emissão', type: 'date', table: false, form: true, cols: 1, group: 'Dados do Template', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_orgao', label: 'Órgão/Setor Emissor', type: 'text', table: false, form: true, cols: 2, group: 'Dados do Template', placeholder: 'Ex: Secretaria Municipal de Cultura', showIf: (d) => d.template === 'memorandum' },

            { key: 'memo_dest_nome', label: 'Para (Destinatário)', type: 'text', table: false, form: true, cols: 1, group: 'Dados do Template', placeholder: 'Nome do destinatário', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_dest_cargo', label: 'Cargo do Destinatário', type: 'text', table: false, form: true, cols: 1, group: 'Dados do Template', placeholder: 'Ex: Secretário de Educação', showIf: (d) => d.template === 'memorandum' },

            { key: 'memo_rem_nome', label: 'De (Remetente)', type: 'text', table: false, form: true, cols: 1, group: 'Dados do Template', placeholder: 'Nome do remetente', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_rem_cargo', label: 'Cargo do Remetente', type: 'text', table: false, form: true, cols: 1, group: 'Dados do Template', placeholder: 'Ex: Coordenador de Eventos', showIf: (d) => d.template === 'memorandum' },

            { key: 'memo_assunto', label: 'Assunto/Referência', type: 'text', table: false, form: true, cols: 2, group: 'Dados do Template', placeholder: 'Descreva o assunto do memorando', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_corpo', label: 'Mensagem', type: 'textarea', table: false, form: true, cols: 2, group: 'Dados do Template', placeholder: 'Digite o conteúdo do memorando...', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_anexos', label: 'Anexos', type: 'textarea', table: false, form: true, cols: 2, group: 'Dados do Template', placeholder: 'Liste os documentos anexos (um por linha)', showIf: (d) => d.template === 'memorandum' },
            { key: 'memo_assinantes', label: 'Assinantes', type: 'textarea', table: false, form: true, cols: 2, group: 'Dados do Template', placeholder: 'Nome e cargo dos assinantes (um por linha)', showIf: (d) => d.template === 'memorandum' },

            // Campos dinâmicos por template (armazenados como JSON)
            { key: 'templateData', label: 'Dados do Template', type: 'json', table: false, form: false, cols: 2, group: 'Dados do Template' },
            { key: 'notes', label: 'Observações', type: 'textarea', table: false, form: true, cols: 2, group: 'Dados do Template' }
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

    // ⭐ OSCs (Organizações da Sociedade Civil) - Lei 13.019
    oscs: {
        singular: 'OSC',
        plural: 'OSCs Cadastradas',
        groups: ['Dados Cadastrais', 'Representante Legal', 'Apresentação Institucional'],
        fields: [
            // DADOS CADASTRAIS
            { key: 'image', label: 'Logotipo/Capa', type: 'text', table: true, form: false, cols: 2, group: 'Dados Cadastrais' },
            {
                key: 'nome',
                label: 'Nome da OSC (Razão Social)',
                type: 'text',
                table: true,
                form: true,
                required: true,
                cols: 2,
                group: 'Dados Cadastrais',
                placeholder: 'Ex: Instituto Cultural Raízes'
            },
            {
                key: 'cnpj',
                label: 'CNPJ',
                type: 'text',
                table: true,
                form: true,
                required: true,
                cols: 1,
                group: 'Dados Cadastrais',
                placeholder: '00.000.000/0001-00',
                mask: '##.###.###/####-##'
            },
            {
                key: 'telefone',
                label: 'Telefone',
                type: 'text',
                table: true,
                form: true,
                required: true,
                cols: 1,
                group: 'Dados Cadastrais',
                placeholder: '(00) 0000-0000',
                mask: '(##) #####-####'
            },
            {
                key: 'email',
                label: 'E-mail Institucional',
                type: 'email',
                table: true,
                form: true,
                required: true,
                cols: 1,
                group: 'Dados Cadastrais',
                placeholder: 'contato@osc.org.br'
            },
            {
                key: 'endereco',
                label: 'Endereço Completo',
                type: 'textarea',
                table: false,
                form: true,
                required: true,
                cols: 1,
                rows: 3,
                group: 'Dados Cadastrais',
                placeholder: 'Logradouro, número, complemento, bairro, cidade/UF, CEP'
            },

            // REPRESENTANTE LEGAL
            {
                key: 'representante_nome',
                label: 'Nome Completo do Representante Legal',
                type: 'text',
                table: false,
                form: true,
                required: true,
                cols: 2,
                group: 'Representante Legal',
                placeholder: 'Nome conforme documento'
            },
            {
                key: 'representante_cpf',
                label: 'CPF',
                type: 'text',
                table: false,
                form: true,
                required: true,
                cols: 1,
                group: 'Representante Legal',
                placeholder: '000.000.000-00',
                mask: '###.###.###-##'
            },
            {
                key: 'representante_rg',
                label: 'RG e Órgão Expedidor',
                type: 'text',
                table: false,
                form: true,
                required: true,
                cols: 1,
                group: 'Representante Legal',
                placeholder: 'Ex: 1234567 SSP/RS'
            },
            {
                key: 'representante_cargo',
                label: 'Cargo/Função',
                type: 'text',
                table: false,
                form: true,
                required: true,
                cols: 2,
                group: 'Representante Legal',
                placeholder: 'Ex: Presidente'
            },

            // APRESENTAÇÃO INSTITUCIONAL
            {
                key: 'apresentacao',
                label: 'Histórico, Missão e Visão',
                type: 'textarea',
                table: false,
                form: true,
                required: false,
                cols: 2,
                rows: 10,
                group: 'Apresentação Institucional',
                placeholder: 'Descreva a missão, visão, histórico e principais realizações da OSC para uso em planos de trabalho...'
            },

            {
                key: 'status',
                label: 'Status',
                type: 'select',
                table: true,
                form: true,
                options: [
                    { value: 'active', label: 'Ativo' },
                    { value: 'inactive', label: 'Inativo' }
                ],
                cols: 2,
                group: 'Dados Cadastrais'
            }
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
