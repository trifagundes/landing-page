window.BaseIcon = {
    props: ['name', 'iconClass'],
    template: `
        <span :class="['inline-flex items-center justify-center lucide-wrapper', iconClass]" ref="iconWrapper">
            <i :data-lucide="name"></i>
        </span>
    `,
    methods: {
        renderIcon() {
            this.$nextTick(() => {
                if (this.$refs.iconWrapper) {
                    this.$refs.iconWrapper.innerHTML = `<i data-lucide="${this.name}" class="lucide-icon"></i>`;
                    if (window.lucide && window.lucide.createIcons) {
                        window.lucide.createIcons({
                            root: this.$refs.iconWrapper,
                            attrs: {
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                            }
                        });
                    }
                }
            });
        }
    },
    mounted() {
        this.renderIcon();
    },
    watch: {
        name() {
            this.renderIcon();
        }
    }
};
