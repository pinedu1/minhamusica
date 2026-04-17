import { pausaSchema } from '../../schemas/pausaSchema.js';
import { TempoDuracao } from '../tempo/TempoDuracao.js';
import { ElementoMusical } from "./ElementoMusical.js";

/**
 * Representa um silêncio (pausa) na pauta musical.
 */
export class Pausa extends ElementoMusical {
    /**
     * @param {TempoDuracao} duracao - Duração da pausa.
     * @param {Object} [options={}] - Contexto e atributos.
     */
    constructor(duracao, options = {}) {
        super(duracao, options);

        this.duracao = duracao;

        // 2. Mesclamos os padrões com o que veio do options diretamente no "this"
        this._options = Object.assign({
            obra: null,
            voz: null, // <- Adicionei a voz que faltava!
            compasso: null,
            unidadeTempo: null,
            fermata: false,
            breath: null,
            invisivel: false,
            ...options // Sobrescreve os nulls/false se o usuário mandar algo
        });
    }

    /**
     * USAGE: Gera a string ABC da pausa (ex: "z2", "z/").
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        
        if (this._options.fermata) abc += "!fermata!";
        if (this._options.breath) abc += "!breath!";
        
        // Caractere de pausa no ABC (z = visível, x = invisível)
        abc += this._options.invisivel ? "x" : "z";

        // Sufixo de duração
        abc += this._formatarDuracaoAbc();

        return abc;
    }

    toJSON() {
        const json = {
            duracao: this.duracao.toString(),
        };

        const defaultOptions = {
            fermata: false,
            breath: null,
            invisivel: false,
        };

        const optionsToExport = {};

        for (const key in this._options) {
            if (Object.hasOwnProperty.call(defaultOptions, key)) {
                const value = this._options[key];
                const defaultValue = defaultOptions[key];

                if (value !== defaultValue) {
                    optionsToExport[key] = value;
                }
            }
        }

        if (Object.keys(optionsToExport).length > 0) {
            json.options = optionsToExport;
        }

        return json;
    }

    get fermata() { return this._options.fermata === true; }
    get breath() { return this._options.fermata === true; }
    get invisivel() { return this._options.invisivel === true; }

    /**
     * USAGE: Helper para criação rápida de Pausa a partir de um JSON.
     * Ex: Pausa.create({ duracao: "1/4", fermata: true })
     */
    static create(dados) {
        if (dados instanceof Pausa) return dados;

        const resultado = pausaSchema.safeParse(dados);

        if (!resultado.success) {
            throw new TypeError("Pausa.contructor: A unidadeTempo Global deve ser definida em Compasso ou Voz ou Obra em options.");
        }
        if ( !resultado.data.options.unidadeTempo && !resultado.data.options.compasso && !resultado.data.options.voz && !resultado.data.options.obra ) {
            throw new TypeError("Pausa.contructor: A unidadeTempo Global deve ser definida em Compasso ou Voz ou Obra em options.");
        }

        const validado = resultado.data;

        // Instancia as durações
        const instanciaDuracao = TempoDuracao.create(validado.duracao);
        const instanciaUnidadeTempo = validado.options.unidadeTempo
            ? TempoDuracao.create(validado.options.unidadeTempo)
            : null;

        // 2. Chamada atualizada! Passamos 'instanciaDuracao' como primeiro argumento,
        // e montamos o 'options' como segundo argumento.
        return new Pausa(instanciaDuracao, {
            fermata: validado.options.fermata,
            breath: validado.options.breath,
            invisivel: validado.options.invisivel,
            unidadeTempo: instanciaUnidadeTempo,
            obra: validado.options.obra,
            voz: validado.options.voz,
            compasso: validado.options.compasso
        });
    }

    /**
     * USAGE: Cria uma nova instância de Pausa a partir de uma string de notação ABC.
     * @param {string} pausaString - A string da pausa (ex: "z2", "X/").
     * @param {Object} contextOptions - Opções de contexto (L, M, K).
     * @returns {Pausa} Uma nova instância da classe Pausa.
     */
    static parseAbc(pausaString, contextOptions) {
        const pausaRegex = /([zxyZXY])([0-9]*\/*[0-9]*)?/;
        const match = pausaString.match(pausaRegex);

        if (!match) {
            throw new Error(`Pausa.parseAbc: String de pausa inválida: "${pausaString}"`);
        }

        const [, tipo, duracaoStr] = match;

        const pausaOptions = { ...contextOptions };
        pausaOptions.invisivel = ['x', 'X'].includes(tipo);

        let duracao;
        const unidadeTempo = (function() {
            if (contextOptions.voz) {
                const voz = contextOptions.voz;
                if ( voz.getUnidadeTempo() && voz.getUnidadeTempo() instanceof TempoDuracao ) {
                    return voz.getUnidadeTempo();
                }
            }
            if (contextOptions.obra) {
                const obra = contextOptions.obra;
                if ( obra.getUnidadeTempo() && obra.getUnidadeTempo() instanceof TempoDuracao ) {
                    return obra.getUnidadeTempo();
                }
            }
            return new TempoDuracao(1, 8);
        })();

        if (['Z', 'X'].includes(tipo)) {
            // Pausa de compasso inteiro
            const metrica = contextOptions.metrica;
            if (!metrica) {
                throw new Error("Pausa.parseAbc: Métrica (M:) não definida para pausa de compasso inteiro (Z ou X).");
            }
            duracao = new TempoDuracao(metrica.numerador, metrica.denominador);
        } else if (duracaoStr) {
            if (duracaoStr.includes('/')) {
                if (duracaoStr.startsWith('/')) { // ex: /2
                    duracao = new TempoDuracao(unidadeTempo.numerador, unidadeTempo.denominador * 2);
                } else { // ex: 3/2
                    const [numerador, denominador] = duracaoStr.split('/').map(Number);
                    duracao = new TempoDuracao(unidadeTempo.numerador * numerador, unidadeTempo.denominador * denominador);
                }
            } else { // ex: 2
                duracao = new TempoDuracao(unidadeTempo.numerador * Number(duracaoStr), unidadeTempo.denominador);
            }
        } else {
            duracao = unidadeTempo;
        }

        return new Pausa(duracao, pausaOptions);
    }
}
