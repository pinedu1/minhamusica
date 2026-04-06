import { Dinamica } from './Dinamica.js';
import { TipoBarra } from './TipoBarra.js';
import { EstruturaTempo } from './EstruturaTempo.js';
import { Clave } from './Clave.js';
import { Voz } from './Voz.js';
import { Ligadura } from './Ligadura.js';
import { ArmaduraClave } from './ArmaduraClave.js';
import { Anotacao } from './Anotacao.js';
import { Acorde } from './Acorde.js';
import { Nota } from './Nota.js';
import { MarcaExpressao } from './MarcaExpressao.js';

export class Compasso {
    /** @type {number} */
    #indice = 0;

    /**
     * USAGE:
     * Define a métrica rítmica (Fórmula de Compasso).
     * Se for null, o compasso herda a métrica do anterior.
     * @type {EstruturaTempo | null}
     * @example
     * // Configurando um compasso de Guarânia (3/4):
     * this.#estruturaTempo = new EstruturaTempo(3, 4);
     */
    #estruturaTempo = null;

    /**
     * USAGE:
     * Define o referencial de altura das notas (Clave) para este compasso.
     * Se for null, o sistema herda a clave do compasso anterior.
     * @type {Clave | null}
     * @example
     * // Definindo Clave de Sol (Padrão para Viola):
     * this.#clave = new Clave( ClaveTipo.TREBLE, 2); // Sol na 2ª linha
     */
    #clave = null;

    /**
     * USAGE:
     * Define a tonalidade atual do compasso.
     * Se for null, o sistema assume a armadura do compasso anterior.
     * @type {ArmaduraClave | null}
     * @example
     * // Definindo Tonalidade de Dó Maior:
     * this.#armaduraClave = new ArmaduraClave( Tonalidade.C, 'maior');
     * */
    #armaduraClave = null;

    /**
     * USAGE:
     * ÚNICA FONTE DE VERDADE DAS NOTAS.
     * Coleção de camadas musicais independentes (Vozes) que compõem o compasso.
     * Permite a escrita polifônica (ex: Melodia e Baixo simultâneos).
     * A soma das durações dos elementos dentro de cada voz deve respeitar a Fórmula de Compasso.
     * @type {Array<Voz>}
     * @example
     * // Em um ponteado de Viola:
     * const melodia = new Voz(1, "Ponteado");
     * const acompanhamento = new Voz(2, "Baixo");
     * this.#vozes = [ melodia, acompanhamento ];
     */
    #vozes = [];

    /**
     * USAGE:
     * Define a barra de abertura do compasso (usado principalmente para ritornellos).
     * Se for null, o compasso não imprime barra de abertura.
     * @type {keyof typeof TipoBarra | null}
     * @example this.#tipoBarraAbertura = '|:';
     */
    #tipoBarraAbertura = null;

    /** * USAGE:
     * Define a semântica e a grafia da barra de fechamento do compasso.
     * Utiliza as chaves do Enum TipoBarra (ex: 'DUPLA', 'REPETICAO_FIM').
     * Se for null, o motor abcjs assume a barra simples padrão '|'.
     * @type {keyof typeof TipoBarra | null}
     * @example
     * // Para encerrar uma introdução de ponteado:
     * this.#tipoBarraFechamento = TipoBarra.DUPLA; // Renderiza '||'
     */
    #tipoBarraFechamento = null;

    /**
     * USAGE:
     * Representa a lista de variações de volume (intensidade) no compasso.
     * @type {Array<{tipo: keyof typeof Dinamica, posicao: number}> | null}
     * @example
     * // Começa pianíssimo (pp) e muda para forte (f) no terceiro tempo:
     * this.#dinamicas = [
     * { tipo: 'pp', posicao: 0 },
     * { tipo: 'f',  posicao: 2 }
     * ];
     */
    #dinamicas = null;

