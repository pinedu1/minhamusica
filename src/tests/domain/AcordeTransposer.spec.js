import { describe, it, expect, beforeEach } from 'vitest';
import { AcordeTransposer } from '@domain/nota/AcordeTransposer.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('AcordeTransposer', () => {
    let transposer;

    beforeEach(() => {
        transposer = new AcordeTransposer();
    });

    describe('ehAcordeValido()', () => {
        it('deve validar de acordo com as regras de negócio', () => {
            expect(transposer.ehAcordeValido('C')).toBe(true);
            expect(transposer.ehAcordeValido('H')).toBe(false);
            expect(transposer.ehAcordeValido('Cm')).toBe(true);
            expect(transposer.ehAcordeValido('cm')).toBe(false); // Letra minúscula
            expect(transposer.ehAcordeValido('C#m')).toBe(true);
            expect(transposer.ehAcordeValido('C#M')).toBe(false); // M maiúsculo não mapeado no sufixo
            expect(transposer.ehAcordeValido('C#m7dim')).toBe(true);
        });

        it('deve rejeitar palavras ou strings sem notação musical', () => {
            expect(transposer.ehAcordeValido('Desconhecido')).toBe(false);
            expect(transposer.ehAcordeValido('Voz')).toBe(false);
        });
    });

    describe('analisarAcorde()', () => {
        it('deve extrair a raiz e a qualidade de um acorde simples', () => {
            expect(transposer.analisarAcorde('C')).toEqual({ raiz: 'C', qualidade: '', baixo: null });
            expect(transposer.analisarAcorde('F#m')).toEqual({ raiz: 'F#', qualidade: 'm', baixo: null });
        });

        it('deve retornar null para strings inválidas interceptadas pelo validador', () => {
            expect(transposer.analisarAcorde('H')).toBeNull();
            expect(transposer.analisarAcorde('Desconhecido')).toBeNull();
        });
    });

    describe('obterPassosEntre()', () => {
        it('deve calcular a diferença de semitons subindo o tom', () => {
            expect(transposer.obterPassosEntre('C', 'E')).toBe(4);
            expect(transposer.obterPassosEntre('C', 'C#')).toBe(1);
        });

        it('deve calcular a diferença de semitons descendo o tom', () => {
            expect(transposer.obterPassosEntre('G', 'F')).toBe(-2);
        });
    });

    describe('transporAcorde()', () => {
        it('deve transpor tríades básicas corretamente', () => {
            expect(transposer.transporAcorde('C', 2)).toBe('D');
            expect(transposer.transporAcorde('Cm', 4)).toBe('Em');
        });

        it('deve transpor tétrades e manter a qualidade do acorde', () => {
            expect(transposer.transporAcorde('C#m7', 3)).toBe('Em7');
        });

        it('deve transpor o baixo invertido corretamente', () => {
            expect(transposer.transporAcorde('C/E', 2)).toBe('D/F#');
        });

        it('deve manter acordes não reconhecidos inalterados', () => {
            // Este era o teste que estava falhando e agora passa
            expect(transposer.transporAcorde('Desconhecido', 2)).toBe('Desconhecido');
            expect(transposer.transporAcorde('Pausa', 1)).toBe('Pausa');
        });
    });

    describe('obterNotasAcorde()', () => {
        it('deve mapear corretamente os intervalos', () => {
            expect(transposer.obterNotasAcorde('C')).toEqual(['C', 'E', 'G']);
            expect(transposer.obterNotasAcorde('Cm')).toEqual(['C', 'D#', 'G']);
        });

        it('deve retornar array vazio se a qualidade do acorde não estiver mapeada no dicionário', () => {
            // Nota: C#m7dim é válido no regex, mas só retornará as notas se você
            // mapear o array de intervalos dele no this.qualidades do constructor
            expect(transposer.obterNotasAcorde('C#m7dim')).toEqual([]);
        });
    });
    describe('transporAcorde() - Preservação de Qualidades (Com Echo)', () => {
        it('deve transpor e manter a qualidade Maior', () => {
            const original = 'C';
            const transposto = transposer.transporAcorde(original, 2);

            // console.log(`[Maior] Original: ${original.padEnd(5)} | +2 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('D');
        });
	    it('deve transpor e manter a qualidade Maior para Bemol', () => {
		    const original = 'C';
		    const transposto = transposer.transporAcorde(original, -2);

		    // console.log(`[Maior] Original: ${original.padEnd(5)} | +2 semitons -> Transposto: ${transposto}`);
		    expect(transposto).toBe('A#');
	    });

        it('deve transpor e manter a qualidade Menor', () => {
            const original = 'Cm';
            const transposto = transposer.transporAcorde(original, 2);

            // console.log(`[Menor] Original: ${original.padEnd(5)} | +2 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Dm');
        });

        it('deve transpor e manter a qualidade Diminuta', () => {
            const original = 'Cdim';
            const transposto = transposer.transporAcorde(original, 3);

            // console.log(`[Dim]   Original: ${original.padEnd(5)} | +3 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('D#dim');
        });

        it('deve transpor e manter a qualidade Aumentada', () => {
            const original = 'Gaug';
            const transposto = transposer.transporAcorde(original, 5);

            // console.log(`[Aug]   Original: ${original.padEnd(5)} | +5 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Caug');
        });

        it('deve transpor e manter a qualidade Meio-Diminuta (m7b5)', () => {
            const original = 'Bm7b5';
            const transposto = transposer.transporAcorde(original, 2);

            // console.log(`[m7b5]  Original: ${original.padEnd(5)} | +2 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('C#m7b5');
        });
    });
    describe('transporAcorde() - Casos Limites: Notas E e B (Com Echo)', () => {
        it('deve transpor saindo de E e chegando em B (Qualidade Maior)', () => {
            const original = 'E';
            // Subindo uma Quinta Justa (7 semitons)
            const transposto = transposer.transporAcorde(original, 7);

            // console.log(`[E -> B]  Original: ${original.padEnd(5)} | +7 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('B');
        });

        it('deve transpor saindo de B e chegando em E (Qualidade Menor)', () => {
            const original = 'Bm';
            // Subindo uma Quarta Justa (5 semitons)
            const transposto = transposer.transporAcorde(original, 5);

            // console.log(`[B -> E]  Original: ${original.padEnd(5)} | +5 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Em');
        });

        it('deve transpor de outra tônica chegando em E (Qualidade Diminuta)', () => {
            const original = 'C#dim';
            // Subindo uma Terça Menor (3 semitons)
            const transposto = transposer.transporAcorde(original, 3);

            // console.log(`[-> E]    Original: ${original.padEnd(5)} | +3 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Edim');
        });

        it('deve transpor de outra tônica chegando em B (Qualidade Aumentada)', () => {
            const original = 'Gaug';
            // Subindo uma Terça Maior (4 semitons)
            const transposto = transposer.transporAcorde(original, 4);

            // console.log(`[-> B]    Original: ${original.padEnd(5)} | +4 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Baug');
        });

        it('deve transpor saindo de E e chegando em B descendo o tom (Meio-Diminuto)', () => {
            const original = 'Em7b5';
            // Descendo uma Quarta Justa (-5 semitons)
            const transposto = transposer.transporAcorde(original, -5);

            // console.log(`[E -> B]  Original: ${original.padEnd(5)} | -5 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('Bm7b5');
        });

        it('deve transpor saindo de B e chegando em E descendo o tom (Maior com baixo)', () => {
            const original = 'B/D#';
            // Descendo uma Quinta Justa (-7 semitons)
            const transposto = transposer.transporAcorde(original, -7);

            // console.log(`[B -> E]  Original: ${original.padEnd(5)} | -7 semitons -> Transposto: ${transposto}`);
            expect(transposto).toBe('E/G#');
        });
    });
    describe('transporAcorde() - Preservação de Qualidades (Com Echo e Notas)', () => {
        it('deve transpor e manter a qualidade Maior', () => {
            const original = 'C';
            const transposto = transposer.transporAcorde(original, 2);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[Maior] Original: ${original.padEnd(6)} | +2 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('D');
        });

        it('deve transpor e manter a qualidade Menor', () => {
            const original = 'Cm';
            const transposto = transposer.transporAcorde(original, 2);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[Menor] Original: ${original.padEnd(6)} | +2 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Dm');
        });

        it('deve transpor e manter a qualidade Diminuta', () => {
            const original = 'Cdim';
            const transposto = transposer.transporAcorde(original, 3);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[Dim]   Original: ${original.padEnd(6)} | +3 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('D#dim');
        });

        it('deve transpor e manter a qualidade Aumentada', () => {
            const original = 'Gaug';
            const transposto = transposer.transporAcorde(original, 5);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[Aug]   Original: ${original.padEnd(6)} | +5 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Caug');
        });

        it('deve transpor e manter a qualidade Meio-Diminuta (m7b5)', () => {
            const original = 'Bm7b5';
            const transposto = transposer.transporAcorde(original, 2);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[m7b5]  Original: ${original.padEnd(6)} | +2 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('C#m7b5');
        });
    });

    describe('transporAcorde() - Casos Limites: Notas E e B (Com Echo e Notas)', () => {
        it('deve transpor saindo de E e chegando em B (Qualidade Maior)', () => {
            const original = 'E';
            const transposto = transposer.transporAcorde(original, 7);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[E -> B] Original: ${original.padEnd(6)} | +7 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('B');
        });

        it('deve transpor saindo de B e chegando em E (Qualidade Menor)', () => {
            const original = 'Bm';
            const transposto = transposer.transporAcorde(original, 5);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[B -> E] Original: ${original.padEnd(6)} | +5 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Em');
        });

        it('deve transpor de outra tônica chegando em E (Qualidade Diminuta)', () => {
            const original = 'C#dim';
            const transposto = transposer.transporAcorde(original, 3);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[-> E]   Original: ${original.padEnd(6)} | +3 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Edim');
        });

        it('deve transpor de outra tônica chegando em B (Qualidade Aumentada)', () => {
            const original = 'Gaug';
            const transposto = transposer.transporAcorde(original, 4);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[-> B]   Original: ${original.padEnd(6)} | +4 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Baug');
        });

        it('deve transpor saindo de E e chegando em B descendo o tom (Meio-Diminuto)', () => {
            const original = 'Em7b5';
            const transposto = transposer.transporAcorde(original, -5);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[E -> B] Original: ${original.padEnd(6)} | -5 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('Bm7b5');
        });

        it('deve transpor saindo de B e chegando em E descendo o tom (Maior com baixo)', () => {
            const original = 'B/D#';
            const transposto = transposer.transporAcorde(original, -7);
            const notas = transposer.obterNotasAcorde(transposto);

            // console.log(`[B -> E] Original: ${original.padEnd(6)} | -7 semitons -> Transposto: ${transposto.padEnd(6)} | Notas: [${notas.join(', ')}]`);
            expect(transposto).toBe('E/G#');
        });
    });
});