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
	 * @property {string:null} [options.letra='ma'] - letra associado à nota.
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
	 * @property {[]|null} [options.dedilhado=[]] - Digitação !0! a !5!.
	 * @property {number} [options.dinamicaSuave=0] - Nível de p (1:p, 2:pp, 3:ppp).
	 * @property {Nota[]|null} [options.graceNote=[]] - Digitação !0! a !5!.
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
			letra: null,

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
			graceNote: [],
			dedilhado: [],

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
		const ded = this._options.dedilhado;
		if (ded !== null && ded !== false && !Array.isArray(ded)) {
			throw new TypeError("Nota: dedilhado deve ser Array, null ou false.");
		}
	}

    // Getters / Setters
    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) throw new Error("A altura deve ser NotaFrequencia.");
        this.#altura = val;
    }
// --- GETTERS ---
	get acento() { return this._options.acento === true; }
	get acordes() { return this._options.acordes; } // Corrigido: Retorna o Array
	get arpeggio() { return this._options.arpeggio === true; }
	get bemol() { return this._options.bemol === true; }
	get beQuad() { return this._options.beQuad === true; }
	get breath() { return this._options.breath === true; }
	get crescendo() { return this._options.crescendo; } // Corrigido: Retorna String ou null
	//get dedilhado() { return this._options.dedilhado; } // Corrigido e SOBREPOSTO // overwrite
	get diminuendo() { return this._options.diminuendo; } // Corrigido: Retorna String ou null
	get dinamicaForte() { return this._options.dinamicaForte; } // Corrigido: Retorna Number
	get dinamicaMeioForte() { return this._options.dinamicaMeioForte === true; }
	get dinamicaSuave() { return this._options.dinamicaSuave; } // Corrigido: Retorna Number
	get downBow() { return this._options.downBow === true; }
	get fermataInvertida() { return this._options.fermataInvertida === true; }
	get fermata() { return this._options.fermata === true; }
	get ghostNote() { return this._options.ghostNote === true; }
	//get graceNote() { return this._options.graceNote; } // Corrigido e SOBREPOSTO // overwrite
	get hammerOn() { return this._options.hammerOn === true; }
	get ligada() { return this._options.ligada === true; }
	get marcato() { return this._options.marcato === true; }
	get mordente() { return this._options.mordente === true; }
	get openString() { return this._options.openString === true; }
	get pizzicato() { return this._options.pizzicato === true; }
	get pullOff() { return this._options.pullOff === true; }
	get roll() { return this._options.roll === true; }
	get snapPizzicato() { return this._options.snapPizzicato === true; }
	get staccatissimo() { return this._options.staccatissimo === true; }
	get staccato() {
		return this._options.staccato === true;
	}
	get sustenido() { return this._options.sustenido === true; }
	get tenuto() { return this._options.tenuto === true; }
	get thumb() { return this._options.thumb === true; }
	get trinado() { return this._options.trinado === true; }
	get turn() { return this._options.turn === true; }
	get upBow() { return this._options.upBow === true; }
	get upperMordent() { return this._options.upperMordent === true; }

	// --- SETTERS ---
	set acento(val) { this._options.acento = !!val; }
	set acordes(val) { this._options.acordes = val; } // Array
	set arpeggio(val) { this._options.arpeggio = !!val; }
	set bemol(val) { this._options.bemol = !!val; }
	set beQuad(val) { this._options.beQuad = !!val; }
	set breath(val) { this._options.breath = !!val; }
	set crescendo(val) { this._options.crescendo = val; } // String / null
	//set dedilhado(val) { this._options.dedilhado = val; } // SOBREPOSTO // overwrite
	set diminuendo(val) { this._options.diminuendo = val; } // String / null
	set dinamicaForte(val) { this._options.dinamicaForte = val; } // Number
	set dinamicaMeioForte(val) { this._options.dinamicaMeioForte = !!val; } // Boolean
	set dinamicaSuave(val) { this._options.dinamicaSuave = val; } // Number
	set downBow(val) { this._options.downBow = !!val; }
	set fermataInvertida(val) { this._options.fermataInvertida = !!val; }
	set fermata(val) { this._options.fermata = !!val; }
	set ghostNote(val) { this._options.ghostNote = !!val; }
	//set graceNote(val) { this._options.graceNote = val; } // SOBREPOSTO // overwrite
	set hammerOn(val) { this._options.hammerOn = !!val; }
	set ligada(val) { this._options.ligada = !!val; }
	set marcato(val) { this._options.marcato = !!val; }
	set mordente(val) { this._options.mordente = !!val; }
	set openString(val) { this._options.openString = !!val; }
	set pizzicato(val) { this._options.pizzicato = !!val; }
	set pullOff(val) { this._options.pullOff = !!val; }
	set roll(val) { this._options.roll = !!val; }
	set snapPizzicato(val) { this._options.snapPizzicato = !!val; }
	set staccatissimo(val) { this._options.staccatissimo = !!val; }
	set staccato(val) { this._options.staccato = !!val; }
	set sustenido(val) { this._options.sustenido = !!val; }
	set tenuto(val) { this._options.tenuto = !!val; }
	set thumb(val) { this._options.thumb = !!val; }
	set trinado(val) { this._options.trinado = !!val; }
	set turn(val) { this._options.turn = !!val; }
	set upBow(val) { this._options.upBow = !!val; }
	set upperMordent(val) { this._options.upperMordent = !!val; }
}
