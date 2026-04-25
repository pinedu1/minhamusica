import { Altura } from './Altura.js';
import { Duracao } from './Duracao.js';
import { EstruturaTempo } from './EstruturaTempo.js';

/**
 * Representa uma nota musical com inteligência de contexto rítmico.
 */
export class Nota {
    /** @type {Altura} */
    #altura;
    /** @type {Duracao|EstruturaTempo|null} - Tempo rítmico da nota */
    #duracao;
    /** @type {Object} - Opções de contexto (Compasso, Musica, Articulações, etc) */
    #options;

    /**
     * USAGE: Cria uma nota. Se 'duracao' for null, ela buscará o fallback no 'options'.
     * 
     * @param {Altura} altura - Objeto de altura musical.
     * @param {Duracao|EstruturaTempo|null} [duracao=null] - Duração específica da nota.
     * @param {Object} [options={}] - Contexto superior e modificadores.
     * @param {Compasso} [options.compasso] - Referência ao compasso pai (busca L: e M:).
     * @param {Musica} [options.musica] - Referência à música pai (busca L: e M:).
     * @param {Array} [options.articulacoes=[]] - Lista de ornamentos.
     * @param {boolean} [options.ligada=false] - Se está ligada (-).
     * @throws {Error} Se não houver informação rítmica mínima na nota ou no contexto.
     */
    constructor(altura, duracao = null, options = {}) {
        this.#altura = altura;
        this.#duracao = duracao;
        this.#options = {
            articulacoes: [],
            tecnica: null,
            ghostNote: false,
            ligada: false,
            compasso: null,
            musica: null,
            ...options
        };

        // --- VALIDAÇÃO DE SEGURANÇA RÍTMICA ---
        // A nota só pode ser instanciada se houver como calcular sua duração.
        const temContexto = this.#duracao || 
                           this.#options.compasso ||
                           this.#options.musica;

        if (!temContexto) {
             throw new Error("Falha ao criar Nota: É necessário informar uma duração rítmica ou fornecer um contexto (Compasso/Musica) que contenha a unidade base (L:).");
        }
    }

    /**
     * USAGE: Gera o ABC resolvendo o fallback da unidade base (L:).
     * @returns {string}
     */
    toAbc() {
        let abcString = "";
        if (this.#options.tecnica) abcString += this.#options.tecnica;
        if (this.#options.articulacoes.length > 0) abcString += this.#options.articulacoes.join("");
        if (this.#options.ghostNote) abcString += "!style=x!";
        
        abcString += this.#altura.abc;

        // 2. Resolve a duração rítmica da nota
        let duracaoFinal;
        if (this.#duracao instanceof Duracao) {
            duracaoFinal = this.#duracao;
        } else if (this.#options.compasso) {
            const cp = this.#options.compasso;
            duracaoFinal = new Duracao(cp.estruturaTempo, cp.unidadeBase);
        } else if (this.#options.musica) {
            const ms = this.#options.musica;
            duracaoFinal = new Duracao(ms.formula, ms.unidadeBase);
        } else {
            throw new Error("Falha Renderizar a Nota. É preciso da estrutura de tempo!");
        }

        abcString += duracaoFinal.toAbc();

        if (this.#options.ligada) abcString += "-";
        return abcString;
    }

    // Getters para compatibilidade
    get altura() { return this.#altura; }
    get duracao() { return this.#duracao; }
    get ligada() { return this.#options.ligada; }
    set ligada(valor) { this.#options.ligada = !!valor; }

    static resolverNota(alturaStr, duracao = null, options = {}) {
        return ObjectFactory.newNota(Altura.resolverAltura(alturaStr), duracao, options);
    }
}
