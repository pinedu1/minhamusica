/**
 * Enum para as durações rítmicas.
 * O valor 1.0 representa uma Semínima (Quarter Note).
 * @enum {{nome: string, valor: number, abc: string}}
 */
export const Duracao = Object.freeze({
    // --- NOTAS LONGAS ---
    QUADRUPLA:  { nome: 'Semibreve quadrupla', valor: 16.0, abc: '16' },
    DOUBLE:     { nome: 'Breve',              valor: 8.0,  abc: '8'  },
    INTEIRA:    { nome: 'Semibreve',         valor: 4.0,  abc: '4'  }, // 4 tempos
    METADE:     { nome: 'Mínima',            valor: 2.0,  abc: '2'  }, // 2 tempos

    // --- PADRÃO (Semínima) ---
    QUARTER:    { nome: 'Semínima',          valor: 1.0,  abc: ''   }, // 1 tempo (padrão no ABC)

    // --- SUBDIVISÕES ---
    OCTAVE:     { nome: 'Colcheia',          valor: 0.5,  abc: '/2' },
    SIXTEENTH:  { nome: 'Semicolcheia',      valor: 0.25, abc: '/4' }
});