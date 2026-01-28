/**
 * ExportService - Serviço para exportação de dados
 * 100% Nativo e independente do GAS.
 */
window.ExportService = {
    toCsv(data, columns, fileName = 'export') {
        if (!data || !data.length) {
            console.warn("Sem dados para exportar");
            return;
        }

        const headers = columns.map(c => c.label).join(",");
        const rows = data.map(item => {
            return columns.map(col => {
                let val = item[col.key];

                if (col.key === 'status') {
                    val = item.status === 'active' ? 'Ativo' : 'Inativo';
                } else if (Array.isArray(val)) {
                    val = val.join('; ');
                } else if (col.type === 'date') {
                    val = val ? new Date(val).toLocaleDateString('pt-BR') : '';
                } else if (col.type === 'currency' || col.type === 'number') {
                    val = val !== null && val !== undefined ? val : 0;
                }

                if (val === null || val === undefined) val = "";
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(",");
        }).join("\n");

        const csvContent = "\uFEFF" + headers + "\n" + rows;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        const finalName = `${fileName.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", finalName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Exportação CSV concluída: ${finalName}`);
    }
};
