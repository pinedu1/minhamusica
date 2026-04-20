import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
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
	 * @param {Object} [options={}] - Propriedades opcionais e ornamentos.
	 * * // INFRAESTRUTURA
	 * @property {Obra|null} [options.obra=null] - Referência à obra musical.
	 * @property {Voz|null} [options.voz=null] - Referência à voz à qual a nota pertence.
	 * @property {Compasso|null} [options.compasso=null] - Referência ao compasso atual.
	 * @property {TempoDuracao|null} [options.unidadeTempo=null] - Unidade de tempo vigente.
	 * @property {Acorde[]|string} [options.acordes=[]] - Acordes associados à nota.
	 * @property {boolean} [options.fermata=false] - Símbolo !fermata! (H).
	 * @property {boolean} [options.fermataInvertida=false] - Símbolo !invertedfermata!.
	 * @property {boolean} [options.acento=false] - Símbolo !accent! ou !emphasis!.
	 * @property {boolean} [options.tenuto=false] - Símbolo !tenuto!.
	 * @property {boolean} [options.staccatissimo=false] - Símbolo !wedge!.
	 * @property {boolean} [options.breath=false] - Marca de respiração !breath!.
	 * @property {boolean} [options.trinado=false] - Símbolo !trill!.
	 * @property {boolean} [options.turn=false] - Grupeto !turn!.
	 * @property {boolean} [options.mordente=false] - Mordente inferior !lowermordent!.
	 * @property {boolean} [options.upperMordent=false] - Mordente superior !uppermordent!.
	 * @property {boolean} [options.roll=false] - Símbolo !roll!.
	 * @property {boolean} [options.pizzicato=false] - Pizzicato / Rasp !+!.
	 * @property {boolean} [options.snapPizzicato=false] - Snap Pizzicato !snap!.
	 * @property {boolean} [options.downBow=false] - Arco para baixo !downbow!.
	 * @property {boolean} [options.upBow=false] - Arco para cima !upbow!.
	 * @property {boolean} [options.openString=false] - Corda solta !open!.
	 * @property {boolean} [options.thumb=false] - Símbolo de polegar !thumb!.
	 * @property {number|null} [options.dedilhado=null] - Digitação !0! a !5!.
	 * @property {number} [options.dinamicaSuave=0] - Nível de p (1:p, 2:pp, 3:ppp).
	 * @property {number} [options.dinamicaForte=0] - Nível de f (1:f, 2:ff, 3:fff).
	 * @property {boolean} [options.dinamicaMeioForte=false] - Símbolo !mf!.
	 * @property {string|null} [options.crescendo=null] - 'inicio' para !crescendo(! ou 'fim' para !crescendo)!.
	 * @property {string|null} [options.diminuendo=null] - 'inicio' para !diminuendo(! ou 'fim' para !diminuendo)!.
	 */
	constructor(altura, duracao, options = {}) {
		super(duracao, options);

		this.altura = altura;
		this.duracao = duracao;

		/** @private */
		this._options = {
			obra: null,
			voz: null,
			compasso: null,
			unidadeTempo: null,
			acordes: [],

			// ACENTUAÇÃO E ARTICULAÇÃO
			acento: false,
			marcato: false,
			staccato: false,
			staccatissimo: false,
			tenuto: false,
			fermata: false,
			fermataInvertida: false,
			breath: false,

			// ORNAMENTOS
			mordente: false,
			upperMordent: false,
			trinado: false,
			turn: false,
			roll: false,

			// TÉCNICAS
			hammerOn: false,
			pullOff: false,
			ligada: false,
			pizzicato: false,
			snapPizzicato: false,
			downBow: false,
			upBow: false,
			openString: false,
			thumb: false,

			// OUTROS
			ghostNote: false,
			arpeggio: false,
			graceNote: null,
			dedilhado: null,

			// DINÂMICAS (Nível: 1, 2 ou 3)
			dinamicaSuave: 0,
			dinamicaForte: 0,
			dinamicaMeioForte: false,

			// EXPRESSÃO (Semântico: 'inicio' ou 'fim')
			crescendo: null,
			diminuendo: null,

			sustenido: false,
			bemol: false,
			beQuad: false,

			...options
		};

		// --- VALIDAÇÕES DEFENSIVAS MANUAIS ---

		if (this._options.dinamicaForte < 0 || this._options.dinamicaForte > 3) {
			throw new RangeError("Nota: dinamicaForte deve ser entre 0 e 3.");
		}
		if (this._options.dinamicaSuave < 0 || this._options.dinamicaSuave > 3) {
			throw new RangeError("Nota: dinamicaSuave deve ser entre 0 e 3.");
		}
		if (this._options.dedilhado !== null && (this._options.dedilhado < 0 || this._options.dedilhado > 5)) {
			throw new RangeError("Nota: dedilhado deve ser entre 0 e 5.");
		}

		// Validação semântica para crescendo e diminuendo
		const validosHairpin = [null, 'inicio', 'fim'];
		if (!validosHairpin.includes(this._options.crescendo)) {
			throw new TypeError("Nota: crescendo deve ser 'inicio', 'fim' ou null.");
		}
		if (!validosHairpin.includes(this._options.diminuendo)) {
			throw new TypeError("Nota: diminuendo deve ser 'inicio', 'fim' ou null.");
		}

		const gn = this._options.graceNote;
		if (gn !== null && gn !== false && !Array.isArray(gn)) {
			throw new TypeError("Nota: graceNote deve ser Array, null ou false.");
		}
	}

    // Getters / Setters
    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) throw new Error("A altura deve ser NotaFrequencia.");
        this.#altura = val;
    }
	get acordes() { return this._options.acordes; }
    get ligada() { return this._options.ligada; }
    set ligada(val) { this._options.ligada = !!val; }
	get arpeggio() { return this._options.arpeggio; }
    set arpeggio(val) { this._options.arpeggio = !!val; }
    get fermata() { return this._options.fermata; }
    set fermata(val) { this._options.fermata = !!val; }
    get fermataInvertida() { return this._options.fermataInvertida; }
    set fermataInvertida(val) { this._options.fermataInvertida = !!val; }
    get sustenido() { return this._options.sustenido; }
    set sustenido(val) { this._options.sustenido = !!val; }
    get beQuad() { return this._options.beQuad; }
    set beQuad(val) { this._options.beQuad = !!val; }
	get roll() { return this._options.roll; }
    set roll(val) { this._options.roll = !!val; }
	get turn() { return this._options.turn; }
    set turn(val) { this._options.turn = !!val; }
	get trinado() { return this._options.trinado; }
    set trinado(val) { this._options.trinado = !!val; }
	get mordente() { return this._options.mordente; }
    set mordente(val) { this._options.mordente = !!val; }
	get upperMordent() { return this._options.upperMordent; }
    set upperMordent(val) { this._options.upperMordent = !!val; }
}
