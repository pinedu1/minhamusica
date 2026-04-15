export class Tonalidade {
    #tonalidade = null
    /**
     * USAGE: Construtor da Tonalidade.
     * @param tonalidade @type{string}
     */
    constructor(tonalidade) {
        this.#tonalidade = TonalidadeEnum[tonalidade] || TonalidadeEnum.C;
    }
    get valor() {
        if (!this.#tonalidade) return null;
        return this.#tonalidade.valor;
    }
    get acidentes() {
        if (!this.#tonalidade) return null;
        return this.#tonalidade.acidentes;
    }
    get tipo() {
        if (!this.#tonalidade) return null;
        return this.#tonalidade.tipo;
    }
    toAbc() {
        return this.valor;
    }

    static create( key = 'C' ) {
        if (key instanceof Tonalidade) {
            return key;
        }
        // 2. Verifica se a chave informada existe no array de chaves
        const chavesValidas = Object.keys(TonalidadeEnum);
        if (!chavesValidas.includes(key)) {
            throw new TypeError(
                `Tonalidade.create: Tonalidade inválida "${key}". Deve ser um destes: [${chavesValidas.join(', ')}].`
            );
        }
        return new Tonalidade(key);
    }
}
/**
 * Enum completo das Tonalidades (Armaduras de Clave) organizado por grupo.
 * @enum {{valor: string, acidentes: number, tipo: '#'|'b'|'n'}}
 */
export const TonalidadeEnum = Object.freeze({
    // --- MAIORES NATURAIS ---
    A: { valor: 'A', acidentes: 3, tipo: '#' }, // Lá Maior (F#, C#, G#)
    B: { valor: 'B', acidentes: 5, tipo: '#' }, // Si Maior (F#, C#, G#, D#, A#)
    C: { valor: 'C', acidentes: 0, tipo: 'n' }, // Dó Maior (Natural)
    D: { valor: 'D', acidentes: 2, tipo: '#' }, // Ré Maior (F#, C#)
    E: { valor: 'E', acidentes: 4, tipo: '#' }, // Mi Maior (F#, C#, G#, D#)
    F: { valor: 'F', acidentes: 1, tipo: 'b' }, // Fá Maior (Bb)
    G: { valor: 'G', acidentes: 1, tipo: '#' }, // Sol Maior (F#)

    // --- MAIORES BEMÓIS ---
    Ab: { valor: 'Ab', acidentes: 4, tipo: 'b' }, // Lá b Maior
    Bb: { valor: 'Bb', acidentes: 2, tipo: 'b' }, // Si b Maior
    Cb: { valor: 'Cb', acidentes: 7, tipo: 'b' }, // Dó b Maior
    Db: { valor: 'Db', acidentes: 5, tipo: 'b' }, // Ré b Maior
    Eb: { valor: 'Eb', acidentes: 3, tipo: 'b' }, // Mi b Maior
    Fb: { valor: 'Fb', acidentes: 8, tipo: 'b' }, // Fá b Maior
    Gb: { valor: 'Gb', acidentes: 6, tipo: 'b' }, // Sol b Maior

    // --- MAIORES SUSTENIDOS ---
    As: { valor: 'A#', acidentes: 10, tipo: '#' }, // Lá # Maior
    Bs: { valor: 'B#', acidentes: 12, tipo: '#' }, // Si # Maior
    Cs: { valor: 'C#', acidentes: 7, tipo: '#' },  // Dó # Maior
    Ds: { valor: 'D#', acidentes: 9, tipo: '#' },  // Ré # Maior
    Es: { valor: 'E#', acidentes: 11, tipo: '#' }, // Mi # Maior
    Fs: { valor: 'F#', acidentes: 6, tipo: '#' },  // Fá # Maior
    Gs: { valor: 'G#', acidentes: 8, tipo: '#' },  // Sol # Maior

    // --- MENORES NATURAIS ---
    Am: { valor: 'Am', acidentes: 0, tipo: 'n' }, // Lá Menor
    Bm: { valor: 'Bm', acidentes: 2, tipo: '#' }, // Si Menor
    Cm: { valor: 'Cm', acidentes: 3, tipo: 'b' }, // Dó Menor
    Dm: { valor: 'Dm', acidentes: 1, tipo: 'b' }, // Ré Menor
    Em: { valor: 'Em', acidentes: 1, tipo: '#' }, // Mi Menor
    Fm: { valor: 'Fm', acidentes: 4, tipo: 'b' }, // Fá Menor
    Gm: { valor: 'Gm', acidentes: 2, tipo: 'b' }, // Sol Menor

    // --- MENORES BEMÓIS ---
    Abm: { valor: 'Abm', acidentes: 7, tipo: 'b' }, // Lá b Menor
    Bbm: { valor: 'Bbm', acidentes: 5, tipo: 'b' }, // Si b Menor
    Cbm: { valor: 'Cbm', acidentes: 7, tipo: 'b' }, // Dó b Menor
    Dbm: { valor: 'Dbm', acidentes: 5, tipo: 'b' }, // Ré b Menor
    Ebm: { valor: 'Ebm', acidentes: 6, tipo: 'b' }, // Mi b Menor
    Fbm: { valor: 'Fbm', acidentes: 8, tipo: 'b' }, // Fá b Menor
    Gbm: { valor: 'Gbm', acidentes: 6, tipo: 'b' }, // Sol b Menor

    // --- MENORES SUSTENIDOS ---
    Asm: { valor: 'A#m', acidentes: 7, tipo: '#' },  // Lá # Menor
    Bsm: { valor: 'B#m', acidentes: 9, tipo: '#' },  // Si # Menor
    Csm: { valor: 'C#m', acidentes: 4, tipo: '#' },  // Dó # Menor
    Dsm: { valor: 'D#m', acidentes: 6, tipo: '#' },  // Ré # Menor
    Esm: { valor: 'E#m', acidentes: 8, tipo: '#' },  // Mi # Menor
    Fsm: { valor: 'F#m', acidentes: 3, tipo: '#' },  // Fá # Menor
    Gsm: { valor: 'G#m', acidentes: 5, tipo: '#' }   // Sol # Menor
});
