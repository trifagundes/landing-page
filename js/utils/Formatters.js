/**
 * FORMATTERS SERVICE
 * Pure formatting functions used across the application.
 */
window.Formatters = {
    formatDate(value) {
        if (!value) return '-';
        try {
            const date = value instanceof Date ? value : new Date(value);
            if (isNaN(date.getTime())) return '-';

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return '-';
        }
    },

    formatCurrency(value) {
        if (value === null || value === undefined || value === '') return 'R$ 0,00';
        try {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(num)) return 'R$ 0,00';

            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(num);
        } catch (e) {
            return 'R$ 0,00';
        }
    },

    formatNumber(value) {
        if (value === null || value === undefined || value === '') return '0';
        try {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(num)) return '0';

            return new Intl.NumberFormat('pt-BR').format(num);
        } catch (e) {
            return '0';
        }
    },

    truncate(value, maxLength = 50) {
        if (!value) return '-';
        if (value.length <= maxLength) return value;
        return value.substring(0, maxLength) + '...';
    },

    mask(value, pattern) {
        if (!value) return '';
        let i = 0;
        const v = String(value).replace(/\D/g, '');
        return pattern.replace(/#/g, _ => v[i++] || '').trim();
    }
};
