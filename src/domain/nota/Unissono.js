import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
/**
 * Representa um unissono musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 * // INFRAESTRUTURA
@property {Obra|null} [options.obra=null] - Referência à obra musical.
@property {Voz|null} [options.voz=null] - Referência à voz à qual a nota pertence.
@property {Compasso|null} [options.compasso=null] - Referência ao compasso atual.
@property {TempoDuracao|null} [options.unidadeTempo=null] - Unidade de tempo vigente.
@property {Acorde[]|string} [options.acordes=[]] - Acordes associados à nota.
 @property {string:null} [options.letra='ma'] - letra associado à nota.
@property {boolean} [options.fermata=false] - Símbolo !fermata! (H).
@property {boolean} [options.fermataInvertida=false] - Símbolo !invertedfermata!.
@property {boolean} [options.acento=false] - Símbolo !accent! ou !emphasis!.
@property {boolean} [options.tenuto=false] - Símbolo !tenuto!.
@property {boolean} [options.staccatissimo=false] - Símbolo !wedge!.
@property {boolean} [options.breath=false] - Marca de respiração !breath!.
@property {boolean} [options.trinado=false] - Símbolo !trill!.
@property {boolean} [options.turn=false] - Grupeto !turn!.
@property {boolean} [options.mordente=false] - Mordente inferior !lowermordent!.
@property {boolean} [options.upperMordent=false] - Mordente superior !uppermordent!.
@property {boolean} [options.roll=false] - Símbolo !roll!.
@property {boolean} [options.pizzicato=false] - Pizzicato / Rasp !+!.
@property {boolean} [options.snapPizzicato=false] - Snap Pizzicato !snap!.
@property {boolean} [options.downBow=false] - Arco para baixo !downbow!.
@property {boolean} [options.upBow=false] - Arco para cima !upbow!.
@property {boolean} [options.openString=false] - Corda solta !open!.
@property {boolean} [options.thumb=false] - Símbolo de polegar !thumb!.
@property {Array{string}} [options.dedilhado=[]] - Digitação ['!0!', '!5!'].
@property {number} [options.dinamicaSuave=0] - Nível de p (1:p, 2:pp, 3:ppp).
@property {number} [options.dinamicaForte=0] - Nível de f (1:f, 2:ff, 3:fff).
@property {boolean} [options.dinamicaMeioForte=false] - Símbolo !mf!.
@property {string|null} [options.crescendo=null] - 'inicio' para !crescendo(! ou 'fim' para !crescendo)!.
@property {string|null} [options.diminuendo=null] - 'inicio' para !diminuendo(! ou 'fim' para !diminuendo)!.
 *
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
	        graceNote: null,
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

        this.graceNote = this._options.graceNote;
	    this.dedilhado = this._options.dedilhado;
    }
	get tipo() { return 'unissono'; }
	#addNota(elemento) {
		if (!(elemento instanceof ElementoMusical)) {
			throw new TypeError('O elemento deve ser uma instância de ElementoMusical (Nota, Pausa, Unissono ou Quialtera).');
		}
		elemento.options.unissono = this;
		this.#notas.push(elemento);
	}

    get notas() {
	    if (this.#notas === null || this.#notas === undefined || !Array.isArray(this.#notas) || this.#notas.length === 0 ) {
		    return [];
	    }
		return this.#notas;
	}
    
    set notas(arrayNotas) {
        if (!Array.isArray(arrayNotas)) {
            throw new TypeError('As notas de um unissono devem ser fornecidas como um array de instâncias de Nota.');
        }
        if (arrayNotas.some(nota => !(nota instanceof ElementoMusical))) {
            throw new TypeError('Todos os elementos do array de notas devem ser instâncias de Nota.');
        }
		this.#notas = [];
        arrayNotas.forEach(nota => this.#addNota(nota));
    }
	get acordes() { return this._options.acordes; }

	get acento() { return this._options.acento === true; }
	set acento(val) { this._options.acento = !!val; }

	get arpeggio() { return this._options.arpeggio === true; }
	set arpeggio(val) { this._options.arpeggio = !!val; }

	get beQuad() { return this._options.beQuad === true; }
	set beQuad(val) { this._options.beQuad = !!val; }

	get breath() { return this._options.breath === true; }
	set breath(val) { this._options.breath = !!val; }

	get fermata() { return this._options.fermata === true; }
	set fermata(val) { this._options.fermata = !!val; }

	get fermataInvertida() { return this._options.fermataInvertida === true; }
	set fermataInvertida(val) { this._options.fermataInvertida = !!val; }

	get ligada() { return this._options.ligada === true; }
	set ligada(val) { this._options.ligada = !!val; }

	get marcato() { return this._options.marcato === true; }
	set marcato(val) { this._options.marcato = !!val; }

	get mordente() { return this._options.mordente === true; }
	set mordente(val) { this._options.mordente = !!val; }

	get roll() { return this._options.roll === true; }
	set roll(val) { this._options.roll = !!val; }

	get staccatissimo() { return this._options.staccatissimo === true; }
	set staccatissimo(val) { this._options.staccatissimo = !!val; }

	get staccato() { return this._options.staccato === true; }
	set staccato(val) { this._options.staccato = !!val; }

	get sustenido() { return this._options.sustenido === true; }
	set sustenido(val) { this._options.sustenido = !!val; }

	get tenuto() { return this._options.tenuto === true; }
	set tenuto(val) { this._options.tenuto = !!val; }

	get trinado() { return this._options.trinado === true; }
	set trinado(val) { this._options.trinado = !!val; }

	get turn() { return this._options.turn === true; }
	set turn(val) { this._options.turn = !!val; }

	get upperMordent() { return this._options.upperMordent === true; }
	set upperMordent(val) { this._options.upperMordent = !!val; }
}
