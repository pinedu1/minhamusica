import { Nota } from '@domain/nota/Nota.js';
import { Altura } from './Altura.js';
import { Duracao, DuracaoBase } from './Duracao.js';

/**
 * Representa um conjunto de notas (acorde) que compartilham a mesma duração.
 */
export class Acorde {
    /** @type {Array<Nota>} */
    #notas = [];

    /** @type {DuracaoBase|number} - Valor rítmico. */
    #duracao;

    /** @type {DuracaoBase|EstruturaTempo|null} - Unidade L: para renderização. */
    #unidadeBase;

    /** @type {boolean} - Indica se o acorde está ligado ao anterior (Tie). */
    #ligada = false;

    /**
     * USAGE: Cria um novo acorde.
     * @param {Array<Nota>} notas - Lista de notas do acorde.
     * @param {DuracaoBase|number|null} duracao - Duração rítmica.
     * @param {DuracaoBase|EstruturaTempo|null} unidadeBase - Contexto L:.
     */
    constructor(notas = [], duracao = null, unidadeBase = null) {
        this.#notas = notas;
        this.#duracao = duracao;
        this.#unidadeBase = unidadeBase;
    }

    set ligada(valor) { this.#ligada = !!valor; }
    get ligada() { return this.#ligada; }

    /**
     * USAGE: Gera o ABC do acorde [abc]n.
     * @param {DuracaoBase|EstruturaTempo|null} [fallbackUnidade] - Unidade herdada do Compasso.
     * @returns {string} Ex: "[CEG]2"
     */
    toAbc(fallbackUnidade = null) {
        const conteudo = this.#notas.map(n => n.altura.abc).join('');
        const unidadeAtiva = this.#unidadeBase || fallbackUnidade;

        let abc = `[${conteudo}]`;

        if (this.#duracao) {
            if (this.#duracao instanceof DuracaoBase) {
                abc += this.#duracao.toNota(unidadeAtiva);
            } else {
                abc += Duracao.converterFloatParaTempoString(this.#duracao);
            }
        }
        
        if (this.#ligada) abc += "-";
        return abc;
    }

    /**
     * USAGE: Método de fábrica para criar acordes a partir de strings literais ABC.
     * @param {string} entrada - Ex: "[GEB,]"
     * @param {DuracaoBase|number|null} [duracaoManual] - Duração opcional.
     * @param {DuracaoBase|EstruturaTempo|null} [unidadeBase] - Referência L:.
     * @returns {Acorde}
     */
    static resolverNotas(entrada, duracaoManual = null, unidadeBase = null) {
        const ACORDE_GLOBAL_REGEX = /^(?:\[([^\]]+)\]|([^0-9/]+))([\d/]*)$/;
        const matchGlobal = entrada.trim().match(ACORDE_GLOBAL_REGEX);
        if (!matchGlobal) throw new Error(`Formato de acorde inválido: ${entrada}`);

        const notasInternasStr = matchGlobal[1] || matchGlobal[2];
        const duracaoTexto = matchGlobal[3];

        let duracaoFinal = duracaoManual;
        if (!duracaoFinal) {
            const valorReal = Duracao.calcularDuracaoReal(duracaoTexto, unidadeBase || 0.125);
            duracaoFinal = valorReal; 
        }

        const NOTA_INTERNA_REGEX = /([\^=_]*[A-Ga-g][,']*)/g;
        const matchesNotas = notasInternasStr.matchAll(NOTA_INTERNA_REGEX);
        const notasObjetos = [];

        for (const match of matchesNotas) {
            const altura = Altura.resolverAltura(match[1]);
            notasObjetos.push(new Nota(altura, duracaoFinal, unidadeBase));
        }

        return new Acorde(notasObjetos, duracaoFinal, unidadeBase);
    }

    get notas() { return this.#notas; }
    get duracao() { return this.#duracao; }
}
