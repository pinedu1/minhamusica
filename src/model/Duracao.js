/**
 * Classe base para as durações rítmicas.
 */
class DuracaoBase {
    constructor(config) {
        Object.assign(this, config);
    }

    /**
     * Retorna o sufixo da nota (ex: '2', '4', '1/2')
     */
    toAbc() {
        return `L:${this.abc}\n`;
    }

    getValor() {
        return this.valor;
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

    // --- MÉTODOS DO ENUM ---

    /**
     * Busca uma duração pelo valor numérico (tempos).
     */
    getByValor(valor) {
        return Object.values(this).find(d => d instanceof DuracaoBase && d.valor === valor);
    },

    /**
     * Lista todas as durações como um array.
     */
    list() {
        return Object.values(this).filter(d => d instanceof DuracaoBase);
    }
});