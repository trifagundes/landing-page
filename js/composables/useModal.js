window.useModal = function (dataActions, notifications, router) {
    const { reactive, computed, toRefs } = Vue;

    const state = reactive({
        visible: false,
        title: '',
        collection: null,
        model: {},
        isSaving: false,
        isEditing: false
    });

    const fields = computed(() => {
        if (!state.collection) return [];

        const model = window.DATA_MODELS[state.collection];
        if (!model) return [];

        return model.fields.filter(f => f.form);
    });

    function open(collection, item = null) {
        const model = window.DATA_MODELS[collection];

        if (!model) {
            console.error("Schema não encontrado para collection:", collection);
            return;
        }

        state.collection = collection;
        state.isEditing = !!item;
        state.title = item
            ? `Editar ${model.singular}`
            : `Novo ${model.singular}`;

        state.model = item ? JSON.parse(JSON.stringify(item)) : {};

        if (collection === 'users' && state.isEditing && state.model) {
            state.model.password = '';
            state.model.password_confirmation = '';
        }

        state.visible = true;
    }

    function close() {
        state.visible = false;
        state.model = {};
        state.collection = null;
        state.isEditing = false;
    }

    function validate() {
        const currentFields = fields.value;
        const errors = [];

        currentFields.forEach(field => {
            if (field.required) {
                const val = state.model[field.key];
                if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
                    errors.push(field.label);
                }
            }
        });

        if (errors.length > 0) {
            const msg = `Os seguintes campos são obrigatórios:\n- ${errors.join('\n- ')}`;
            notifications.add(msg, "warning");
            return false;
        }
        return true;
    }

    async function save() {
        if (!state.collection) return;

        if (!validate()) return;

        if (router && router.currentContext === 'public' && state.model.status === 'inactive') {
            const confirmed = await window.App.askConfirm(
                'Desativar Item?',
                'Ao desativar este item, ele desaparecerá desta visualização pública imediatamente. Para reativá-lo, você precisará acessar o Painel de Gerenciamento.',
                {
                    type: 'warning',
                    confirmLabel: 'Sim, Desativar',
                    cancelLabel: 'Cancelar'
                }
            );

            if (!confirmed) return;
        }

        state.isSaving = true;

        try {
            await dataActions.save(state.collection, state.model, { showLoading: false });
            close();

            const action = state.isEditing ? "atualizado" : "criado";
            notifications.add(`Registro ${action} com sucesso!`, "success");

        } catch (error) {
            notifications.add(
                error.message || "Erro ao salvar registro. Tente novamente.",
                "error"
            );
        } finally {
            state.isSaving = false;
        }
    }

    return reactive({
        ...toRefs(state),
        fields,
        open,
        close,
        save
    });
};
