import { pausaSchema } from '../../schemas/pausaSchema.js';
import { TempoDuracao } from '../tempo/TempoDuracao.js';
import { Obra } from '../obra/Obra.js';
import { Voz } from '../voz/Voz.js';
import { Compasso } from '../compasso/Compasso.js';

/**
 * Representa um silêncio (pausa) na pauta musical.
 */
export class Pausa {
    /** @type {TempoDuracao} */
    #duracao;
    /** @type {Object} */
    #options;

    /**
     * @param {TempoDuracao} duracao - Duração da pausa.
     * @param {Object} [options={}] - Contexto e atributos.
     */
    constructor(duracao, options = {}) {
        // 1. O que é obrigatório
        this.duracao = duracao;

        // 2. Mesclamos os padrões com o que veio do options diretamente no "this"
        this.#options = Object.assign({
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
        
        if (this.#options.fermata) abc += "!fermata!";
        if (this.#options.breath) abc += "!breath!";
        
        // Caractere de pausa no ABC (z = visível, x = invisível)
        abc += this.#options.invisivel ? "x" : "z";

        // Sufixo de duração
        abc += this.#formatarDuracaoAbc();

        return abc;
    }

    /**
     * @private
     */
    #formatarDuracaoAbc() {
        const razao = this.#duracao.razao / this.getUnidadeTempo().razao;
        if (Math.abs(razao - 1) < 0.000001) return "";

        if (Number.isInteger(Number(razao.toFixed(8)))) {
            return Math.round(razao).toString();
        }

        const d = Number(razao.toFixed(8));
        if (d === 0.5) return "/";
        
        const denominador = Math.round(1 / d);
        if (Math.abs((1 / denominador) - d) < 0.000001) {
            return `/${denominador}`;
        }

        return razao.toString();
    }
    get fermata() { return this.#options.fermata === true; }
    get breath() { return this.#options.fermata === true; }
    get invisivel() { return this.#options.invisivel === true; }

    get duracao() { return this.#duracao; }
    
    set duracao(val) {
        if (!(val instanceof TempoDuracao)) {
            throw new TypeError("A duração da pausa deve ser uma instância de TempoDuracao.");
        }
        this.#duracao = val;
    }

    getUnidadeTempo() {
        if (this.#options.unidadeTempo) {
            return this.#options.unidadeTempo;
        }
        if (this.#options.compasso) {
            return this.#options.compasso.unidadeTempo
        }
        if (this.#options.voz) {
            return this.#options.voz.unidadeTempo
        }
        if (this.#options.obra) {
            return this.#options.obra.unidadeTempo
        }
        return null;
    }
    get unidadeTempo() {
        return this.#options.unidadeTempo;
    }
    set unidadeTempo( tempo ) {
        this.#options.unidadeTempo = tempo;
    }
    // E precisaria de getters para as heranças também
    get obra() { return this.#options.obra; }
    set obra(val) {
        if (val === undefined) return;
        if (!val) {
            this.#options.obra = null;
            return;
        }
        if (!(val instanceof Obra)) {
            throw new TypeError("Pausa:setObra: A obra deve ser uma instancia de Obra ou null.");
        }
        this.#options.obra = val;
    }
    get voz() { return this.#options.voz; }
    set voz(val) {
        if (val === undefined) return;
        if (!val) {
            this.#options.voz = null;
            return;
        }
        if (!(val instanceof Voz)) {
            throw new TypeError("Pausa:setVoz: A voz deve ser uma instancia de Voz ou null.");
        }
        this.#options.voz = val;
    }
    get compasso() { return this.#options.compasso; }
    set compasso(val) {
        if (val === undefined) return;
        if (!val) {
            this.#options.compasso = null;
            return;
        }
        if (!(val instanceof Compasso)) {
            throw new TypeError("Pausa:setVoz: A voz deve ser uma instancia de Voz ou null.");
        }
        this.#options.compasso = val;
    }
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
}