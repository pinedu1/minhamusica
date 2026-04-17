import { Compasso } from "@domain/compasso/Compasso.js";
import { Obra } from "@domain/obra/Obra.js";
import { Clave } from "@domain/obra/Clave.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

/**
 * Representa uma camada musical independente (Voz) na obra.
 * Responsável por agrupar compassos e definir propriedades de exibição e playback.
 */
export class Voz {
    /**
     * USAGE: Identificador único da voz (ex: 1, "V1").
     * @type {string|number|null}
     */
    #id = null;

    /**
     * USAGE: Container central de configurações de exibição da voz.
     * @type {Object}
     */
    #options = {};

    /**
     * USAGE: Lista ordenada de compassos que compõem esta voz.
     * @type {Array<Compasso>}
     */
    #compassos = [];

    /**
     * USAGE: Referência à Obra pai para sincronização de contexto rítmico.
     * @type {Obra|null}
     */
    #obra = null;

    /**
     * USAGE: Referência à Formula do tempo da Obra Q:1/4=90
     * @type {TempoMetrica|null}
     */
    #metrica = null;

    /**
     * USAGE: Cria uma nova voz e inicializa suas propriedades através do objeto options.
     *
     * @param {Array<Compasso>} [compassos=[]] - Matriz inicial de compassos.
     * @param {Object} [options={}] - Configurações de cabeçalho da voz.
     *
     * --- PROPRIEDADES DE #OPTIONS ---
     * @param {Number|String|null} [options.id=null] - Identificador único no ABC.
     * @param {Obra|null} [options.obra=null] - Vinculação imediata com a Obra.
     * @param {String|null} [options.nome=null] - Nome completo da voz (ex: "Viola Ponteada").
     * @param {String|null} [options.sinonimo=null] - Abreviação (nm=) da voz.
     * @param {String} [options.direcaoHaste='auto'] - Direção das hastes ('up', 'down', 'auto').
     * @param {Clave|null} [options.clave=null] - Definição de clave (clef=) inicial da voz.
     * @param {Number|null} [options.stafflines=null] - Número de linhas da pauta (padrão 5).
     * @param {String|null} [options.middle=null] - Define a nota central da pauta.
     */
    constructor(compassos = [], options = {}) {
        this.#options = {
            id: null,
            obra: null,
            unidadeTempo: null,
            nome: null,
            sinonimo: null,
            direcaoHaste: 'auto',
            clave: null,
            stafflines: null,
            middle: null,
            quebraDeLinha: 5,
            ...options
        };
        this.metrica = options.metrica || null;
        this.unidadeTempo = options.unidadeTempo || null;
        const obra = this.#options.obra;
        if (obra instanceof Obra) {
            this.obra = obra;
            obra.addVoz(this);
        }

        if (this.#options.id != null) {
            this.id = this.#options.id;
        }

