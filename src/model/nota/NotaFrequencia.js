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
     */
    constructor(midi, abc) {
        this.midi = midi;
        this.abc = abc;
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
     * Injetado automaticamente pelo processo de inicialização do módulo.
     * @returns {string}
     */
    get key() { return this.#key; }

    /** @param {string} val */
    set key(val) {
        this.#key = val;
        // Alimenta o mapa de busca por chave do dicionário
        NotaFrequencia.#keyLookupMap.set(val, this);
    }

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
      A1      : new NotaFrequencia( 33, "A,,,"  )
    , A2      : new NotaFrequencia( 45, "A,,"   )
    , A3      : new NotaFrequencia( 57, "A,"    )
    , A4      : new NotaFrequencia( 69, "A"     )
    , A5_ALT  : new NotaFrequencia( 81, "A'"    )
    , A5      : new NotaFrequencia( 81, "a"     )
    , A6_ALT  : new NotaFrequencia( 93, "a'"    )
    , A6      : new NotaFrequencia( 93, "a'"    )
    , Ab1     : new NotaFrequencia( 32, "_A,,," )
    , Ab2     : new NotaFrequencia( 44, "_A,,"  )
    , Ab3     : new NotaFrequencia( 56, "_A,"   )
    , Ab4     : new NotaFrequencia( 68, "_A"    )
    , Ab5_ALT : new NotaFrequencia( 80, "_A'"   )
    , Ab5     : new NotaFrequencia( 80, "_a"    )
    , Ab6_ALT : new NotaFrequencia( 92, "_A''"  )
    , Ab6     : new NotaFrequencia( 92, "_a'"   )
    , Ab7_ALT : new NotaFrequencia(104, "_A'''" )
    , Ab7     : new NotaFrequencia(104, "_a''"  )
    , Ab8_ALT : new NotaFrequencia(116, "_A''''")
    , Ab8     : new NotaFrequencia(116, "_a'''" )
    , Bb1     : new NotaFrequencia( 34, "_B,,," )
    , Bb2     : new NotaFrequencia( 46, "_B,,"  )
    , Bb3     : new NotaFrequencia( 58, "_B,"   )
    , Bb4     : new NotaFrequencia( 70, "_B"    )
    , Bb5     : new NotaFrequencia( 82, "_b"    )
    , Bb5_ALT : new NotaFrequencia( 82, "_B'"   )
    , Bb6     : new NotaFrequencia( 94, "_b'"   )
    , Bb6_ALT : new NotaFrequencia( 94, "_B''"  )
    , Bb7     : new NotaFrequencia(106, "_b''"  )
    , Bb7_ALT : new NotaFrequencia(106, "_B'''" )
    , Bb8     : new NotaFrequencia(118, "_b'''" )
    , Bb8_ALT : new NotaFrequencia(118, "_B''''")
    , B1      : new NotaFrequencia( 35, "B,,,"  )
    , B2      : new NotaFrequencia( 47, "B,,"   )
    , B3      : new NotaFrequencia( 59, "B,"    )
    , B4      : new NotaFrequencia( 71, "B"     )
    , B5      : new NotaFrequencia( 83, "b"     )
    , B5_ALT  : new NotaFrequencia( 83, "B'"    )
    , B6      : new NotaFrequencia( 95, "b'"    )
    , B6_ALT  : new NotaFrequencia( 95, "B''"   )
    , B7      : new NotaFrequencia(107, "b''"   )
    , B7_ALT  : new NotaFrequencia(107, "B'''"  )
    , B8      : new NotaFrequencia(119, "b'''"  )
    , B8_ALT  : new NotaFrequencia(119, "B''''" )

    , C1      : new NotaFrequencia( 24, "C,,,"  )
    , C2      : new NotaFrequencia( 36, "C,,"   )
    , C3      : new NotaFrequencia( 48, "C,"    )
    , C4      : new NotaFrequencia( 60, "C"     )
    , C5_ALT  : new NotaFrequencia( 72, "C'"    )
    , C5      : new NotaFrequencia( 72, "c"     )
    , C6_ALT  : new NotaFrequencia( 84, "C''"   )
    , C6      : new NotaFrequencia( 84, "c'"    )
    , C7_ALT  : new NotaFrequencia( 96, "C'''"  )
    , C7      : new NotaFrequencia( 96, "c''"   )
    , C8_ALT  : new NotaFrequencia(108, "C''''" )
    , C8      : new NotaFrequencia(108, "c'''"  )
    , Cb1     : new NotaFrequencia( 23, "_C,,," )
    , Cb2     : new NotaFrequencia( 35, "_C,,"  )
    , Cb3     : new NotaFrequencia( 47, "_C,"   )
    , Cb4     : new NotaFrequencia( 59, "_C"    )
    , Cb5_ALT : new NotaFrequencia( 71, "_C'"   )
    , Cb5     : new NotaFrequencia( 71, "_c"    )
    , Cb6_ALT : new NotaFrequencia( 83, "_C''"  )
    , Cb6     : new NotaFrequencia( 83, "_c'"   )
    , Cb7_ALT : new NotaFrequencia( 95, "_C'''" )
    , Cb7     : new NotaFrequencia( 95, "_c''"  )
    , Cb8_ALT : new NotaFrequencia(107, "_C''''")
    , Cb8     : new NotaFrequencia(107, "_c'''" )
    , Cs1     : new NotaFrequencia( 25, "^C,,," )
    , Cs2     : new NotaFrequencia( 37, "^C,,"  )
    , Cs3     : new NotaFrequencia( 49, "^C,"   )
    , Cs4     : new NotaFrequencia( 61, "^C"    )
    , Cs5_ALT : new NotaFrequencia( 73, "^C'"   )
    , Cs5     : new NotaFrequencia( 73, "^c"    )
    , Cs6_ALT : new NotaFrequencia( 85, "^C''"  )
    , Cs6     : new NotaFrequencia( 85, "^c'"   )
    , Cs7_ALT : new NotaFrequencia( 97, "^C'''" )
    , Cs7     : new NotaFrequencia( 97, "^c''"  )
    , Cs8_ALT : new NotaFrequencia(109, "^C''''")
    , Cs8     : new NotaFrequencia(109, "^c'''" )
    , D1      : new NotaFrequencia( 26, "D,,,"  )
    , D2      : new NotaFrequencia( 38, "D,,"   )
    , D3      : new NotaFrequencia( 50, "D,"    )
    , D4      : new NotaFrequencia( 62, "D"     )
    , D5_ALT  : new NotaFrequencia( 74, "D'"    )
    , D5      : new NotaFrequencia( 74, "d"     )
    , D6_ALT  : new NotaFrequencia( 86, "D''"   )
    , D6      : new NotaFrequencia( 86, "d'"    )
    , D7_ALT  : new NotaFrequencia( 98, "D'''"  )
    , D7      : new NotaFrequencia( 98, "d''"   )
    , D8_ALT  : new NotaFrequencia(110, "D''''" )
    , D8      : new NotaFrequencia(110, "d'''"  )
    , Db1     : new NotaFrequencia( 25, "_D,,," )
    , Db2     : new NotaFrequencia( 37, "_D,,"  )
    , Db3     : new NotaFrequencia( 49, "_D,"   )
    , Db4     : new NotaFrequencia( 61, "_D"    )
    , Db5_ALT : new NotaFrequencia( 73, "_D'"   )
    , Db5     : new NotaFrequencia( 73, "_d"    )
    , Db6_ALT : new NotaFrequencia( 85, "_D''"  )
    , Db6     : new NotaFrequencia( 85, "_d'"   )
    , Db7_ALT : new NotaFrequencia( 97, "_D'''" )
    , Db7     : new NotaFrequencia( 97, "_d''"  )
    , Db8_ALT : new NotaFrequencia(109, "_D''''")
    , Db8     : new NotaFrequencia(109, "_d'''" )
    , Ds1     : new NotaFrequencia( 27, "^D,,," )
    , Ds2     : new NotaFrequencia( 39, "^D,,"  )
    , Ds3     : new NotaFrequencia( 51, "^D,"   )
    , Ds4     : new NotaFrequencia( 63, "^D"    )
    , Ds5_ALT : new NotaFrequencia( 75, "^D'"   )
    , Ds5     : new NotaFrequencia( 75, "^d"    )
    , Ds6_ALT : new NotaFrequencia( 87, "^D''"  )
    , Ds6     : new NotaFrequencia( 87, "^d'"   )
    , Ds7_ALT : new NotaFrequencia( 99, "^D'''" )
    , Ds7     : new NotaFrequencia( 99, "^d''"  )
    , Ds8_ALT : new NotaFrequencia(111, "^D''''")
    , Ds8     : new NotaFrequencia(111, "^d'''" )
    , E1      : new NotaFrequencia( 28, "E,,,"  )
    , E2      : new NotaFrequencia( 40, "E,,"   )
    , E3      : new NotaFrequencia( 52, "E,"    )
    , E4      : new NotaFrequencia( 64, "E"     )
    , E5_ALT  : new NotaFrequencia( 76, "E'"    )
    , E5      : new NotaFrequencia( 76, "e"     )
    , E6_ALT  : new NotaFrequencia( 88, "E''"   )
    , E6      : new NotaFrequencia( 88, "e'"    )
    , E7_ALT  : new NotaFrequencia(100, "E'''"  )
    , E7      : new NotaFrequencia(100, "e''"   )
    , E8_ALT  : new NotaFrequencia(112, "E''''" )
    , E8      : new NotaFrequencia(112, "e'''"  )
    , Eb1     : new NotaFrequencia( 27, "_E,,," )
    , Eb2     : new NotaFrequencia( 39, "_E,,"  )
    , Eb3     : new NotaFrequencia( 51, "_E,"   )
    , Eb4     : new NotaFrequencia( 63, "_E"    )
    , Eb5_ALT : new NotaFrequencia( 75, "_E'"   )
    , Eb5     : new NotaFrequencia( 75, "_e"    )
    , Eb6_ALT : new NotaFrequencia( 87, "_E''"  )
    , Eb6     : new NotaFrequencia( 87, "_e'"   )
    , Eb7_ALT : new NotaFrequencia( 99, "_E'''" )
    , Eb7     : new NotaFrequencia( 99, "_e''"  )
    , Eb8_ALT : new NotaFrequencia(111, "_E''''")
    , Eb8     : new NotaFrequencia(111, "_e'''" )
    , F1      : new NotaFrequencia( 29, "F,,,"  )
    , F2      : new NotaFrequencia( 41, "F,,"   )
    , F3      : new NotaFrequencia( 53, "F,"    )
    , F4      : new NotaFrequencia( 65, "F"     )
    , F5_ALT  : new NotaFrequencia( 77, "F'"    )
    , F5      : new NotaFrequencia( 77, "f"     )
    , F6_ALT  : new NotaFrequencia( 89, "F''"   )
    , F6      : new NotaFrequencia( 89, "f'"    )
    , F7_ALT  : new NotaFrequencia(101, "F'''"  )
    , F7      : new NotaFrequencia(101, "f''"   )
    , F8_ALT  : new NotaFrequencia(113, "F''''" )
    , F8      : new NotaFrequencia(113, "f'''"  )
    , Fb1     : new NotaFrequencia( 28, "_F,,," )
    , Fb2     : new NotaFrequencia( 40, "_F,,"  )
    , Fb3     : new NotaFrequencia( 52, "_F,"   )
    , Fb4     : new NotaFrequencia( 64, "_F"    )
    , Fb5_ALT : new NotaFrequencia( 76, "_F'"   )
    , Fb5     : new NotaFrequencia( 76, "_f"    )
    , Fb6_ALT : new NotaFrequencia( 88, "_F''"  )
    , Fb6     : new NotaFrequencia( 88, "_f'"   )
    , Fb7_ALT : new NotaFrequencia(100, "_F'''" )
    , Fb7     : new NotaFrequencia(100, "_f''"  )
    , Fb8_ALT : new NotaFrequencia(112, "_F''''")
    , Fb8     : new NotaFrequencia(112, "_f'''" )
    , Fs1     : new NotaFrequencia( 30, "^F,,," )
    , Fs2     : new NotaFrequencia( 42, "^F,,"  )
    , Fs3     : new NotaFrequencia( 54, "^F,"   )
    , Fs4     : new NotaFrequencia( 66, "^F"    )
    , Fs5_ALT : new NotaFrequencia( 78, "^F'"   )
    , Fs5     : new NotaFrequencia( 78, "^f"    )
    , Fs6_ALT : new NotaFrequencia( 90, "^F''"  )
    , Fs6     : new NotaFrequencia( 90, "^f'"   )
    , Fs7_ALT : new NotaFrequencia(102, "^F'''" )
    , Fs7     : new NotaFrequencia(102, "^f''"  )
    , Fs8_ALT : new NotaFrequencia(114, "^F''''")
    , Fs8     : new NotaFrequencia(114, "^f'''" )
    , G1      : new NotaFrequencia( 31, "G,,,"  )
    , G2      : new NotaFrequencia( 43, "G,,"   )
    , G3      : new NotaFrequencia( 55, "G,"    )
    , G4      : new NotaFrequencia( 67, "G"     )
    , G5_ALT  : new NotaFrequencia( 79, "G'"    )
    , G5      : new NotaFrequencia( 79, "g"     )
    , G6_ALT  : new NotaFrequencia( 91, "G''"   )
    , G6      : new NotaFrequencia( 91, "g'"    )
    , G7_ALT  : new NotaFrequencia(103, "G'''"  )
    , G7      : new NotaFrequencia(103, "g''"   )
    , G8_ALT  : new NotaFrequencia(115, "G''''" )
    , G8      : new NotaFrequencia(115, "g'''"  )
    , Gb1     : new NotaFrequencia( 30, "_G,,," )
    , Gb2     : new NotaFrequencia( 42, "_G,,"  )
    , Gb3     : new NotaFrequencia( 54, "_G,"   )
    , Gb4     : new NotaFrequencia( 66, "_G"    )
    , Gb5_ALT : new NotaFrequencia( 78, "_G'"   )
    , Gb5     : new NotaFrequencia( 78, "_g"    )
    , Gb6_ALT : new NotaFrequencia( 90, "_G''"  )
    , Gb6     : new NotaFrequencia( 90, "_g'"   )
    , Gb7_ALT : new NotaFrequencia(102, "_G'''" )
    , Gb7     : new NotaFrequencia(102, "_g''"  )
    , Gb8_ALT : new NotaFrequencia(114, "_G''''")
    , Gb8     : new NotaFrequencia(114, "_g'''" )
    , Gs1     : new NotaFrequencia( 32, "^G,,," )
    , Gs2     : new NotaFrequencia( 44, "^G,,"  )
    , Gs3     : new NotaFrequencia( 56, "^G,"   )
    , Gs4     : new NotaFrequencia( 68, "^G"    )
    , Gs5_ALT : new NotaFrequencia( 80, "^G'"   )
    , Gs5     : new NotaFrequencia( 80, "^g"    )
    , Gs6_ALT : new NotaFrequencia( 92, "^G''"  )
    , Gs6     : new NotaFrequencia( 92, "^g'"   )
    , Gs7_ALT : new NotaFrequencia(104, "^G'''" )
    , Gs7     : new NotaFrequencia(104, "^g''"  )
    , Gs8_ALT : new NotaFrequencia(116, "^G''''")
    , Gs8     : new NotaFrequencia(116, "^g'''" )
});

/**
 * PÓS-PROCESSAMENTO: Executado apenas uma vez no carregamento do módulo.
 * Alimenta os mapas de busca O(1) e injeta as chaves nas instâncias.
 */
for (const [key, instance] of Object.entries(NotaFrequenciaEnum)) {
    instance.key = key;
}
