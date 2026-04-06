/**
 * Classe base para os instrumentos
 * Encapsula a lógica para que o 'this' funcione corretamente.
 */
class InstrumentoBase {
    constructor(config) {
        Object.assign(this, config);
    }

    /**
     * Retorna a linha de comando MIDI (ex: %%MIDI program 25)
     */
    toAbcMidi() {
        return `%%MIDI program ${this.id}\n`;
    }

    /**
     * Retorna a definição da voz no ABC (V:1 ...)
     */
    toAbcVoice(clave) {
        const clefPart = clave ? clave.toAbc() : '';
        return `V:1 name="${this.titulo}" sname="${this.abrev}" ${clefPart}\n`;
    }
}

/**
 * Enum para Instrumentos
 */
export const Instrumento = Object.freeze({
    // --- Dados do Enum (Instanciados) ---
    VIOLAO_ACO:    new InstrumentoBase({ id: 25, titulo: 'Violão (Aço)', abrev: 'Vla' }),
    VIOLAO_NYLON:  new InstrumentoBase({ id: 24, titulo: 'Violão (Nylon)', abrev: 'Vln' }),
    GUITARRA_CLEAN: new InstrumentoBase({ id: 27, titulo: 'Guitarra Clean', abrev: 'E.Gtr.' }),
    VIOLA_CAIPIRA_CEBOLAO_E: new InstrumentoBase({
        id: 25,
        titulo: 'Viola Caipira (Cebolão E)',
        abrev: 'Vla.',
        pares: 5,
        afinacao: [
            { par: 1, notas: ['E4', 'E4'], unissono: true },
            { par: 2, notas: ['B3', 'B3'], unissono: true },
            { par: 3, notas: ['G#4', 'G#3'], unissono: false },
            { par: 4, notas: ['E4', 'E3'], unissono: false },
            { par: 5, notas: ['B3', 'B2'], unissono: false }
        ]
    }),
    BAIXO_ELETRICO: new InstrumentoBase({ id: 33, titulo: 'Baixo Elétrico', abrev: 'Bass' }),
    PIANO:         new InstrumentoBase({ id: 0,  titulo: 'Piano Acústico', abrev: 'Pno.' }),
    ORGAO:         new InstrumentoBase({ id: 16, titulo: 'Órgão Hammond', abrev: 'Org.' }),
    FLAUTA:        new InstrumentoBase({ id: 73, titulo: 'Flauta', abrev: 'Fl.' }),
    SAX_ALTO:      new InstrumentoBase({ id: 65, titulo: 'Sax Alto', abrev: 'Sax.' }),
    VIOLINO:       new InstrumentoBase({ id: 40, titulo: 'Violino', abrev: 'Vln.' }),
    CELLO:         new InstrumentoBase({ id: 42, titulo: 'Violoncelo', abrev: 'Vc.' }),

    // --- Métodos de Busca (Estáticos do Enum) ---

    getById(id) {
        return Object.values(this).find(item => item instanceof InstrumentoBase && item.id === id);
    },

    list() {
        return Object.values(this).filter(item => item instanceof InstrumentoBase);
    }
});