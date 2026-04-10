/**
 * Enum para Dinâmicas Musicais (Padrão ABC)
 * O 'valor' é a sintaxe usada pelo abcjs.
 */
export const Dinamica = Object.freeze({
    // Intensidade Fixa
    PIANISSISSISSIMO: { valor: '!pppp!', titulo: 'Pianissississimo' },
    PIANISSISSIMO:    { valor: '!ppp!',  titulo: 'Pianississimo' },
    PIANISSIMO:       { valor: '!pp!',   titulo: 'Pianissimo' },
    PIANO:           { valor: '!p!',    titulo: 'Piano' },
    MEZZO_PIANO:     { valor: '!mp!',   titulo: 'Mezzo-piano' },
    MEZZO_FORTE:     { valor: '!mf!',   titulo: 'Mezzo-forte' },
    FORTE:           { valor: '!f!',    titulo: 'Forte' },
    FORTISSIMO:      { valor: '!ff!',   titulo: 'Fortissimo' },
    FORTISSISSIMO:   { valor: '!fff!',  titulo: 'Fortississimo' },
    FORTISSISSISSIMO:{ valor: '!ffff!', titulo: 'Fortissississimo' },

    // Ataque
    SFORZANDO:       { valor: '!sfz!',  titulo: 'Sforzando' },

    // Variações de Volume (Hairpins / Linhas)
    CRESCENDO_INICIO: { valor: '!(!',    titulo: 'Início Crescendo' },
    CRESCENDO_FIM:    { valor: '!)!',    titulo: 'Fim Crescendo' },
    DIMINUENDO_INICIO:{ valor: '!>(!',   titulo: 'Início Diminuendo' },
    DIMINUENDO_FIM:   { valor: '!>)!',   titulo: 'Fim Diminuendo' }
});