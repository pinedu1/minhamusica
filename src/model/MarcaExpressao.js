/**
 * Enum para Marcas de Expressão e Articulação.
 * @enum {{valor: string, titulo: string, tipo: string}}
 */
export const MarcaExpressao = Object.freeze({
    // Articulações (Símbolos sobre/sob a nota)
    STACCATO:  { valor: '.',   titulo: 'Staccato',  tipo: 'articulacao' },
    TENUTO:    { valor: 'M',   titulo: 'Tenuto',    tipo: 'articulacao' },
    ACENTO:    { valor: 'L',   titulo: 'Acento',    tipo: 'articulacao' },
    FERMATA:   { valor: 'H',   titulo: 'Fermata',   tipo: 'articulacao' },
    MORDENTE:  { valor: 'm',   titulo: 'Mordente',  tipo: 'ornamento' },

    // Indicações de Tempo (Agógica)
    RITARDANDO: { valor: '^"rit."',  titulo: 'Ritardando',  tipo: 'tempo' },
    ACCELERANDO:{ valor: '^"accel."', titulo: 'Accelerando', tipo: 'tempo' },
    A_TEMPO:    { valor: '^"a tempo"', titulo: 'A Tempo',     tipo: 'tempo' },

    // Caráter (Texto interpretativo)
    DOLCE:     { valor: '^"dolce"',    titulo: 'Dolce',      tipo: 'carater' },
    LEGATO:    { valor: '^"legato"',   titulo: 'Legato',     tipo: 'carater' },
    ESPRESSIVO: { valor: '^"espress."', titulo: 'Espressivo', tipo: 'carater' }
});