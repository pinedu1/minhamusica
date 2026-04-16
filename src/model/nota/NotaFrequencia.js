/**
 * Representa a identidade física e tonal de uma nota musical.
 * Centraliza a relação entre o som (MIDI) e o símbolo (ABC), permitindo buscas instantâneas.
 */
export class NotaFrequencia {
    /** @type {number} */
    #midi;
    /** @type {string} */
    #abc;
    /** @type {string} */
    #key;

    /** @type {Map<string, NotaFrequencia>} */
    static #abcLookupMap = new Map();

    /** @type {Map<string, NotaFrequencia>} */
    static #keyLookupMap = new Map();

    /**
     * @param {number} midi - Valor numérico MIDI.
     * @param {string} abc - Notação ABC correspondente.
     * @param {string} key - Chave identificadora da nota (ex: "C4").
     */
    constructor(midi, abc, key) {
        this.midi = midi;
        this.abc = abc;
        this.#key = key; // Set key directly
        NotaFrequencia.#keyLookupMap.set(key, this); // Populate keyLookupMap in constructor
    }

    /** @returns {number} */
    get midi() { return this.#midi; }

    /**
     * @param {number} midi
     * @throws {TypeError} Se não for um número inteiro.
     */
    set midi(midi) {
        if (!Number.isInteger(midi)) {
            throw new TypeError(`O valor Midi deve ser um número inteiro. Recebido: ${midi}`);
        }
        this.#midi = midi;
    }

    /** @returns {string} */
    get abc() { return this.#abc; }

    /**
     * @param {string} abc
     * @throws {TypeError} Se não for uma string válida.
     */
    set abc(abc) {
        if (typeof abc !== 'string' || abc.trim() === '') {
            throw new TypeError(`A notação ABC deve ser uma string não vazia. Recebido: ${abc}`);
        }
        this.#abc = abc;
        // Alimenta o mapa de busca por notação ABC
        NotaFrequencia.#abcLookupMap.set(abc, this);
    }

    /**
     * USAGE: Identificador único baseado na chave do dicionário interno (ex: "A4").
     * @returns {string}
     */
    get key() { return this.#key; }

    /**
     * USAGE: Retorna a oitava científica (ex: 4 para o Dó Central).
     * @returns {number}
     */
    get oitava() {
        return Math.floor(this.midi / 12) - 1;
    }

    /**
     * USAGE: Busca instantânea (O(1)) de uma NotaFrequencia pela sua notação ABC.
     * @param {string} abcString - Ex: "C", "^F,", "_g'"
     * @returns {NotaFrequencia|undefined}
     */
    static getByAbc(abcString) {
        return NotaFrequencia.#abcLookupMap.get(abcString);
    }

    /**
     * USAGE: Busca instantânea (O(1)) pela chave identificadora da nota.
     * @param {string} key - Ex: "C4", "Gs5_ALT", "Ab3"
     * @returns {NotaFrequencia|undefined}
     */
    static getByKey(key) {
        return NotaFrequencia.#keyLookupMap.get(key);
    }

    /**
     * USAGE: Fornece a nota padrão do sistema (Dó Central - C4).
     * @returns {NotaFrequencia}
     */
    static get DEFAULT() {
        return NotaFrequencia.getByKey("C4");
    }

    /**
     * USAGE: Resolve uma string ABC para uma instância de NotaFrequencia.
     * Se a nota não for encontrada, retorna a nota padrão (C4).
     * @param {string} str - Notação ABC.
     * @returns {NotaFrequencia}
     */
    static resolverAltura(str) {
        return NotaFrequencia.getByAbc(str) || NotaFrequencia.DEFAULT;
    }

    /**
     * USAGE: Retorna a lista completa de notas disponíveis no sistema.
     * @returns {Array<NotaFrequencia>}
     */
    static list() {
        return Array.from(NotaFrequencia.#keyLookupMap.values());
    }
}

/**
 * DICIONÁRIO PRIVADO: Contém todas as instâncias de NotaFrequencia indexadas.
 * O dicionário é encapsulado dentro do módulo, protegendo a integridade dos dados.
 */
const NotaFrequenciaEnum = Object.freeze({
      A1      : new NotaFrequencia( 33, "A,,,", "A1" )
    , A2      : new NotaFrequencia( 45, "A,,", "A2" )
    , A3      : new NotaFrequencia( 57, "A,", "A3" )
    , A4      : new NotaFrequencia( 69, "A", "A4" )
    , A5_ALT  : new NotaFrequencia( 81, "A'", "A5_ALT" )
    , A5      : new NotaFrequencia( 81, "a", "A5" )
    , A6_ALT  : new NotaFrequencia( 93, "a'", "A6_ALT" )
    , A6      : new NotaFrequencia( 93, "a'", "A6" )
    , Ab1     : new NotaFrequencia( 32, "_A,,,", "Ab1" )
    , Ab2     : new NotaFrequencia( 44, "_A,,", "Ab2" )
    , Ab3     : new NotaFrequencia( 56, "_A,", "Ab3" )
    , Ab4     : new NotaFrequencia( 68, "_A", "Ab4" )
    , Ab5_ALT : new NotaFrequencia( 80, "_A'", "Ab5_ALT" )
    , Ab5     : new NotaFrequencia( 80, "_a", "Ab5" )
    , Ab6_ALT : new NotaFrequencia( 92, "_A''", "Ab6_ALT" )
    , Ab6     : new NotaFrequencia( 92, "_a'", "Ab6" )
    , Ab7_ALT : new NotaFrequencia(104, "_A'''", "Ab7_ALT" )
    , Ab7     : new NotaFrequencia(104, "_a''", "Ab7" )
    , Ab8_ALT : new NotaFrequencia(116, "_A''''", "Ab8_ALT" )
    , Ab8     : new NotaFrequencia(116, "_a'''", "Ab8" )
    , Bb1     : new NotaFrequencia( 34, "_B,,,", "Bb1" )
    , Bb2     : new NotaFrequencia( 46, "_B,,", "Bb2" )
    , Bb3     : new NotaFrequencia( 58, "_B,", "Bb3" )
    , Bb4     : new NotaFrequencia( 70, "_B", "Bb4" )
    , Bb5     : new NotaFrequencia( 82, "_b", "Bb5" )
    , Bb5_ALT : new NotaFrequencia( 82, "_B'", "Bb5_ALT" )
    , Bb6     : new NotaFrequencia( 94, "_b'", "Bb6" )
    , Bb6_ALT : new NotaFrequencia( 94, "_B''", "Bb6_ALT" )
    , Bb7     : new NotaFrequencia(106, "_b''", "Bb7" )
    , Bb7_ALT : new NotaFrequencia(106, "_B'''", "Bb7_ALT" )
    , Bb8     : new NotaFrequencia(118, "_b'''", "Bb8" )
    , Bb8_ALT : new NotaFrequencia(118, "_B''''", "Bb8_ALT" )
    , B1      : new NotaFrequencia( 35, "B,,,", "B1" )
    , B2      : new NotaFrequencia( 47, "B,,", "B2" )
    , B3      : new NotaFrequencia( 59, "B,", "B3" )
    , B4      : new NotaFrequencia( 71, "B", "B4" )
    , B5      : new NotaFrequencia( 83, "b", "B5" )
    , B5_ALT  : new NotaFrequencia( 83, "B'", "B5_ALT" )
    , B6      : new NotaFrequencia( 95, "b'", "B6" )
    , B6_ALT  : new NotaFrequencia( 95, "B''", "B6_ALT" )
    , B7      : new NotaFrequencia(107, "b''", "B7" )
    , B7_ALT  : new NotaFrequencia(107, "B'''", "B7_ALT" )
    , B8      : new NotaFrequencia(119, "b'''", "B8" )
    , B8_ALT  : new NotaFrequencia(119, "B''''", "B8_ALT" )

    , C1      : new NotaFrequencia( 24, "C,,,", "C1" )
    , C2      : new NotaFrequencia( 36, "C,,", "C2" )
    , C3      : new NotaFrequencia( 48, "C,", "C3" )
    , C4      : new NotaFrequencia( 60, "C", "C4" )
    , C5_ALT  : new NotaFrequencia( 72, "C'", "C5_ALT" )
    , C5      : new NotaFrequencia( 72, "c", "C5" )
    , C6_ALT  : new NotaFrequencia( 84, "C''", "C6_ALT" )
    , C6      : new NotaFrequencia( 84, "c'", "C6" )
    , C7_ALT  : new NotaFrequencia( 96, "C'''", "C7_ALT" )
    , C7      : new NotaFrequencia( 96, "c''", "C7" )
    , C8_ALT  : new NotaFrequencia(108, "C''''", "C8_ALT" )
    , C8      : new NotaFrequencia(108, "c'''", "C8" )
    , Cb1     : new NotaFrequencia( 23, "_C,,,", "Cb1" )
    , Cb2     : new NotaFrequencia( 35, "_C,,", "Cb2" )
    , Cb3     : new NotaFrequencia( 47, "_C,", "Cb3" )
    , Cb4     : new NotaFrequencia( 59, "_C", "Cb4" )
    , Cb5_ALT : new NotaFrequencia( 71, "_C'", "Cb5_ALT" )
    , Cb5     : new NotaFrequencia( 71, "_c", "Cb5" )
    , Cb6_ALT : new NotaFrequencia( 83, "_C''", "Cb6_ALT" )
    , Cb6     : new NotaFrequencia( 83, "_c'", "Cb6" )
    , Cb7_ALT : new NotaFrequencia( 95, "_C'''", "Cb7_ALT" )
    , Cb7     : new NotaFrequencia( 95, "_c''", "Cb7" )
    , Cb8_ALT : new NotaFrequencia(107, "_C''''", "Cb8_ALT" )
    , Cb8     : new NotaFrequencia(107, "_c'''", "Cb8" )
    , Cs1     : new NotaFrequencia( 25, "^C,,,", "Cs1" )
    , Cs2     : new NotaFrequencia( 37, "^C,,", "Cs2" )
    , Cs3     : new NotaFrequencia( 49, "^C,", "Cs3" )
    , Cs4     : new NotaFrequencia( 61, "^C", "Cs4" )
    , Cs5_ALT : new NotaFrequencia( 73, "^C'", "Cs5_ALT" )
    , Cs5     : new NotaFrequencia( 73, "^c", "Cs5" )
    , Cs6_ALT : new NotaFrequencia( 85, "^C''", "Cs6_ALT" )
    , Cs6     : new NotaFrequencia( 85, "^c'", "Cs6" )
    , Cs7_ALT : new NotaFrequencia( 97, "^C'''", "Cs7_ALT" )
    , Cs7     : new NotaFrequencia( 97, "^c''", "Cs7" )
    , Cs8_ALT : new NotaFrequencia(109, "^C''''", "Cs8_ALT" )
    , Cs8     : new NotaFrequencia(109, "^c'''", "Cs8" )
    , D1      : new NotaFrequencia( 26, "D,,,", "D1" )
    , D2      : new NotaFrequencia( 38, "D,,", "D2" )
    , D3      : new NotaFrequencia( 50, "D,", "D3" )
    , D4      : new NotaFrequencia( 62, "D", "D4" )
    , D5_ALT  : new NotaFrequencia( 74, "D'", "D5_ALT" )
    , D5      : new NotaFrequencia( 74, "d", "D5" )
    , D6_ALT  : new NotaFrequencia( 86, "D''", "D6_ALT" )
    , D6      : new NotaFrequencia( 86, "d'", "D6" )
    , D7_ALT  : new NotaFrequencia( 98, "D'''", "D7_ALT" )
    , D7      : new NotaFrequencia( 98, "d''", "D7" )
    , D8_ALT  : new NotaFrequencia(110, "D''''", "D8_ALT" )
    , D8      : new NotaFrequencia(110, "d'''", "D8" )
    , Db1     : new NotaFrequencia( 25, "_D,,,", "Db1" )
    , Db2     : new NotaFrequencia( 37, "_D,,", "Db2" )
    , Db3     : new NotaFrequencia( 49, "_D,", "Db3" )
    , Db4     : new NotaFrequencia( 61, "_D", "Db4" )
    , Db5_ALT : new NotaFrequencia( 73, "_D'", "Db5_ALT" )
    , Db5     : new NotaFrequencia( 73, "_d", "Db5" )
    , Db6_ALT : new NotaFrequencia( 85, "_D''", "Db6_ALT" )
    , Db6     : new NotaFrequencia( 85, "_d'", "Db6" )
    , Db7_ALT : new NotaFrequencia( 97, "_D'''", "Db7_ALT" )
    , Db7     : new NotaFrequencia( 97, "_d''", "Db7" )
    , Db8_ALT : new NotaFrequencia(109, "_D''''", "Db8_ALT" )
    , Db8     : new NotaFrequencia(109, "_d'''", "Db8" )
    , Ds1     : new NotaFrequencia( 27, "^D,,,", "Ds1" )
    , Ds2     : new NotaFrequencia( 39, "^D,,", "Ds2" )
    , Ds3     : new NotaFrequencia( 51, "^D,", "Ds3" )
    , Ds4     : new NotaFrequencia( 63, "^D", "Ds4" )
    , Ds5_ALT : new NotaFrequencia( 75, "^D'", "Ds5_ALT" )
    , Ds5     : new NotaFrequencia( 75, "^d", "Ds5" )
    , Ds6_ALT : new NotaFrequencia( 87, "^D''", "Ds6_ALT" )
    , Ds6     : new NotaFrequencia( 87, "^d'", "Ds6" )
    , Ds7_ALT : new NotaFrequencia( 99, "^D'''", "Ds7_ALT" )
    , Ds7     : new NotaFrequencia( 99, "^d''", "Ds7" )
    , Ds8_ALT : new NotaFrequencia(111, "^D''''", "Ds8_ALT" )
    , Ds8     : new NotaFrequencia(111, "^d'''", "Ds8" )
    , E1      : new NotaFrequencia( 28, "E,,,", "E1" )
    , E2      : new NotaFrequencia( 40, "E,,", "E2" )
    , E3      : new NotaFrequencia( 52, "E,", "E3" )
    , E4      : new NotaFrequencia( 64, "E", "E4" )
    , E5_ALT  : new NotaFrequencia( 76, "E'", "E5_ALT" )
    , E5      : new NotaFrequencia( 76, "e", "E5" )
    , E6_ALT  : new NotaFrequencia( 88, "E''", "E6_ALT" )
    , E6      : new NotaFrequencia( 88, "e'", "E6" )
    , E7_ALT  : new NotaFrequencia(100, "E'''", "E7_ALT" )
    , E7      : new NotaFrequencia(100, "e''", "E7" )
    , E8_ALT  : new NotaFrequencia(112, "E''''", "E8_ALT" )
    , E8      : new NotaFrequencia(112, "e'''", "E8" )
    , Eb1     : new NotaFrequencia( 27, "_E,,,", "Eb1" )
    , Eb2     : new NotaFrequencia( 39, "_E,,", "Eb2" )
    , Eb3     : new NotaFrequencia( 51, "_E,", "Eb3" )
    , Eb4     : new NotaFrequencia( 63, "_E", "Eb4" )
    , Eb5_ALT : new NotaFrequencia( 75, "_E'", "Eb5_ALT" )
    , Eb5     : new NotaFrequencia( 75, "_e", "Eb5" )
    , Eb6_ALT : new NotaFrequencia( 87, "_E''", "Eb6_ALT" )
    , Eb6     : new NotaFrequencia( 87, "_e'", "Eb6" )
    , Eb7_ALT : new NotaFrequencia( 99, "_E'''", "Eb7_ALT" )
    , Eb7     : new NotaFrequencia( 99, "_e''", "Eb7" )
    , Eb8_ALT : new NotaFrequencia(111, "_E''''", "Eb8_ALT" )
    , Eb8     : new NotaFrequencia(111, "_e'''", "Eb8" )
    , F1      : new NotaFrequencia( 29, "F,,,", "F1" )
    , F2      : new NotaFrequencia( 41, "F,,", "F2" )
    , F3      : new NotaFrequencia( 53, "F,", "F3" )
    , F4      : new NotaFrequencia( 65, "F", "F4" )
    , F5_ALT  : new NotaFrequencia( 77, "F'", "F5_ALT" )
    , F5      : new NotaFrequencia( 77, "f", "F5" )
    , F6_ALT  : new NotaFrequencia( 89, "F''", "F6_ALT" )
    , F6      : new NotaFrequencia( 89, "f'", "F6" )
    , F7_ALT  : new NotaFrequencia(101, "F'''", "F7_ALT" )
    , F7      : new NotaFrequencia(101, "f''", "F7" )
    , F8_ALT  : new NotaFrequencia(113, "F''''", "F8_ALT" )
    , F8      : new NotaFrequencia(113, "f'''", "F8" )
    , Fb1     : new NotaFrequencia( 28, "_F,,,", "Fb1" )
    , Fb2     : new NotaFrequencia( 40, "_F,,", "Fb2" )
    , Fb3     : new NotaFrequencia( 52, "_F,", "Fb3" )
    , Fb4     : new NotaFrequencia( 64, "_F", "Fb4" )
    , Fb5_ALT : new NotaFrequencia( 76, "_F'", "Fb5_ALT" )
    , Fb5     : new NotaFrequencia( 76, "_f", "Fb5" )
    , Fb6_ALT : new NotaFrequencia( 88, "_F''", "Fb6_ALT" )
    , Fb6     : new NotaFrequencia( 88, "_f'", "Fb6" )
    , Fb7_ALT : new NotaFrequencia(100, "_F'''", "Fb7_ALT" )
    , Fb7     : new NotaFrequencia(100, "_f''", "Fb7" )
    , Fb8_ALT : new NotaFrequencia(112, "_F''''", "Fb8_ALT" )
    , Fb8     : new NotaFrequencia(112, "_f'''", "Fb8" )
    , Fs1     : new NotaFrequencia( 30, "^F,,,", "Fs1" )
    , Fs2     : new NotaFrequencia( 42, "^F,,", "Fs2" )
    , Fs3     : new NotaFrequencia( 54, "^F,", "Fs3" )
    , Fs4     : new NotaFrequencia( 66, "^F", "Fs4" )
    , Fs5_ALT : new NotaFrequencia( 78, "^F'", "Fs5_ALT" )
    , Fs5     : new NotaFrequencia( 78, "^f", "Fs5" )
    , Fs6_ALT : new NotaFrequencia( 90, "^F''", "Fs6_ALT" )
    , Fs6     : new NotaFrequencia( 90, "^f'", "Fs6" )
    , Fs7_ALT : new NotaFrequencia(102, "^F'''", "Fs7_ALT" )
    , Fs7     : new NotaFrequencia(102, "^f''", "Fs7" )
    , Fs8_ALT : new NotaFrequencia(114, "^F''''", "Fs8_ALT" )
    , Fs8     : new NotaFrequencia(114, "^f'''", "Fs8" )
    , G1      : new NotaFrequencia( 31, "G,,,", "G1" )
    , G2      : new NotaFrequencia( 43, "G,,", "G2" )
    , G3      : new NotaFrequencia( 55, "G,", "G3" )
    , G4      : new NotaFrequencia( 67, "G", "G4" )
    , G5_ALT  : new NotaFrequencia( 79, "G'", "G5_ALT" )
    , G5      : new NotaFrequencia( 79, "g", "G5" )
    , G6_ALT  : new NotaFrequencia( 91, "G''", "G6_ALT" )
    , G6      : new NotaFrequencia( 91, "g'", "G6" )
    , G7_ALT  : new NotaFrequencia(103, "G'''", "G7_ALT" )
    , G7      : new NotaFrequencia(103, "g''", "G7" )
    , G8_ALT  : new NotaFrequencia(115, "G''''", "G8_ALT" )
    , G8      : new NotaFrequencia(115, "g'''", "G8" )
    , Gb1     : new NotaFrequencia( 30, "_G,,,", "Gb1" )
    , Gb2     : new NotaFrequencia( 42, "_G,,", "Gb2" )
    , Gb3     : new NotaFrequencia( 54, "_G,", "Gb3" )
    , Gb4     : new NotaFrequencia( 66, "_G", "Gb4" )
    , Gb5_ALT : new NotaFrequencia( 78, "_G'", "Gb5_ALT" )
    , Gb5     : new NotaFrequencia( 78, "_g", "Gb5" )
    , Gb6_ALT : new NotaFrequencia( 90, "_G''", "Gb6_ALT" )
    , Gb6     : new NotaFrequencia( 90, "_g'", "Gb6" )
    , Gb7_ALT : new NotaFrequencia(102, "_G'''", "Gb7_ALT" )
    , Gb7     : new NotaFrequencia(102, "_g''", "Gb7" )
    , Gb8_ALT : new NotaFrequencia(114, "_G''''", "Gb8_ALT" )
    , Gb8     : new NotaFrequencia(114, "_g'''", "Gb8" )
    , Gs1     : new NotaFrequencia( 32, "^G,,,", "Gs1" )
    , Gs2     : new NotaFrequencia( 44, "^G,,", "Gs2" )
    , Gs3     : new NotaFrequencia( 56, "^G,", "Gs3" )
    , Gs4     : new NotaFrequencia( 68, "^G", "Gs4" )
    , Gs5_ALT : new NotaFrequencia( 80, "^G'", "Gs5_ALT" )
    , Gs5     : new NotaFrequencia( 80, "^g", "Gs5" )
    , Gs6_ALT : new NotaFrequencia( 92, "^G''", "Gs6_ALT" )
    , Gs6     : new NotaFrequencia( 92, "^g'", "Gs6" )
    , Gs7_ALT : new NotaFrequencia(104, "^G'''", "Gs7_ALT" )
    , Gs7     : new NotaFrequencia(104, "^g''", "Gs7" )
    , Gs8_ALT : new NotaFrequencia(116, "^G''''", "Gs8_ALT" )
    , Gs8     : new NotaFrequencia(116, "^g'''", "Gs8" )
});

export const notaChavesValidas = Object.keys(NotaFrequenciaEnum);
