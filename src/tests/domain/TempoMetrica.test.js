import { describe, test, expect, beforeEach } from 'vitest';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';

describe('TempoMetrica', () => {
    // Testes de Instanciação Válida
    describe('Instanciação Válida', () => {
        test('deve criar uma instância com numerador e denominador válidos', () => {
            const tempo = new TempoMetrica(3, 8);
            expect(tempo.numerador).toBe(3);
            expect(tempo.denominador).toBe(8);
        });

        test('deve usar valores padrão (4/4) quando nenhum argumento é fornecido', () => {
            const tempo = new TempoMetrica();
            expect(tempo.numerador).toBe(4);
            expect(tempo.denominador).toBe(4);
        });

        test('deve criar a partir de uma string "n/d"', () => {
            const tempo = TempoMetrica.create("3/4");
            expect(tempo.numerador).toBe(3);
            expect(tempo.denominador).toBe(4);
        });

        test('deve criar a partir de um objeto {numerador, denominador}', () => {
            const tempo = TempoMetrica.create({ numerador: 2, denominador: 4 });
            expect(tempo.numerador).toBe(2);
            expect(tempo.denominador).toBe(4);
        });

        test('deve criar a partir de um objeto {metrica: "n/d"}', () => {
            const tempo = TempoMetrica.create({ metrica: "6/8" });
            expect(tempo.numerador).toBe(6);
            expect(tempo.denominador).toBe(8);
        });

        test('deve retornar a mesma instância se já for um TempoMetrica', () => {
            const original = new TempoMetrica(2, 2);
            const novo = TempoMetrica.create(original);
            expect(novo).toBe(original);
        });
    });

    // Testes de Instanciação Inválida
    describe('Instanciação Inválida', () => {
        test('deve lançar erro para numerador não inteiro', () => {
            expect(() => new TempoMetrica(1.5, 4)).toThrow(TypeError);
        });

        test('deve lançar erro para denominador não inteiro', () => {
            expect(() => new TempoMetrica(1, 4.5)).toThrow(TypeError);
        });

        test('deve lançar erro para numerador zero ou negativo', () => {
            expect(() => new TempoMetrica(0, 4)).toThrow(Error);
            expect(() => new TempoMetrica(-1, 4)).toThrow(Error);
        });

        test('deve lançar erro para denominador zero ou negativo', () => {
            expect(() => new TempoMetrica(1, 0)).toThrow(Error);
            expect(() => new TempoMetrica(1, -4)).toThrow(Error);
        });

        test('deve lançar erro com .create() para string inválida', () => {
            expect(() => TempoMetrica.create("abc")).toThrow(TypeError);
            // O schema valida os limites, então um valor fora do limite deve falhar
            expect(() => TempoMetrica.create("10/4")).toThrow(TypeError);
            expect(() => TempoMetrica.create("4/65")).toThrow(TypeError);
        });

        test('deve lançar erro com .create() para objeto inválido', () => {
            expect(() => TempoMetrica.create({ num: 1, den: 4 })).toThrow(TypeError);
        });
    });

    // Testes de Métodos e Getters
    describe('Métodos e Getters', () => {
        const tempo = new TempoMetrica(3, 4);

        test('get razao deve retornar o valor decimal correto', () => {
            expect(tempo.razao).toBe(0.75);
            const tempo2 = new TempoMetrica(2, 2);
            expect(tempo2.razao).toBe(1);
        });

        test('toString deve retornar a fração como string', () => {
            expect(tempo.toString()).toBe("3/4");
        });

        test('toCompasso deve retornar o formato de compasso ABC', () => {
            expect(tempo.toCompasso()).toBe("[M:3/4]");
        });

        test('toAbc deve retornar a notação de métrica ABC', () => {
            expect(new TempoMetrica(4, 4).toAbc()).toBe("M:4/4");
            expect(new TempoMetrica(1, 2).toAbc()).toBe("M:/2");
            expect(new TempoMetrica(1, 1).toAbc()).toBe("1");
        });
    });

    // Testes dos Setters
    describe('Setters', () => {
        let tempo;
        beforeEach(() => {
            tempo = new TempoMetrica(4, 4);
        });

        test('set numerador deve atualizar o valor e lançar erro para entradas inválidas', () => {
            tempo.numerador = 2;
            expect(tempo.numerador).toBe(2);
            expect(() => { tempo.numerador = 0; }).toThrow(Error);
            expect(() => { tempo.numerador = 1.5; }).toThrow(TypeError);
        });

        test('set denominador deve atualizar o valor e lançar erro para entradas inválidas', () => {
            tempo.denominador = 8;
            expect(tempo.denominador).toBe(8);
            expect(() => { tempo.denominador = -1; }).toThrow(Error);
            expect(() => { tempo.denominador = "a"; }).toThrow(TypeError);
        });
    });
});
