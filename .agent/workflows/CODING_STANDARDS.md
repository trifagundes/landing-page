---
description: 
---

# Padrões de Código e Arquitetura -

Este documento define os princípios de engenharia e design a serem seguidos neste projeto para garantir consistência, manutenibilidade e escalabilidade.

## 1. Princípios Fundamentais (Core Principles)

### 1.1. DRY (Don't Repeat Yourself)
*   **Regra:** Evite duplicação de lógica ou estilos.
*   **Aplicação:**
    *   Use **Variáveis CSS** para cores, espaçamentos e fontes.
    *   Extraia estilos repetidos para **classes utilitárias** ou componentes.
    *   Evite lógica de negócio duplicada no JavaScript; centralize em funções reutilizáveis.

### 1.2. SRP (Single Responsibility Principle)
*   **Regra:** Cada arquivo, classe, função ou componente deve ter uma única responsabilidade.
*   **Aplicação:**
    *   **HTML:** Responsável apenas pela estrutura semântica (O quê).
    *   **CSS:** Responsável apenas pela apresentação visual (Como se parece).
    *   **JS:** Responsável apenas pelo comportamento e estado (Como funciona).
    *   **Não utilize estilos inline** (`style="..."`) no HTML, exceto para valores dinâmicos calculados via JS (ex: `style="{ width: dynamicValue + '%' }"`).

## 2. Padrões de CSS e Design

### 2.1. Uso de Classes
*   Prefira classes semânticas (`.card-header`, `.avatar`) para estruturas complexas.
*   Utilize classes utilitárias (`.flex-center`, `.text-right`) para ajustes de layout e tipografia comuns.
*   Mantenha nomes de classes em inglês (padrão da indústria) ou português consistente, mas evite misturar (preferência atual: Inglês para classes CSS).

### 2.2. Design System
*   Sempre utilize os tokens definidos em `:root` (ex: `var(--accent-primary)`). Nunca "chute" valores hexadecimais (`#FFF`) diretamente nos componentes.

### 2.3. UX e Segurança de Interface (Input Blocking)
*   **Componentes Oficiais (Use SEMPRE):**
    *   **Cabeçalhos:** Use `<header-block icon="..." title="..." subtitle="..." />` para Cards e Modais. Isso garante que o ícone e o texto (com ou sem subtítulo) fiquem perfeitamente alinhados e padronizados (ícones de 1.75rem).
    *   **Formulários:** Use `<smart-form :loading="isLoading"> ... </smart-form>`. Isso aplica automaticamente o bloqueio visual e lógico (`disabled`) em todos os inputs filhos.
    *   **Notificações:** Use o método `notify(titulo, msg, tipo)`. O componente `<system-toast>` gerencia a renderização.
    *   **Confirmações:** Use o método `askConfirm(titulo, msg, callback)`. O componente `<confirm-modal>` gerencia a UI.
*   **Feedback Visual:** Toda ação assíncrona DEVE exibir loading e bloquear interações.
*   **Prevenção de Race Conditions:** 
    *   **Context Locking:** Bloqueie o container pai (`.card-processing`, `.content-disabled`) durante o loading.
    *   O `<action-button>` gerencia seu próprio estado `:disabled`.
    *   **Context Locking (Bloqueio de Contexto):**
        *   Bloqueie o **container visual imediato** da ação. Se a ação ocorre dentro de um Card, bloqueie o Card. Se em um Modal, bloqueie o `.modal-body`.
        *   Utilize a classe `.card-processing` (opacidade reduzida + pointer-events: none) para Cards.
        *   Utilize a classe `.content-disabled` para áreas de conteúdo/modais.
    *   **Jamais** permita que o usuário clique duas vezes ou inicie ações conflitantes simultaneamente.

### 2.4. Estratégia de Camadas (Z-Index)
*   **Regra:** Utilize as camadas padronizadas. Não use valores arbitrários (ex: `z-index: 53`).
*   **Hierarquia:**
    *   `Level 1 (Conteúdo)`: 0 - 10 (Cards, Textos)
    *   `Level 2 (Floaters)`: 100 - 1000 (Dropdowns, Tooltips, Sticky Headers)
    *   `Level 3 (Alerts/Overlays)`: **8000** (Modais, Confirmações Críticas)
    *   `Level 4 (System)`: **9999** (Toasts de Notificação - Topo Absoluto)

## 3. Padrões Vue.js

### 3.1. Estrutura
*   Mantenha o estado (`ref`, `reactive`) agrupado no topo do `setup()`.
*   Funções "Handler" (`handleClick`, `toggleMode`) devem ser nomeadas claramente com verbos de ação.
*   Use `v-for` para renderizar listas repetitivas (botões de menu, listas de config) ao invés de hard-code.

## 4. Estratégia de Arquitetura e Deploy (Zero Dependencies)

### 4.1. Desenvolvimento (Development Mode)
*   **Separação Física:** O código DEVE ser separado em arquivos distintos para facilitar a leitura e o foco da IA.
    *   `index.html`: Apenas estrutura e links.
    *   `style.css` (e subpastas): Estilos.
    *   `app.js` (e subpastas): Lógica.
*   **Sem Modules (No-ESM):** Para evitar restrições de CORS locais (`file://`) e a necessidade de servidores HTTP, **não utilizamos** `import/export`.
    *   JS e CSS rodam no escopo global.
    *   Arquivos são incluídos via tags `<script src="...">` e `<link href="...">`.

### 4.2. Produção (Single File Output)
*   **Requisito de Deploy:** O produto final deve ser um arquivo único (`index.html`).
*   **Processo de Build (Manual Bundling):**
    *   **Não usamos Webpack/Vite/NPM.**
    *   O "Build" é realizado pela IA (Agente) sob demanda.
    *   O Agente lê o conteúdo de `style.css` e injeta em `<style>`.
    *   O Agente lê o conteúdo de `app.js` e injeta em `<script>`.
    *   O resultado é um arquivo monolítico pronto para deploy em qualquer lugar (Google Apps Script, Landing page simples, etc).

## 5. Governança e Restrições (STRICT RULES)

### 5.1. Congelamento de Componentes
*   **REGRA DE OURO:** A IA está **ESTRITAMENTE PROIBIDA** de criar novos tipos de componentes (ex: Sliders, Tabs, Accordions, Sidebars) ou novas variantes de estilo para componentes existentes sem a **AUTORIZAÇÃO EXPRESSA** do usuário.
*   **Reutilização:** Sempre tente resolver problemas utilizando os componentes e classes utilitárias já existentes (`.card`, `.btn`, `.modal`).
*   **Processo:** Se a IA identificar a necessidade de um novo componente visual, ela deve **PROPOR** ao usuário primeiro e aguardar o "De acordo" antes de escrever qualquer código.

## 6. Protocolo de Encerramento (Feedback Obrigatório)
*   Ao concluir qualquer tarefa de codificação, a IA DEVE incluir explicitamente uma confirmação de conformidade no final da resposta.
*   **Formato Exigido:**
    > ✅ **Padrões Verificados:**
    > - Estrutura de Arquivos: [OK]
    > - Zero Inline Styles: [OK]
    > - UX Safety / Locking: [OK]

---
*Documento gerado automaticamente por Antigravity em 26/01/2026.*
