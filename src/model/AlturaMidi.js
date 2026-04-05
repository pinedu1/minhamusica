class AlturaMid {
    constructor(midi, abcjs) {
        this.midi = midi;
        this.abcjs = abcjs;
    }
}
/**
 * Dicionário estático de instâncias de AlturaMidi.
 * Organizado por oitava científica.
 */
export const AlturaMidi = Object.freeze({
    // --- Oitava 2 (Grave - Bordões da Viola) ---
    C2:  new AlturaMid(36, "C,,"),  Cs2: new AlturaMid(37, "^C,,"),
    D2:  new AlturaMid(38, "D,,"),  Ds2: new AlturaMid(39, "^D,,"),
    E2:  new AlturaMid(40, "E,,"),  F2:  new AlturaMid(41, "F,,"),
    Fs2: new AlturaMid(42, "^F,,"), G2:  new AlturaMid(43, "G,,"),
    Gs2: new AlturaMid(44, "^G,,"), A2:  new AlturaMid(45, "A,,"),
    As2: new AlturaMid(46, "^A,,"), B2:  new AlturaMid(47, "B,,"),

    // --- Oitava 3 ---
    C3:  new AlturaMid(48, "C,"),   Cs3: new AlturaMid(49, "^C,"),
    D3:  new AlturaMid(50, "D,"),   Ds3: new AlturaMid(51, "^D,"),
    E3:  new AlturaMid(52, "E,"),   F3:  new AlturaMid(53, "F,"),
    Fs3: new AlturaMid(54, "^F,"),  G3:  new AlturaMid(55, "G,"),
    Gs3: new AlturaMid(56, "^G,"),  A3:  new AlturaMid(57, "A,"),
    As3: new AlturaMid(58, "^A,"),  B3:  new AlturaMid(59, "B,"),

    // --- Oitava 4 (Dó Central = 60) ---
    C4:  new AlturaMid(60, "C"),    Cs4: new AlturaMid(61, "^C"),
    D4:  new AlturaMid(62, "D"),    Ds4: new AlturaMid(63, "^D"),
    E4:  new AlturaMid(64, "E"),    F4:  new AlturaMid(65, "F"),
    Fs4: new AlturaMid(66, "^F"),   G4:  new AlturaMid(67, "G"),
    Gs4: new AlturaMid(68, "^G"),   A4:  new AlturaMid(69, "A"),
    As4: new AlturaMid(70, "^A"),   B4:  new AlturaMid(71, "B"),

    // --- Oitava 5 (Agudas / Primas) ---
    C5:  new AlturaMid(72, "c"),    Cs5: new AlturaMid(73, "^c"),
    D5:  new AlturaMid(74, "d"),    Ds5: new AlturaMid(75, "^d"),
    E5:  new AlturaMid(76, "e"),    F5:  new AlturaMid(77, "f"),
    Fs5: new AlturaMid(78, "^f"),   G5:  new AlturaMid(79, "g"),
    Gs5: new AlturaMid(80, "^g"),   A5:  new AlturaMid(81, "a"),
    As5: new AlturaMid(82, "^a"),   B5:  new AlturaMid(83, "b"),

    // --- Oitava 6 (Extremo Agudo) ---
    C6:  new AlturaMid(84, "c'"),   E6:  new AlturaMid(88, "e'")
});