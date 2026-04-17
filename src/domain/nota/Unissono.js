import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { Nota } from "./Nota.js";
import { ElementoMusical } from "./ElementoMusical.js";
import { unissonoSchema } from "../../schemas/unissonoSchema.js";
import { NotaFrequencia } from "./NotaFrequencia.js";
import { NotaFrequenciaSchema } from "../../schemas/notaFrequenciaSchema.js";
import { TempoDuracaoSchema } from "../../schemas/tempoDuracaoSchema.js";
/**
 * Representa um unissono musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 */
export class Unissono extends ElementoMusical {
    /** @type {Array<Nota>} */
    #notas = [];
    /**
     * @param {Array<Nota>} notas - Notas que compõem o unissono.
     * @param {TempoDuracao} duracao - Duração do conjunto.
     * @param {Object} [options={}] - Atributos e contexto.
     */
    constructor(notas = [], duracao, options = {}) {
        super(duracao, options);
        this.notas = notas;
        this._options = {
            obra: null,
            compasso: null,
            unidadeTempo: null,
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E ORNAMENTOS
            ligada: false, 
            arpeggio: false,
            fermata: false,
            ghostNote: false,
            roll: false,
            trinado: false,
            mordente: false,
            upperMordent: false,
            
            graceNote: null, // false | null | Array<Nota>
            dedilhado: null,
            ...options
        };

        // Validação da propriedade graceNote (Idêntica à classe Nota)
        const gn = this._options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Unissono: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
        }
        if (Array.isArray(gn) && gn.some(n => !(n instanceof Nota))) {
            throw new TypeError("Falha ao criar Unissono: Todos os elementos em 'graceNote' devem ser instâncias de Nota.");
        }
    }

    /**
     * USAGE: Gera a string ABC do unissono processando notas internas e atributos globais.
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        const opt = this._options;

        // 1. PREFIXOS GLOBAIS
        if (opt.ghostNote) abc += "!style=x!";
        if (opt.fermata) abc += "!fermata!";
        if (opt.arpeggio) abc += "!arpeggio!";
        
        if (opt.marcato) abc += "!marcato!";
        else if (opt.acento) abc += "!accent!";

        if (opt.staccatissimo) abc += "!staccatissimo!";
        else if (opt.staccato) abc += ".";
        else if (opt.tenuto) abc += "!tenuto!";

        if (opt.trinado) abc += "!trill!";
        else if (opt.mordente) abc += "!mordent!";
        else if (opt.upperMordent) abc += "!uppermordent!";
        
        if (opt.roll) abc += "~";

        // Grace Notes (Adornos) aplicados ao unissono
        abc += this.#toGraceNotes();

        // 2. CORPO DO UNISSONO
        const notasAbc = this.#notas.map(nota => nota.toAbc(true)).join('');
        abc += `[${notasAbc}]`;

        // 3. SUFIXO DE DURAÇÃO
        abc += this._formatarDuracaoAbc();

        // 4. SUFIXOS FINAIS
        if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;
        if (opt.ligada) abc += "-";

        return abc;
    }

    toJSON() {
        const json = {
            notas: this.#notas.map(n => n.toJSON()),
            duracao: this.duracao.toString(),
        };

        const defaultOptions = {
            acento: false,
            marcato: false,
            staccato: false,
            staccatissimo: false,
            tenuto: false,
            ligada: false,
            arpeggio: false,
            fermata: false,
            ghostNote: false,
            roll: false,
            trinado: false,
            mordente: false,
            upperMordent: false,
            graceNote: null,
            dedilhado: null,
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
     * USAGE: Transforma a matriz de adornos em uma string ABC enfileirada.
     * @private
     * @returns {string}
     */
    #toGraceNotes() {
        const gn = this._options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";

        const notasGraceAbc = gn.map(nota => nota.toGraceNote(true)).join('');
        return `{${notasGraceAbc}}`;
    }

    #addNota(nota) {
        if (!(nota instanceof Nota)) {
            throw new TypeError('A nota deve ser uma instância de Nota.');
        }
        this.#notas.push(nota);
    }
    get notas() { return this.#notas; }
    
    set notas(arrayNotas) {
        if (!Array.isArray(arrayNotas)) {
            throw new TypeError('As notas de um unissono devem ser fornecidas como um array de instâncias de Nota.');
        }
        if (arrayNotas.some(nota => !(nota instanceof Nota))) {
            throw new TypeError('Todos os elementos do array de notas devem ser instâncias de Nota.');
        }
        this.#notas = [];
        arrayNotas.forEach(nota => this.#addNota(nota));
    }

    /**
     * USAGE: Helper para criação rápida de Unissono a partir de um JSON.
     */
    static create(dados) {
        if (dados instanceof Unissono) return dados;

        // 1. Validação via Zod
        const resultado = unissonoSchema.safeParse(dados);

        if (!resultado.success) {
            throw new TypeError("Unissono.create: Erro na estrutura dos dados: " + resultado.error.message);
        }

        const { notas, duracao, options } = resultado.data;

        // 2. Validação da Regra de Negócio (Hierarquia de Tempo)
        if (!options.unidadeTempo && !options.compasso && !options.voz && !options.obra) {
            throw new TypeError("Unissono.create: A unidadeTempo Global deve ser definida em algum nível da hierarquia.");
        }

        // 3. Instanciação recursiva das Notas
        const instanciasNotas = notas.map(n => {
            // GARANTE que o objeto options exista no JSON cru da nota
            n.options = n.options || {};

            // Propaga o contexto do Unissono para a Nota, se a nota não tiver o seu próprio.
            if (!n.options.unidadeTempo && options.unidadeTempo) {
                n.options.unidadeTempo = options.unidadeTempo;
            }
            if (!n.options.compasso && options.compasso) {
                n.options.compasso = options.compasso;
            }
            if (!n.options.voz && options.voz) {
                n.options.voz = options.voz;
            }
            if (!n.options.obra && options.obra) {
                n.options.obra = options.obra;
            }
            return Nota.create(n);
        });

        // 4. Instanciação da Duração e Unidade de Tempo
        const instanciaDuracao = TempoDuracao.create(duracao);
        const optionsProcessado = { ...options };

        if (options.unidadeTempo) {
            optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
        }

        // Tratamento de GraceNotes se forem um array
        if (Array.isArray(options.graceNote)) {
            optionsProcessado.graceNote = options.graceNote.map(n => Nota.create(n));
        }

        // 5. Retorna a nova instância de Unissono
        return new Unissono(instanciasNotas, instanciaDuracao, optionsProcessado);
    }

    /**
     * USAGE: Cria uma nova instância de Unissono a partir de uma string de notação ABC.
     * @param {string} unissonoString - A string do unissono (ex: "[CEG]2").
     * @param {Object} contextOptions - Opções de contexto (L, M, K).
     * @returns {Unissono} Uma nova instância da classe Unissono.
     */
    static parseAbc(unissonoString, contextOptions) {
        const unissonoRegex = /\[([^\]]+)\]([0-9]*\/*[0-9]*)?(-)?/;
        const match = unissonoString.match(unissonoRegex);

        if (!match) {
            throw new Error(`Unissono.parseAbc: String de unissono inválida: "${unissonoString}"`);
        }

        const [, notasStr, duracaoStr, ligadura] = match;
        const unissonoOptions = { ...contextOptions };

        // 1. Duração do Unissono
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

        if (ligadura) {
            unissonoOptions.ligada = true;
        }

        // 2. Parsing das notas internas
        const notaInternaRegex = /([=^_]?[a-gA-G][,']*)/g;
        const notas = [];
        let notaMatch;
        while ((notaMatch = notaInternaRegex.exec(notasStr)) !== null) {
            // A duração de cada nota interna é a mesma do unissono.
            // Passamos a string da nota e o contexto, mas a duração será a do unissono.
            const nota = Nota.parseAbc(notaMatch[0], contextOptions);
            notas.push(nota);
        }

        // 3. Criação do Unissono
        const unissono = new Unissono(notas, duracao, unissonoOptions);
        
        // Garante que a duração de cada nota individual seja a mesma do unissono
        unissono.notas.forEach(n => n.duracao = unissono.duracao);

        return unissono;
    }
}
