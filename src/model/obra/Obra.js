import { Voz } from '../voz/Voz.js';
import { Compasso } from '../compasso/Compasso.js';
import { TempoAndamento } from '../tempo/TempoAndamento.js';
import { TempoDuracao } from '../tempo/TempoDuracao.js';
import { TempoMetrica } from '../tempo/TempoMetrica.js';
import { Ritmo } from './Ritmo.js';
import { GrupoInstrumento } from './GrupoInstrumento.js';
import { Tonalidade } from '../compasso/Tonalidade.js';
import { Clave } from './Clave.js';
import { obraSchema } from '../../schemas/obraSchema.js';

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
     */
    constructor(index, vozes = [], options = {}) {
        this.#options = {
            unidadeTempo: options.unidadeTempo || TempoDuracao.create( '1/4' )  // L: Default note length -see part one of this tutorial for further details
            , metrica: options.metrica || TempoMetrica.create('4/4')  // M: Meter :see part one of this tutorial for further details
            , areaGeografica: options.areaGeografica || null  // A: (Geographical) Area : eg A:Brittany or A:Sussex
            , origemGeografica: options.origemGeografica || null  // O: (Geographical) Origin : eg O:Irish or O:Swedish
            , livro: options.livro || []  // B: Book, eg B:Encyclopeadia Blowzabellica or B:O'Neill's
            , compositor: options.compositor || []  // C: Composer eg C:Andy Cutting or C:Trad
            , discografia: options.discografia || []  // D: Discography eg D:New Victory Band, One More Dance And Then
            , nomeArquivo: options.nomeArquivo || null  // F: File Name eg http://www.lesession.co.uk/woodenflute.abc
            , grupoInstrumento: options.grupoInstrumento || GrupoInstrumento.create('OUTROS')  // G: Group eg G:Flute - this is used for the purpose of indexing tunes in software, NOT for naming the group / band you acquired the tune from (which should be recorded in the S: source field).
            , historia: options.historia || []  // H: History - Multiple H: fields may be used as needed to record text about the history of the tune.
            , informacoes: options.informacoes || []  // I: Information - used by certain software packages, NOT for historical information or notes (which should be recorded in the H: or N: fields).
            , tonalidade: options.tonalidade || Tonalidade.create('C')  // K: Key -see part one of this tutorial for further details
            , clave: options.clave || Clave.create('TREBLE')
            , notas: options.notas || []  // N: Notes : Multiple N: fields can be used as needed to record detailed text notes about, well, just about anything you want to say about the tune that won't go in any of the other fields really ...
            , partes: options.partes || null  // P: Parts -see below for further details
            , tempoAndamento: options.tempoAndamento || TempoAndamento.create({ tempo: '1/4', duracao: 95 })  // Q: Tempo -see part one of this tutorial for further details
            , ritmo: options.ritmo || Ritmo.create('REEL')  // R: Rhythm -see part one of this tutorial for further details
            , fonte: options.fonte || []  // S: Source - where you got the tune from eg S:Olio or S:Dave Praties
            , titulo: options.titulo || null  // T: Title -see part one of this tutorial for further details
            , letra: options.letra || []  // W: Words -see below for further details
            , notaTranscricao: options.notaTranscricao || null  // Z: Transcription note - the identity of the transcriber or the source of the transcription, eg Z:Steve Mansfield
            , ...options
        };
        this.index = index;
        this.vozes = vozes;
    }
    

    /**
     * USAGE: Gera a notação ABC completa representando a Obra.
     * Converte o cabeçalho (Header ABC) com as chaves padrão seguidas do corpo musical das Vozes.
     * @returns {string} String com formato ABC.
     */
    toAbc() {
        let abc = "";

        // Chave X: Reference Number (Obrigatório e deve ser o primeiro)
        abc += `X:${this.index}\n`;

        // Chave T: Title (Obrigatório, deve ser o segundo)
        const tituloOpt = this.#options.titulo;
        if (tituloOpt) {
            if (Array.isArray(tituloOpt)) {
                tituloOpt.forEach(t => abc += `T:${t}\n`);
            } else {
                abc += `T:${tituloOpt}\n`;
            }
        } else {
            abc += `T:Untitled\n`;
        }

        // --- Ordem sugerida/opcional das outras chaves do cabeçalho ---
        const opt = this.#options;

        // C: Composer
        if (opt.compositor && opt.compositor.length > 0) {
            opt.compositor.forEach(c => abc += `C:${c}\n`);
        }

        // O: Origin
        if (opt.origemGeografica) abc += `O:${opt.origemGeografica}\n`;
        
        // A: Area
        if (opt.areaGeografica) abc += `A:${opt.areaGeografica}\n`;

        // M: Meter (Time Signature)
        if (opt.metrica) {
            abc += `${opt.metrica.toAbc()}\n`;
        }

        // L: Default note length
        if (opt.unidadeTempo) {
            abc += `${opt.unidadeTempo.toAbc()}\n`;
        }

        // Q: Tempo
        if (opt.tempoAndamento) {
            abc += `${opt.tempoAndamento.toAbc()}\n`;
        }

        // P: Parts
        if (opt.partes) abc += `P:${opt.partes}\n`;

        // R: Rhythm
        if (opt.ritmo) {
            abc += `R:${opt.ritmo.nome}\n`;
        }

        // B: Book
        if (opt.livro && opt.livro.length > 0) {
            opt.livro.forEach(b => abc += `B:${b}\n`);
        }
        
        // D: Discography
        if (opt.discografia && opt.discografia.length > 0) {
            opt.discografia.forEach(d => abc += `D:${d}\n`);
        }

        // F: File Name
        if (opt.nomeArquivo) abc += `F:${opt.nomeArquivo}\n`;

        // G: Group Instrument
        if (opt.grupoInstrumento) {
            abc += `G:${opt.grupoInstrumento.valor}\n`;
        }

        // H: History
        if (opt.historia && opt.historia.length > 0) {
            opt.historia.forEach(h => abc += `H:${h}\n`);
        }

        // I: Information
        if (opt.informacoes && opt.informacoes.length > 0) {
            opt.informacoes.forEach(i => abc += `I:${i}\n`);
        }
        
        // S: Source
        if (opt.fonte && opt.fonte.length > 0) {
            opt.fonte.forEach(s => abc += `S:${s}\n`);
        }

        // Z: Transcription note
        if (opt.notaTranscricao) {
            if (Array.isArray(opt.notaTranscricao)) {
                opt.notaTranscricao.forEach(z => abc += `Z:${z}\n`);
            } else {
                abc += `Z:${opt.notaTranscricao}\n`;
            }
        }

        // N: Notes
        if (opt.notas && opt.notas.length > 0) {
            opt.notas.forEach(n => abc += `N:${n}\n`);
        }

        // K: Key (Obrigatório e deve ser o ÚLTIMO campo do cabeçalho)
        // Adiciona a clave na mesma linha da tonalidade se ela existir, padrão ABC
        if (opt.tonalidade && opt.tonalidade.valor) {
            abc += `K:${opt.tonalidade.toAbc()}`;
            if (opt.clave) {
                abc += ` ${opt.clave.toAbc()}`;
            }
            abc += `\n`;
        } else if (opt.tonalidade && typeof opt.tonalidade === 'string') {
             abc += `K:${opt.tonalidade}`;
             if (opt.clave) {
                 abc += ` ${opt.clave.toAbc()}`;
             }
             abc += `\n`;
        } else {
            abc += `K:C`;
            if (opt.clave) {
                abc += ` ${opt.clave.toAbc()}`;
            }
            abc += `\n`; // Valor seguro de fallback para Tonalidade
        }
        
        // --- Corpo da Obra ---
        // V: Vozes e Pautas
        if (this.#vozes && this.#vozes.length > 0) {
            this.#vozes.forEach(v => {
                abc += v.toAbc();
            });
        }

        // W: Words (Letras globais) - Geralmente vêm ao final de tudo no padrão ABC
        if (opt.letra && opt.letra.length > 0) {
            opt.letra.forEach(l => abc += `W:${l}\n`);
        }

        return abc.trim();
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
    get options() {
        return this.#options;
    }
    set options(options) {
        this.#options = options;
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
    getUnidadeTempo() {
        return this.#options.unidadeTempo;
    }
    getMetrica() {
        return this.#options.metrica;
    }
    /**
     * USAGE: Criação estática limpa a partir de dados JSON.
     * Combina o parse e validação dos schemas e instanciacoes em cascata.
     * Ex: JSON
     * {
     *    index: 88
     *    , options: {
     *        unidadeTempo: "1/4"
     *        , metrica: "4/4"
     *        , clave: {}
     *        , areaGeografica: "América do Sul"
     *        , origemGeografica: "Brasil"
     *        , livro: options.livro || [ "Enciclopédia de Folclore", "Revista Toca-Toca" ]
     *        , compositor: ["Zé da Silva", "João de Minas"]
     *        , discografia: options.discografia || ["Grandes Clássicos", "Zé da Silva - Coletânia, vol. 1"]
     *        , nomeArquivo: "http://www.mskl.com.br/amor-nao-chora.abc"
     *        , grupoInstrumento: 'OUTROS'
     *        , historia: ["Música Incidental"]  // H: History - Multiple H: fields may be used as needed to record text about the history of the tune.
     *        , informacoes: []
     *        , tonalidade: 'C'
     *        , notas: ["Esta música foi originalmente composta em cavaquinho", "Depois trasposta para Violão", "e finalmente para Viola caipira"]
     *        , partes: null
     *        , tempoAndamento: { tempo: '4/4', duracao: 95 }
     *        , ritmo: 'REEL'
     *        , fonte: ["Internet", "Sitio do caboclo"]
     *        , titulo: ["Amor não chora", "Semente minha"]
     *        , letra: null
     *        , notaTranscricao: ["Antonio dedilhado"]
     *    }
     *    , vozes:[{
     *            id: "V1"
     *            , options: { nome: "Melodia" }
     *            , compassos: [{elementos: [{ altura: "C", duracao: '1/4' }, { altura: "D", duracao: '1/4' }]}]
     *        }
     *    ]
     * }
     */
    static create(dados) {
        if (dados instanceof Obra) return dados;

        // 1. Validação Segura do JSON
        const resultado = obraSchema.safeParse(dados);

        if (!resultado.success) {
            throw new TypeError("Obra.create: Falha na validação do JSON.\n" + resultado.error.message);
        }

        const validado = resultado.data;
        const opt = validado.options || {};

        // 2. Hidratação das instâncias complexas
        const unidadeTempoInstancia = opt.unidadeTempo ? TempoDuracao.create(opt.unidadeTempo) : null;
        const metricaInstancia = opt.metrica ? TempoMetrica.create(opt.metrica) : null;
        const tempoAndamentoInstancia = opt.tempoAndamento ? TempoAndamento.create(opt.tempoAndamento) : null;
        const tonalidadeInstancia = opt.tonalidade ? Tonalidade.create(opt.tonalidade) : null;
        const claveInstancia = opt.clave ? Clave.create(opt.clave) : null;
        const ritmoInstancia = opt.ritmo ? Ritmo.create(opt.ritmo) : null;
        const grupoInstrumentoInstancia = opt.grupoInstrumento ? GrupoInstrumento.create(opt.grupoInstrumento) : null;

        // 3. Hidratação das Vozes
        const vozesInstancias = validado.vozes.map(vozDados => Voz.create(vozDados));

        // 4. Instanciação e ligação
        return new Obra(validado.index, vozesInstancias, {
            // Complexos instanciados
            unidadeTempo: unidadeTempoInstancia,
            metrica: metricaInstancia,
            tempoAndamento: tempoAndamentoInstancia,
            tonalidade: tonalidadeInstancia,
            clave: claveInstancia,
            ritmo: ritmoInstancia,
            grupoInstrumento: grupoInstrumentoInstancia,

            // Primitivos validados (copiados do opt)
            areaGeografica: opt.areaGeografica,
            origemGeografica: opt.origemGeografica,
            livro: opt.livro,
            compositor: opt.compositor,
            discografia: opt.discografia,
            nomeArquivo: opt.nomeArquivo,
            historia: opt.historia,
            informacoes: opt.informacoes,
            notas: opt.notas,
            partes: opt.partes,
            fonte: opt.fonte,
            titulo: opt.titulo,
            letra: opt.letra,
            notaTranscricao: opt.notaTranscricao
        });
    }
}