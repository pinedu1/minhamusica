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
    static getByNome( nome ) {
        const g = GrupoInstrumentoAbc.getByNome(nome);
        if ( !g ) return null;
        return new GrupoInstrumento(g.key);
    }
}
/**
 * Enum para Grupo de Instrumentos (Campo G: no ABC).
 * Utilizado para indexação e agrupamento de famílias instrumentais.
 * @readonly
 */
export const GrupoInstrumentoAbc = Object.freeze({
    // --- CORDAS (STRINGS) ---
    CORDAS: { nome: "Cordas", valor: "Strings", key: "CORDAS" },
    CORDAS_DILACERADAS: { nome: "Cordas Dedilhadas", valor: "Plucked Strings", key: "CORDAS_DILACERADAS" }, // Violão, Harpa, Viola
    CORDAS_FRICCIONADAS: { nome: "Cordas Friccionadas", valor: "Bowed Strings", key: "CORDAS_FRICCIONADAS" }, // Violino, Violoncelo

    // --- MADEIRAS (WOODWINDS) ---
    MADEIRAS: { nome: "Madeiras", valor: "Woodwinds", key: "MADEIRAS" },
    FLAUTAS: { nome: "Flautas", valor: "Flutes", key: "FLAUTAS" },
    PALHETAS: { nome: "Palhetas", valor: "Reeds", key: "PALHETAS" }, // Clarinete, Oboé, Sax

    // --- METAIS (BRASS) ---
    METAIS: { nome: "Metais", valor: "Brass", key: "METAIS" },

    // --- PERCUSSÃO (PERCUSSION) ---
    PERCUSSAO: { nome: "Percussão", valor: "Percussion", key: "PERCUSSAO" },
    PERCUSSAO_RITMICA: { nome: "Percussão Rítmica", valor: "Unpitched Percussion", key: "PERCUSSAO_RITMICA" },
    PERCUSSAO_MELODICA: { nome: "Percussão Melódica", valor: "Pitched Percussion", key: "PERCUSSAO_MELODICA" }, // Xilofone, Tímpanos

    // --- TECLAS E FOLES ---
    TECLAS: { nome: "Teclas", valor: "Keyboards", key: "TECLAS" }, // Piano, Cravo
    FOLES: { nome: "Foles", valor: "Free Reeds", key: "FOLES" }, // Acordeom, Concertina, Bandoneón

    // --- VOZES HUMANAS ---
    VOZES: { nome: "Vozes", valor: "Voices", key: "VOZES" },
    CORO: { nome: "Coro", valor: "Choir", key: "CORO" },

    // --- ELETRÔNICOS ---
    ELETRONICOS: { nome: "Eletrônicos", valor: "Electronic", key: "ELETRONICOS" },

    // --- GERAL ---
    OUTROS: { nome: "Outros", valor: "Other", key: "OUTROS" },
    getByNome: function(nome) {
        return Object.values(this).find(tipo => tipo.nome === nome);
    }
});