/**
 * Enum para Claves.
 * O valor segue o padrão do abcjs (clef=).
 */
export const ClaveTipo = Object.freeze({
    TREBLE: { valor: 'treble', linha: 2, nome: 'Sol' },    // Clave de Sol na 2ª linha
    BASS:   { valor: 'bass',   linha: 4, nome: 'Fá' },     // Clave de Fá na 4ª linha
    ALTO:   { valor: 'alto',   linha: 3, nome: 'Dó' },     // Clave de Dó na 3ª linha
    TENOR:  { valor: 'tenor',  linha: 4, nome: 'Dó' },     // Clave de Dó na 4ª linha
    PERC:   { valor: 'perc',   linha: 3, nome: 'Percussão' }
});