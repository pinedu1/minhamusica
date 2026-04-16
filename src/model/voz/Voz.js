import { Compasso } from "../compasso/Compasso.js";
import { Obra } from "../obra/Obra.js";
import { Clave } from "../obra/Clave.js";
import { TempoMetrica } from "../tempo/TempoMetrica.js";
import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { vozSchema } from "../../schemas/vozSchema.js";
import { TipoBarra } from "../compasso/TipoBarra.js";

/**
 * Representa uma camada musical independente (Voz) na obra.
 * Responsável por agrupar compassos e definir propriedades de exibição e playback.
 */
export class Voz {
    #id;
    #options = {};
    #compassos = [];

    constructor(id, compassos = [], options = {}) {
        this.compassos = compassos;
        this.id = id;
        this.#options = {
            obra: null,
            unidadeTempo: null,
            nome: null,
            sinonimo: null,
            direcaoHaste: 'auto',
            clave: null,
            stafflines: null,
            middle: null,
            quebraDeLinha: 4,
            metrica: null,
            ...options
        };
    }

    toAbc() {
        let abc = `V:${this.#id || 1}`;
        if (this.#options.nome) abc += ` name="${this.#options.nome}"`;
        if (this.#options.sinonimo) abc += ` nm="${this.#options.sinonimo}"`;
        if (this.#options.clave instanceof Clave) {
            const clave = this.#options.clave;
            if (clave) abc += ` ${clave.toVoz()}`;
        }
        if (this.#options.direcaoHaste !== 'auto') abc += ` stem=${this.#options.direcaoHaste}`;
        if (this.#options.stafflines) abc += ` stafflines=${this.#options.stafflines}`;
        if (this.#options.middle) abc += ` middle=${this.#options.middle}`;
        abc += "\n";
        abc += `V:${this.#id || 1}\n`;
        if (this.#options.metrica) abc += this.#options.metrica.toCompasso();

        let configQuebraLinha = this.getQuebraDeLinha() || 5;
        if (configQuebraLinha <= 0) configQuebraLinha = 5;

        let compassoCount = 0;
        const qtdeCompassos = this.#compassos.length;
        if (this.#compassos.length > 0) {
            let c = this.#compassos[0];
            if (c.options && !c.options.barraInicial) {
                c.options.barraInicial = TipoBarra.STANDARD;
            }
        }
        const compassosString = this.#compassos.map((compasso, index) => {
            let compassoStr = '';
            compassoStr += compasso.toAbc();

            compassoCount++;
            if ( (index < (qtdeCompassos - 1)) && (compassoCount % configQuebraLinha === 0)) {
                compassoStr += '\n|';
            }
            return compassoStr;
        }).join('').trim();

        abc += compassosString;

        if (!abc.endsWith('|') && !abc.endsWith(':') && !abc.endsWith(']') && !abc.endsWith('\n')) {
            abc += '|';
        }
        abc += "\n";

        const lyrics = this.#compassos
            .filter(compasso => compasso.letra && compasso.letra.length > 0)
            .map(compasso => compasso.letra.join('-'))
            .join(' - ');
        if (lyrics) abc += `w: ${lyrics}\n`;

        return abc;
    }

    toJSON() {
        const json = {
            id: this.#id,
            compassos: this.#compassos.map(c => c.toJSON())
        };
        const options = {};
        const opt = this.#options;
        if (opt.nome) options.nome = opt.nome;
        if (opt.sinonimo) options.sinonimo = opt.sinonimo;
        if (opt.direcaoHaste && opt.direcaoHaste !== 'auto') options.direcaoHaste = opt.direcaoHaste;
        if (opt.clave) options.clave = opt.clave.toJSON();
        if (opt.stafflines) options.stafflines = opt.stafflines;
        if (opt.middle) options.middle = opt.middle;
        if (opt.quebraDeLinha && opt.quebraDeLinha !== 5) options.quebraDeLinha = opt.quebraDeLinha;
        if (opt.metrica) options.metrica = opt.metrica.toString();
        if (opt.unidadeTempo) options.unidadeTempo = opt.unidadeTempo.toString();
        if (Object.keys(options).length > 0) json.options = options;
        return json;
    }

    get obra() { return this.#options.obra; }
    set obra(val) {
        if (val != null && !(val instanceof Obra)) throw new TypeError("Voz: 'obra' deve ser uma instância de Obra.");
        this.#options.obra = val;
    }

    get id() { return this.#id; }
    set id(val) { this.#id = val; }

    get compassos() { return this.#compassos; }
    set compassos(arrayCompassos) {
        if (!Array.isArray(arrayCompassos)) throw new TypeError('Voz: Compassos devem ser fornecidos em um Array.');
        this.#compassos = [];
        arrayCompassos.forEach(c => this.addCompasso(c));
    }

    addCompasso(compasso) {
        if (!(compasso instanceof Compasso)) throw new TypeError('Voz: O objeto compasso adicionado deve ser uma instância de Compasso.');
        compasso.index = this.#compassos.length + 1;
        compasso.options.voz = this;
        this.#compassos.push(compasso);
    }

    getUnidadeTempo() {
        if (this.#options.unidadeTempo) return this.#options.unidadeTempo;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.getUnidadeTempo();
            if (obra.options.unidadeTempo) return obra.options.unidadeTempo;
        }
        return null;
    }

    get unidadeTempo() { return this.#options.unidadeTempo; }
    set unidadeTempo(val) { this.#options.unidadeTempo = val; }
    getQuebraDeLinha() {
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.options.quebraDeLinha;
            if (obra.options.quebraDeLinha) return obra.options.quebraDeLinha;
        }
        return this.#options.quebraDeLinha;
    }
    getClave() {
        if (this.#options.clave) return this.#options.clave;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.clave;
            if (obra.options.clave) return obra.options.clave;
        }
        return null;
    }

    get direcaoHaste() { return this.#options.direcaoHaste; }
    set direcaoHaste(val) {
        if (val == null) { this.#options.direcaoHaste = 'auto'; return; }
        if (!['auto', 'up', 'down'].includes(val)) throw new TypeError("Voz: Direção da haste deve ser 'auto', 'up' ou 'down'.");
        this.#options.direcaoHaste = val;
    }

    getMetrica() {
        if (this.#options.metrica) return this.#options.metrica;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.getMetrica();
            if (obra.options.metrica) return obra.options.metrica;
        }
        return null;
    }

    get metrica() { return this.#options.metrica; }
    set metrica(val) {
        if (val == null) { this.#options.metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Voz: TempoMetrica inválido.');
        this.#options.metrica = val;
    }

    get options() { return this.#options; }

    static create(json = {}) {
        if (json instanceof Voz) return json;
        if (json?.id === undefined || json?.id === null) {
            throw new TypeError("Voz.create: Erro na estrutura dos dados: O ID da voz é obrigatório.");
        }
        const resultado = vozSchema.safeParse(json);
        if (!resultado.success) {
            throw new TypeError("Voz.create: Erro na estrutura dos dados: " + JSON.stringify(resultado.error.format(), null, 2));
        }
        const { id, compassos, options } = resultado.data;
        const optionsProcessado = { ...options };
        if (options.unidadeTempo) optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
        if (options.metrica) optionsProcessado.metrica = TempoMetrica.create(options.metrica);
        if (options.clave) optionsProcessado.clave = Clave.create(options.clave);
        const voz = new Voz(id, [], optionsProcessado);
        const instanciasCompassos = compassos.map(c => {
            if (c.constructor.name === 'Compasso') {
                c.options = c.options || {};
                c.options.voz = voz;
                return c;
            }
            c.options = c.options || {};
            c.options.voz = voz;
            return Compasso.create(c);
        });
        voz.compassos = instanciasCompassos;
        return voz;
    }

    static #collectVoiceHeaders(declaration, contextOptions) {
        const voiceOptions = { ...contextOptions };
        const declarationParts = declaration.split(/\s+/);
        const voiceId = declarationParts[0].substring(2);

        const nameMatch = declaration.match(/name="([^"]+)"/);
        if (nameMatch) voiceOptions.nome = nameMatch[1];

        const synonymMatch = declaration.match(/nm="([^"]+)"/);
        if (synonymMatch) voiceOptions.sinonimo = synonymMatch[1];

        const clefMatch = declaration.match(/clef=([^\s]+)/);
        if (clefMatch) voiceOptions.clave = Clave.create(clefMatch[1]);

        return { voiceId, voiceOptions };
    }

    static #collectCompassos(musicString) {
        const tokens = [':|:', '|:', ':|', '||', '|]', '|'];
        const tokensSetInicio = new Set(['|:']);
        const tokensSetFim = new Set([':|', '|]']);
        const tokenizer = new RegExp(`(${tokens.map(t => t.replace(/\|/g, '\\|')).join('|')})`);
        
        let parts = musicString.split(tokenizer).filter(p => p);
        const compassos = [];
        let i = 0;

        while (parts.length > 0) {
            let content = '';
            let options = {};
            let barraInicio = null;
            let barraFim = null;
            if (tokenizer.test( parts[0]) ) {
                const part = parts[0];
                barraInicio = getBarType( part );
                content = parts[1];
                parts = parts.slice(2);
            } else {
                content = parts[0];
                parts = parts.slice(1);
            }
            if (tokenizer.test( parts[0]) ) {
                barraFim = getBarType( parts[0] );
                parts = parts.slice(1);
            }
            if (content && content.length > 0) {
                if ( barraInicio === TipoBarra.REPEAT_OPEN ) {
                    options.barraInicial = barraInicio;
                }
                if ( barraFim ) {
                    options.barraFinal = barraFim;
                }
                options.content = content;
                compassos.push( options );
            }
            if ( parts.length <= 0 ) {
                break;
            }
        }
        const lastCompasso = compassos[compassos.length - 1];
        if ( lastCompasso ) {
            const opt = lastCompasso;
            if ( !opt.barraFinal || (opt.barraFinal === TipoBarra.NONE) || (opt.barraFinal === TipoBarra.STANDARD)) {
                lastCompasso.barraFinal = TipoBarra.FINAL;
            }
        }

        function getBarType(barString) {
            for (const key in TipoBarra) {
                if (TipoBarra[key].abc === barString) return TipoBarra[key];
            }
            return TipoBarra.NONE;
        }

        return compassos.filter(c => c.content.length > 0);
    }

    static parseAbc(group, contextOptions) {
        const { declaration, lines } = group;
        const { voiceId, voiceOptions } = this.#collectVoiceHeaders(declaration, contextOptions);

        let musicString = lines.map(line => {
            const commentIndex = line.indexOf('%');
            return commentIndex !== -1 ? line.substring(0, commentIndex).trim() : line.trim();
        }).join(' ').trim();
        musicString = musicString.replaceAll('| |', '|').replaceAll('||', '|');
        const compassoTokens = this.#collectCompassos(musicString);

        const compassos = compassoTokens.map(token => {
            const compassoOptions = {
                ...voiceOptions,
                barraInicial: token.barraInicial,
                barraFinal: token.barraFinal
            };
            return Compasso.parseAbc(token.content, compassoOptions);
        });

        return new Voz(voiceId, compassos, voiceOptions);
    }
}
