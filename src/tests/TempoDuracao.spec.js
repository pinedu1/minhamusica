import { describe, it, expect } from 'vitest';
import { TempoDuracao } from '../../src/model/tempo/TempoDuracao.js';

describe('TempoDuracao', () => {
    describe('Factory Method (create)', () => {
        it('deve criar uma instância com sucesso via formato String e manter as propriedades corretas', () => {
            const dados = { duracao: '1/4' };
            const tempo = TempoDuracao.create(dados);
            
            expect(tempo).toBeInstanceOf(TempoDuracao);
            expect(tempo.numerador).toBe(1);
            expect(tempo.denominador).toBe(4);
        });

        it('deve criar uma instância com sucesso via formato Objeto', () => {
            const dados = { numerador: 3, denominador: 8 };
            const tempo = TempoDuracao.create(dados);
            
            expect(tempo).toBeInstanceOf(TempoDuracao);
            expect(tempo.numerador).toBe(3);
            expect(tempo.denominador).toBe(8);
        });

        it('deve rejeitar a validação e lançar TypeError se enviar formato inválido', () => {
            const dadosInvalidos = [
                { duracao: '1/0' }, // denominador 0 (string)
                { numerador: 1, denominador: 0 }, // denominador 0 (objeto)
                { duracao: 'texto aleatorio' }, // texto aleatório
                { numerador: 1, denominador: 4, extra: 'chave' }, // chaves extras (.strict)
                { duracao: '1/4', extra: 'chave' }, // chaves extras (.strict)
                null,
                undefined,
                123
            ];

            dadosInvalidos.forEach(dado => {
                expect(() => TempoDuracao.create(dado)).toThrow(TypeError);
                // Valida a mensagem de erro específica do throw personalizado na classe
                expect(() => TempoDuracao.create(dado)).toThrow("TempoDuracao.create: unidadeTempo deve ser uma string.");
            });
        });

        it('deve retornar a mesma instância se o dado já for um objeto TempoDuracao', () => {
            const original = new TempoDuracao(2, 4);
            const resultado = TempoDuracao.create(original);
            expect(resultado).toBe(original);
        });
    });

    describe('Getters, Setters e Cálculos', () => {
        it('deve validar e atribuir corretamente via setters', () => {
            const tempo = new TempoDuracao();
            tempo.numerador = 2;
            tempo.denominador = 2;
            expect(tempo.numerador).toBe(2);
            expect(tempo.denominador).toBe(2);
        });

        it('deve lançar erro ao atribuir valores inválidos aos setters', () => {
            const tempo = new TempoDuracao();
            
            expect(() => { tempo.numerador = '1'; }).toThrow(TypeError);
            expect(() => { tempo.numerador = 0; }).toThrow(Error);
            
            expect(() => { tempo.denominador = '4'; }).toThrow(TypeError);
            expect(() => { tempo.denominador = -1; }).toThrow(Error);
        });

        it('deve calcular o getter .razao corretamente (valor decimal)', () => {
            const tempo1 = new TempoDuracao(1, 4);
            expect(tempo1.razao).toBe(0.25);
            
            const tempo2 = new TempoDuracao(3, 8);
            expect(tempo2.razao).toBe(0.375);
        });
    });
    
    describe('Métodos de formatação de String', () => {
        it('deve retornar a string montada corretamente em toString', () => {
            const tempo = new TempoDuracao(3, 4);
            expect(tempo.toString()).toBe('3/4');
        });
        
        it('deve retornar a string montada corretamente em toCompasso', () => {
            const tempo = new TempoDuracao(4, 4);
            expect(tempo.toCompasso()).toBe('[L:4/4]');
        });

        it('deve retornar a string montada corretamente em toNota', () => {
            expect(new TempoDuracao(1, 4).toNota()).toBe('/4');
            expect(new TempoDuracao(2, 1).toNota()).toBe('2');
            expect(new TempoDuracao(1, 1).toNota()).toBe('1');
            expect(new TempoDuracao(3, 8).toNota()).toBe('3/8');
        });
        
        it('deve retornar a string montada corretamente em toAbc', () => {
            const tempo = new TempoDuracao(1, 8);
            expect(tempo.toAbc()).toBe('L:1/8');
            expect(tempo.toCompasso()).toBe('[L:1/8]');
        });
    });
});
