# Contexto Técnico do Projeto "minhamusica"

Este documento serve como uma "memória de contexto" para a IA assistente de desenvolvimento. Ele descreve a stack técnica, a estrutura do projeto e as convenções a serem seguidas.

## 1. Stack Técnica

O projeto utiliza a seguinte stack:

-   **Linguagem:** JavaScript (ES6)
-   **Build Tool:** Vite
-   **Testes:** Vitest
-   **Validação de Esquemas:** Zod
-   **Renderização de Partituras:** ABCJS

## 2. Estrutura e Path Aliases

O projeto utiliza aliases de caminho para simplificar os imports e manter a organização. Os seguintes aliases estão configurados no `vite.config.js` e `jsconfig.json`:

-   `@model`: Para classes de modelo de domínio.
-   `@schemas`: Para esquemas de validação com Zod.
-   `@services`: Para serviços, como chamadas de API ou lógica de negócio.
-   `@styles`: Para arquivos de estilização (CSS, SCSS, etc.).
-   `@tests`: Para arquivos de teste.

## 3. Regras para a IA

Para garantir consistência e eficiência, siga as seguintes regras ao auxiliar no desenvolvimento deste projeto:

1.  **Use Sempre os Path Aliases:** Ao criar novos imports ou refatorar existentes, **SEMPRE** utilize os aliases (`@/caminho/para/modulo`) em vez de caminhos relativos longos (`../../../caminho/para/modulo`).
2.  **Assuma Módulos ES6:** Todos os arquivos com a extensão `.js` neste projeto são módulos ES6. Utilize a sintaxe `import`/`export` moderna.
3.  **Consulte Este Documento:** Antes de sugerir qualquer refatoração estrutural (como mover arquivos, renomear diretórios ou alterar a arquitetura), verifique o conteúdo deste arquivo para entender as convenções atuais.
