/**
 * DOCUMENT TEMPLATES
 * Define todos os templates de documentos disponíveis no sistema.
 * Cada template tem seus próprios campos, validações e defaults.
 */
window.DOCUMENT_TEMPLATES = {
    memorandum: {
        id: 'memorandum',
        name: 'Memorando',
        description: 'Comunicação interna entre órgãos ou setores',
        icon: 'file-text',
        color: 'primary',

        fields: [
            {
                key: 'numero',
                label: 'Número do Memorando',
                type: 'text',
                placeholder: 'Ex: 042/2024',
                required: true,
                cols: 1
            },
            {
                key: 'data',
                label: 'Data de Emissão',
                type: 'date',
                required: true,
                cols: 1
            },
            {
                key: 'orgaoEmissor',
                label: 'Órgão/Setor Emissor',
                type: 'text',
                placeholder: 'Ex: Secretaria Municipal de Cultura',
                required: true,
                cols: 2
            },
            {
                key: 'destinatarioNome',
                label: 'Para (Destinatário)',
                type: 'text',
                placeholder: 'Nome do destinatário',
                required: true,
                cols: 1
            },
            {
                key: 'destinatarioCargo',
                label: 'Cargo do Destinatário',
                type: 'text',
                placeholder: 'Ex: Secretário de Educação',
                required: true,
                cols: 1
            },
            {
                key: 'remetenteNome',
                label: 'De (Remetente)',
                type: 'text',
                placeholder: 'Nome do remetente',
                required: true,
                cols: 1
            },
            {
                key: 'remetenteCargo',
                label: 'Cargo do Remetente',
                type: 'text',
                placeholder: 'Ex: Coordenador de Eventos',
                required: true,
                cols: 1
            },
            {
                key: 'assunto',
                label: 'Assunto/Referência',
                type: 'text',
                placeholder: 'Descreva o assunto do memorando',
                required: true,
                cols: 2
            },
            {
                key: 'corpo',
                label: 'Mensagem',
                type: 'textarea',
                placeholder: 'Digite o conteúdo do memorando...',
                required: true,
                cols: 2,
                rows: 8
            },
            {
                key: 'anexos',
                label: 'Anexos',
                type: 'textarea',
                placeholder: 'Liste os documentos anexos (um por linha)',
                cols: 2,
                rows: 3
            },
            {
                key: 'assinantes',
                label: 'Assinantes',
                type: 'textarea',
                placeholder: 'Nome e cargo dos assinantes (um por linha)',
                required: true,
                cols: 2,
                rows: 4
            }
        ],

        getDefaults: (currentUser) => {
            const today = new Date().toISOString().split('T')[0];
            return {
                data: today,
                remetenteNome: currentUser?.name || '',
                assinantes: currentUser?.name ? `${currentUser.name}\n` : ''
            };
        }
    },

    certificate: {
        id: 'certificate',
        name: 'Certificado',
        description: 'Certificado de participação em eventos',
        icon: 'award',
        color: 'success',

        fields: [
            {
                key: 'recipientName',
                label: 'Nome do Participante',
                type: 'text',
                placeholder: 'Nome completo',
                required: true,
                cols: 2
            },
            {
                key: 'eventName',
                label: 'Nome do Evento',
                type: 'text',
                placeholder: 'Ex: Bicentenário (200 Anos): Raça Negra',
                required: true,
                cols: 2
            },
            {
                key: 'eventDate',
                label: 'Data do Evento',
                type: 'date',
                required: true,
                cols: 1
            },
            {
                key: 'hours',
                label: 'Carga Horária',
                type: 'number',
                placeholder: 'Horas',
                cols: 1
            },
            {
                key: 'description',
                label: 'Descrição/Atividade',
                type: 'textarea',
                placeholder: 'Descreva a atividade realizada...',
                cols: 2,
                rows: 4
            }
        ],

        getDefaults: () => ({
            hours: 8
        })
    },

    letter: {
        id: 'letter',
        name: 'Ofício',
        description: 'Comunicação oficial externa',
        icon: 'mail',
        color: 'warning',

        // ⭐ Sistema de Abas
        groups: ['Identificação', 'Destinatário', 'Conteúdo'],

        fields: [
            {
                key: 'numero',
                label: 'Número do Ofício',
                type: 'text',
                placeholder: 'Ex: OF/001/2024',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'data',
                label: 'Data',
                type: 'date',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'remetente',
                label: 'Remetente',
                type: 'text',
                placeholder: 'Nome do remetente',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'cargo',
                label: 'Cargo',
                type: 'text',
                placeholder: 'Cargo do remetente',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'destinatario',
                label: 'Destinatário',
                type: 'text',
                placeholder: 'Nome completo',
                required: true,
                cols: 2,
                group: 'Destinatário'
            },
            {
                key: 'endereco',
                label: 'Endereço',
                type: 'textarea',
                placeholder: 'Endereço completo do destinatário',
                required: true,
                cols: 2,
                rows: 3,
                group: 'Destinatário'
            },
            {
                key: 'assunto',
                label: 'Assunto',
                type: 'text',
                placeholder: 'Assunto do ofício',
                required: true,
                cols: 2,
                group: 'Conteúdo'
            },
            {
                key: 'corpo',
                label: 'Mensagem',
                type: 'textarea',
                placeholder: 'Conteúdo do ofício...',
                required: true,
                cols: 2,
                rows: 10,
                group: 'Conteúdo'
            }
        ],

        getDefaults: (currentUser) => {
            const today = new Date().toISOString().split('T')[0];
            return {
                data: today,
                remetente: currentUser?.name || ''
            };
        }
    },

    declaration: {
        id: 'declaration',
        name: 'Declaração',
        description: 'Declaração oficial',
        icon: 'file-check',
        color: 'info',

        fields: [
            {
                key: 'titulo',
                label: 'Título da Declaração',
                type: 'text',
                placeholder: 'Ex: Declaração de Comparecimento',
                required: true,
                cols: 2
            },
            {
                key: 'declarante',
                label: 'Declarante (quem declara)',
                type: 'text',
                placeholder: 'Nome completo',
                required: true,
                cols: 1
            },
            {
                key: 'cargo',
                label: 'Cargo do Declarante',
                type: 'text',
                placeholder: 'Cargo',
                required: true,
                cols: 1
            },
            {
                key: 'beneficiario',
                label: 'Beneficiário',
                type: 'text',
                placeholder: 'Para quem é a declaração',
                required: true,
                cols: 2
            },
            {
                key: 'finalidade',
                label: 'Finalidade',
                type: 'text',
                placeholder: 'Ex: Para fins de comprovação',
                cols: 2
            },
            {
                key: 'corpo',
                label: 'Texto da Declaração',
                type: 'textarea',
                placeholder: 'Declaro que...',
                required: true,
                cols: 2,
                rows: 8
            },
            {
                key: 'data',
                label: 'Data',
                type: 'date',
                required: true,
                cols: 1
            },
            {
                key: 'local',
                label: 'Local',
                type: 'text',
                placeholder: 'Ex: Santana do Livramento/RS',
                required: true,
                cols: 1
            }
        ],

        getDefaults: (currentUser) => {
            const today = new Date().toISOString().split('T')[0];
            return {
                data: today,
                declarante: currentUser?.name || '',
                local: 'Santana do Livramento/RS'
            };
        }
    },

    contract: {
        id: 'contract',
        name: 'Contrato',
        description: 'Contrato de prestação de serviços',
        icon: 'file-signature',
        color: 'danger',

        accordion: true,
        groups: ['Identificação', 'Partes Contratantes', 'Objeto do Contrato', 'Valores e Pagamento', 'Vigência e Cláusulas'],

        fields: [
            {
                key: 'numero',
                label: 'Número do Contrato',
                type: 'text',
                placeholder: 'Ex: 001/2024',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'data',
                label: 'Data de Assinatura',
                type: 'date',
                required: true,
                cols: 1,
                group: 'Identificação'
            },
            {
                key: 'contratante',
                label: 'Contratante (Nome/Razão Social)',
                type: 'text',
                placeholder: 'Ex: Prefeitura Municipal',
                required: true,
                cols: 2,
                group: 'Partes Contratantes'
            },
            {
                key: 'contratanteCnpj',
                label: 'CNPJ/CPF do Contratante',
                type: 'text',
                placeholder: 'Ex: 00.000.000/0001-00',
                required: true,
                cols: 1,
                group: 'Partes Contratantes'
            },
            {
                key: 'contratanteEndereco',
                label: 'Endereço do Contratante',
                type: 'textarea',
                placeholder: 'Endereço completo',
                required: true,
                cols: 1,
                rows: 3,
                group: 'Partes Contratantes'
            },
            {
                key: 'contratado',
                label: 'Contratado (Nome/Razão Social)',
                type: 'text',
                placeholder: 'Ex: Empresa de Serviços Ltda',
                required: true,
                cols: 2,
                group: 'Partes Contratantes'
            },
            {
                key: 'contratadoCnpj',
                label: 'CNPJ/CPF do Contratado',
                type: 'text',
                placeholder: 'Ex: 00.000.000/0001-00',
                required: true,
                cols: 1,
                group: 'Partes Contratantes'
            },
            {
                key: 'contratadoEndereco',
                label: 'Endereço do Contratado',
                type: 'textarea',
                placeholder: 'Endereço completo',
                required: true,
                cols: 1,
                rows: 3,
                group: 'Partes Contratantes'
            },
            {
                key: 'objeto',
                label: 'Objeto do Contrato',
                type: 'textarea',
                placeholder: 'Descreva os serviços ou produtos contratados...',
                required: true,
                cols: 2,
                rows: 6,
                group: 'Objeto do Contrato'
            },
            {
                key: 'valorTotal',
                label: 'Valor Total',
                type: 'text',
                placeholder: 'Ex: R$ 50.000,00',
                required: true,
                cols: 1,
                group: 'Valores e Pagamento'
            },
            {
                key: 'formaPagamento',
                label: 'Forma de Pagamento',
                type: 'text',
                placeholder: 'Ex: Parcelado em 3x',
                required: true,
                cols: 1,
                group: 'Valores e Pagamento'
            },
            {
                key: 'condicoesPagamento',
                label: 'Condições de Pagamento',
                type: 'textarea',
                placeholder: 'Descreva as condições e datas...',
                required: true,
                cols: 2,
                rows: 4,
                group: 'Valores e Pagamento'
            },
            {
                key: 'dataInicio',
                label: 'Data de Início',
                type: 'date',
                required: true,
                cols: 1,
                group: 'Vigência e Cláusulas'
            },
            {
                key: 'dataTermino',
                label: 'Data de Término',
                type: 'date',
                required: true,
                cols: 1,
                group: 'Vigência e Cláusulas'
            },
            {
                key: 'clausulasEspeciais',
                label: 'Cláusulas Especiais',
                type: 'textarea',
                placeholder: 'Descreva cláusulas adicionais...',
                cols: 2,
                rows: 6,
                group: 'Vigência e Cláusulas'
            }
        ],

        getDefaults: (currentUser) => {
            const today = new Date().toISOString().split('T')[0];
            return {
                data: today,
                dataInicio: today,
                contratante: 'Prefeitura Municipal'
            };
        }
    },

    // ⭐ PLANO DE TRABALHO - LEI 13.019 (Refatorado com estrutura semântica)
    workplan_13019: {
        id: 'workplan_13019',
        name: 'Plano de Trabalho - Lei 13.019',
        description: 'Plano de Trabalho para parcerias com OSCs',
        icon: 'briefcase',
        color: 'secondary',

        // ⭐ 7 Acordeons Semânticos (Fluxo Intuitivo)
        accordion: true,
        groups: [
            '1. Instituição Parceira',
            '2. Conta Exclusiva do Projeto',
            '3. Apresentação e Contexto',
            '4. Justificativa e Objetivos',
            '5. Metodologia e Planejamento',
            '6. Orçamento e Sustentabilidade',
            '7. Indicadores e Gestão de Riscos'
        ],

        fields: [
            // ==========================================
            // 1. DADOS DA OSC
            // ==========================================
            {
                key: 'osc_id',
                label: 'Vincular OSC Cadastrada',
                type: 'select',
                placeholder: 'Escolha uma OSC ou preencha manualmente...',
                cols: 2,
                group: '1. Instituição Parceira',
                hint: 'Selecione uma OSC para preencher automaticamente os dados básicos e o representante.'
            },
            {
                key: 'osc_logo',
                label: 'Logotipo da OSC',
                type: 'text',
                cols: 2,
                group: '1. Instituição Parceira',
                hint: 'Logotipo oficial da instituição para o documento.'
            },
            {
                key: 'osc_save_new',
                label: 'Salvar como nova OSC?',
                type: 'boolean',
                cols: 2,
                group: '1. Instituição Parceira',
                hint: 'Se marcado, os dados preenchidos abaixo serão salvos no cadastro de OSCs para uso futuro.'
            },
            {
                key: 'osc_nome',
                label: 'Nome da OSC (Razão Social)',
                type: 'text',
                placeholder: 'Ex: Instituto Cultural Raízes',
                required: true,
                cols: 2,
                group: '1. Instituição Parceira'
            },
            {
                key: 'osc_cnpj',
                label: 'CNPJ',
                type: 'text',
                placeholder: '00.000.000/0001-00',
                required: true,
                cols: 1,
                group: '1. Instituição Parceira'
            },
            {
                key: 'osc_telefone',
                label: 'Telefone',
                type: 'text',
                placeholder: '(00) 0000-0000',
                required: true,
                cols: 1,
                group: '1. Instituição Parceira'
            },
            {
                key: 'osc_email',
                label: 'E-mail Institucional',
                type: 'text',
                placeholder: 'contato@osc.org.br',
                required: true,
                cols: 1,
                group: '1. Instituição Parceira'
            },
            {
                key: 'osc_endereco',
                label: 'Endereço Completo',
                type: 'textarea',
                placeholder: 'Logradouro, número, complemento, bairro, cidade/UF, CEP',
                required: true,
                cols: 1,
                rows: 3,
                group: '1. Instituição Parceira'
            },

            // ==========================================
            // 2. REPRESENTANTE LEGAL
            // ==========================================
            {
                key: 'representante_nome',
                label: 'Nome Completo do Representante Legal',
                type: 'text',
                placeholder: 'Nome conforme documento',
                required: true,
                cols: 2,
                group: '1. Instituição Parceira'
            },
            {
                key: 'representante_cpf',
                label: 'CPF',
                type: 'text',
                placeholder: '000.000.000-00',
                required: true,
                cols: 1,
                group: '1. Instituição Parceira'
            },
            {
                key: 'representante_rg',
                label: 'RG e Órgão Expedidor',
                type: 'text',
                placeholder: 'Ex: 1234567 SSP/RS',
                required: true,
                cols: 1,
                group: '1. Instituição Parceira'
            },
            {
                key: 'representante_cargo',
                label: 'Cargo/Função',
                type: 'text',
                placeholder: 'Ex: Presidente',
                required: true,
                cols: 2,
                group: '1. Instituição Parceira'
            },

            // ==========================================
            // 3. APRESENTAÇÃO DA OSC
            // ==========================================
            {
                key: 'apresentacao_osc',
                label: 'Apresentação da OSC',
                type: 'textarea',
                placeholder: 'Missão, visão, histórico, área de atuação, principais realizações',
                required: true,
                cols: 2,
                rows: 6,
                group: '1. Instituição Parceira'
            },

            // ==========================================
            // 4. CONTA EXCLUSIVA DO PROJETO
            // ==========================================
            {
                key: 'conta_status',
                label: 'Status da Conta Bancária',
                type: 'select',
                required: true,
                options: [
                    { value: 'pendente', label: 'Informar oportunamente (após aprovação)' },
                    { value: 'informado', label: 'Informar agora (conta já disponível)' }
                ],
                cols: 2,
                group: '2. Conta Exclusiva do Projeto',
                hint: 'A Lei 13.019 exige conta exclusiva. Você pode informar os dados agora ou somente após a aprovação do plano.'
            },
            {
                key: 'conta_banco',
                label: 'Banco',
                type: 'text',
                placeholder: 'Ex: Banco do Brasil - 001',
                required: false, // Depende de conta_status
                cols: 1,
                group: '2. Conta Exclusiva do Projeto'
            },
            {
                key: 'conta_agencia',
                label: 'Agência',
                type: 'text',
                placeholder: 'Ex: 1234-5',
                required: false, // Depende de conta_status
                cols: 1,
                group: '2. Conta Exclusiva do Projeto'
            },
            {
                key: 'conta_numero',
                label: 'Conta Corrente (Exclusiva)',
                type: 'text',
                placeholder: 'Ex: 12345-6',
                required: false, // Depende de conta_status
                cols: 2,
                group: '2. Conta Exclusiva do Projeto'
            },

            // ==========================================
            // 5. APRESENTAÇÃO E CONTEXTO
            // ==========================================
            {
                key: 'titulo_projeto',
                label: 'Título do Projeto',
                type: 'text',
                placeholder: 'Ex: Resgate Cultural: 200 Anos de História Afro-brasileira',
                required: true,
                cols: 2,
                group: '3. Apresentação e Contexto'
            },
            {
                key: 'resumo',
                label: 'Resumo Executivo',
                type: 'textarea',
                placeholder: 'Descreva em poucas linhas o que é o projeto (máximo 500 caracteres)',
                required: true,
                cols: 2,
                rows: 4,
                group: '3. Apresentação e Contexto'
            },
            {
                key: 'contexto',
                label: 'Contexto e Diagnóstico',
                type: 'textarea',
                placeholder: 'Qual a realidade local? Quais problemas/necessidades existem? Dados e evidências que fundamentam o projeto',
                required: true,
                cols: 2,
                rows: 8,
                group: '3. Apresentação e Contexto'
            },
            {
                key: 'publico_alvo',
                label: 'Público-Alvo Beneficiado',
                type: 'textarea',
                placeholder: 'Quem será beneficiado? Quantas pessoas? Perfil demográfico (idade, gênero, localização, vulnerabilidades)',
                required: true,
                cols: 2,
                rows: 5,
                group: '3. Apresentação e Contexto'
            },

            // ==========================================
            // 6. JUSTIFICATIVA E OBJETIVOS
            // ==========================================
            {
                key: 'justificativa',
                label: 'Justificativa',
                type: 'textarea',
                placeholder: 'Por que este projeto é necessário? Como ele contribui para resolver o problema identificado? Referências, pesquisas, dados',
                required: true,
                cols: 2,
                rows: 8,
                group: '4. Justificativa e Objetivos'
            },
            {
                key: 'objetivo_geral',
                label: 'Objetivo Geral',
                type: 'textarea',
                placeholder: 'O que o projeto pretende alcançar de forma ampla?',
                required: true,
                cols: 2,
                rows: 3,
                group: '4. Justificativa e Objetivos'
            },
            {
                key: 'objetivos_especificos',
                label: 'Objetivos Específicos',
                type: 'textarea',
                placeholder: 'Liste os objetivos específicos (detalhamentos do objetivo geral, mensuráveis)',
                required: true,
                cols: 2,
                rows: 6,
                group: '4. Justificativa e Objetivos'
            },
            {
                key: 'metas',
                label: 'Metas Quantificáveis',
                type: 'textarea',
                placeholder: 'Liste metas numéricas: Ex: - Realizar 10 oficinas\n- Atender 200 pessoas\n- Produzir 5 vídeos documentários',
                required: true,
                cols: 2,
                rows: 6,
                group: '4. Justificativa e Objetivos'
            },

            // ==========================================
            // 7. METODOLOGIA E PLANEJAMENTO
            // ==========================================
            {
                key: 'metodologia',
                label: 'Metodologia',
                type: 'textarea',
                placeholder: 'Como o projeto será executado? Qual a abordagem metodológica? Técnicas, métodos, ferramentas',
                required: true,
                cols: 2,
                rows: 8,
                group: '5. Metodologia e Planejamento'
            },
            {
                key: 'acoes_atividades',
                label: 'Ações e Atividades Detalhadas',
                type: 'textarea',
                placeholder: 'Descreva TODAS as atividades que serão realizadas no projeto, passo a passo',
                required: true,
                cols: 2,
                rows: 10,
                group: '5. Metodologia e Planejamento'
            },
            {
                key: 'cronograma',
                label: 'Cronograma de Execução',
                type: 'textarea',
                placeholder: 'Divida o projeto em fases/etapas com datas. Ex:\nMês 1-2: Planejamento e mobilização\nMês 3-6: Execução das oficinas\nMês 7: Evento de encerramento',
                required: true,
                cols: 2,
                rows: 8,
                group: '5. Metodologia e Planejamento'
            },
            {
                key: 'local_execucao',
                label: 'Local de Execução',
                type: 'text',
                placeholder: 'Ex: Santana do Livramento/RS',
                required: true,
                cols: 1,
                group: '5. Metodologia e Planejamento'
            },
            {
                key: 'periodo_execucao',
                label: 'Período de Execução',
                type: 'text',
                placeholder: 'Ex: 12 meses (01/01/2024 a 31/12/2024)',
                required: true,
                cols: 1,
                group: '5. Metodologia e Planejamento'
            },

            // ==========================================
            // 8. ORÇAMENTO E SUSTENTABILIDADE
            // ==========================================
            {
                key: 'valor_total',
                label: 'Valor Global da Parceria',
                type: 'text',
                placeholder: 'Ex: R$ 150.000,00',
                required: true,
                cols: 1,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'tipo_parceria',
                label: 'Tipo de Parceria',
                type: 'text',
                placeholder: 'Ex: Termo de Colaboração / Termo de Fomento',
                required: true,
                cols: 1,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'orcamento_detalhado',
                label: 'Orçamento Detalhado por Rubrica',
                type: 'textarea',
                placeholder: 'Detalhe TODAS as despesas por categoria:\n\n1. Recursos Humanos (R$ X)\n   - Coordenador: R$ X\n   - Oficineiros: R$ X\n\n2. Material de Consumo (R$ X)\n   - Item A: R$ X\n   - Item B: R$ X\n\n3. Serviços de Terceiros (R$ X)\n4. Equipamentos (R$ X)\n5. Outras despesas (R$ X)',
                required: true,
                cols: 2,
                rows: 12,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'cronograma_desembolso',
                label: 'Cronograma de Desembolso',
                type: 'textarea',
                placeholder: 'Quando e quanto será desembolsado?\n\n1ª Parcela (mês 1): R$ X\n2ª Parcela (mês 4): R$ X\n3ª Parcela (mês 8): R$ X',
                required: true,
                cols: 2,
                rows: 6,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'contrapartida',
                label: 'Contrapartida da OSC',
                type: 'textarea',
                placeholder: 'Descreva a contrapartida (financeira, bens ou serviços) que a OSC oferecerá',
                cols: 2,
                rows: 4,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'recursos_complementares',
                label: 'Recursos Complementares',
                type: 'textarea',
                placeholder: 'Outras fontes de financiamento (se houver): patrocínios, doações, outras parcerias',
                cols: 2,
                rows: 3,
                group: '6. Orçamento e Sustentabilidade'
            },
            {
                key: 'sustentabilidade',
                label: 'Sustentabilidade do Projeto',
                type: 'textarea',
                placeholder: 'Como o projeto continuará após o término da parceria? Estratégias de sustentabilidade financeira e institucional',
                cols: 2,
                rows: 5,
                group: '6. Orçamento e Sustentabilidade'
            },

            // ==========================================
            // 9. INDICADORES E GESTÃO DE RISCOS
            // ==========================================
            {
                key: 'indicadores',
                label: 'Indicadores de Acompanhamento',
                type: 'textarea',
                placeholder: 'Como será avaliado o sucesso do projeto?\n\nIndicadores quantitativos:\n- Nº de beneficiários atendidos\n- Nº de atividades realizadas\n\nIndicadores qualitativos:\n- Satisfação dos participantes\n- Mudanças percebidas na comunidade',
                required: true,
                cols: 2,
                rows: 8,
                group: '7. Indicadores e Gestão de Riscos'
            },
            {
                key: 'analise_riscos',
                label: 'Análise de Riscos',
                type: 'textarea',
                placeholder: 'Quais riscos podem afetar o projeto? Como serão mitigados?\n\nRisco 1: [Descrição]\nMitigação: [Como evitar/minimizar]\n\nRisco 2: [Descrição]\nMitigação: [Como evitar/minimizar]',
                cols: 2,
                rows: 8,
                group: '7. Indicadores e Gestão de Riscos'
            },
            {
                key: 'anexos',
                label: 'Anexos e Documentos Complementares',
                type: 'textarea',
                placeholder: 'Liste documentos anexados (checklist):\n□ Estatuto da OSC\n□ Ata de eleição da diretoria\n□ Comprovante de endereço\n□ Certidões negativas\n□ Plano de aplicação de recursos',
                cols: 2,
                rows: 6,
                group: '7. Indicadores e Gestão de Riscos'
            }
        ],

        getDefaults: (currentUser) => {
            const today = new Date().toISOString().split('T')[0];
            return {
                conta_status: 'pendente',
                tipo_parceria: 'Termo de Colaboração',
                periodo_execucao: '12 meses',
                local_execucao: 'Santana do Livramento/RS'
            };
        }
    }
};
