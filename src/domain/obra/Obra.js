import { Voz } from '@domain/voz/Voz.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TempoAndamento } from '@domain/tempo/TempoAndamento.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { Tonalidade } from '@domain/compasso/Tonalidade.js';
import { Ritmo } from '@domain/obra/Ritmo.js';
import { GrupoInstrumento } from './GrupoInstrumento.js';
import { Clave } from '@domain/obra/Clave.js';

/*
A:	(Geographical) Area : eg A:Brittany or A:Sussex
B:	Book, eg B:Encyclopeadia Blowzabellica or B:O'Neill's
C:	Composer eg C:Andy Cutting or C:Trad
D:	Discography eg D:New Victory Band, One More Dance And Then
F:	File Name eg http://www.lesession.co.uk/woodenflute.abc
G:	Group eg G:Flute - this is used for the purpose of indexing tunes in software, NOT for naming the group / band you acquired the tune from (which should be recorded in the S: source field).
H:	History - Multiple H: fields may be used as needed to record text about the history of the tune. (Many people (including me) seem to tend to forget about the H: field and instead always put information like that in the N: notes field instead.)
I:	Information - used by certain software packages, NOT for historical information or notes (which should be recorded in the H: or N: fields).
K:	Key -see part one of this tutorial for further details
L:	Default note length -see part one of this tutorial for further details
M:	Meter :see part one of this tutorial for further details
N:	Notes : Multiple N: fields can be used as needed to record detailed text notes about, well, just about anything you want to say about the tune that won't go in any of the other fields really ...
O:	(Geographical) Origin : eg O:Irish or O:Swedish
P:	Parts -see below for further details
Q:	Tempo -see part one of this tutorial for further details
R:	Rhythm -see part one of this tutorial for further details
S:	Source - where you got the tune from eg S:Olio or S:Dave Praties
T:	Title -see part one of this tutorial for further details
W:	Words -see below for further details
X:	Tune reference number -see part one of this tutorial for further details
Z:	Transcription note - the identity of the transcriber or the source of the transcription, eg Z:Steve Mansfield
*/

export class Obra {
    #index = 0;
    #options = {};
    #vozes = [];

