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
}