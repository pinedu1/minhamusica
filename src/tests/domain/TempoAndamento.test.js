import { describe, test, expect } from 'vitest';
import { TempoAndamento } from '@domain/tempo/TempoAndamento.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe('TempoAndamento', () => {
    // Testes de Instanciação Válida
    describe('Instanciação Válida', () => {
        test('deve criar uma instância com TempoDuracao e bpm válidos', () => {
            const tempoDuracao = new TempoDuracao(1, 4);
            const andamento = new TempoAndamento(tempoDuracao, 120);
            expect(andamento.andamento).toBe(tempoDuracao);
            expect(andamento.bpm).toBe(120);
        });

        test('deve criar a partir de um objeto {andamento: "n/d", bpm: number}', () => {
            const andamento = TempoAndamento.create({ andamento: "1/4", bpm: 90 });
            expect(andamento.andamento.toString()).toBe("1/4");
            expect(andamento.bpm).toBe(90);
        });

        test('deve retornar a mesma instância se já for um TempoAndamento', () => {
            const original = new TempoAndamento(new TempoDuracao(1, 2), 100);
            const novo = TempoAndamento.create(original);
            expect(novo).toBe(original);
        });
    });

    // Testes de Instanciação Inválida
    describe('Instanciação Inválida', () => {
        const tempoValido = new TempoDuracao(1, 4);

        test('deve lançar erro se o andamento não for uma instância de TempoDuracao', () => {
            expect(() => new TempoAndamento("1/4", 120)).toThrow(TypeError);
            expect(() => new TempoAndamento({}, 120)).toThrow(TypeError);
        });

        test('deve lançar erro se o bpm não for um inteiro positivo', () => {
            expect(() => new TempoAndamento(tempoValido, 0)).toThrow(TypeError);
            expect(() => new TempoAndamento(tempoValido, -100)).toThrow(TypeError);
            expect(() => new TempoAndamento(tempoValido, 120.5)).toThrow(TypeError);
        });

        test('deve lançar erro com .create() para dados inválidos', () => {
            // O schema do Zod deve rejeitar isso
            expect(() => TempoAndamento.create({ andamento: "10/4", bpm: 120 })).toThrow(TypeError);
            expect(() => TempoAndamento.create({ andamento: "1/4", bpm: 0 })).toThrow(TypeError);
            expect(() => TempoAndamento.create("abc")).toThrow(TypeError);
        });
    });

    // Testes de Métodos e Getters
    describe('Métodos e Getters', () => {
        const tempoDuracao = new TempoDuracao(1, 4); // razao = 0.25
        const andamento = new TempoAndamento(tempoDuracao, 120);

        test('get andamento deve retornar a instância de TempoDuracao', () => {
            expect(andamento.andamento).toBeInstanceOf(TempoDuracao);
            expect(andamento.andamento.toString()).toBe("1/4");
        });

        test('get bpm deve retornar o valor do bpm', () => {
            expect(andamento.bpm).toBe(120);
        });

        test('get razao deve calcular a razão correta', () => {
            // razao = andamento.razao / bpm
            expect(andamento.razao).toBe(0.25 / 120);
        });

        test('toString deve retornar a representação em string correta', () => {
            expect(andamento.toString()).toBe("1/4=120");
        });

        test('toCompasso deve retornar o formato de compasso ABC', () => {
            expect(andamento.toCompasso()).toBe("[Q:1/4=120]");
        });

        test('toAbc deve retornar a notação de andamento ABC', () => {
            expect(andamento.toAbc()).toBe("Q:1/4=120");
        });

        test('toJSON deve retornar o objeto serializável correto', () => {
            expect(andamento.toJSON()).toEqual({ andamento: "1/4", bpm: 120 });
        });
    });
});
