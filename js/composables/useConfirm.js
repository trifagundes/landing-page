window.useConfirm = function () {
    const { reactive } = Vue;

    const state = reactive({
        show: false,
        title: '',
        message: '',
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        type: 'warning',
        resolvePromise: null,
        rejectPromise: null
    });

    const confirm = (title, message, options = {}) => {
        state.title = title;
        state.message = message;
        state.confirmLabel = options.confirmLabel || 'Confirmar';
        state.cancelLabel = options.cancelLabel || 'Cancelar';
        state.type = options.type || 'warning';
        console.log('[useConfirm] Triggering confirm:', { title, state });
        state.show = true;

        return new Promise((resolve, reject) => {
            state.resolvePromise = resolve;
            state.rejectPromise = reject;
        });
    };

    const handleConfirm = () => {
        state.show = false;
        if (state.resolvePromise) state.resolvePromise(true);
    };

    const handleCancel = () => {
        state.show = false;
        if (state.resolvePromise) state.resolvePromise(false);
    };

    return reactive({
        state,
        confirm,
        askConfirm: confirm,
        handleConfirm,
        handleCancel
    });
};
