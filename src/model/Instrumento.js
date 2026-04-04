/**
 * Enum para Instrumentos (Baseado no General MIDI)
 * @enum {{id: number, titulo: string, abrev: string}}
 */
export const Instrumento = Object.freeze({
    // Cordas Dedilhadas (Seu interesse principal)
    VIOLAO_ACO:    { id: 25, titulo: 'Violão (Aço)', abrev: 'Gtr.' },
    VIOLAO_NYLON:  { id: 24, titulo: 'Violão (Nylon)', abrev: 'Gtr.' },
    GUITARRA_CLEAN: { id: 27, titulo: 'Guitarra Clean', abrev: 'E.Gtr.' },
    VIOLA_CAIPIRA_CEBOLAO_E: {
        id: 25,
        titulo: 'Viola Caipira (Cebolão E)',
        abrev: 'Vla.',
        pares: 5,
        afinacao: [
            { par: 1, notas: ['E4', 'E4'], unissono: true },
            { par: 2, notas: ['B3', 'B3'], unissono: true },
            { par: 3, notas: ['G#4', 'G#3'], unissono: false }, // Oitavado
            { par: 4, notas: ['E4', 'E3'], unissono: false },   // Oitavado
            { par: 5, notas: ['B3', 'B2'], unissono: false }    // Oitavado
        ]
    },

    BAIXO_ELETRICO: { id: 33, titulo: 'Baixo Elétrico', abrev: 'Bass' },

    // Teclados
    PIANO:         { id: 0,  titulo: 'Piano Acústico', abrev: 'Pno.' },
    ORGAO:         { id: 16, titulo: 'Órgão Hammond', abrev: 'Org.' },

    // Sopros
    FLAUTA:        { id: 73, titulo: 'Flauta', abrev: 'Fl.' },
    SAX_ALTO:      { id: 65, titulo: 'Sax Alto', abrev: 'Sax.' },

    // Cordas Friccionadas
    VIOLINO:       { id: 40, titulo: 'Violino', abrev: 'Vln.' },
    CELLO:         { id: 42, titulo: 'Violoncelo', abrev: 'Vc.' }
});