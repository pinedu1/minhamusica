import { Dinamica } from './Dinamica.js';
import { TipoBarra } from '@domain/compasso/TipoBarra.js';
import { EstruturaTempo } from './EstruturaTempo.js';
import { Clave } from './Clave.js';
import { Voz } from './Voz.js';
import { Ligadura } from './Ligadura.js';
import { ArmaduraClave } from './ArmaduraClave.js';
import { Anotacao } from './Anotacao.js';
import { Acorde } from './Acorde.js';
import { Nota } from '@domain/nota/Nota.js';
import { MarcaExpressao } from './MarcaExpressao.js';

/**
 * Representa um compasso musical, contendo notas, acordes, e metadados rítmicos/estruturais.
 */
export class Compasso_old {
    /** @type {number} */
    #indice = 0;

    /**
     * USAGE: Define a métrica rítmica (Fórmula de Compasso). Se for null, herda da Música.
     * @type {EstruturaTempo | null}
     */
    #estruturaTempo = null;

    /**
     * USAGE: Define a unidade base de duração (L:). Se for null, herda da Música.
     * @type {EstruturaTempo | null}
     */
    #unidadeBase = null;

    /**
     * USAGE: Define o referencial de altura das notas (Clave) para este compasso.
     * @type {Clave | null}
     */
    #clave = null;

    /**
     * USAGE: Define a tonalidade atual do compasso.
     * @type {ArmaduraClave | null}
     */
    #armaduraClave = null;

    /**
     * USAGE: Coleção de camadas musicais independentes (Vozes).
     * @type {Array<Voz>}
     */
    #vozes = [];

    /**
     * USAGE: Define a barra de abertura do compasso (ex: '|:').
     * @type {keyof typeof TipoBarra | null}
     */
    #tipoBarraAbertura = null;

    /**
     * USAGE: Define a barra de fechamento do compasso (ex: '||', ':|').
     * @type {keyof typeof TipoBarra | null}
     */
    #tipoBarraFechamento = null;

    /**
     * USAGE: Lista de variações de volume (intensidade) no compasso.
     * @type {Array<{tipo: keyof typeof Dinamica, posicao: number}> | null}
     */
    #dinamicas = null;

    /**
     * USAGE: Lista de marcas de interpretação aplicadas ao compasso.
     * @type {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>}
     */
    #marcasExpressao = [];

    /**
     * USAGE: Lista de instâncias da classe Ligadura aplicadas às vozes deste compasso.
     * @type {Array<Ligadura> | null}
     */
    #ligaduras = null;

    /**
     * USAGE: Objeto que centraliza a métrica física (Canvas) e temporal (Audio) do compasso.
     * @type {Dimensoes | null}
     */
    #dimensoes = null;

    /** @type {boolean} - Se true, força uma quebra de linha no ABC. */
    #quebraDeLinha = false;

    /** @type {boolean} - Se true, indica que é uma anacruse (compasso incompleto). */
    #anacruse = false;

    /**
     * USAGE: Lista de textos livres (anotações) ancorados a momentos rítmicos do compasso.
     * @type {Array<Anotacao> | null}
     */
    #anotacoes = null;

    /**
     * USAGE: Lista de acordes (cifras) que guiam a harmonia do compasso.
     * @type {Array<Acorde> | null}
     */
    #acordes = null;

    /**
     * USAGE: Construtor do Compasso.
     * @param {number} [indice=0] - Posição sequencial do compasso na música.
     * @param {Object} [config={}] - Objeto de configuração.
     * @param {EstruturaTempo|null} [config.estruturaTempo=null] - Fórmula de compasso local.
     * @param {EstruturaTempo|null} [config.unidadeBase=null] - Unidade L: local.
     * @param {Clave|null} [config.clave=null] - Clave local.
     * @param {ArmaduraClave|null} [config.armaduraClave=null] - Armadura de clave local.
     * @param {Array<Voz>} [config.vozes=[]] - Vozes do compasso.
     * @param {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>} [config.marcasExpressao=[]] - Marcas de expressão.
     * @param {keyof typeof TipoBarra|null} [config.tipoBarraAbertura=null] - Tipo de barra de abertura.
     * @param {keyof typeof TipoBarra|null} [config.tipoBarraFechamento=null] - Tipo de barra de fechamento.
     * @param {Array<{tipo: keyof typeof Dinamica, posicao: number}>|null} [config.dinamicas=null] - Dinâmicas.
     * @param {Array<Ligadura>|null} [config.ligaduras=null] - Ligaduras.
     * @param {Array<Anotacao>|null} [config.anotacoes=null] - Anotações.
     * @param {Array<Acorde>|null} [config.acordes=null] - Acordes.
     * @param {Dimensoes|null} [config.dimensoes=null] - Dimensões para renderização.
     * @param {boolean} [config.quebraDeLinha=false] - Força quebra de linha.
     * @param {boolean} [config.anacruse=false] - Indica anacruse.
     */
    constructor(indice = 0, {
        estruturaTempo = null,
        unidadeBase = null,
        clave = null,
        armaduraClave = null,
        vozes = [],
        marcasExpressao = [],
        tipoBarraAbertura = null,
        tipoBarraFechamento = null,
        dinamicas = null,
        ligaduras = null,
        anotacoes = null,
        acordes = null,
        dimensoes = null,
        quebraDeLinha = false,
        anacruse = false
    } = {}) {
        this.#indice = indice;
        this.#estruturaTempo = estruturaTempo;
        this.#unidadeBase = unidadeBase;
        this.#clave = clave;
        this.#armaduraClave = armaduraClave;
        this.#vozes = vozes;
        this.#marcasExpressao = marcasExpressao;
        this.#tipoBarraAbertura = tipoBarraAbertura;
        this.#tipoBarraFechamento = tipoBarraFechamento;
        this.#dinamicas = dinamicas;
        this.#ligaduras = ligaduras;
        this.#anotacoes = anotacoes;
        this.#acordes = acordes;
        this.#dimensoes = dimensoes;
        this.#quebraDeLinha = quebraDeLinha;
        this.#anacruse = anacruse;
    }

