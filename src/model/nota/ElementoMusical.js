import { TempoDuracao } from '../tempo/TempoDuracao.js';

/**
 * Classe base para Nota e Pausa.
 * Gerencia a lógica de tempo e contexto hierárquico.
 */
export class ElementoMusical {
    /** @type {TempoDuracao} */
    _duracao;
    _options;

    constructor(duracao, options = {}) {
        this._duracao = duracao;
        this._options = options;
    }

    /**
     * Lógica DRY: Busca a unidade de tempo ativa na hierarquia.
     */
    getUnidadeTempo() {
        if (this._options.unidadeTempo) {
            return this._options.unidadeTempo;
        }
        if (this._options.compasso) {
            return this._options.compasso.unidadeTempo
        }
        if (this._options.voz) {
            return this._options.voz.unidadeTempo
        }
        if (this._options.obra) {
            return this._options.obra.unidadeTempo
        }
        throw new TypeError("A unidadeTempo Global deve ser definida em algum nível da hierarquia (Pausa/Compasso/Voz/Obra).");
        return null;
    }

    /**
     * Lógica DRY: Formata a duração para o padrão ABC.
     */
    /**
     * @private
     */
    _formatarDuracaoAbc() {
        const razao = this._duracao.razao / this.getUnidadeTempo().razao;
        if (Math.abs(razao - 1) < 0.000001) return "";

        // Se for um número inteiro (ex: 2, 3, 4), retorna direto
        if (Number.isInteger(Number(razao.toFixed(8)))) {
            return Math.round(razao).toString();
        }

        const d = Number(razao.toFixed(8));

        // Transforma o decimal em uma fração musical perfeita (bases 2, 4, 8, 16...)
        for (let denominador = 2; denominador <= 64; denominador *= 2) {
            const numerador = Math.round(d * denominador);

            // Verifica se a fração bate perfeitamente com o decimal original
            if (Math.abs((numerador / denominador) - d) < 0.000001) {

                // Sintaxe simplificada do ABC para frações
                if (numerador === 1 && denominador === 2) return "/"; // Ex: C/
                if (numerador === 1) return `/${denominador}`;        // Ex: C/4

                // Retorna a fração completa
                return `${numerador}/${denominador}`;                 // Ex: C3/2, z5/2
            }
        }

        // Fallback de extrema segurança (teoricamente nunca deve cair aqui se a música estiver no compasso)
        return razao.toString();
    }

    // Getters e Setters comuns
    get duracao() { return this._duracao; }
    set duracao(val) {
        if (!(val instanceof TempoDuracao)) {
            throw new TypeError("Duração deve ser instância de TempoDuracao.");
        }
        this._duracao = val;
    }

    get unidadeTempo() { return this._options.unidadeTempo; }
    set unidadeTempo(tempo) { this._options.unidadeTempo = tempo; }
    // E precisaria de getters para as heranças também
    get obra() { return this._options.obra; }
    set obra(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.obra = null;
            return;
        }
        if (val.constructor.name !== 'Obra' && !(val instanceof Object)) {
            throw new TypeError("setObra: A obra deve ser uma instancia de Obra ou null.");
        }
        this._options.obra = val;
    }
    get voz() { return this._options.voz; }
    set voz(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.voz = null;
            return;
        }
        if (val.constructor.name !== 'Voz' && !(val instanceof Object)) {
            throw new TypeError("setVoz: A Voz deve ser uma instancia de Voz ou null.");
        }
        this._options.voz = val;
    }
    get compasso() { return this._options.compasso; }
    set compasso(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.compasso = null;
            return;
        }
        if (val.constructor.name !== 'Compasso' && !(val instanceof Object)) {
            throw new TypeError("setCompasso: O Compasso deve ser uma instancia de Compasso ou null.");
        }
        this._options.compasso = val;
    }
    get options() { return this._options; }
}