    /**
     * USAGE:
     * Representa a lista de marcas de interpretação aplicadas ao compasso.
     * @type {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>}
     * @example
     * // Aplicando um Staccato no início e um Dolce no terceiro tempo (3/4):
     * this.#marcasExpressao = [
     * { tipo: 'STACCATO', posicao: 0 },
     * { tipo: 'DOLCE', posicao: 2 }
     * ];
     */
    #marcasExpressao = [];

    /**
     * USAGE:
     * Lista de instâncias da classe Ligadura aplicadas às vozes deste compasso.
     * @type {Array<Ligadura> | null}
     * @example
     * // Criando um martelado (Hammer-on) da primeira para a segunda nota:
     * const hammer = new Ligadura('HAMMER_ON', 0, 0.5);
     * this.#ligaduras = [ hammer ];
     */
    #ligaduras = null;

    /**
     * USAGE:
     * Objeto que centraliza a métrica física (Canvas) e temporal (Audio) do compasso.
     * @type {Dimensoes | null}
     * @example
     * this.#dimensoes = new Dimensoes(450, 4.0);
     */
    #dimensoes = null;

    /** @type {boolean} */
    #quebraDeLinha = false;

    /** @type {boolean} */
    #anacruse = false;

    /**
     * USAGE:
     * Lista de textos livres (anotações) ancorados a momentos rítmicos do compasso.
     * @type {Array<Anotacao> | null}
     * @example
     * this.#anotacoes = [ new Anotacao("Ponteado", 0, 'ACIMA') ];
     */
    #anotacoes = null;

    /**
     * USAGE:
     * Lista de acordes (cifras) que guiam a harmonia do compasso.
     * @type {Array<Acorde> | null}
     * @example
     * // Um compasso que começa em Mi Maior e muda para Si7 no meio:
     * this.#acordes = [
     * new Acorde("E", 0),
     * new Acorde("B7", 2)
     * ];
     */
    #acordes = null;

    constructor(indice = 0, {
        // Elementos Estruturais
        estruturaTempo = null,
        clave = null,
        armaduraClave = null,

        // Coleções (Garante que nunca sejam undefined)
        vozes = [],
        marcasExpressao = [],

        // Barras
        tipoBarraAbertura = null,
        tipoBarraFechamento = null,

        // Elementos de Notação e Expressão
        dinamicas = null,
        ligaduras = null,
        anotacoes = null,
        acordes = null,

        // Meta-dados e Renderização
        dimensoes = null,

        // Flags de Estado
        quebraDeLinha = false,
        anacruse = false
    } = {}) {

        this.#indice = indice;

        // Atribuição de Elementos Estruturais
        this.#estruturaTempo = estruturaTempo;
        this.#clave = clave;
        this.#armaduraClave = armaduraClave;

        // Atribuição de Coleções
        this.#vozes = vozes;
        this.#marcasExpressao = marcasExpressao;

        // Atribuição de Barras
        this.#tipoBarraAbertura = tipoBarraAbertura;
        this.#tipoBarraFechamento = tipoBarraFechamento;

        // Atribuição de Elementos de Notação e Expressão
        this.#dinamicas = dinamicas;
        this.#ligaduras = ligaduras;
        this.#anotacoes = anotacoes;
        this.#acordes = acordes;

        // Meta-dados e Renderização
        this.#dimensoes = dimensoes;

        // Flags de Estado
        this.#quebraDeLinha = quebraDeLinha;
        this.#anacruse = anacruse;
    }

    // --- Getters básicos para orquestração ---
// ==========================================
    // GETTERS & SETTERS
    // ==========================================

