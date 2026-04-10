import { TipoBarra } from "../compasso/TipoBarra.js";
import { Nota } from "../nota/Nota.js";
import { Pausa } from "../nota/Pausa.js";
import { Acorde } from "../nota/Acorde.js";
/*
import { Voz } from "../voz/Voz.js";
import { Obra } from "../obra/Obra.js";
*/
import { TempoMetrica } from "../tempo/TempoMetrica.js";
import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { Tonalidade } from "../compasso/Tonalidade.js";

/**
 * Representa um compasso musical, organizando notas, pausas e acordes dentro de uma métrica.
 */
export class Compasso {
    /** @type {number} */
    #index = 0;

    /** @type {Array<Nota|Pausa|Acorde>} */
    #elements = [];

    /** @type {Object} */
    #options;

    /** @type {Voz|null} */
    #voz = null;

    /** @type {Obra|null} */
    #obra = null;

    /** @type {TipoBarra|null} */
    #barraInicial = null;

    /** @type {TipoBarra|null} */
    #barraFinal = null;

    /** @type {TempoMetrica|null} */
    #metrica = null;

    /** @type {TempoDuracao} */
    #unidadeTempo;

    /**
     * Usage: Letra pertencente ao compasso
     * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
     * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
     * Estou apenas utilizando compasso como repositório de sua letra, para facilitar o toAbc() do Voz, em plotar este dado
     * @type {string|null}
     * */
    #letra = null;

    /**
     * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
     *
     * @param {Array<Nota|Pausa|Acorde>} elements - Matriz de elementos musicais.
     * @param {Object} [options={}] - Configurações detalhadas.
     */
    constructor(elements = [], options = {}) {
        this.#options = {
            anotacoes: options.anotacoes || [],
            cifras: options.cifras || [],
            mudancaDeTom: null,
            unidadeTempo: null,
            letra: null,
            ...options
        };

        // Inicialização via SETTERS para garantir validação
        this.elements = elements;
        this.index = options.index || 0;
        this.voz = options.voz || null;
        this.obra = options.obra || null;
        this.barraInicial = options.barraInicial || TipoBarra.NONE;
        this.barraFinal = options.barraFinal || TipoBarra.STANDARD;
        this.mudancaDeTom = options.mudancaDeTom || null;
        this.letra = options.letra || null;

