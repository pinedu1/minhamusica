import { Nota } from './Nota.js';
import { Altura } from './Altura.js';
import { Duracao } from './Duracao.js';

export class Acorde {
    /** @type {Array<Nota>} */
    #notas = [];

    /** * USAGE: Valor rítmico baseado no Enum Duracao.
     * @type {DuracaoBase}
     */
    #duracao;

    constructor(notas = [], duracao = Duracao.COLCHEIA) {
        this.#notas = notas;
        this.#duracao = duracao;
    }

    /**
     * USAGE: Transforma o array de notas e a duração na string ABC.
     * @returns {string} Ex: "[GEB,]2" ou "[Ac]/4"
     */
    toAbc() {
        const conteudo = this.#notas.map(n => {
            // Notas dentro de acorde não levam duração individual no ABC padrão
            return n.altura.toAbc ? n.altura.toAbc() : n.altura;
        }).join('');

        // A duração do acorde (multiplicador/divisor) vai após o fechamento do colchete
        return `[${conteudo}]${this.#duracao.toNota(0.5)}`;
    }

    /**
     * USAGE: Resolve uma string de acorde e extrai a duração se existir.
     * @param {string} entrada - Ex: "[GEB,]", "[Ac]4", "C,E,G,"
     * @param {DuracaoBase|null} duracaoManual - Se fornecida, ignora a duração da string.
     * @returns {Acorde} Uma nova instância de Acorde.
     */
    static resolverNotas(entrada, duracaoManual = null) {
        // 1. Regex para separar o bloco de notas da duração externa:
        // Grupo 1: Conteúdo entre [] ou a string toda
        // Grupo 2: O sufixo rítmico (ex: 4, /2, 3/8)
        const ACORDE_GLOBAL_REGEX = /^(?:\[([^\]]+)\]|([^0-9/]+))([\d/]*)$/;
        const matchGlobal = entrada.trim().match(ACORDE_GLOBAL_REGEX);

        if (!matchGlobal) throw new Error(`Formato de acorde inválido: ${entrada}`);

        const notasInternasStr = matchGlobal[1] || matchGlobal[2];
        const duracaoTexto = matchGlobal[3];

        // 2. Definir a Duração:
        // Prioridade: 1. Manual -> 2. Extraída da String -> 3. Padrão 1/8 (COLCHEIA)
        let duracaoFinal = duracaoManual;

        if (!duracaoFinal) {
            if (duracaoTexto) {
                // Busca no Enum pelo tempo ABC (ex: "1/4", "2/1")
                // Se o seu Duracao.getByTempo não existir, usamos o valor extraído
                duracaoFinal = Duracao.getByTempo(duracaoTexto) || Duracao.COLCHEIA;
            } else {
                duracaoFinal = Duracao.COLCHEIA; // Padrão 1/8
            }
        }

        // 3. Resolver as notas individuais internamente
        const NOTA_INTERNA_REGEX = /([\^=_]*[A-Ga-g][,']*)/g;
        const matchesNotas = notasInternasStr.matchAll(NOTA_INTERNA_REGEX);
        const notasObjetos = [];

        for (const match of matchesNotas) {
            const altura = Altura.resolverAltura(match[1]);
            // Criamos as notas internas. A duração individual delas é irrelevante
            // dentro do acorde, então usamos a base.
            notasObjetos.push(new Nota(altura, duracaoFinal));
        }

        return new Acorde(notasObjetos, duracaoFinal);
    }

    // Getters
    get notas() { return this.#notas; }
    get duracao() { return this.#duracao; }
}