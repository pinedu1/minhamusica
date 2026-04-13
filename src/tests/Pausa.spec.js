import { describe, it, expect } from 'vitest';
import { Pausa } from '../model/nota/Pausa.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';

describe('Pausa', () => {
    describe('Funcionalidades Básicas', () => {
        const ref14 = new TempoDuracao(1, 4); // L: 1/4
        it('deve formatar corretamente a pausa base sem multiplicador (z) quando duração == unidadeTempo', () => {
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14 } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z");
        });
        it('deve calcular multiplicador quando duração for maior que unidadeTempo', () => {
            const pausa = Pausa.create({ duracao: "1/2", options: { unidadeTempo: ref14 } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z2");
        });
        it('deve calcular o divisor quando duração for menor que unidadeTempo', () => {
            const pausa = Pausa.create({ duracao: "1/8", options: { unidadeTempo: ref14 } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("z/");

            const pausa2 = Pausa.create({ duracao: "1/16", options: { unidadeTempo: ref14 } });
            const result1 = pausa2.toAbc();
            console.log("-----------------");
            console.log(result1);
            console.log("-----------------");
            expect(result1).toBe("z/4");
        });
        it('deve incluir fermata corretamente (!fermata!z)', () => {
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14, fermata: true } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("!fermata!z");
        });
        it('deve incluir marcação de respiração (!breath!z)', () => {
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14, breath: true } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("!breath!z");
        });
        it('deve plotar a pausa invizivel', () => {
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14, invisivel: true } });
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("x");
        });
        it('deve combinar múltiplos atributos (fermata e breath)', () => {
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14, fermata: true, breath: true } });;
            const result = pausa.toAbc();
            console.log("-----------------");
            console.log(result);
            console.log("-----------------");
            expect(result).toBe("!fermata!!breath!z");
        });
    });
    describe('Construtor Manual', () => {
        it('deve mesclar as opções corretamente na instância', () => {
            const duracao = TempoDuracao.create({duracao:"1/4"});
            const options = { fermata: true, breath: true, invisivel: true };
            const pausa = new Pausa(duracao, options);

            expect(pausa.duracao).toBe(duracao);
            expect(pausa.fermata).toBe(true);
            expect(pausa.breath).toBe(true);
            expect(pausa.invisivel).toBe(true);
        });
    });
    describe('Factory Method (create)', () => {
        it('deve criar uma instância real de TempoDuracao quando passado um JSON limpo', () => {
            const json = { duracao: "1/4", options: { fermata: true, unidadeTempo: TempoDuracao.create({duracao:"2/4"}) } };
            const pausa = Pausa.create(json);

            expect(pausa).toBeInstanceOf(Pausa);
            expect(pausa.duracao).toBeInstanceOf(TempoDuracao);
            expect(pausa.fermata).toBe(true);
        });

        it('deve lançar TypeError se a duração não for enviada', () => {
            const jsonInvalido = { fermata: true, breath: false };
            expect(() => Pausa.create(jsonInvalido)).toThrow(TypeError);
        });
    });
    describe('Regra de Recursão (unidadeTempo)', () => {
        it('deve respeitar a ordem exata de prioridade: Própria -> Compasso -> Voz -> Obra', () => {
            // Mocks simples de acordo com as regras estritas (duck typing)
            const mockObra = { options:{ unidadeTempo: TempoDuracao.create({duracao: "4/4"}) }, get unidadeTempo() { return this.options.unidadeTempo;} };
            const mockVoz = { options:{ unidadeTempo: TempoDuracao.create({duracao:"3/4"}) }, get unidadeTempo() { return this.options.unidadeTempo;} };
            const mockCompasso = { options:{ unidadeTempo: TempoDuracao.create({duracao:"2/4"}) }, get unidadeTempo() { return this.options.unidadeTempo;} };
            const mockPropria = TempoDuracao.create({duracao:"1/4"});

            // Criamos a pausa injetando o contexto diretamente
            const pausa = new Pausa(TempoDuracao.create("1/4"), {
                obra: mockObra,
                voz: mockVoz,
                compasso: mockCompasso,
                unidadeTempo: mockPropria
            });

            // 1. Prioridade máxima: deve encontrar a Própria unidadeTempo
            expect(pausa.getUnidadeTempo()).toEqual(mockPropria);

            // 2. Removendo a Propria, deve encontrar a da Compasso
            pausa.unidadeTempo = null;
            expect(pausa.getUnidadeTempo()).toEqual(mockCompasso.unidadeTempo);

            // 3. Removendo a Compasso, deve encontrar a do Voz
            pausa.compasso = null;
            expect(pausa.getUnidadeTempo()).toEqual(mockVoz.unidadeTempo);

            // 4. Removendo o Voz, deve encontrar a unidadeTempo da Obra
            pausa.voz = null;
            expect(pausa.getUnidadeTempo()).toEqual(mockObra.unidadeTempo);
        });

    });
});
