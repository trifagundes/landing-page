window.SCHEMAS = {
    event: { idField: 'id', collection: 'events' },
    user: { idField: 'id', collection: 'users' },
    testimonial: { idField: 'id', collection: 'testimonials' },
    team: { idField: 'id', collection: 'team' },
    clipping: { idField: 'id', collection: 'clipping' }
};

window.DataService = {
    async list(collection) {
        try {
            console.log(`[DataService] Fetching ${collection}...`);
            const data = LocalStorageDB.getCollection(collection);
            return data || [];
        } catch (e) {
            console.error(`[DataService] List Error (${collection})`, e);
            return [];
        }
    },

    async save(collection, item) {
        try {
            const idField = this._getIdField(collection);
            console.log("[DataService] Saving:", collection, item);
            return LocalStorageDB.saveToCollection(collection, item, idField);
        } catch (e) {
            console.error("DataService Save Error", e);
            throw e;
        }
    },

    async delete(collection, id) {
        try {
            const idField = this._getIdField(collection);
            return LocalStorageDB.removeFromCollection(collection, id, idField);
        } catch (e) {
            console.error("DataService Delete Error", e);
            throw e;
        }
    },

    async bulkDelete(collection, ids) {
        try {
            const idField = this._getIdField(collection);
            let count = 0;
            ids.forEach(id => {
                if (LocalStorageDB.removeFromCollection(collection, id, idField)) count++;
            });
            return { success: true, count };
        } catch (e) {
            console.error("DataService Bulk Delete Error", e);
            throw e;
        }
    },

    async bulkUpdateStatus(collection, ids, status) {
        try {
            const idField = this._getIdField(collection);
            ids.forEach(id => {
                LocalStorageDB.saveToCollection(collection, { [idField]: id, status }, idField);
            });
            return { success: true };
        } catch (e) {
            console.error("DataService Bulk Status Error", e);
            throw e;
        }
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
