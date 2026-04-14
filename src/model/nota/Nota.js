import { NotaFrequencia } from "./NotaFrequencia.js";
import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { notaSchema } from "../../schemas/notaSchema.js";
import { NotaFrequenciaSchema } from "../../schemas/notaFrequenciaSchema.js";
import { TempoDuracaoSchema } from "../../schemas/tempoDuracaoSchema.js";
import { ElementoMusical } from "./ElementoMusical.js";
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
    get options() { return this._options; }
}
