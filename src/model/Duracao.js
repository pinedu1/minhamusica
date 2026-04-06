/**
 * Classe base para as durações rítmicas.
 */
/**
 * Classe base para as durações rítmicas.
 */
export class DuracaoBase {
    constructor(config) {
        Object.assign(this, config);
    }

    /**
     * Retorna o identificador global de duração (Field L) para o padrão ABC.
     * USAGE: Usado no cabeçalho ou nas propriedades estruturais do compasso.
     * @returns {string} Ex: "L:1/4\n"
     */
    toAbc() {
        return `L:${this.abc}\n`;
    }

    /**
     * @param {number} referencia - O valor da unidade L: (Ex: 0.5 para 1/8)
     * @returns {string} O sufixo ABC calculado dinamicamente
     */
    toNota(referencia = 0.5) {
        // Calculamos a razão entre a nota atual e a referência
        // Ex: Semínima(1.0) / Colcheia(0.5) = 2
        // Ex: Semicolcheia(0.25) / Colcheia(0.5) = 0.5
        const razao = this.valor / referencia;

        // Se a nota for exatamente igual à referência (Ex: Colcheia com L:1/8)
        if (razao === 1) return "";

        // Se for um número inteiro (Ex: 2, 4, 8)
        if (Number.isInteger(razao)) {
            return `${razao}`;
        }

        // Se for uma fração (Ex: 0.5 vira "/", 0.25 vira "/4")
        return this.#converterParaFracaoAbc(razao);
    }

    /**
     * Método auxiliar para converter números decimais em frações padrão ABC
     */
    #converterParaFracaoAbc(decimal) {
        if (decimal === 0.5) return "/"; // Atalho ABC para /2

        // Para outros casos, buscamos uma representação fracionária simples
        // Usamos uma aproximação para evitar erros de ponto flutuante
        const denominador = Math.round(1 / decimal);
        if (denominador > 1) {
            return `/${denominador}`;
        }

        // Para notas pontuadas (ex: 1.5, 0.75), calculamos numerador/denominador
        // Ex: Razão 1.5 (Semínima Pontuada vs Colcheia) -> "3/2"
        const n = decimal * 2;
        if (Number.isInteger(n)) {
            return `${n}/2`;
        }

        return decimal.toString(); // Fallback
    }

    getValor() { return this.valor; }

    getTempo() {
        return this.abc;
    }
}

/**
 * Enum para as durações rítmicas em Português-BR.
 * Baseado na unidade L:1/8 (Colcheia).
 */
export const Duracao = Object.freeze({
    // --- NOTAS LONGAS ---
    QUADRUPLA:      new DuracaoBase({ nome: 'Semibreve Quádrupla', valor: 16.0, abc: '32/1' }),
    BREVE:          new DuracaoBase({ nome: 'Breve',              valor: 8.0,  abc: '16/1' }),
    SEMIBREVE:      new DuracaoBase({ nome: 'Semibreve',          valor: 4.0,  abc: '8/1'  }),
    WHOLE:          new DuracaoBase({ nome: 'Semibreve',          valor: 4.0,  abc: '8/1'  }),
    MINIMA:         new DuracaoBase({ nome: 'Mínima',             valor: 2.0,  abc: '4/1'  }),
    HALF:           new DuracaoBase({ nome: 'Mínima',             valor: 2.0,  abc: '4/1'  }),

    // --- NOTAS MÉDIAS ---
    SEMINIMA:       new DuracaoBase({ nome: 'Semínima',           valor: 1.0,  abc: '2/1'  }),
    QUARTER:        new DuracaoBase({ nome: 'Semínima',           valor: 1.0,  abc: '2/1'  }),
    COLCHEIA:       new DuracaoBase({ nome: 'Colcheia',           valor: 0.5,  abc: '1/1'  }),
    EIGHTH:         new DuracaoBase({ nome: 'Colcheia',           valor: 0.5,  abc: '1/1'  }),

    // --- SUBDIVISÕES ---
    SEMICOLCHEIA:   new DuracaoBase({ nome: 'Semicolcheia',       valor: 0.25,     abc: '1/2'  }),
    SIXTEENTH:      new DuracaoBase({ nome: 'Semicolcheia',       valor: 0.25,     abc: '1/2'  }),
    FUSA:           new DuracaoBase({ nome: 'Fusa',               valor: 0.125,    abc: '1/4'  }),
    SEMIFUSA:       new DuracaoBase({ nome: 'Semifusa',           valor: 0.0625,   abc: '1/8'  }),
    BISSEMIFUSA:    new DuracaoBase({ nome: 'Bissemifusa',        valor: 0.03125,  abc: '1/16' }),
    QUADRISSIFUSA:  new DuracaoBase({ nome: 'Quadrissifusa',      valor: 0.015625, abc: '1/32' }),

    // --- PONTUADAS (Baseadas em 1/8) ---
    SEMIBREVE_PONTUADA:    new DuracaoBase({ nome: 'Semibreve Pontuada',    valor: 6.0,  abc: '12/1' }),
    MINIMA_PONTUADA:       new DuracaoBase({ nome: 'Mínima Pontuada',       valor: 3.0,  abc: '6/1'  }),
    SEMINIMA_PONTUADA:     new DuracaoBase({ nome: 'Semínima Pontuada',     valor: 1.5,  abc: '3/1'  }),
    COLCHEIA_PONTUADA:     new DuracaoBase({ nome: 'Colcheia Pontuada',     valor: 0.75, abc: '3/2'  }),
    SEMICOLCHEIA_PONTUADA: new DuracaoBase({ nome: 'Semicolcheia Pontuada', valor: 0.375, abc: '3/4'  }),

    // --- TERCINAS (Relativas à colcheia) ---
    TERCINA_MINIMA:        new DuracaoBase({ nome: 'Tercina de Mínima',     valor: 1.33333333, abc: '8/3' }),
    TERCINA_SEMINIMA:      new DuracaoBase({ nome: 'Tercina de Semínima',   valor: 0.66666667, abc: '4/3' }),
    TERCINA_COLCHEIA:      new DuracaoBase({ nome: 'Tercina de Colcheia',   valor: 0.33333333, abc: '2/3' }),

    // Métodos auxiliares permanecem iguais...
    list() { return Object.values(this).filter(d => d instanceof DuracaoBase); },
    getByValor(valor) { return this.list().find(d => Math.abs(d.getValor() - valor) < 0.000001); }
});