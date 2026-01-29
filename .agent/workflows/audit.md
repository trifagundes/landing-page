---
description: Verifica se o código atende aos Padrões de Qualidade e Arquitetura do projeto.
---

# Workflow de Auditoria e Qualidade

Siga estes passos rigorosamente para validar o trabalho recente:

1.  **Ler os Padrões:**
    *   Leia o arquivo `.agent/workflows/CODING_STANDARDS.md` para refrescar a memória sobre as regras ativas.

2.  **Verificação de Estilos (CSS/HTML):**
    *   Verifique se há **estilos inline** (`style="..."`) proibidos nos arquivos HTML (exceto para valores dinâmicos em loops).
    *   Se encontrar, **extraia** para o `css/style.css` usando classes semânticas.

3.  **Verificação de UX/State:**
    *   Verifique se todas as ações assíncronas (cliques em botões de API, Modais) possuem **Feedback de Loading**.
    *   Verifique se há **Bloqueio de Contexto** (`disabled`, `.content-disabled`, `.card-processing`) aplicado durante essas ações.

4.  **Verificação de Arquitetura:**
    *   Confirme se HTML está em `index.html`, CSS em `css/` e JS em `js/`.
    *   Confirme se **nenhuma biblioteca externa** (npm/node) foi introduzida.

5.  **Relatório:**
    *   Se encontrar erros, CORRIJA-OS imediatamente.
    *   Se estiver tudo certo, reporte ao usuário: "Auditoria Concluída: Código 100% Validado ✅".
