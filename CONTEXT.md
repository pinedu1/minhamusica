# Contexto Técnico do Projeto "minhamusica"

Este documento serve como uma "memória de contexto" para a IA assistente de desenvolvimento. Ele descreve a stack técnica, a estrutura do projeto e as convenções a serem seguidas.

## 1. Stack Técnica

O projeto utiliza a seguinte stack:

-   **Linguagem:** JavaScript (ES6)
-   **Build Tool:** Vite
-   **Testes:** Vitest
-   **Validação de Esquemas:** Zod
-   **Renderização de Partituras:** ABCJS
-   **Renderização de Persistência:** JSON

## 2. Estrutura e Path Aliases

O projeto utiliza aliases de caminho para simplificar os imports e manter a organização. Os seguintes aliases estão configurados no `vite.config.js` e `jsconfig.json`:

-   `@domain`: Para classes de modelo de domínio (Regras musicais puras).
-   `@adapters`: Para tradutores de infraestrutura (ABCJS, JSON, Vexflow).
-   `@abcjs`: Para tradutores de infraestrutura ABCJS.
-   `@persistence`: Para tradutores de infraestrutura JSON.
-   `@schemas`: Para esquemas de validação com Zod.
-   `@services`: Para serviços e orquestração.
-   `@styles`: Para arquivos de estilização.
-   `@tests`: Para arquivos de teste.

## 3. Regras para a IA (Diretrizes de Escrita)

Para garantir consistência e eficiência, siga as seguintes regras:

1.  **Use Sempre os Path Aliases:** **SEMPRE** utilize os aliases (`@domain`, `@adapters`, etc.) em vez de caminhos relativos.
2.  **Assuma Módulos ES6:** Utilize exclusivamente a sintaxe `import`/`export`.
3. **Documentação JSDoc Proativa (OBRIGATÓRIO):**
    - **Preservação:** NUNCA remova ou simplifique JSDocs existentes.
    - **Geração Automática:** Se encontrar um método, classe ou propriedade sem JSDoc, você DEVE criá-lo do zero.
    - **Requisitos do Help:** O JSDoc gerado deve conter obrigatoriamente:
        - `@param {Tipo}`: Com a descrição clara do parâmetro.
        - `@returns {Tipo}`: Com a descrição do retorno.
        - `@example`: Um exemplo prático de uso musical (ex: como instanciar uma Nota ou Pausa).
    - **Integração:** Trate o JSDoc como código funcional; se a lógica mudar, o JSDoc deve ser expandido para refletir a nova realidade.
4.  **Separação de Preocupações:** Mantenha a lógica de domínio (Teoria Musical) isolada em `@domain`. Lógicas de entrada/saída (ABC, JSON) devem morar em `@adapters`.
5.  **Padrão de Criação:** Prefira métodos estáticos de fábrica (Static Factories) nos adaptadores (ex: `PausaJson.fromJson`) para instanciar classes de domínio.
## 4. Estilo de Código (Formatação Obrigatória)
1. **Comma First:** Em objetos ou arrays multilinhas, a vírgula deve vir no INÍCIO da linha.
    - Exemplo:
      const obj = {
          item1: 1
          , item2: 2
      };
2. **Espaçamento de Parênteses:** Sempre inclua espaços dentro de parênteses de funções e chamadas.
    - Exemplo: `funcao( arg1, arg2 );`
3. **Espaçamento de Chaves:** Use espaços dentro de chaves de objetos e blocos.
    - Exemplo: `{ a: 1 }` ou `if ( true ) { ... }`
4. **Semicolons:** Sempre use ponto e vírgula `;` ao final das instruções.