    /**
     * USAGE: Cria uma nova instância de Obra e inicializa suas propriedades através do objeto options.
     * @param {number} [index=0] - X: Índice da obra no contexto global (RG) da música no arquivo (obrigatório pelo padrão ABC).
     * @param {Array<Voz>} [vozes=[]] - Matriz inicial de vozes que compõem a obra.
     * @param {Object} [options={}] - Objeto de metadados e configurações de cabeçalho (Campos de informação ABC).
     * * --- PROPRIEDADES DE #OPTIONS ---
     * @param {String|null} [options.areaGeografica=null] -       A: Área geográfica (ex: "Brittany" ou "Sussex").
     * @param {String|null} [options.origemGeografica=null] -     O: Origem geográfica/Etnia (ex: "Irish" ou "Swedish").
     * @param {Array<String>} [options.livro=[]]                  B: Livro ou coleção onde a obra foi publicada.
     * @param {Array<String>} [options.compositor=[]]             C: Nome do compositor da música ou "Trad" para tradicional.
     * @param {Array<String>} [options.discografia=[]]            D: Informações sobre discografia relacionada à obra.
     * @param {String|null} [options.nomeArquivo=null] -          F: URL ou nome do arquivo original da transcrição.
     * @param {GrupoInstrumento|null} [options.grupoInstrumento=null] -     G: Grupo/Categoria para indexação em software (ex: "Flute"). Não use para o nome da banda.
     * @param {Array<String>} [options.historia=[]] -             H: História da música. Pode conter múltiplas entradas para textos longos.
     * @param {Array<String>} [options.informacoes=[]] -          I: Informações técnicas específicas para softwares de processamento ABC.
     * @param {Tonalidade|null} [options.tonalidade=null] -       K: Tonalidade (Key) da música (ex: "G", "Am", "Dmix").
     * @param {Clave|null} [options.clave=null] -                 Ajuda a definir a clave
     * @param {TempoMetrica} [options.metrica=null] -             M: Fórmula de compasso/Métrica (Meter, ex: "4/4", "3/4", "C|").
     * @param {TempoDuracao} [options.unidadeTempo=null] -        L: Duração padrão das notas (Default note length, ex: "1/4", "1/8").
     * @param {Array<String>} [options.notas=[]] -                N: Notas gerais e comentários detalhados sobre a peça.
     * @param {String|null} [options.partes=null] -               P: Ordem de execução das partes da música (ex: "A(AB)3").
     * @param {TempoAndamento|null} [options.tempoAndamento] -    Q: Andamento/Tempo da música (ex: "1/4=120").
     * @param {Ritmo|null} [options.ritmo=null] -                 R: Ritmo da música (ex: "Jig", "Reel", "Polka").
     * @param {Array<String>} [options.fonte=[]]                  S: Fonte de onde a música foi obtida (ex: pessoa, banda ou manuscrito).
     * @param {String|Array<String>|null} [options.titulo=null] - T: Título da música. Use Array para títulos alternativos ou subtítulos.
     * @param {Array<String>} [options.letra=[]] -                W: Letras (Words) da música, geralmente exibidas ao final da partitura.
     * @param {String|null} [options.notaTranscricao=null] -      Z: Nota de transcrição; nome de quem digitou ou converteu o arquivo.
     * @param {Array<String>} [options.diretivas=[]] -            %%: Diretivas de formatação e metadados (ex: %%textfont, %%text).
     */
    constructor(index, vozes = [], options = {}) {
        this.#options = {
            unidadeTempo: options.unidadeTempo || new TempoDuracao( 1, 4 )  // L: Default note length -see part one of this tutorial for further details
            , metrica: options.metrica || new TempoMetrica(4,4)  // M: Meter :see part one of this tutorial for further details
            , areaGeografica: options.areaGeografica || null  // A: (Geographical) Area : eg A:Brittany or A:Sussex
            , origemGeografica: options.origemGeografica || null  // O: (Geographical) Origin : eg O:Irish or O:Swedish
            , livro: options.livro || []  // B: Book, eg B:Encyclopeadia Blowzabellica or B:O'Neill's
            , compositor: options.compositor || []  // C: Composer eg C:Andy Cutting or C:Trad
            , discografia: options.discografia || []  // D: Discography eg D:New Victory Band, One More Dance And Then
            , nomeArquivo: options.nomeArquivo || null  // F: File Name eg http://www.lesession.co.uk/woodenflute.abc
            , grupoInstrumento: options.grupoInstrumento || new GrupoInstrumento('OUTROS')  // G: Group eg G:Flute - this is used for the purpose of indexing tunes in software, NOT for naming the group / band you acquired the tune from (which should be recorded in the S: source field).
            , historia: options.historia || []  // H: History - Multiple H: fields may be used as needed to record text about the history of the tune.
            , informacoes: options.informacoes || []  // I: Information - used by certain software packages, NOT for historical information or notes (which should be recorded in the H: or N: fields).
            , tonalidade: options.tonalidade || new Tonalidade('C')  // K: Key -see part one of this tutorial for further details
            , clave: options.clave || new Clave('TREBLE')
            , notas: options.notas || []  // N: Notes : Multiple N: fields can be used as needed to record detailed text notes about, well, just about anything you want to say about the tune that won't go in any of the other fields really ...
            , partes: options.partes || null  // P: Parts -see below for further details
            , tempoAndamento: options.tempoAndamento || new TempoAndamento( new TempoDuracao(1,4), 95)  // Q: Tempo -see part one of this tutorial for further details
            , ritmo: options.ritmo || Ritmo.create('REEL')  // R: Rhythm -see part one of this tutorial for further details
            , fonte: options.fonte || []  // S: Source - where you got the tune from eg S:Olio or S:Dave Praties
            , titulo: options.titulo || null  // T: Title -see part one of this tutorial for further details
            , letra: options.letra || []  // W: Words -see below for further details
            , notaTranscricao: options.notaTranscricao || null  // Z: Transcription note - the identity of the transcriber or the source of the transcription, eg Z:Steve Mansfield
            , diretivas: options.diretivas || [] // %%: Directives
            , ...options
        };
        this.index = index;
        this.vozes = vozes;
    }

    get index() {
        return this.#index;
    }
    /**
     * Define o índice da obra (RG/Campo X:).
     * @param {number} val - Deve ser um número inteiro positivo.
     */
    set index(val) {
        // 1. Garante que seja um número (rejeita null, undefined, strings e NaN)
        if (typeof val !== 'number' || Number.isNaN(val)) {
            throw new TypeError(`Obra.index: Valor inválido. Esperado um número, recebido: ${val}`);
        }

        // 2. Garante que seja um número inteiro e finito (rejeita decimais e Infinity)
        if (!Number.isInteger(val)) {
            throw new TypeError(`Obra.index: O índice deve ser um número inteiro finito (recebido: ${val})`);
        }

        // 3. Garante que siga a regra de negócio do padrão ABC (X: >= 1)
        if (val < 1) {
            throw new RangeError(`Obra.index: O índice deve ser um número positivo (recebido: ${val})`);
        }

        this.#index = val;
    }
    /**
     *
     * @param val {Numer}
     */
    set quebraDeLinha(val) {
        if (typeof val !== 'number') {
            this.#options.quebraDeLinha=5;
        }
        this.#options.quebraDeLinha = val;
    }
    get vozes() {
        return this.#vozes;
    }
    set vozes(vozes) {
        if (!Array.isArray(vozes)) {
            throw new TypeError('Obra: Vozes devem ser fornecidos em um Array.');
        }
        this.#vozes = [];
        vozes.forEach(v => this.addVoz(v));
    }
    /**
     * USAGE: Adiciona um compasso à voz, definindo seu índice e vinculando a referência de voz.
     * @param {Compasso} voz
     */
    addVoz(voz) {
        if (!(voz instanceof Voz)) {
            throw new TypeError('Obra: O objeto voz adicionado deve ser uma instância de Voz.');
        }
        voz.index = this.#vozes.length + 1;
        voz.options.obra = this;
        this.#vozes.push(voz);
    }
	get options() {
		if ( this.#options === null || this.#options === undefined ) {
			this.#options = {};
		}
		return this.#options;
	}
	set options(options) {
		if ( this.#options === null || this.#options === undefined ) {
			this.#options = {};
		}
		this.#options = options;
	}
    getUnidadeTempo() {
        return this.unidadeTempo;
    }
	get unidadeTempo() {
		return this.options.unidadeTempo;
	}
	set unidadeTempo(val) {
		if (val == null) { this.options.unidadeTempo = null; return; }
		if (!(val instanceof TempoDuracao)) throw new TypeError('Obra: TempoDuracao inválido.');
		this.options.unidadeTempo = val;
	}
	get metrica() { return this.#options.metrica; }
	set metrica(val) {
		if (val == null) { this.options.metrica = null; return; }
		if (!(val instanceof TempoMetrica)) throw new TypeError('Obra: TempoMetrica inválido.');
		this.options.metrica = val;
	}
    getMetrica() {
        return this.options.metrica;
    }
}
