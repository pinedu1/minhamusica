import { describe, test, expect, beforeEach } from 'vitest';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe('TempoDuracao', () => {
    // Testes de Instanciação Válida
    describe('Instanciação Válida', () => {
        test('deve criar uma instância com numerador e denominador válidos', () => {
            const tempo = new TempoDuracao(3, 8);
            expect(tempo.numerador).toBe(3);
            expect(tempo.denominador).toBe(8);
        });

        test('deve usar valores padrão (1/4) quando nenhum argumento é fornecido', () => {
            const tempo = new TempoDuracao();
            expect(tempo.numerador).toBe(1);
            expect(tempo.denominador).toBe(4);
        });

        test('deve criar a partir de uma string "n/d"', () => {
            const tempo = TempoDuracao.create("1/8");
            expect(tempo.numerador).toBe(1);
            expect(tempo.denominador).toBe(8);
        });

        test('deve criar a partir de um objeto {numerador, denominador}', () => {
            const tempo = TempoDuracao.create({ numerador: 2, denominador: 4 });
            expect(tempo.numerador).toBe(2);
            expect(tempo.denominador).toBe(4);
        });

        test('deve criar a partir de um objeto {duracao: "n/d"}', () => {
            const tempo = TempoDuracao.create({ duracao: "3/4" });
            expect(tempo.numerador).toBe(3);
            expect(tempo.denominador).toBe(4);
        });

        test('deve retornar a mesma instância se já for um TempoDuracao', () => {
            const original = new TempoDuracao(1, 2);
            const novo = TempoDuracao.create(original);
            expect(novo).toBe(original);
        });
    });

    // Testes de Instanciação Inválida
    describe('Instanciação Inválida', () => {
        test('deve lançar erro para numerador não inteiro', () => {
            expect(() => new TempoDuracao(1.5, 4)).toThrow(TypeError);
        });

        test('deve lançar erro para denominador não inteiro', () => {
            expect(() => new TempoDuracao(1, 4.5)).toThrow(TypeError);
        });

        test('deve lançar erro para numerador zero ou negativo', () => {
            expect(() => new TempoDuracao(0, 4)).toThrow(Error);
            expect(() => new TempoDuracao(-1, 4)).toThrow(Error);
        });

        test('deve lançar erro para denominador zero ou negativo', () => {
            expect(() => new TempoDuracao(1, 0)).toThrow(Error);
            expect(() => new TempoDuracao(1, -4)).toThrow(Error);
        });

        test('deve lançar erro com .create() para string inválida', () => {
            expect(() => TempoDuracao.create("abc")).toThrow(TypeError);
            expect(() => TempoDuracao.create("1/0")).toThrow(TypeError); // Schema validation
        });

        test('deve lançar erro com .create() para objeto inválido', () => {
            expect(() => TempoDuracao.create({ num: 1, den: 4 })).toThrow(TypeError);
        });
    });

    // Testes de Métodos e Getters
    describe('Métodos e Getters', () => {
        const tempo = new TempoDuracao(1, 4);

        test('get razao deve retornar o valor decimal correto', () => {
            expect(tempo.razao).toBe(0.25);
            const tempo2 = new TempoDuracao(3, 4);
            expect(tempo2.razao).toBe(0.75);
        });

        test('toString deve retornar a fração como string', () => {
            expect(tempo.toString()).toBe("1/4");
        });

        test('toCompasso deve retornar o formato de compasso ABC', () => {
            expect(tempo.toCompasso()).toBe("[L:1/4]");
        });

        test('toNota deve retornar a notação de nota ABC simplificada', () => {
            expect(new TempoDuracao(1, 4).toNota()).toBe("/4");
            expect(new TempoDuracao(2, 1).toNota()).toBe("2");
            expect(new TempoDuracao(1, 1).toNota()).toBe("1");
            expect(new TempoDuracao(3, 8).toNota()).toBe("3/8");
        });

        test('toAbc deve retornar a notação de duração ABC', () => {
            expect(tempo.toAbc()).toBe("L:1/4");
        });

        test('toJSON deve retornar um objeto com numerador e denominador', () => {
            expect(tempo.toJSON()).toEqual({ numerador: 1, denominador: 4 });
        });

        test('equals deve comparar duas instâncias de TempoDuracao', () => {
            const tempo1 = new TempoDuracao(1, 2);
            const tempo2 = new TempoDuracao(2, 4);
            const tempo3 = new TempoDuracao(3, 4);
            expect(tempo1.equals(tempo2)).toBe(true);
            expect(tempo1.equals(tempo3)).toBe(false);
            expect(tempo1.equals("1/2")).toBe(false); // Deve comparar apenas com instâncias
        });
    });

    // Testes dos Setters
    describe('Setters', () => {
        let tempo;
        beforeEach(() => {
            tempo = new TempoDuracao(1, 1);
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
