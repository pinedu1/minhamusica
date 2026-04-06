/**
 * Classe base para as durações rítmicas.
 */
class DuracaoBase {
    constructor(config) {
        Object.assign(this, config);
    }

    /**
     * Retorna o sufixo da nota para o padrão ABC.
     */
    toAbc() {
        return this.abc;
    }

    getValor() {
        return this.valor;
    }
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
    QUADRUPLA:      new DuracaoBase({ nome: 'Semibreve Quádrupla', valor: 16.0, abc: '4/1' }),
    BREVE:          new DuracaoBase({ nome: 'Breve',              valor: 8.0,  abc: '2/1' }),
    SEMIBREVE:      new DuracaoBase({ nome: 'Semibreve',          valor: 4.0,  abc: '1/1' }),
    MINIMA:         new DuracaoBase({ nome: 'Mínima',             valor: 2.0,  abc: '1/2' }),

    // --- NOTAS MÉDIAS ---
    SEMINIMA:       new DuracaoBase({ nome: 'Semínima',           valor: 1.0,  abc: '1/4' }),
    COLCHEIA:       new DuracaoBase({ nome: 'Colcheia',           valor: 0.5,  abc: '1/8' }),

    // --- SUBDIVISÕES ---
    SEMICOLCHEIA:   new DuracaoBase({ nome: 'Semicolcheia',       valor: 0.25,     abc: '1/16' }),
    FUSA:           new DuracaoBase({ nome: 'Fusa',               valor: 0.125,    abc: '1/32' }),
    SEMIFUSA:       new DuracaoBase({ nome: 'Semifusa',           valor: 0.0625,   abc: '1/64' }),
    BISSEMIFUSA:    new DuracaoBase({ nome: 'Bissemifusa',        valor: 0.03125,  abc: '1/128' }),
    QUADRISSIFUSA:  new DuracaoBase({ nome: 'Quadrissifusa',      valor: 0.015625, abc: '1/256' }),
// --- NOTAS PONTUADAS E TEMPOS COMPOSTOS BASE 2 ---
    SEMIBREVE_PONTUADA:    new DuracaoBase({ nome: 'Semibreve Pontuada',    valor: 6.0,  abc: '3/2' }),
    COMPOSTO_5_2:          new DuracaoBase({ nome: 'Composto 5/2',          valor: 10.0, abc: '5/2' }),
    COMPOSTO_7_2:          new DuracaoBase({ nome: 'Composto 7/2',          valor: 14.0, abc: '7/2' }),

// --- NOTAS PONTUADAS E TEMPOS COMPOSTOS BASE 4 ---
    MINIMA_PONTUADA:       new DuracaoBase({ nome: 'Mínima Pontuada',       valor: 3.0,  abc: '3/4' }),
    COMPOSTO_5_4:          new DuracaoBase({ nome: 'Composto 5/4',          valor: 5.0,  abc: '5/4' }),
    COMPOSTO_7_4:          new DuracaoBase({ nome: 'Composto 7/4',          valor: 7.0,  abc: '7/4' }),

// --- NOTAS PONTUADAS E TEMPOS COMPOSTOS BASE 8 ---
    SEMINIMA_PONTUADA:     new DuracaoBase({ nome: 'Semínima Pontuada',     valor: 1.5,  abc: '3/8' }),
    COMPOSTO_5_8:          new DuracaoBase({ nome: 'Composto 5/8',          valor: 2.5,  abc: '5/8' }),
    COMPOSTO_7_8:          new DuracaoBase({ nome: 'Composto 7/8',          valor: 3.5,  abc: '7/8' }),
    COMPOSTO_9_8:          new DuracaoBase({ nome: 'Composto 9/8',          valor: 4.5,  abc: '9/8' }),

// --- NOTAS PONTUADAS E TEMPOS COMPOSTOS BASE 16 ---
    COLCHEIA_PONTUADA:     new DuracaoBase({ nome: 'Colcheia Pontuada',     valor: 0.75, abc: '3/16' }),
    COMPOSTO_5_16:         new DuracaoBase({ nome: 'Composto 5/16',         valor: 1.25, abc: '5/16' }),
    COMPOSTO_7_16:         new DuracaoBase({ nome: 'Composto 7/16',         valor: 1.75, abc: '7/16' }),

// --- NOTAS PONTUADAS E TEMPOS COMPOSTOS BASE 32 ---
    SEMICOLCHEIA_PONTUADA: new DuracaoBase({ nome: 'Semicolcheia Pontuada', valor: 0.375, abc: '3/32' }),
    COMPOSTO_5_32:         new DuracaoBase({ nome: 'Composto 5/32',         valor: 0.625, abc: '5/32' }),
    COMPOSTO_7_32:         new DuracaoBase({ nome: 'Composto 7/32',         valor: 0.875, abc: '7/32' }),

// --- QUIÁLTERAS / TERCINAS (Opcional, se precisar do valor exato) ---
    TERCINA_MINIMA:        new DuracaoBase({ nome: 'Tercina de Mínima',     valor: 1.33333333, abc: '1/3' }),
    TERCINA_SEMINIMA:      new DuracaoBase({ nome: 'Tercina de Semínima',   valor: 0.66666667, abc: '1/6' }),
    TERCINA_COLCHEIA:      new DuracaoBase({ nome: 'Tercina de Colcheia',   valor: 0.33333333, abc: '1/12' }),

    // --- MÉTODOS DO ENUM ---

    /**
     * Busca uma duração pelo valor numérico (tempos).
     * @param {number} valor 
     * @returns {DuracaoBase|undefined}
     */
    getByValor(valor) {
        // Usamos um limiar de tolerância para comparação de ponto flutuante
        return this.list().find(d => Math.abs(d.getValor() - valor) < 0.000001);
    },
    getByTempo( tempoString ) {
        var x = this.list().find(d => d.getTempo() === tempoString);
        return x;
    },
    /**
     * Lista todas as durações como um array.
     */
    list() {
        return Object.values(this).filter(d => d instanceof DuracaoBase);
    }
});