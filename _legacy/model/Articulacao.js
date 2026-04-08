/**
 * Enum para Articulações e Ornamentos compatíveis com abcjs.
 * @enum {{nome: string, abc: string}}
 */
export const Articulacao = Object.freeze({
    // --- ARTICULAÇÕES DE DURAÇÃO/ATAQUE ---
    STACCATO: { nome: 'Staccato', abc: '.' },      // Nota curta (ponto antes da nota)
    TENUTO:   { nome: 'Tenuto',   abc: 'M' },      // Nota sustentada (traço)
    ACCENT:   { nome: 'Acento',   abc: 'L' },      // Ênfase no ataque (>)

    // --- ORNAMENTOS (Muito comuns no ponteado) ---
    FERMATA:  { nome: 'Fermata',  abc: '!fermata!' }, // Sustentação indefinida
    MORDENT:  { nome: 'Mordente', abc: '!mordent!' }, // Ornamento rápido
    TRILL:    { nome: 'Trinado',  abc: '!trill!' },   // Oscilação rápida entre notas
    GRACE:    { nome: 'Appoggiatura', abc: '{' },     // Nota de graça (requer fechamento '}')

    // --- ESPECÍFICOS DE INSTRUMENTOS DE CORDA (Viola/Violão) ---
    UP_BOW:   { nome: 'Palhetada Cima',  abc: 'u' },  // Movimento para cima
    DOWN_BOW: { nome: 'Palhetada Baixo', abc: 'v' },  // Movimento para baixo
    HARMONIC: { nome: 'Harmônico',       abc: '!harmonic!' }
});