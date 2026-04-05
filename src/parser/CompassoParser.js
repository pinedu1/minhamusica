import { Compasso } from '../model/Compasso.js';
import { Nota } from '../model/Nota.js';
import { AlturaMidi } from '../model/AlturaMidi.js';
import { Duracao } from '../model/Duracao.js';

export class CompassoParser {
    /**
     * Regex para capturar:
     * 1. Acidente opcional (^, _, =)
     * 2. Nota (A-Ga-g)
     * 3. Oitava opcional (,,, ou ''')
     * 4. Duração opcional (números, frações como 3/2 ou /2)
     * 5. Ligadura opcional (-)
     */
    static TOKEN_REGEX = /([\^=_]*[A-Ga-g][,']*?)([\d/]*)([-]?)/g;

    static parse(entrada, indice = 0) {
        const compasso = new Compasso(indice);
        let match;

        // Reset do regex para garantir leitura do início
        this.TOKEN_REGEX.lastIndex = 0;

        while ((match = this.TOKEN_REGEX.exec(entrada)) !== null) {
            const [fullToken, alturaStr, duracaoStr, ligaduraStr] = match;

            // 1. Resolver Altura
            const alturaObj = this.#resolverAltura(alturaStr);

            // 2. Resolver Duração
            const valorTempo = this.#resolverDuracao(duracaoStr);

            // 3. Criar a Nota (aqui você pode instanciar sua classe Nota)
            const novaNota = new Nota(alturaObj, valorTempo);

            // Se houver ligadura (-), você pode marcar na nota
            if (ligaduraStr === '-') novaNota.ligada = true;

            compasso.notas.push(novaNota);
        }

        return compasso;
    }

    /**
     * Converte "A", "^c", "G," para o objeto AlturaMidi correspondente
     */
    static #resolverAltura(str) {
        // Busca direta no seu dicionário AlturaMidi pelo valor abcjs
        const encontrado = Object.values(AlturaMidi).find(a => a.abcjs === str);
        if (!encontrado) {
            console.warn(`Altura não mapeada: ${str}`);
            return AlturaMidi.C4; // Fallback
        }
        return encontrado;
    }

    /**
     * Converte "", "3", "3/2", "/2" em valor numérico de tempos
     * Baseado em L:1/8
     */
    static #resolverDuracao(str) {
        if (!str) return 0.5; // Padrão L:1/8 (Colcheia = 0.5 tempo)

        if (str === "/") return 0.25; // Semicolcheia
        if (str.startsWith("/")) {
            const denom = parseInt(str.substring(1)) || 2;
            return 0.5 / denom;
        }

        if (str.includes("/")) {
            const [num, den] = str.split("/").map(Number);
            return (num / (den || 2)) * 0.5;
        }

        return parseInt(str) * 0.5; // Ex: "3" -> 3 * 0.5 = 1.5 tempos
    }
}