        this.compassos = compassos;
    }

    /**
     * USAGE: Gera a string ABC da voz completa, incluindo o cabeçalho V: e todos os seus compassos.
     * Realiza a injeção de contexto rítmico (M: e L:) da obra em cada compasso.
     *
     * @returns {string} Ex: "V:1 name=\"Melodia\"\n| C D E | F G A |"
     */
    toAbc() {
        let abc = `V:${this.#id || 1}`;

        // Propriedades do cabeçalho da Voz
        if (this.#options.nome) abc += ` name="${this.#options.nome}"`;
        if (this.#options.sinonimo) abc += ` nm="${this.#options.sinonimo}"`;

        if (this.#options.clave instanceof Clave) {
            abc += ` ${this.#options.clave.toAbc()}`;
        }

        if (this.#options.direcaoHaste !== 'auto') {
            abc += ` stem=${this.#options.direcaoHaste}`;
        }

        if (this.#options.stafflines) abc += ` stafflines=${this.#options.stafflines}`;
        if (this.#options.middle) abc += ` middle=${this.#options.middle}`;

        abc += "\n";

        if ( this.metrica ) {
            abc += this.metrica.toCompasso();
        }

        let configQuebraLinha = this.#options.quebraDeLinha || 5;
        if ( configQuebraLinha <= 0 ) {
            configQuebraLinha = 5;
        }
        abc += "|";
        abc += this.#compassos.map((compasso, index) => {
            const textoABC = compasso.toAbc( );

            // Se for o último compasso do array, não adiciona nenhum separador no final
            if (index === this.#compassos.length - 1) {
                return textoABC;
            }

            // Se o compasso atual for o 4º, 8º, 12º... a cauda é um \n. Senão, é um espaço.
            const separador = ((index + 1) % configQuebraLinha === 0) ? '\n' : ' ';

            return textoABC + separador;

        }).join(''); // Junta tudo sem adicionar caracteres extras
        abc += "\n";

        const lyrics = this.#compassos
            .filter(compasso => compasso.letra && compasso.letra.length > 0)
            .map(compasso => compasso.letra.join(' '))
            .join(' - ');

        if (lyrics) {
            abc += `w: ${lyrics}\n`;
        }

        return abc;
    }

    /**
     * USAGE: Obtém a Obra à qual esta voz pertence.
     */
    get obra() { return this.#obra; }

    /**
     * USAGE: Associa esta voz a uma Obra. Valida a instância.
     */
    set obra(val) {
        if (val != null && !(val instanceof Obra)) {
            throw new TypeError("Voz: 'obra' deve ser uma instância de Obra.");
        }
        this.#obra = val;
    }

    /**
     * USAGE: Obtém o identificador único da voz.
     */
    get id() { return this.#id; }

    /**
     * USAGE: Define o identificador da voz (usado no V: do ABC).
     */
    set id(val) { this.#id = val; }

    /**
     * USAGE: Retorna a coleção de compassos da voz.
     */
    get compassos() { return this.#compassos; }

    /**
     * USAGE: Substitui a coleção de compassos, garantindo a integridade dos objetos.
     */
    set compassos(arrayCompassos) {
        if (!Array.isArray(arrayCompassos)) {
            throw new TypeError('Voz: Compassos devem ser fornecidos em um Array.');
        }
        this.#compassos = [];
        arrayCompassos.forEach(c => this.addCompasso(c));
    }
    get unidadeTempo() {
        return this.#unidadeTempo ||
            this.#options.obra?.unidadeTempo;
    }

    /**
     * USAGE: Adiciona um compasso à voz, definindo seu índice e vinculando a referência de voz.
     * @param {Compasso} compasso
     */
    addCompasso(compasso) {
        if (!(compasso instanceof Compasso)) {
            throw new TypeError('Voz: O objeto compasso adicionado deve ser uma instância de Compasso.');
        }
        compasso.index = this.#compassos.length + 1;
        compasso.options.voz = this;
        this.#compassos.push(compasso);
    }

    /**
     * USAGE: Obtém a configuração atual da haste das notas.
     */
    get direcaoHaste() { return this.#options.direcaoHaste; }

    /**
     * USAGE: Define a direção das hastes ('up', 'down', 'auto').
     */
    set direcaoHaste(val) {
        if (val == null) { this.#options.direcaoHaste = 'auto'; return; }
        if (val !== 'auto' && val !== 'up' && val !== 'down') {
            throw new TypeError("Voz: Direção da haste deve ser 'auto', 'up' ou 'down'.");
        }
        this.#options.direcaoHaste = val;
    }
    get metrica() {
        return this.#metrica;
    }
    set metrica(val) {
        if (val == null) { this.#metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Voz: TempoMetrica inválido.');
        this.#metrica = val;
    }
    /**
     * USAGE: Helper estático para criação rápida de Voz a partir de um JSON.
     * Ex: Voz.create( { "compassos": [ { "elementos": [ { "freq": "C" }, { "notas": [ { "freq": "E" } ] }, {} ], "options": { "tempo": "1", "duracao": "1/8" } }, { "elementos": [ { "freq": "C" }, { "notas": [ { "freq": "E" } ] }, {} ], "options": { "tempo": "1", "duracao": "1/8" } } ], "options": { "nome": "Metais", "sinonimo": "mtl", "direcaoHaste": "up", "clave": {}, "stafflines": 5, "middle": "B" } } );
     *
     * @param {Object} [json={}] - Objeto raiz contendo os dados brutos da voz.
     * @param {Array<Object>} [json.compassos=[]] - Matriz de objetos JSON literais que serão hidratados em instâncias de Compasso.
     * @param {Object} [json.options={}] - Objeto interno com as configurações e metadados da voz.
     * @param {Number|String|null} [json.options.id=null] - Identificador único no ABC.
     * @param {Obra|null} [json.options.obra=null] - Vinculação imediata com a Obra.
     * @param {String|null} [json.options.nome=null] - Nome completo da voz (ex: "Viola Ponteada").
     * @param {String|null} [json.options.sinonimo=null] - Abreviação (nm=) da voz.
     * @param {String} [json.options.direcaoHaste='auto'] - Direção das hastes ('up', 'down', 'auto').
     * @param {Object|null} [json.options.clave=null] - Objeto literal (JSON) que será hidratado em uma instância de Clave.
     * @param {Number|null} [json.options.stafflines=null] - Número de linhas da pauta (padrão 5).
     * @param {String|null} [json.options.middle=null] - Define a nota central da pauta.
     * @returns {Voz} Uma nova instância hidratada de Voz.
     */
    static create( json = {} ) {
        // 1. Extraímos com segurança, já definindo padrões caso venha vazio
        let {
            compassos = [],
            options = {}
        } = json;

        // 2. Hidratamos os compassos (se vier vazio, o map não faz nada e retorna [])
        const compassosInstanciados = compassos.map( c => Compasso.create(c) );
        let duracaoObj;
        if (options.unidadeTempo) {
            if (options.unidadeTempo instanceof TempoDuracao) {
                duracaoObj = tempo;
            } else {
                duracaoObj = new TempoDuracao.create(options.unidadeTempo);
            }
        }

        // 3. Hidratamos a Clave diretamente no objeto options extraído
        options.clave = options.clave ? Clave.create(options.clave) : null;

        // 4. Passamos os dados hidratados para o construtor
        return new Voz( compassosInstanciados, options );
    }
}
