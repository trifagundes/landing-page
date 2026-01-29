window.SCHEMAS = {
    event: { idField: 'id', collection: 'events' },
    user: { idField: 'id', collection: 'users' },
    testimonial: { idField: 'id', collection: 'testimonials' },
    team: { idField: 'id', collection: 'team' },
    clipping: { idField: 'id', collection: 'clipping' },
    osc: { idField: 'id', collection: 'oscs' },
    document: { idField: 'id', collection: 'documents' }
};

window.DataService = {
    async list(collection) {
        try {
            console.log(`[DataService] Fetching ${collection}...`);
            return await window.GASAPIService.list(collection);
        } catch (e) {
            console.error(`[DataService] List Error (${collection})`, e);
            return [];
        }
    },

    async save(collection, item) {
        try {
            const idField = this._getIdField(collection);
            console.log("[DataService] Saving:", collection, item);
            return await window.GASAPIService.save(collection, item);
        } catch (e) {
            console.error("DataService Save Error", e);
            throw e;
        }
    },

    async delete(collection, id) {
        try {
            const idField = this._getIdField(collection);
            return await window.GASAPIService.delete(collection, id);
        } catch (e) {
            console.error("DataService Delete Error", e);
            throw e;
        }
    },

    async bulkDelete(collection, ids) {
        try {
            return await window.GASAPIService.bulkDelete(collection, ids);
        } catch (e) {
            console.error("DataService Bulk Delete Error", e);
            throw e;
        }
    },

    async bulkUpdateStatus(collection, ids, status) {
        try {
            return await window.GASAPIService.bulkUpdateStatus(collection, ids, status);
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