        // Tenta pegar a unidadeTempo local, depois de voz ou obra
        if (this.#options.unidadeTempo) {
            this.unidadeTempo = this.#options.unidadeTempo;
        } else if (this.#options.voz?.unidadeTempo) {
            this.unidadeTempo = this.#options.voz.unidadeTempo;
        } else if (this.#options.obra?.unidadeTempo) {
            this.unidadeTempo = this.#options.obra.unidadeTempo;
        }
        // Tenta pegar a metrica local, depois de voz ou obra
        if (this.#options.metrica) {
            this.metrica = this.#options.metrica;
        } else if (this.#options.voz?.metrica) {
            this.metrica = this.#options.voz.metrica;
        } else if (this.#options.obra?.metrica) {
            this.metrica = this.#options.obra.metrica;
        }
    }

    /**
     * USAGE: Helper estático para criação rápida de Compasso a partir de um JSON.
     * Ex: Compasso.create({ elementos: [{ freq: "C" }, { notas: [{freq:"E"}] }, {}], options: { tempo: "1", duracao: "1/8" } })
     */
    static create(config = {}) {
        const elementosArray = config.elementos || config.elements || [];
        const options = config.options || {};
        
        // Aliases comuns do JSON raiz para o options
        if (config.letra !== undefined) options.letra = config.letra;
        if (config.index !== undefined) options.index = config.index;
        if (config.mudancaDeTom !== undefined) options.mudancaDeTom = config.mudancaDeTom;

        // Trata metrica a partir de string ("4/4")
        if (config.metrica) {
            if (config.metrica instanceof TempoMetrica) {
                options.metrica = config.metrica;
            } else if (typeof config.metrica === "string") {
                options.metrica = TempoMetrica.create(config.metrica);
            }
        }
        
        // Conversão de "duracao" ou "unidadeTempo" do config/options em TempoDuracao (L:)
        const refTempo = options.unidadeTempo || options.duracao || config.unidadeTempo || config.duracao;
        if (refTempo) {
            if (refTempo instanceof TempoDuracao) {
                options.unidadeTempo = refTempo;
            } else {
                const parts = refTempo.toString().split("/");
                const num = parseInt(parts[0]) || 1;
                const den = parseInt(parts[1]) || 1;
                options.unidadeTempo = new TempoDuracao(num, den);
            }
        }

        // Instancia os elementos musicais (Nota, Pausa, Acorde)
        const elementosInstanciados = elementosArray.map(el => {
            if (el instanceof Nota || el instanceof Pausa || el instanceof Acorde) {
                return el;
            }
            
            const elConfig = { ...el };

            // Herança de contexto do Compasso para os elementos 
            if (!elConfig.unidadeTempo && options.unidadeTempo) {
                elConfig.unidadeTempo = options.unidadeTempo;
            }

            // Repassa o "tempo" default das opções, se o elemento não definir o dele próprio
            if (!elConfig.tempo && options.tempo) {
                elConfig.tempo = options.tempo;
            }

            // Identificação implícita do tipo pelo formato das propriedades
            if (elConfig.notas && Array.isArray(elConfig.notas)) {
                return Acorde.create(elConfig);
            } else if (elConfig.freq) {
                return Nota.create(elConfig);
            } else {
                return Pausa.create(elConfig);
            }
        });

        return new Compasso(elementosInstanciados, options);
    }

    /**
     * USAGE: Orquestra a geração da string ABC completa do compasso.
     * Agrupa as notas visivelmente baseando-se no total de pulsos e na metade do compasso.
     * @returns {string}
     */
    toAbc() {
        let abc = "";

        if (this.#barraInicial && this.#barraInicial !== TipoBarra.NONE) {
            abc += this.#barraInicial.abc;
        }

        if (this.#metrica) {
            abc += this.metrica.toCompasso();
        }

        if (this.mudancaDeTom) {
            abc += `[K:${this.mudancaDeTom.valor}]`;
        }

        // Resolvendo unidade de tempo local com fallback para 1/8 exclusivo deste método
        const ut = this.unidadeTempo || this.voz?.unidadeTempo || this.obra?.unidadeTempo || new TempoDuracao(1, 8);
        const metricaRef = this.metrica || this.voz?.metrica || this.obra?.metrica;

        let pulsosTotais = 0;
        if (metricaRef) {
            // Ex: M: 4/4, L: 1/8 => (4/4) / 0.125 = 8 pulsos.
            pulsosTotais = (metricaRef.numerador / metricaRef.denominador) / ut.razao;
        } else {
            // Fallback: calcula pulsos baseados na soma das durações reais dos elementos
            const somaRazoes = this.#elements.reduce((acc, el) => acc + el.duracao.razao, 0);
            pulsosTotais = somaRazoes / ut.razao;
        }

        // Arredonda para cima para dar prioridade à primeira metade em casos ímpares
        const pontoDeCorte = Math.ceil(pulsosTotais / 2);
        
        let pulsosAcumulados = 0;
        let meioAlcancado = false;

        this.#elements.forEach((elemento, idx) => {
            const cifrasDaPosicao = this.#options.cifras.filter(c => c.posicao === idx);
            cifrasDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

            const anotacoesDaPosicao = this.#options.anotacoes.filter(a => a.posicao === idx);
            anotacoesDaPosicao.forEach(a => {
                const local = a.local || "_";
                abc += `"${local}${a.texto}"`;
            });

            abc += elemento.toAbc();

            const pulsosElemento = elemento.duracao.razao / ut.razao;
            pulsosAcumulados += pulsosElemento;

            // Insere o espaço para quebrar o agrupamento (beam) na metade do compasso
            // Usa uma pequena margem (0.001) para contornar imprecisões de ponto flutuante
            if (!meioAlcancado && pulsosAcumulados >= pontoDeCorte - 0.001) {
                if (idx < this.#elements.length - 1) {
                    abc += " ";
                }
                meioAlcancado = true;
            }
        });

        if (this.#barraFinal) {
            abc += this.#barraFinal.abc;
        }

        return abc;
    }

    /**
     * USAGE: Índice do compasso.
     */
    get index() { return this.#index; }
    set index(val) { this.#index = val; }

    /**
     * USAGE: Voz associada.
     */
    get voz() { return this.#voz; }
    set voz(val) {
        if (val == null) { this.#voz = null; return; }
        if (!(val instanceof Voz)) throw new TypeError('Compasso: O objeto deve ser uma instância de Voz.');
        this.#voz = val;
    }

    /**
     * USAGE: Elementos musicais (Nota, Pausa, Acorde).
     */
    get elements() { return this.#elements; }
    set elements(val) {
        if (!Array.isArray(val)) throw new TypeError('Compasso: Elementos devem ser Array.');
        if (val.some(n => !(n instanceof Nota) && !(n instanceof Pausa) && !(n instanceof Acorde))) {
            throw new TypeError("Compasso: Apenas instâncias de Nota, Pausa ou Acorde são permitidas.");
        }
        this.#elements = val;
    }

    /**
     * USAGE: Barra inicial.
     */
    get barraInicial() { return this.#barraInicial; }
    set barraInicial(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra inicial deve ser do tipo TipoBarra.');
        this.#barraInicial = val;
    }

    /**
     * USAGE: Barra final.
     */
    get barraFinal() { return this.#barraFinal; }
    set barraFinal(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra final deve ser do tipo TipoBarra.');
        this.#barraFinal = val;
    }

    /**
     * USAGE: Mudança de métrica local.
     */
    get metrica() { return this.#metrica; }
    set metrica(val) {
        if (val == null) { this.#metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Compasso: Deve ser instância de TempoMetrica.');
        this.#metrica = val;
    }

    /**
     * USAGE: Tonalidade local.
     */
    get mudancaDeTom() { return this.#options.mudancaDeTom; }
    set mudancaDeTom(val) {
        if (val == null) { this.#options.mudancaDeTom = null; return; }
        const existe = Object.values(Tonalidade).includes(val);
        if (!existe) throw new TypeError("Compasso: A tonalidade deve ser um membro válido do Enum Tonalidade.");
        this.#options.mudancaDeTom = val;
    }

    /**
     * USAGE: Referência à Obra.
     */
    get obra() { return this.#obra; }
    set obra(val) {
        if (val == null) { this.#obra = null; return; }
        if (!(val instanceof Obra)) throw new TypeError('Compasso: Obra deve ser uma instância de Obra.');
        this.#obra = val;
    }

    get unidadeTempo() { return this.#unidadeTempo; }

    set unidadeTempo( tempo ) {
        if (!(tempo instanceof TempoDuracao)) {
            throw new TypeError("O 'unidadeTempo' do compasso deve ser do tipo TempoDuracao.");
        }
        this.#unidadeTempo = tempo;
    }

    /**
     * USAGE: Adiciona cifra.
     */
    addCifra(texto, posicao) {
        this.#options.cifras.push({ texto, posicao });
    }

    /**
     * USAGE: Adiciona anotação.
     */
    addAnotacao(texto, posicao, local = "_") {
        this.#options.anotacoes.push({ texto, posicao, local });
    }

    /**
     * Usage: Letra pertencente ao compasso
     * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
     * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
     * @return {string|null}
     * */
    get letra() { return this.#letra; }
    /**
     * Usage: Letra pertencente ao compasso
     * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
     * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
     *
     * @param {string|null} letra
     * @return {void}
     * */
    set letra( letra ) {
        this.#letra = letra;
    }
}
