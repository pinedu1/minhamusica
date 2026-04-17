import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { notaSchema } from "@schemas/notaSchema.js";
import { NotaFrequenciaSchema } from "@schemas/notaFrequenciaSchema.js";
import { TempoDuracaoSchema } from "@schemas/tempoDuracaoSchema.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
/**
 * Representa uma nota musical completa, integrando altura, duração e atributos de execução.
 */
export class Nota extends ElementoMusical {
    /** @type {NotaFrequencia} */
    #altura;
    /**
     * @param {NotaFrequencia} altura
     * @param {TempoDuracao} duracao
     * @param {Object} [options={}]
     */
    constructor(altura, duracao, options = {}) {
        super(duracao, options);
        //
        this.altura = altura;
        this.duracao = duracao;
        this._options = {
            obra: null,
            voz: null,
            compasso: null,
            unidadeTempo: null,
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES DE DURAÇÃO
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E LIGADURAS
            hammerOn: false,
            pullOff: false,
            ligada: false,

            // ORNAMENTOS
            mordente: false,
            upperMordent: false,
            trinado: false,
            roll: false,

            // OUTROS
            fermata: false,
            ghostNote: false,
            graceNote: null,
            arpeggio: false,
            dedilhado: null,
            
            sustenido: false, // Propriedade b.1
            beQuad: false,    // Propriedade b.2
            ...options
        };

        const gn = this._options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Nota: 'graceNote' deve ser false, null ou Array<Nota>.");
        }
    }

    /**
     * USAGE: Gera string ABC simplificada para notas de adorno.
     */
    toGraceNote() {
        let abc = "";
        if (this._options.sustenido) abc += "^";
        if (this._options.beQuad) abc += "=";
        abc += this.#altura.abc;
        abc += this._formatarDuracaoAbc();
        return abc;
    }

    /**
     * USAGE: Gera a string ABC completa processando todos os atributos de execução.
     * @param {boolean} [isAcorde=false] - Se true, simplifica a saída para dentro de colchetes.
     * @returns {string}
     */
    toAbc( isAcorde = false ) {
        let abc = "";
        const opt = this._options;
        
        // Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
        if ( isAcorde === true ) {
            if (opt.sustenido) abc += "^";
            if (opt.beQuad) abc += "=";
            abc += this.#altura.abc;
            return abc;
        }

        // 1. PREFIXOS (Decoradores e Ornamentos)
        if (opt.ghostNote) abc += "!style=x!";
        if (opt.fermata) abc += "!fermata!";
        if (opt.arpeggio) abc += "!arpeggio!";

        // Acentuação (Exclusiva)
        if (opt.marcato) abc += "!marcato!";
        else if (opt.acento) abc += "!accent!";

        // Articulações (Exclusiva)
        if (opt.staccatissimo) abc += "!staccatissimo!";
        else if (opt.staccato) abc += ".";
        else if (opt.tenuto) abc += "!tenuto!";
        
        // Acidentes locais
        if (opt.sustenido) abc += "^";
        if (opt.beQuad) abc += "=";

        // Ornamentos (Exclusiva)
        if (opt.trinado) abc += "!trill!";
        else if (opt.mordente) abc += "!mordent!";
        else if (opt.upperMordent) abc += "!uppermordent!";
        
        if (opt.roll) abc += "~";

        // Grace Notes (Adornos)
        abc += this.#toGraceNotes();

        // 2. ALTURA DA NOTA
        abc += this.#altura.abc;

        // 3. SUFIXO DE DURAÇÃO
        abc += this._formatarDuracaoAbc();

        // 4. SUFIXOS (Dedilhado e Ligaduras)
        if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;

        // Ligaduras (Prolongamento/Tie)
        if (opt.ligada || opt.hammerOn || opt.pullOff) {
            abc += "-";
        }

        return abc;
    }

    /**
     * @private
     */
    #toGraceNotes() {
        const gn = this._options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";
        const notasGraceAbc = gn.map(nota => nota.toGraceNote()).join('');
        return `{${notasGraceAbc}}`;
    }

    /**
     * @private
     */

    // Getters / Setters
    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) throw new Error("A altura deve ser NotaFrequencia.");
        this.#altura = val;
    }
    get ligada() { return this._options.ligada; }
    set ligada(val) { this._options.ligada = !!val; }

    /**
     * Converte a instância da Nota para um objeto JSON que pode ser usado para recriá-la.
     * @returns {Object}
     */
    toJSON() {
        const json = {
            altura: this.#altura.abc,
            duracao: this.duracao.toString(),
        };

        const defaultOptions = {
            acento: false,
            marcato: false,
            staccato: false,
            staccatissimo: false,
            tenuto: false,
            hammerOn: false,
            pullOff: false,
            ligada: false,
            mordente: false,
            upperMordent: false,
            trinado: false,
            roll: false,
            fermata: false,
            ghostNote: false,
            graceNote: null,
            arpeggio: false,
            dedilhado: null,
            sustenido: false,
            beQuad: false,
        };

        const optionsToExport = {};

        for (const key in this._options) {
            if (Object.hasOwnProperty.call(defaultOptions, key)) {
                const value = this._options[key];
                const defaultValue = defaultOptions[key];

                if (key === 'graceNote' && Array.isArray(value)) {
                    if (value.length > 0) {
                        optionsToExport[key] = value.map(gn => gn.toJSON());
                    }
                } else if (value !== defaultValue) {
                    optionsToExport[key] = value;
                }
            }
        }

        if (Object.keys(optionsToExport).length > 0) {
            json.options = optionsToExport;
        }

        return json;
    }

    /**
     * USAGE: Helper para criação rápida de Nota a partir de um JSON.
     * Ex: Nota.create({ altura: "C", duracao: "1/4", options:{ sustenido: true })
     */
    static create(dados) {
        if (dados instanceof Nota) return dados;

        const resultado = notaSchema.safeParse(dados);

        // 1. Validação do Schema
        if (!resultado.success) {
            throw new TypeError("Nota.create: Erro na estrutura dos dados: " + resultado.error.message);
        }

        const { altura, duracao, options } = resultado.data;

        // 2. Validação da Regra de Negócio: Hierarquia de Tempo
        if (!options.unidadeTempo && !options.compasso && !options.voz && !options.obra) {
            throw new TypeError("Nota.create: A unidadeTempo Global deve ser definida em algum nível da hierarquia (Pausa/Compasso/Voz/Obra).");
        }

        // 3. Instanciação das dependências
        const instanciaFrequencia = NotaFrequencia.getByAbc(altura);
        const instanciaDuracao = TempoDuracao.create(duracao);

        // 4. Tratamento específico para unidadeTempo se ela existir no options
        const optionsProcessado = { ...options };
        if (options.unidadeTempo) {
            optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
        }

        // Retorno usando o spread para manter o DRY em todas as propriedades de options
        return new Nota(instanciaFrequencia, instanciaDuracao, optionsProcessado);
    }

    /**
     * USAGE: Cria uma nova instância de Nota a partir de uma string de notação ABC.
     * @param {string} notaString - A string da nota (ex: "^C'2").
     * @param {Object} contextOptions - Opções de contexto (L, M, K).
     * @returns {Nota} Uma nova instância da classe Nota.
     */
    static parseAbc(notaString, contextOptions) {
        const notaRegex = /([=^_]*)?([a-gA-G])([,']*)?([0-9]*\/*[0-9]*)?(-)?/;
        const match = notaString.match(notaRegex);

        if (!match) {
            throw new Error(`Nota.parseAbc: String de nota inválida: "${notaString}"`);
        }

        const [, acidente, nome, oitava, duracaoStr, ligadura] = match;

        const notaOptions = { ...contextOptions };

        // 1. Acidentes
        if (acidente) {
            if (acidente.includes('^')) notaOptions.sustenido = true;
            if (acidente.includes('=')) notaOptions.beQuad = true;
            // Adicionar bemol (_) se necessário no futuro
        }

        // 2. Altura (Nome + Oitava)
        const alturaAbc = `${nome}${oitava || ''}`;
        const altura = NotaFrequencia.getByAbc(alturaAbc);

        // 3. Duração
        const unidadeTempo = (function() {
            if (contextOptions.voz) {
                const voz = contextOptions.voz;
                if ( voz.getUnidadeTempo() && voz.getUnidadeTempo() instanceof TempoDuracao ) {
                    return voz.getUnidadeTempo();
                }
            }
            if (contextOptions.obra) {
                const obra = contextOptions.obra;
                if ( obra.getUnidadeTempo() && obra.getUnidadeTempo() instanceof TempoDuracao ) {
                    return obra.getUnidadeTempo();
                }
            }
            return new TempoDuracao(1, 8);
        })();
        let duracao;

        if (duracaoStr) {
            if (duracaoStr.includes('/')) {
                if (duracaoStr.startsWith('/')) { // ex: /2
                    duracao = new TempoDuracao(unidadeTempo.numerador, unidadeTempo.denominador * 2);
                } else { // ex: 3/2
                    const [numerador, denominador] = duracaoStr.split('/').map(Number);
                    duracao = new TempoDuracao(unidadeTempo.numerador * numerador, unidadeTempo.denominador * denominador);
                }
            } else { // ex: 2
                duracao = new TempoDuracao(unidadeTempo.numerador * Number(duracaoStr), unidadeTempo.denominador);
            }
        } else {
            duracao = unidadeTempo;
        }
        
        if (duracaoStr && duracaoStr.endsWith('-')) {
            notaOptions.ligada = true;
        }

        // 4. Ligadura (tie)
        if (ligadura) {
            notaOptions.ligada = true;
        }

        return new Nota(altura, duracao, notaOptions);
    }
}
