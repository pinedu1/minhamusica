import { describe, it, expect } from 'vitest';
import { Nota } from '../model/nota/Nota.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';

describe('Classe Nota', () => {

    const ref14 = new TempoDuracao(1, 4); // L: 1/4

    describe('Funcionalidades Básicas', () => {
        it('deve calcular corretamente a razão rítmica sem sufixo quando duração == unidadeTempo', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14 });
            expect(nota.toAbc()).toBe("C");
        });

        it('deve calcular sufixo numérico quando duração for múltipla da unidadeTempo', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/2", unidadeTempo: ref14 });
            expect(nota.toAbc()).toBe("C2");
        });

        it('deve calcular sufixo de fração (/) quando duração for metade da unidadeTempo', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/8", unidadeTempo: ref14 });
            expect(nota.toAbc()).toBe("C/");
        });

        it('deve formatar corretamente acidentes locais (sustenido e bequadro)', () => {
            const notaSust = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, sustenido: true });
            expect(notaSust.toAbc()).toBe("^C");

            const notaBeQuad = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, beQuad: true });
            expect(notaBeQuad.toAbc()).toBe("=C");
        });

        it('deve aplicar staccato e acento simultaneamente em ordem correta', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, staccato: true, acento: true });
            expect(nota.toAbc()).toBe("!accent!.C");
        });

        it('deve respeitar a exclusividade de atributos (marcato tem precedência sobre acento)', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, acento: true, marcato: true });
            expect(nota.toAbc()).toContain("!marcato!");
            expect(nota.toAbc()).not.toContain("!accent!");
        });

        it('deve renderizar notas fantasma (!style=x!)', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, ghostNote: true });
            expect(nota.toAbc()).toBe("!style=x!C");
        });

        it('deve incluir grace notes (adornos) entre chaves antes da nota principal', () => {
            const adornoD = Nota.create({ freq: "D", tempo: "1/16", unidadeTempo: ref14 });
            const adornoE = Nota.create({ freq: "E", tempo: "1/16", unidadeTempo: ref14 });

            const notaPrincipal = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, graceNote: [adornoD, adornoE] });
            expect(notaPrincipal.toAbc()).toBe("{D/4E/4}C");
        });

        it('deve lançar TypeError se graceNote for inválido (não array, etc)', () => {
            expect(() => {
                Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, graceNote: "isso nao é um array" });
            }).toThrow(TypeError);
        });

        it('deve aplicar ligadura de prolongamento (-)', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, ligada: true });
            expect(nota.toAbc()).toBe("C-");
        });

        it('deve gerar string simplificada quando isAcorde for true', () => {
            const nota = Nota.create({ freq: "C", tempo: "1/4", unidadeTempo: ref14, sustenido: true, staccato: true });
            expect(nota.toAbc(true)).toBe("^C");
        });

        it('deve herdar a unidadeTempo de uma classe Pai (Obra)', () => {
            const mockObra = { unidadeTempo: ref14 }; 
            const nota = Nota.create({ freq: "C", tempo: "1/4", obra: mockObra });
            
            expect(nota).toBeInstanceOf(Nota);
            expect(nota.unidadeTempo).toBe(ref14);
        });
    });

    describe('Helper estático Nota.create()', () => {
        
        it('deve criar uma nota simples a partir de strings', () => {
            const nota = Nota.create({ freq: "G", tempo: "1/8", unidadeTempo: ref14 });
            expect(nota).toBeInstanceOf(Nota);
            expect(nota.altura.abc).toBe("G");
            expect(nota.duracao.razao).toBe(0.125); // 1/8
            // Em L:1/4, uma nota de 1/8 gera o sufixo de divisão (/)
            expect(nota.toAbc()).toBe("G/");
        });

        it('deve criar uma nota com acidentes e opções usando create() e duracao como string', () => {
            const nota = Nota.create({ freq: "F,", tempo: "1/2", duracao: "1/4", sustenido: true, staccato: true });
            expect(nota.toAbc()).toBe(".^F,2"); // A ordem correta é articulação depois acidente
        });

        it('deve criar grace notes complexas através do helper', () => {
            const adorno1 = Nota.create({ freq: "d", tempo: "1/16", unidadeTempo: ref14, sustenido: true });
            const adorno2 = Nota.create({ freq: "f", tempo: "1/16", unidadeTempo: ref14, beQuad: true });
            
            const nota = Nota.create({ freq: "G", tempo: "1/4", unidadeTempo: ref14, graceNote: [adorno1, adorno2] });
            
            expect(nota.toAbc()).toBe("{^d/4=f/4}G");
        });

        it('deve lançar erro no create() se a frequência não for encontrada', () => {
            expect(() => {
                Nota.create({ freq: "NOTA_INEXISTENTE", tempo: "1/4", unidadeTempo: ref14 });
            }).toThrow("NotaFrequencia não encontrada para: NOTA_INEXISTENTE");
        });

        it('deve assumir denominador 1 se omitido na string de tempo', () => {
            // "2" deve ser parseado como "2/1"
            const nota = Nota.create({ freq: "E", tempo: "2", unidadeTempo: ref14 });
            expect(nota.duracao.razao).toBe(2); 
            // 2/1 (2) em relação a L:1/4 (0.25) -> Razão 8
            expect(nota.toAbc()).toBe("E8");
        });
    });
});
