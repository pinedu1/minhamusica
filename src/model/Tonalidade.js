/**
 * Enum completo das 12 Tonalidades (Armaduras de Clave).
 * @enum {{valor: string, acidentes: number, tipo: '#'|'b'|'n'}}
 */
/**
 * Enum completo das Tonalidades (Armaduras de Clave) organizado por grupo.
 * @enum {{valor: string, acidentes: number, tipo: '#'|'b'|'n'}}
 */
export const Tonalidade = Object.freeze({
    // --- NATURAIS ---
    A: { valor: 'A', acidentes: 3, tipo: '#' }, // Lá Maior (F#, C#, G#)
    B: { valor: 'B', acidentes: 5, tipo: '#' }, // Si Maior (F#, C#, G#, D#, A#)
    C: { valor: 'C', acidentes: 0, tipo: 'n' }, // Dó Maior (Natural)
    D: { valor: 'D', acidentes: 2, tipo: '#' }, // Ré Maior (F#, C#)
    E: { valor: 'E', acidentes: 4, tipo: '#' }, // Mi Maior (F#, C#, G#, D#)
    F: { valor: 'F', acidentes: 1, tipo: 'b' }, // Fá Maior (Bb)
    G: { valor: 'G', acidentes: 1, tipo: '#' }, // Sol Maior (F#)

    // --- BEMÓIS ---
    Ab: { valor: 'Ab', acidentes: 4, tipo: 'b' }, // Lá b Maior
    Bb: { valor: 'Bb', acidentes: 2, tipo: 'b' }, // Si b Maior
    Cb: { valor: 'Cb', acidentes: 7, tipo: 'b' }, // Dó b Maior (Todas bemóis)
    Db: { valor: 'Db', acidentes: 5, tipo: 'b' }, // Ré b Maior
    Eb: { valor: 'Eb', acidentes: 3, tipo: 'b' }, // Mi b Maior
    Fb: { valor: 'Fb', acidentes: 8, tipo: 'b' }, // Fá b Maior (Raro, enarmônico de E)
    Gb: { valor: 'Gb', acidentes: 6, tipo: 'b' }, // Sol b Maior

    // --- SUSTENIDOS ---
    As: { valor: 'A#', acidentes: 10, tipo: '#' }, // Lá # Maior (Raro, enarmônico de Bb)
    Bs: { valor: 'B#', acidentes: 12, tipo: '#' }, // Si # Maior (Teórico, enarmônico de C)
    Cs: { valor: 'C#', acidentes: 7, tipo: '#' },  // Dó # Maior (Todas sustenidos)
    Ds: { valor: 'D#', acidentes: 9, tipo: '#' },  // Ré # Maior (Raro, enarmônico de Eb)
    Es: { valor: 'E#', acidentes: 11, tipo: '#' }, // Mi # Maior (Teórico, enarmônico de F)
    Fs: { valor: 'F#', acidentes: 6, tipo: '#' },  // Fá # Maior
    Gs: { valor: 'G#', acidentes: 8, tipo: '#' }   // Sol # Maior
});