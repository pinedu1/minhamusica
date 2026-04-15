export class GrupoInstrumento {
    #grupo = null;
    #key = null;
    constructor( key ) {
        if ( key == null || key === undefined ) {
            key = 'CORDAS';
        }
        this.#grupo = GrupoInstrumentoAbc[ key ];
        this.#key = key;
    }
    get nome() {
        if (!this.#grupo) return null;
        return this.#grupo.nome
    }
    get valor() {
        if (!this.#grupo) return null;
        return this.#grupo.valor
    }
    get key() {
        return this.#key;
    }
    static create( key = 'CORDAS' ) {
        // 2. Verifica se a chave informada existe no array de chaves
        const chavesValidas = Object.keys(GrupoInstrumentoAbc);
        if (!chavesValidas.includes(key)) {
            throw new TypeError(
                `GrupoInstrumento.create: Chave de Instrumento inválida "${key}". Deve ser um destes: [${chavesValidas.join(', ')}].`
            );
        }
        return new GrupoInstrumento(key);
    }
}
/**
 * Enum para Grupo de Instrumentos (Campo G: no ABC).
 * Utilizado para indexação e agrupamento de famílias instrumentais.
 * @readonly
 */
export const GrupoInstrumentoAbc = Object.freeze({
    // --- CORDAS (STRINGS) ---
    CORDAS: { nome: "Cordas", valor: "Strings" },
    CORDAS_DILACERADAS: { nome: "Cordas Dedilhadas", valor: "Plucked Strings" }, // Violão, Harpa, Viola
    CORDAS_FRICCIONADAS: { nome: "Cordas Friccionadas", valor: "Bowed Strings" }, // Violino, Violoncelo

    // --- MADEIRAS (WOODWINDS) ---
    MADEIRAS: { nome: "Madeiras", valor: "Woodwinds" },
    FLAUTAS: { nome: "Flautas", valor: "Flutes" },
    PALHETAS: { nome: "Palhetas", valor: "Reeds" }, // Clarinete, Oboé, Sax

    // --- METAIS (BRASS) ---
    METAIS: { nome: "Metais", valor: "Brass" },

    // --- PERCUSSÃO (PERCUSSION) ---
    PERCUSSAO: { nome: "Percussão", valor: "Percussion" },
    PERCUSSAO_RITMICA: { nome: "Percussão Rítmica", valor: "Unpitched Percussion" },
    PERCUSSAO_MELODICA: { nome: "Percussão Melódica", valor: "Pitched Percussion" }, // Xilofone, Tímpanos

    // --- TECLAS E FOLES ---
    TECLAS: { nome: "Teclas", valor: "Keyboards" }, // Piano, Cravo
    FOLES: { nome: "Foles", valor: "Free Reeds" }, // Acordeom, Concertina, Bandoneón

    // --- VOZES HUMANAS ---
    VOZES: { nome: "Vozes", valor: "Voices" },
    CORO: { nome: "Coro", valor: "Choir" },

    // --- ELETRÔNICOS ---
    ELETRONICOS: { nome: "Eletrônicos", valor: "Electronic" },

    // --- GERAL ---
    OUTROS: { nome: "Outros", valor: "Other" }
});