    /**
     * USAGE: Obtém o identificador sequencial deste compasso na partitura.
     * @returns {number}
     */
    get indice() { return this.#indice; }
    /**
     * USAGE: Define a posição sequencial deste compasso na grade geral.
     * @param {number} valor
     */
    set indice(valor) { this.#indice = valor; }

    /**
     * USAGE: Obtém a métrica rítmica atual.
     * @returns {EstruturaTempo | null}
     */
    get estruturaTempo() { return this.#estruturaTempo; }
    /**
     * USAGE: Injeta uma nova métrica rítmica. Se alterado no meio da música,
     * renderizará a tag [M:x/y] no início deste compasso.
     * @param {EstruturaTempo | null} valor
     */
    set estruturaTempo(valor) { this.#estruturaTempo = valor; }

    /**
     * USAGE: Obtém a clave configurada para este compasso.
     * @returns {Clave | null}
     */
    get clave() { return this.#clave; }
    /**
     * USAGE: Altera a clave (ex: de Sol para Fá). O motor renderizará [clef=...]
     * antes das notas deste compasso.
     * @param {Clave | null} valor
     */
    set clave(valor) { this.#clave = valor; }

    /**
     * USAGE: Obtém a armadura de clave (tonalidade) atual.
     * @returns {ArmaduraClave | null}
     */
    get armaduraClave() { return this.#armaduraClave; }
    /**
     * USAGE: Modula a tonalidade a partir deste compasso. O motor renderizará [K:...] inline.
     * @param {ArmaduraClave | null} valor
     */
    set armaduraClave(valor) { this.#armaduraClave = valor; }

    /**
     * USAGE: Obtém a coleção de camadas musicais (Vozes) que contêm as Notas.
     * @returns {Array<Voz>}
     */
    get vozes() { return this.#vozes; }
    /**
     * USAGE: Substitui integralmente a matriz de vozes do compasso.
     * Para adicionar uma única voz sem apagar as demais, prefira um método de injeção pontual.
     * @param {Array<Voz>} valor
     */
    set vozes(valor) { this.#vozes = valor; }

    /**
     * USAGE: Obtém as marcas de interpretação globais deste compasso.
     * @returns {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>}
     */
    get marcasExpressao() { return this.#marcasExpressao; }
    /**
     * USAGE: Define a lista de marcas de expressão aplicadas.
     * @param {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>} valor
     */
    set marcasExpressao(valor) { this.#marcasExpressao = valor; }

    /**
     * USAGE: Obtém o tipo de barra que inicia este compasso.
     * @returns {keyof typeof TipoBarra | null}
     */
    get tipoBarraAbertura() { return this.#tipoBarraAbertura; }
    /**
     * USAGE: Define a barra de abertura. Geralmente utilizado para iniciar repetições ('|:').
     * @param {keyof typeof TipoBarra | null} valor
     */
    set tipoBarraAbertura(valor) { this.#tipoBarraAbertura = valor; }

    /**
     * USAGE: Obtém o tipo de barra que encerra este compasso.
     * @returns {keyof typeof TipoBarra | null}
     */
    get tipoBarraFechamento() { return this.#tipoBarraFechamento; }
    /**
     * USAGE: Define a barra de fechamento (ex: '||' para dupla, ':|' para fim de repetição).
     * @param {keyof typeof TipoBarra | null} valor
     */
    set tipoBarraFechamento(valor) { this.#tipoBarraFechamento = valor; }

    /**
     * USAGE: Obtém a lista de variações de volume rítmico.
     * @returns {Array<{tipo: keyof typeof Dinamica, posicao: number}> | null}
     */
    get dinamicas() { return this.#dinamicas; }
    /**
     * USAGE: Define as variações de intensidade (p, mf, f) ao longo deste compasso.
     * @param {Array<{tipo: keyof typeof Dinamica, posicao: number}> | null} valor
     */
    set dinamicas(valor) { this.#dinamicas = valor; }

    /**
     * USAGE: Obtém as ligaduras aplicadas às notas deste compasso.
     * @returns {Array<Ligadura> | null}
     */
    get ligaduras() { return this.#ligaduras; }
    /**
     * USAGE: Define os arcos de ligadura (Slurs) ou martelados (Hammer-on/Pull-off).
     * @param {Array<Ligadura> | null} valor
     */
    set ligaduras(valor) { this.#ligaduras = valor; }

    /**
     * USAGE: Obtém as anotações textuais livres.
     * @returns {Array<Anotacao> | null}
     */
    get anotacoes() { return this.#anotacoes; }
    /**
     * USAGE: Define os textos posicionados sobre ou sob a pauta neste compasso.
     * @param {Array<Anotacao> | null} valor
     */
    set anotacoes(valor) { this.#anotacoes = valor; }

    /**
     * USAGE: Obtém os acordes (cifras) que guiam a harmonia.
     * @returns {Array<Acorde> | null}
     */
    get acordes() { return this.#acordes; }
    /**
     * USAGE: Define a progressão harmônica. As cifras serão plotadas sobre a primeira voz (Melodia).
     * @param {Array<Acorde> | null} valor
     */
    set acordes(valor) { this.#acordes = valor; }

    /**
     * USAGE: Obtém o objeto que centraliza as métricas físicas no Canvas.
     * @returns {Dimensoes | null}
     */
    get dimensoes() { return this.#dimensoes; }
    /**
     * USAGE: Injeta os metadados calculados após o primeiro ciclo de layout do motor.
     * @param {Dimensoes | null} valor
     */
    set dimensoes(valor) { this.#dimensoes = valor; }

    /**
     * USAGE: Indica se este compasso força uma quebra de sistema visual no fim da linha.
     * @returns {boolean}
     */
    get quebraDeLinha() { return this.#quebraDeLinha; }
    /**
     * USAGE: Ative para forçar o renderizador a desenhar o próximo compasso na linha de baixo (adiciona '\n').
     * @param {boolean} valor
     */
    set quebraDeLinha(valor) { this.#quebraDeLinha = !!valor; }

    /**
     * USAGE: Indica se este compasso é uma anacruse (compasso incompleto no início).
     * @returns {boolean}
     */
    get anacruse() { return this.#anacruse; }
    /**
     * USAGE: Ative caso este seja o compasso inicial e não preencha toda a fórmula de tempo.
     * @param {boolean} valor
     */
    set anacruse(valor) { this.#anacruse = !!valor; }

    /**
     * Orquestra a geração da string ABC deste compasso inteiro.
     * @returns {string}
     */
    toAbc() {
        let abc = this.#gerarAbertura();
        abc += this.#gerarPropriedadesEstruturais();
        abc += this.#gerarNotasEAcordes();
        abc += this.#gerarFechamento();

        return abc;
    }

    // --- Métodos Privados de Geração ABC ---

    /**
     * Adiciona uma barra de abertura apenas se for explicitamente solicitada (ex: ritornello).
     * @returns {string}
     */
    #gerarAbertura() {
        return this.#tipoBarraAbertura ? this.#tipoBarraAbertura : "";
    }

    /**
     * Trata as mudanças de métrica, clave e tonalidade no meio da música.
     * Utiliza a saída 'inline' formatada pelas próprias classes.
     * @returns {string}
     */
    #gerarPropriedadesEstruturais() {
        let propriedades = "";

        if (this.#estruturaTempo) propriedades += this.#estruturaTempo.toCompasso();
        if (this.#clave) propriedades += this.#clave.toCompasso();
        if (this.#armaduraClave) propriedades += this.#armaduraClave.toCompasso();

        return propriedades;
    }

    /**
     * Processa a grade rítmica principal iterando estritamente sobre as Vozes.
     * Resolve a polifonia "inline" utilizando o operador de sobreposição '&'.
     * @returns {string}
     */
    #gerarNotasEAcordes() {
        // Se o compasso for um compasso de pausa total sem vozes instanciadas
        if (!this.#vozes || this.#vozes.length === 0) return "";

        const temMultiplasVozes = this.#vozes.length > 1;

        // Mapeia cada voz instanciada para a sua string ABC correspondente
        const vozesAbc = this.#vozes.map((voz, indexVoz) => {
            let vozStr = "";

            // Garante um ID seguro para a voz
            if (voz.id == null) {
                voz.setId(indexVoz + 1);
            }

            // Injeta a mudança de contexto de Voz
            if (temMultiplasVozes) {
                vozStr += `[V:${voz.id}]`;
            }

            // Itera sobre as Notas desta Voz específica
            voz.notas.forEach((nota, idx) => {
                // Renderiza os Acordes apenas na primeira voz (Melodia Principal)
                if (indexVoz === 0 && this.#acordes) {
                    const acordeAqui = this.#acordes.find(a => a.posicao === idx);
                    if (acordeAqui) vozStr += `"${acordeAqui.cifra}"`;
                }

                // A nota agora sabe como se renderizar sozinha
                vozStr += nota.toAbc();
            });

            return vozStr;
        });

        // A MÁGICA DA POLIFONIA:
        // O '&' diz ao ABCJS para voltar o cursor de tempo para o início do compasso.
        // Assim, [V:1] e [V:2] tocam de forma estritamente simultânea.
        return vozesAbc.join(" & ");
    }

    /**
     * Aplica a barra final e resolve quebras de sistema
     * @returns {string}
     */
    #gerarFechamento() {
        let fechamento = this.#tipoBarraFechamento ? this.#tipoBarraFechamento : "|";

        if (this.#quebraDeLinha) fechamento += "\n";

        return fechamento;
    }

// ==========================================
    // MANIPULAÇÃO DE NOTAS POR VOZ
    // ==========================================

    /**
     * Método privado para garantir que a voz exista no índice solicitado.
     * @param {number} idVoz - Índice da voz (0-based).
     */
    #garantirVoz(idVoz) {
        if (!this.#vozes[idVoz]) {
            // Instancia a voz sob demanda se ela não existir
            this.#vozes[idVoz] = new Voz(idVoz + 1, `Voz ${idVoz + 1}`);
        }
    }

    /**
     * Adiciona uma nota ao final de uma voz do compasso.
     * @param {Nota} n - Objeto Nota a ser adicionado.
     * @param {number} [idVoz=0] - Índice da voz. Padrão é 0 (Primeira voz).
     */
    notaAppend(n, idVoz = 0) {
        this.#garantirVoz(idVoz);
        this.#vozes[idVoz].notas.push(n);
    }

    /**
     * Insere uma nota em um índice específico dentro de uma voz, empurrando as outras.
     * @param {Nota} n - Objeto Nota a ser inserido.
     * @param {number} index - Posição (índice da nota) onde será inserida.
     * @param {number} [idVoz=0] - Índice da voz. Padrão é 0.
     */
    notaInsert(n, index, idVoz = 0) {
        this.#garantirVoz(idVoz);
        const notasVoz = this.#vozes[idVoz].notas;

        if (index < 0 || index > notasVoz.length) {
            throw new Error(`Índice de nota ${index} inválido na Voz ${idVoz}.`);
        }
        notasVoz.splice(index, 0, n);
    }

    /**
     * Substitui a nota existente em um índice específico dentro de uma voz.
     * @param {Nota} n - Novo objeto Nota.
     * @param {number} index - Posição da nota a ser substituída.
     * @param {number} [idVoz=0] - Índice da voz. Padrão é 0.
     */
    notaUpdate(n, index, idVoz = 0) {
        this.#garantirVoz(idVoz);
        const notasVoz = this.#vozes[idVoz].notas;

        if (index < 0 || index >= notasVoz.length) {
            throw new Error(`Índice de nota ${index} inválido para atualização na Voz ${idVoz}.`);
        }
        notasVoz[index] = n;
    }

    /**
     * Remove uma nota em um índice específico dentro de uma voz.
     * @param {number} index - Posição da nota a ser removida.
     * @param {number} [idVoz=0] - Índice da voz. Padrão é 0.
     */
    notaDelete(index, idVoz = 0) {
        this.#garantirVoz(idVoz);
        const notasVoz = this.#vozes[idVoz].notas;

        if (index < 0 || index >= notasVoz.length) {
            throw new Error(`Índice de nota ${index} inválido para exclusão na Voz ${idVoz}.`);
        }
        notasVoz.splice(index, 1);
    }
}