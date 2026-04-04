/**
 * Dicionário estático de instâncias de AlturaMidi.
 * Organizado por oitava científica.
 */
export const AlturaMidi = Object.freeze({
    // --- Oitava 2 (Grave - Bordões da Viola) ---
    C2:  new AlturaMidi(36, "C,,"),  Cs2: new AlturaMidi(37, "^C,,"),
    D2:  new AlturaMidi(38, "D,,"),  Ds2: new AlturaMidi(39, "^D,,"),
    E2:  new AlturaMidi(40, "E,,"),  F2:  new AlturaMidi(41, "F,,"),
    Fs2: new AlturaMidi(42, "^F,,"), G2:  new AlturaMidi(43, "G,,"),
    Gs2: new AlturaMidi(44, "^G,,"), A2:  new AlturaMidi(45, "A,,"),
    As2: new AlturaMidi(46, "^A,,"), B2:  new AlturaMidi(47, "B,,"),

    // --- Oitava 3 ---
    C3:  new AlturaMidi(48, "C,"),   Cs3: new AlturaMidi(49, "^C,"),
    D3:  new AlturaMidi(50, "D,"),   Ds3: new AlturaMidi(51, "^D,"),
    E3:  new AlturaMidi(52, "E,"),   F3:  new AlturaMidi(53, "F,"),
    Fs3: new AlturaMidi(54, "^F,"),  G3:  new AlturaMidi(55, "G,"),
    Gs3: new AlturaMidi(56, "^G,"),  A3:  new AlturaMidi(57, "A,"),
    As3: new AlturaMidi(58, "^A,"),  B3:  new AlturaMidi(59, "B,"),

    // --- Oitava 4 (Dó Central = 60) ---
    C4:  new AlturaMidi(60, "C"),    Cs4: new AlturaMidi(61, "^C"),
    D4:  new AlturaMidi(62, "D"),    Ds4: new AlturaMidi(63, "^D"),
    E4:  new AlturaMidi(64, "E"),    F4:  new AlturaMidi(65, "F"),
    Fs4: new AlturaMidi(66, "^F"),   G4:  new AlturaMidi(67, "G"),
    Gs4: new AlturaMidi(68, "^G"),   A4:  new AlturaMidi(69, "A"),
    As4: new AlturaMidi(70, "^A"),   B4:  new AlturaMidi(71, "B"),

    // --- Oitava 5 (Agudas / Primas) ---
    C5:  new AlturaMidi(72, "c"),    Cs5: new AlturaMidi(73, "^c"),
    D5:  new AlturaMidi(74, "d"),    Ds5: new AlturaMidi(75, "^d"),
    E5:  new AlturaMidi(76, "e"),    F5:  new AlturaMidi(77, "f"),
    Fs5: new AlturaMidi(78, "^f"),   G5:  new AlturaMidi(79, "g"),
    Gs5: new AlturaMidi(80, "^g"),   A5:  new AlturaMidi(81, "a"),
    As5: new AlturaMidi(82, "^a"),   B5:  new AlturaMidi(83, "b"),

    // --- Oitava 6 (Extremo Agudo) ---
    C6:  new AlturaMidi(84, "c'"),   E6:  new AlturaMidi(88, "e'")
});