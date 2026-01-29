/**
 * useDataOperations - Operações de manipulação de dados (extraído de useData)
 * Aplica SRP: responsabilidade única de atualizar estado local
 */
window.useDataOperations = function () {
    /**
     * Encontra o campo ID do schema
     */
    const getIdField = (collection) => {
        let idKey = 'id';
        if (window.SCHEMAS) {
            const schema = Object.values(window.SCHEMAS).find(s => s.collection === collection);
            if (schema) idKey = schema.idField;
        }
        return idKey;
    };

    /**
     * Atualiza item no array (create ou update)
     */
    const upsertItem = (items, item, idKey) => {
        const idx = items.findIndex(i => i[idKey] == item[idKey]);
        if (idx !== -1) {
            items[idx] = item;
        } else {
            items.push(item);
        }
        return [...items]; // Nova referência para reatividade
    };

    /**
     * Remove item do array
     */
    const deleteItem = (items, id, idKey) => {
        return items.filter(i => i[idKey] != id);
    };

    /**
     * Remove múltiplos items do array
     */
    const bulkDelete = (items, ids, idKey) => {
        return items.filter(i => !ids.includes(i[idKey]));
    };

    /**
     * Atualiza status de múltiplos items
     */
    const bulkUpdateStatus = (items, ids, status, idKey) => {
        items.forEach(item => {
            if (ids.includes(item[idKey])) {
                item.status = status;
            }
        });
        return [...items]; // Nova referência para reatividade
    };

    /**
     * Aplica update otimista no estado local
     */
    const applyOptimisticUpdate = (targetRef, action, payload, collection) => {
        if (!targetRef) return;

        const idKey = getIdField(collection);
        const current = targetRef.value;

        switch (action) {
            case 'save':
                targetRef.value = upsertItem(current, payload, idKey);
                break;
            case 'delete':
                targetRef.value = deleteItem(current, payload, idKey);
                break;
            case 'bulkDelete':
                targetRef.value = bulkDelete(current, payload, idKey);
                break;
            case 'bulkStatus':
                targetRef.value = bulkUpdateStatus(current, payload.ids, payload.status, idKey);
                break;
        }

        // Sincroniza usuário logado se necessário
        if (collection === 'users' && action === 'save' && window.App?.auth?.user) {
            if (String(payload[idKey]) === String(window.App.auth.user.id)) {
                window.App.auth.updateUser(payload);
            }
        }
    };

    return {
        getIdField,
        upsertItem,
        deleteItem,
        bulkDelete,
        bulkUpdateStatus,
        applyOptimisticUpdate
    };
};
