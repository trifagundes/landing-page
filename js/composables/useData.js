window.useData = function () {
    // Estado centralizado para todas as coleções (Extensível e SRP)
    const collectionsState = Vue.reactive({
        events: [],
        users: [],
        testimonials: [],
        team: [],
        clipping: [],
        documents: [],
        oscs: []
    });

    const isLoading = Vue.ref(false);
    const systemInfo = Vue.ref({
        database: { status: 'unknown', url: '#' },
        drive: { status: 'unknown', url: '#' },
        env: {}
    });

    const loadAll = async () => {
        const isAuthenticated = !!localStorage.getItem('auth_token_gas');
        const PUBLIC_COLLECTIONS = ['events', 'testimonials', 'team', 'clipping', 'oscs'];

        isLoading.value = true;
        try {
            // Determine quais coleções carregar
            const collectionKeys = Object.keys(collectionsState).filter(key => {
                return isAuthenticated || PUBLIC_COLLECTIONS.includes(key);
            });

            // Carrega em paralelo, mas trata falhas individuais
            const promises = collectionKeys.map(key =>
                window.DataService.list(key)
                    .catch(err => {
                        console.warn(`[useData] Falha ao carregar ${key}:`, err.message);
                        return []; // Retorna lista vazia em caso de erro individual
                    })
            );

            const results = await Promise.all(promises);

            // Atribuição segura
            collectionKeys.forEach((key, index) => {
                collectionsState[key] = results[index] || [];
            });

            // System Info - Apenas se autenticado
            if (isAuthenticated) {
                try {
                    const sys = await window.AppUtils.runBackend('getSystemInfo');
                    if (sys) systemInfo.value = sys;
                } catch (e) { }
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            if (window.App && window.App.setCriticalError) {
                window.App.setCriticalError(true);
            }
        } finally {
            isLoading.value = false;
        }
    };

    const processingIds = Vue.ref([]);

    /**
     * Aplica mudanças locais imediatamente para UX fluida (Optimistic UI)
     * Agora totalmente agnóstico a qual coleção está sendo alterada.
     */
    const _applyOptimisticUpdate = (collection, action, payload) => {
        const target = collectionsState[collection];
        if (!target) {
            console.warn(`[useData] Tentativa de atualizar coleção inexistente: ${collection}`);
            return;
        }

        let idKey = 'id';
        if (window.SCHEMAS) {
            const schema = Object.values(window.SCHEMAS).find(s => s.collection === collection);
            if (schema) idKey = schema.idField;
        }

        if (action === 'save') {
            const idx = target.findIndex(i => i[idKey] == payload[idKey]);
            if (idx !== -1) target[idx] = payload;
            else target.push(payload);
        } else if (action === 'delete') {
            collectionsState[collection] = target.filter(i => i[idKey] != payload);
        } else if (action === 'bulkDelete') {
            collectionsState[collection] = target.filter(i => !payload.includes(i[idKey]));
        } else if (action === 'bulkStatus') {
            target.forEach(item => {
                if (payload.ids.includes(item[idKey])) item.status = payload.status;
            });
        }

        // Se o usuário logado for alterado, atualiza o useAuth em tempo real
        if (collection === 'users' && action === 'save' && window.App?.auth?.user) {
            if (String(payload[idKey]) === String(window.App.auth.user.id)) {
                window.App.auth.updateUser(payload);
            }
        }
    };

    const dataActions = {
        async save(collection, item, options = { showLoading: true, silent: false }) {
            if (options.showLoading) isLoading.value = true;
            const idKey = item.id || 'new';
            processingIds.value.push(idKey);

            try {
                const savedItem = await window.DataService.save(collection, item);
                _applyOptimisticUpdate(collection, 'save', savedItem);

                if (!options.silent) {
                    window.notify("Sistema", "Salvo com sucesso!", "success");
                }

                if (options.callback && typeof options.callback === 'function') {
                    options.callback(savedItem);
                }
                return savedItem;
            } catch (e) {
                if (!options.silent) {
                    window.notify("Erro", e.message || "Erro ao salvar", "error");
                }
                throw e;
            } finally {
                if (options.showLoading) isLoading.value = false;
                processingIds.value = processingIds.value.filter(id => id !== idKey);
            }
        },

        async delete(collection, idOrItem) {
            let idKey = 'id';
            if (window.SCHEMAS) {
                const schema = Object.values(window.SCHEMAS).find(s => s.collection === collection);
                if (schema) idKey = schema.idField;
            }
            const finalId = (typeof idOrItem === 'object') ? idOrItem[idKey] : idOrItem;

            const confirm = await window.App.askConfirm("Excluir Registro", "Tem certeza que deseja excluir este registro?");
            if (!confirm) return;
            processingIds.value.push(finalId);

            try {
                await window.DataService.delete(collection, finalId);
                _applyOptimisticUpdate(collection, 'delete', finalId);
                window.notify("Sistema", "Registro excluído com sucesso", "success");
            } catch (e) {
                window.notify("Erro", "Erro ao excluir registro", "error");
            } finally {
                processingIds.value = processingIds.value.filter(pid => pid !== finalId);
            }
        },

        async bulkDelete(collection, ids) {
            const confirm = await window.App.askConfirm("Exclusão em Massa", `Tem certeza que deseja excluir ${ids.length} registros?`);
            if (!confirm) return;
            processingIds.value.push(...ids);

            try {
                await window.DataService.bulkDelete(collection, ids);
                _applyOptimisticUpdate(collection, 'bulkDelete', ids);
                window.notify("Sistema", `${ids.length} registros excluídos`, "success");
            } catch (e) {
                window.notify("Erro", "Erro ao excluir em massa", "error");
            } finally {
                processingIds.value = processingIds.value.filter(pid => !ids.includes(pid));
            }
        },

        async bulkStatusChange(collection, { ids, status }) {
            const actionName = status === 'active' ? 'ativar' : 'inativar';
            const confirm = await window.App.askConfirm("Alterar Status", `Tem certeza que deseja ${actionName} ${ids.length} registros?`);
            if (!confirm) return;
            processingIds.value.push(...ids);

            try {
                await window.DataService.bulkUpdateStatus(collection, ids, status);
                _applyOptimisticUpdate(collection, 'bulkStatus', { ids, status });
                window.notify("Sistema", "Status atualizado", "success");
            } catch (e) {
                window.notify("Erro", "Erro ao alterar status", "error");
            } finally {
                processingIds.value = processingIds.value.filter(pid => !ids.includes(pid));
            }
        },

        async resetDatabase() {
            const confirm = await window.App.askConfirm("Reset de Banco", "ATENÇÃO: Reverter para dados de exemplo? Isso apagará as mudanças recentes.");
            if (!confirm) return { cancelled: true };
            isLoading.value = true;
            try {
                const token = localStorage.getItem('auth_token');
                const response = await window.AppUtils.runBackend('resetSystemDatabase', token);

                if (response.success) {
                    window.notify("Sistema", "O seu banco de dados foi resetado conforme solicitado.", "success");
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('auth_token');
                    return { success: true };
                } else {
                    throw new Error(response.message);
                }
            } catch (e) {
                window.notify("Erro", "Erro no reset: " + e.message, "error");
                return { success: false };
            } finally {
                isLoading.value = false;
            }
        },
        refresh: loadAll
    };

    Vue.onMounted(loadAll);

    return {
        ...Vue.toRefs(collectionsState),
        isLoading,
        systemInfo,
        dataActions,
        processingIds
    };
};
