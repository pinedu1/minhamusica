export const ClaveTipo = Object.freeze({
    TREBLE: { key: 'TREBLE',valor: 'treble', linha: 2, nome: 'Sol', middle: 'B' },    // Linha central é o Si (B4)
    BASS:   { key: 'BASS',valor: 'bass',   linha: 4, nome: 'Fá',  middle: 'D,' },   // Linha central é o Ré (D3)
    ALTO:   { key: 'ALTO',valor: 'alto',   linha: 3, nome: 'Dó',  middle: 'C' },    // Linha central é o Dó central (C4)
    TENOR:  { key: 'TENOR',valor: 'tenor',  linha: 4, nome: 'Dó',  middle: 'A,' },   // Linha central é o Lá (A3)
    PERC:   { key: 'PERC',valor: 'perc',   linha: 3, nome: 'Percussão', middle: 'B' } // Usa B por convenção de mapeamento
});