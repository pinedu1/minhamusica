import { TipoBarra } from "./TipoBarra.js";
import { Nota } from "../nota/Nota.js";
import { Pausa } from "../nota/Pausa.js";
import { Unissono } from "../nota/Unissono.js";
import { Voz } from "../voz/Voz.js";
import { Obra } from "../obra/Obra.js";
import { TempoMetrica } from "../tempo/TempoMetrica.js";
import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { Tonalidade } from "./Tonalidade.js";
import { compassoSchema } from "../../schemas/compassoSchema.js";


/**
 * Representa um compasso musical, organizando notas, pausas e unissonos dentro de uma métrica.
 */
export class Compasso {
    /** @type {number} */
    #index = 0;

    /** @type {Array<Nota|Pausa|Unissono>} */
    #elements = [];

    /** @type {Object} */
    #options;

    /**
     * Usage: Letra pertencente ao compasso
     * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
     * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
     * Estou apenas utilizando compasso como repositório de sua letra, para facilitar o toAbc() do Voz, em plotar este dado
     * @type {Array<string>}
     * */
    #letra = [];

    /**
     * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
     *
     * @param {Array<Nota|Pausa|Unissono>} elements - Matriz de elementos musicais.
     * @param {Object} [options={}] - Configurações detalhadas.
     */
    constructor(elements = [], options = {}) {
        this.#options = {
            voz: options.voz || null
            , obra: options.obra || null
            , anotacoes: options.anotacoes || []
            , cifras: options.cifras || []
            , unidadeTempo: null
            , barraInicial: options.barraInicial || TipoBarra.NONE
            , barraFinal: options.barraFinal || TipoBarra.STANDARD
            , mudancaDeTom: options.mudancaDeTom || null
            , letra: options.letra || []
            , ...options
        };
        this.elements = elements;
        this.index = options.index || 0;
    }

    getUnidadeTempo() {
        if (this.unidadeTempo) {
            return this.unidadeTempo;
        }
        if (this.voz) {
            return this.voz.getUnidadeTempo();
        }
        if ( this.obra ) {
            return this.obra.unidadeTempo;
        }
        return null;
    }
    getMetrica() {
        if (this.#options.metrica) {
            return this.#options.metrica;
        }
        if (this.#options.voz) {
            const voz = this.#options.voz;
            if (voz instanceof Voz) {
                return voz.getMetrica();
            } else if (voz.options.metrica) {
                return voz.options.metrica;
            }
        }
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Voz) {
                return obra.getMetrica();
            } else if (obra.options.metrica) {
                return obra.options.metrica;
            }
        }
        return null;
    }
    /**
     * Calcula a unidade de tempo baseado no compasso e suas propriedades.
     * @param unidadeTempo @type{TempoDuracao}
     * @returns {Number}
     */
    getPulsos(unidadeTempo) {
        const metricaRef = this.getMetrica();
        let pulsosTotais = 0;
        if (metricaRef) {
            // Ex: M: 4/4, L: 1/8 => (4/4) / 0.125 = 8 pulsos.
            pulsosTotais = metricaRef.razao / unidadeTempo.razao;
        } else {
            // Fallback: calcula pulsos baseados na soma das durações reais dos elementos
            const somaRazoes = this.#elements.reduce((acc, el) => acc + el.duracao.razao, 0);
            pulsosTotais = somaRazoes / unidadeTempo.razao;
        }
        return pulsosTotais;
    }

    /**
     * USAGE: Orquestra a geração da string ABC completa do compasso.
     * Agrupa as notas visivelmente baseando-se no total de pulsos e na metade do compasso.
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        // Resolvendo unidade de tempo local com fallback para 1/8 exclusivo deste método
        const ut = this.getUnidadeTempo();
        let pulsosTotais = this.getPulsos(ut);

        if (this.#options.barraInicial && (this.#options.barraInicial !== TipoBarra.NONE)) {
            abc += this.#options.barraInicial.abc;
        }

        if (this.#options.metrica) {
            abc += this.#options.metrica.toCompasso();
        }

        if (this.mudancaDeTom) {
            abc += `[K:${this.#options.mudancaDeTom.valor}]`;
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
        // --- NOVO BLOCO: COMPLEMENTO DE PAUSA (CORRIGIDO) ---
        const pulsosFaltantes = pulsosTotais - pulsosAcumulados;

        if (pulsosFaltantes > 0.001 && pulsosAcumulados > 0) {
            const razaoPausa = pulsosFaltantes * ut.razao;

            // Busca o denominador musical perfeito (1, 2, 4, 8, 16, 32, 64)
            let num = 0, den = 1;
            for (let d of [1, 2, 4, 8, 16, 32, 64]) {
                // Se a multiplicação der um número inteiro (ex: 0.75 * 4 = 3.000)
                if (Math.abs((razaoPausa * d) - Math.round(razaoPausa * d)) < 0.001) {
                    num = Math.round(razaoPausa * d);
                    den = d;
                    break;
                }
            }

            // Agora ele cria TempoDuracao(3, 4) em vez de (1, 1)!
            const duracaoFaltante = new TempoDuracao(num, den);

            const pausaPreenchimento = new Pausa(duracaoFaltante, {
                unidadeTempo: ut,
            });

            abc += " " + pausaPreenchimento.toAbc();
        }
        // --- FIM DO BLOCO NOVO ---
        if (this.#options.barraFinal && (this.#options.barraFinal !== TipoBarra.NONE)) {
            abc += this.#options.barraFinal.abc;
        }

        return abc;
    }

    /**
     * Converte a instância do Compasso para um objeto JSON que pode ser usado para recriá-la.
     * @returns {Object}
     */
    toJSON() {
        const json = {
            elementos: this.#elements.map(el => el.toJSON())
        };

        const options = {};

        // Serializa apenas as opções que não são nulas, vazias ou padrão
        if (this.#options.unidadeTempo) {
            options.unidadeTempo = this.#options.unidadeTempo.toString();
        }
        if (this.#options.metrica) {
            options.metrica = this.#options.metrica.toString();
        }
        if (this.#options.mudancaDeTom) {
            options.mudancaDeTom = this.#options.mudancaDeTom.valor;
        }
        if (this.#options.anotacoes && this.#options.anotacoes.length > 0) {
            options.anotacoes = this.#options.anotacoes;
        }
        if (this.#options.cifras && this.#options.cifras.length > 0) {
            options.cifras = this.#options.cifras;
        }
        if (this.#options.letra && this.#options.letra.length > 0) {
            options.letra = this.#options.letra;
        }
        // barraInicial e barraFinal são omitidos intencionalmente, pois o método `create`
        // não possui a lógica para desserializá-los de uma string para uma instância de `TipoBarra`.
        // Adicionar isso ao JSON quebraria a reconstrução.

        if (Object.keys(options).length > 0) {
            json.options = options;
        }

        return json;
    }

    /**
     * USAGE: Índice do compasso.
     */
    get index() { return this.#index; }
    set index(val) { this.#index = val; }

    /**
     * USAGE: Voz associada.
     */
    get voz() { return this.#options.voz; }
    set voz(val) {
        if (val == null) { this.#options.voz = null; return; }
        if (!(val instanceof Voz)) throw new TypeError('Compasso: O objeto deve ser uma instância de Voz.');
        this.#options.voz = val;
    }

    /**
     * USAGE: Elementos musicais (Nota, Pausa, Unissono).
     */
    get elements() { return this.#elements; }
    set elements(val) {
        if (!Array.isArray(val)) {
            throw new TypeError('Compasso: Elementos devem ser um Array.');
        }

        this.#elements = val.map(el => {
            // 1. Prepara o objeto options caso ele não exista (importante para JSONs crus)
            el.options = el.options || {};

            // 2. Injeta o compasso como pai.
            // Isso dispensa a necessidade de copiar a unidadeTempo manualmente,
            // pois a Nota/Pausa/Unissono agora sabe subir a árvore para procurar!
            el.options.compasso = this;

            // 3. A SUA LÓGICA DE ROTEAMENTO:
            // Verifica se já é uma instância de Nota ou se o JSON tem a propriedade 'altura'
            if (el.constructor.name === 'Nota' || el.altura !== undefined) {
                const notaOpc = Object.fromEntries(
                    Object.entries(
                        (({ obra, voz, compasso, unidadeTempo, acento, marcato, staccato, staccatissimo, tenuto, hammerOn, pullOff, ligada, mordente, upperMordent, trinado, roll, fermata, ghostNote, graceNote, arpeggio, dedilhado, sustenido, beQuad }) => ({
                            obra, voz, compasso, unidadeTempo, acento, marcato, staccato, staccatissimo, tenuto, hammerOn, pullOff, ligada, mordente, upperMordent, trinado, roll, fermata, ghostNote, graceNote, arpeggio, dedilhado, sustenido, beQuad
                        }))(el.options || {})
                    ).filter(([chave, valor]) => valor != null) // Filtra fora null e undefined
                );

                el.options = notaOpc;
                return Nota.create(el);
            }

            // Verifica se já é uma instância de Unissono ou se o JSON tem um array 'notas'
            if (el.constructor.name === 'Unissono' || el.notas !== undefined) {
                const unissonoOpc = Object.fromEntries(
                    Object.entries(
                        (({ obra, compasso, unidadeTempo, acento, marcato, staccato, staccatissimo, tenuto, ligada, arpeggio, fermata, ghostNote, roll, trinado, mordente, upperMordent, graceNote, dedilhado }) => ({
                            obra, compasso, unidadeTempo, acento, marcato, staccato, staccatissimo, tenuto, ligada, arpeggio, fermata, ghostNote, roll, trinado, mordente, upperMordent, graceNote, dedilhado }))(el.options || {})
                    ).filter(([chave, valor]) => valor != null) // Filtra fora null e undefined
                );

                el.options = unissonoOpc;
                return Unissono.create(el);
            }

            const pausaOpc = Object.fromEntries(
                Object.entries(
                    (({ obra, voz, compasso, unidadeTempo, fermata, breath, invisivel }) => ({ obra, voz, compasso, unidadeTempo, fermata, breath, invisivel }))(el.options || {})
                ).filter(([chave, valor]) => valor != null) // Filtra fora null e undefined
            );
            el.options = pausaOpc;
            return Pausa.create(el);
        });
    }
    /**
     * USAGE: Barra inicial.
     */
    get barraInicial() { return this.#options.barraInicial; }
    set barraInicial(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra inicial deve ser do tipo TipoBarra.');
        this.#options.barraInicial = val;
    }

    /**
     * USAGE: Barra final.
     */
    get barraFinal() { return this.#options.barraFinal; }
    set barraFinal(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra final deve ser do tipo TipoBarra.');
        this.#options.barraFinal = val;
    }

    /**
     * USAGE: Mudança de métrica local.
     */
    get metrica() { return this.#options.metrica; }
    set metrica(val) {
        if (val == null) { this.#options.metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Compasso: Deve ser instância de TempoMetrica.');
        this.#options.metrica = val;
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
    get obra() { return this.#options.obra; }
    set obra(val) {
        if (val == null) { this.#options.obra = null; return; }
        if (!(val instanceof Obra)) throw new TypeError('Compasso: Obra deve ser uma instância de Obra.');
        this.#options.obra = val;
    }
    get unidadeTempo() { return this.#options.unidadeTempo; }

    set unidadeTempo(tempo) {
        if (!(tempo instanceof TempoDuracao)) {
            throw new TypeError("O 'unidadeTempo' do compasso deve ser do tipo TempoDuracao.");
        }
        this.#options.unidadeTempo = tempo;
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
     * @return {Array<string>}
     * */
    get letra() { return this.#options.letra; }

    /**
     * Usage: Letra pertencente ao compasso
     * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
     * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
     *
     * @param {Array<string>} letra
     * @return {void}
     * */
    set letra(letra) {
        if (!Array.isArray(letra)) {
            throw new TypeError("Compasso: A propriedade 'letra' deve ser um Array de strings.");
        }
        this.#options.letra = letra;
    }

    get options() { return this.#options; }
    /**
     * USAGE: Helper estático para criação rápida de Compasso a partir de um JSON.
     * Ex: Compasso.create({ elementos: [{ altura: "C" }, { notas: [{altura:"E"}] }, {}], options: { unidadeTempo: "1", duracao: "1/8" } })
     */
    static create(json = {}) {
        if (json instanceof Compasso) return json;

        const resultado = compassoSchema.safeParse(json);

        if (!resultado.success) {
            throw new TypeError("Compasso.create: Erro na estrutura dos dados: " +
                JSON.stringify(resultado.error.format(), null, 2));
        }

        const { elementos, options } = resultado.data;

        // 1. Processamento de Options (Tempo e Métrica) PRIMEIRO
        const optionsProcessado = { ...options };

        if (options.barraInicial) {
            optionsProcessado.barraInicial = TipoBarra.getByAbc(options.barraInicial);
        }
        if (options.barraFinal) {
            optionsProcessado.barraFinal = TipoBarra.getByAbc(options.barraFinal);
        }
        if (options.mudancaDeTom) {
            optionsProcessado.mudancaDeTom = Tonalidade.create(options.mudancaDeTom);
        }
        if (options.unidadeTempo) {
            optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
        }
        if (options.metrica) {
            optionsProcessado.metrica = TempoMetrica.create(options.metrica);
        }

        // 2. CRIAÇÃO DA INSTÂNCIA PRIMEIRO (Ainda sem elementos para não engatilhar validação)
        const compasso = new Compasso([], optionsProcessado);

        // 3. Roteamento e Instanciação dos Elementos (Nota, Pausa ou Unissono)
        const instanciasElementos = elementos.map(el => {

            // Garante que o objeto options exista no JSON cru
            el.options = el.options || {};

            // A MÁGICA: Injeta o compasso no JSON ANTES de chamar o .create()
            el.options.compasso = compasso;

            // Agora, quando o Nota.create validar a unidadeTempo, ele achará o compasso pai!
            if (el.constructor.name === 'Nota' || el.altura) return Nota.create(el);
            if (el.constructor.name === 'Unissono' || el.notas) return Unissono.create(el);
            return Pausa.create(el);
        });

        // 4. Atribuir os elementos já hidratados
        // O seu setter 'elements' vai assumir daqui e fazer as verificações finais
        compasso.elements = instanciasElementos;

        return compasso;
    }

    /**
     * USAGE: Cria uma nova instância de Compasso a partir de uma string de notação ABC.
     * @param {string} compassoString - A string contendo os elementos do compasso.
     * @param {Object} contextOptions - Opções de contexto (L, M, K) herdadas da Voz/Obra.
     * @returns {Compasso} Uma nova instância da classe Compasso.
     */
    static parseAbc(compassoString, contextOptions) {
        // Regex para capturar notas, unissonos, pausas e cifras
        const elementRegex = /"([^"]+)"|(\[([^\]]+)\])|([zxyZXY])|([=^_]?[a-gA-G][,']*)([0-9]*\/*[0-9]*-?)/g;
        const elements = [];
        let match;

        // Remove espaços extras para simplificar a regex
        const cleanString = compassoString.replace(/\s+/g, ' ');

        // Itera sobre todos os elementos musicais na string do compasso
        while ((match = elementRegex.exec(cleanString)) !== null) {
            const token = match[0];

            if (token.startsWith('"')) {
                // TODO: Implementar parsing de cifras e anotações
                continue;
            }

            if (token.startsWith('[')) {
                // É um unissono
                elements.push(Unissono.parseAbc(token, contextOptions));
            } else if (/[zxyZXY]/.test(token[0])) {
                // É uma pausa
                elements.push(Pausa.parseAbc(token, contextOptions));
            } else {
                // É uma nota
                elements.push(Nota.parseAbc(token, contextOptions));
            }
        }

        return new Compasso(elements, contextOptions);
    }
}
