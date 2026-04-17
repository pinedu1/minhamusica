import { describe, it, expect } from 'vitest';
import { Pausa } from '../domain/nota/Pausa.js';
import { TempoDuracao } from '../domain/tempo/TempoDuracao.js';

describe('Classe Pausa', () => {

    const ref14 = new TempoDuracao(1, 4); // L: 1/4

    describe('Funcionalidades Básicas', () => {

        it('deve formatar corretamente a pausa base sem multiplicador (z) quando duração == unidadeTempo', () => {
            const pausa = Pausa.create({ tempo: "1/4", unidadeTempo: ref14 });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z");
        });

        it('deve calcular multiplicador quando duração for maior que unidadeTempo', () => {
            const pausa = Pausa.create({ tempo: "1/2", unidadeTempo: ref14 });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z2");
        });

        it('deve calcular o divisor quando duração for menor que unidadeTempo', () => {
            const pausa = Pausa.create({ tempo: "1/8", unidadeTempo: ref14 });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z/");
            
            const pausa2 = Pausa.create({ tempo: "1/16", unidadeTempo: ref14 });
            const result1 = pausa2.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result1).toBe("z/4");
        });

        it('deve incluir fermata corretamente (!fermata!z)', () => {
            const pausa = Pausa.create({ tempo: "1/4", unidadeTempo: ref14, fermata: true });
            expect(pausa.toAbc()).toBe("!fermata!z");
        });

        it('deve incluir marcação de respiração (!breath!z)', () => {
            const pausa = Pausa.create({ tempo: "1/4", unidadeTempo: ref14, breath: true });
            expect(pausa.toAbc()).toBe("!breath!z");
        });

        it('deve combinar múltiplos atributos (fermata e breath)', () => {
            const pausa = Pausa.create({ tempo: "1/4", unidadeTempo: ref14, fermata: true, breath: true });
            expect(pausa.toAbc()).toBe("!fermata!!breath!z");
        });

        it('deve suportar pausa invisível (x) ao invés de (z)', () => {
            const pausa = Pausa.create({ tempo: "1/4", unidadeTempo: ref14, invisivel: true });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("x");
        });

        it('deve herdar a unidadeTempo de uma classe Pai (Obra ou Compasso)', () => {
            const mockObra = { unidadeTempo: ref14 };
            const pausa = Pausa.create({ tempo: "1/4", obra: mockObra });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");

            expect(pausa).toBeInstanceOf(Pausa);
            expect(pausa.unidadeTempo).toBe(ref14);
            expect(result).toBe("z");
        });
    });

    describe('Helper estático Pausa.create() com JSON', () => {
        
        it('deve instanciar com strings usando "duracao" como referencia', () => {
            const pausa = Pausa.create({ tempo: "1/8", unidadeTempo: "1/4" });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(pausa).toBeInstanceOf(Pausa);
            expect(pausa.duracao.razao).toBe(0.125); 
            expect(result).toBe("z/");
        });

        it('deve assumir denominador 1 se omitido na string de tempo ou duracao', () => {
            const pausa = Pausa.create({ tempo: "2", unidadeTempo: "1/4" });
            expect(pausa.duracao.razao).toBe(2); 
            expect(pausa.toAbc()).toBe("z8"); // L: 1/4 -> razao 0.25. 2/0.25 = 8
        });

        it('deve criar Pausa a partir de strings no tempo com / no final (ex: "2/")', () => {
            const pausa = Pausa.create({ tempo: "2/", unidadeTempo: "1/4" });
            expect(pausa.duracao.razao).toBe(2);
            expect(pausa.toAbc()).toBe("z8");
        });
    });
});
