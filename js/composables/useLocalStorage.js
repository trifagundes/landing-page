/**
 * useLocalStorage - Composable para persistência em localStorage
 * Centraliza toda a lógica de leitura/escrita com conversão de tipos
 */
window.useLocalStorage = function() {
    /**
     * Obtém valor do localStorage com conversão de tipo
     * @param {string} key - Chave do item
     * @param {*} fallback - Valor padrão se não encontrar
     * @param {string} type - Tipo esperado: 'string', 'bool', 'number'
     * @returns {*} Valor convertido
     */
    const get = (key, fallback, type = 'string') => {
        const val = localStorage.getItem(key);
        
        if (val === null) return fallback;
        
        if (type === 'bool') return val === 'true';
        if (type === 'number') return !isNaN(parseInt(val)) ? parseInt(val) : fallback;
        
        return val;
    };
    
    /**
     * Salva valor no localStorage (converte automaticamente)
     * @param {string} key - Chave do item
     * @param {*} value - Valor a salvar
     */
    const set = (key, value) => {
        localStorage.setItem(key, String(value));
    };
    
    /**
     * Remove item do localStorage
     * @param {string} key - Chave do item
     */
    const remove = (key) => {
        localStorage.removeItem(key);
    };
    
    /**
     * Limpa todo o localStorage
     */
    const clear = () => {
        localStorage.clear();
    };
    
    return { get, set, remove, clear };
};