    // --- Getters & Setters ---
    get indice() { return this.#indice; }
    set indice(valor) { this.#indice = valor; }

    get estruturaTempo() { return this.#estruturaTempo; }
    set estruturaTempo(valor) { this.#estruturaTempo = valor; }

    get unidadeBase() { return this.#unidadeBase; }
    set unidadeBase(valor) { this.#unidadeBase = valor; }

    get clave() { return this.#clave; }
    set clave(valor) { this.#clave = valor; }

    get armaduraClave() { return this.#armaduraClave; }
    set armaduraClave(valor) { this.#armaduraClave = valor; }

    get vozes() { return this.#vozes; }
    set vozes(valor) { this.#vozes = valor; }

    get tipoBarraFechamento() { return this.#tipoBarraFechamento; }
    set tipoBarraFechamento(valor) { this.#tipoBarraFechamento = valor; }

    get quebraDeLinha() { return this.#quebraDeLinha; }
    set quebraDeLinha(valor) { this.#quebraDeLinha = !!valor; }

    /**
     * USAGE: Gera o ABC do compasso.
     * @param {Object} [contextoFallback] - Objeto contendo formula e unidadeBase da Música.
     * @param {EstruturaTempo} [contextoFallback.formula] - Fórmula de compasso global.
     * @param {EstruturaTempo} [contextoFallback.unidadeBase] - Unidade L: global.
     * @returns {string}
     */
    toAbc(contextoFallback = {}) {
        let abc = this.#gerarAbertura();
        abc += this.#gerarPropriedadesEstruturais(contextoFallback);
        abc += this.#gerarNotasEAcordes(contextoFallback);
        abc += this.#gerarFechamento();
        return abc;
    }

    #gerarAbertura() {
        return this.#tipoBarraAbertura ? this.#tipoBarraAbertura : "";
    }

    #gerarPropriedadesEstruturais(contextoFallback) {
        let propriedades = "";
        if (this.#estruturaTempo) propriedades += this.#estruturaTempo.toCompasso();
        
        // Se o compasso tem uma unidadeBase local, usa-a. Senão, usa a do fallback.
        const unidadeL = this.#unidadeBase || contextoFallback.unidadeBase;
        if (unidadeL) propriedades += `[L:${unidadeL.quantidade}/${unidadeL.unidadeTempo}]`;
        
        if (this.#clave) propriedades += this.#clave.toCompasso();
        if (this.#armaduraClave) propriedades += this.#armaduraClave.toCompasso();
        return propriedades;
    }

    #gerarNotasEAcordes(contextoFallback) {
        if (!this.#vozes || this.#vozes.length === 0) return "";
        const temMultiplasVozes = this.#vozes.length > 1;

        const vozesAbc = this.#vozes.map((voz, indexVoz) => {
            let vozStr = temMultiplasVozes ? `[V:${voz.id || (indexVoz + 1)}]` : "";

            voz.notas.forEach((nota, idx) => {
                // Prioridade da unidade L: para a nota:
                // 1. Unidade local do Compasso > 2. Unidade global da Música
                const unidadeParaNota = this.#unidadeBase || contextoFallback.unidadeBase;
                
                vozStr += (nota instanceof Nota || nota instanceof Acorde) 
                    ? nota.toAbc(unidadeParaNota) 
                    : nota.toAbc(); // Fallback para outros tipos de elementos
            });

            return vozStr;
        });

        return vozesAbc.join(" & ");
    }

    #gerarFechamento() {
        let fechamento = this.#tipoBarraFechamento ? this.#tipoBarraFechamento : "|";
        if (this.#quebraDeLinha) fechamento += "\n";
        return fechamento;
    }

    #garantirVoz(idVoz) {
        if (!this.#vozes[idVoz]) {
            this.#vozes[idVoz] = new Voz(idVoz + 1, `Voz ${idVoz + 1}`);
        }
    }

    notaAppend(n, idVoz = 0) {
        this.#garantirVoz(idVoz);
        this.#vozes[idVoz].notas.push(n);
    }
}
