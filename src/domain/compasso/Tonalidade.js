export class Tonalidade {
    #tonalidade = null
    /**
     * USAGE: Construtor da Tonalidade.
     * @param tonalidade @type{string}
     */
    constructor(tonalidade) {
        this.#tonalidade = TonalidadeEnum[tonalidade] || TonalidadeEnum.C;
    }
	/**
	 * Retorna o array de todas as notas da escala
	 * @returns {string[]}
	 */
	get notas() {
		if (!this.#tonalidade) return [];
		return this.#tonalidade.notas || [];
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
 * TODO: Refatoração da Inteligência Musical (Roadmap 6 meses)
 * * @description
 * Atualmente, a gestão de tonalidades e escalas é feita via `TonalidadeEnum` estático.
 * Para suportar modulações complexas, enarmonias automáticas e modos gregos na
 * música raiz, recomenda-se migrar para bibliotecas de teoria musical especializadas.
 * * @see {@link https://github.com/tonaljs/tonal|Tonal.js} - Abordagem funcional e leve.
 * @see {@link https://github.com/saebekassebil/teoria|Teoria.js} - Abordagem orientada a objetos (POO).
 * * @example
 * // Instalação via terminal:
 * // npm install tonal teoria
 * * // Exemplo de uso futuro (Tonal.js):
 * // import { Key } from "tonal";
 * // const escala = Key.majorKey("F#").scale; // ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']
 * * @notes
 * 1. Manter a lógica de "Bubble Up" (hierarquia Obra > Voz > Compasso).
 * 2. As bibliotecas devem substituir apenas o fornecimento de dados (escalas/notas),
 * preservando o domínio de `TempoDuracao` para cálculos rítmicos.
 */
export const TonalidadeEnum = Object.freeze({
	// --- MAIORES NATURAIS ---
	A:  { valor: 'A',  acidentes: 3, tipo: '#', notas: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
	B:  { valor: 'B',  acidentes: 5, tipo: '#', notas: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
	C:  { valor: 'C',  acidentes: 0, tipo: 'n', notas: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
	D:  { valor: 'D',  acidentes: 2, tipo: '#', notas: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
	E:  { valor: 'E',  acidentes: 4, tipo: '#', notas: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
	F:  { valor: 'F',  acidentes: 1, tipo: 'b', notas: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
	G:  { valor: 'G',  acidentes: 1, tipo: '#', notas: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },

	// --- MAIORES BEMÓIS ---
	Ab: { valor: 'Ab', acidentes: 4, tipo: 'b', notas: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
	Bb: { valor: 'Bb', acidentes: 2, tipo: 'b', notas: ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A'] },
	Cb: { valor: 'Cb', acidentes: 7, tipo: 'b', notas: ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'] },
	Db: { valor: 'Db', acidentes: 5, tipo: 'b', notas: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
	Eb: { valor: 'Eb', acidentes: 3, tipo: 'b', notas: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
	Fb: { valor: 'Fb', acidentes: 8, tipo: 'b', notas: ['Fb', 'Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Eb'] },
	Gb: { valor: 'Gb', acidentes: 6, tipo: 'b', notas: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'] },

	// --- MAIORES SUSTENIDOS ---
	As: { valor: 'A#', acidentes: 10, tipo: '#', notas: ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G##'] },
	Bs: { valor: 'B#', acidentes: 12, tipo: '#', notas: ['B#', 'C##', 'D##', 'E#', 'F##', 'G##', 'A##'] },
	Cs: { valor: 'C#', acidentes: 7,  tipo: '#', notas: ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'] },
	Ds: { valor: 'D#', acidentes: 9,  tipo: '#', notas: ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'] },
	Es: { valor: 'E#', acidentes: 11, tipo: '#', notas: ['E#', 'F##', 'G##', 'A#', 'B#', 'C##', 'D##'] },
	Fs: { valor: 'F#', acidentes: 6,  tipo: '#', notas: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'] },
	Gs: { valor: 'G#', acidentes: 8,  tipo: '#', notas: ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'] },

	// --- MENORES NATURAIS ---
	Am: { valor: 'Am', acidentes: 0, tipo: 'n', notas: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
	Bm: { valor: 'Bm', acidentes: 2, tipo: '#', notas: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
	Cm: { valor: 'Cm', acidentes: 3, tipo: 'b', notas: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
	Dm: { valor: 'Dm', acidentes: 1, tipo: 'b', notas: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
	Em: { valor: 'Em', acidentes: 1, tipo: '#', notas: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
	Fm: { valor: 'Fm', acidentes: 4, tipo: 'b', notas: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'] },
	Gm: { valor: 'Gm', acidentes: 2, tipo: 'b', notas: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },

	// --- MENORES BEMÓIS ---
	Abm: { valor: 'Abm', acidentes: 7, tipo: 'b', notas: ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb'] },
	Bbm: { valor: 'Bbm', acidentes: 5, tipo: 'b', notas: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'] },
	Cbm: { valor: 'Cbm', acidentes: 7, tipo: 'b', notas: ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'] },
	Dbm: { valor: 'Dbm', acidentes: 5, tipo: 'b', notas: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb'] },
	Ebm: { valor: 'Ebm', acidentes: 6, tipo: 'b', notas: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'] },
	Fbm: { valor: 'Fbm', acidentes: 8, tipo: 'b', notas: ['Fb', 'Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Eb'] },
	Gbm: { valor: 'Gbm', acidentes: 6, tipo: 'b', notas: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb'] },

	// --- MENORES SUSTENIDOS ---
	Asm: { valor: 'A#m', acidentes: 7, tipo: '#', notas: ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'] },
	Bsm: { valor: 'B#m', acidentes: 9, tipo: '#', notas: ['B#', 'C##', 'D#', 'E#', 'F##', 'G#', 'A#'] },
	Csm: { valor: 'C#m', acidentes: 4, tipo: '#', notas: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'] },
	Dsm: { valor: 'D#m', acidentes: 6, tipo: '#', notas: ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'] },
	Esm: { valor: 'E#m', acidentes: 8, tipo: '#', notas: ['E#', 'F##', 'G#', 'A#', 'B#', 'C#', 'D#'] },
	Fsm: { valor: 'F#m', acidentes: 3, tipo: '#', notas: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'] },
	Gsm: { valor: 'G#m', acidentes: 5, tipo: '#', notas: ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'] }
});