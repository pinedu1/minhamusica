import { Compasso } from '@domain/compasso/Compasso';
import { Nota } from '@domain/nota/Nota';
import { Pausa } from '@domain/nota/Pausa';
import { Unissono } from '@domain/nota/Unissono';
import { TempoDuracao } from '@domain/tempo/TempoDuracao';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia';
import { describe, it, expect } from 'vitest';

describe('Compasso', () => {
    it('a) Deve criar um compasso simples, com as propriedades obrigatórias do construtor', () => {
        const compasso = new Compasso();
        expect(compasso).toBeInstanceOf(Compasso);
        expect(compasso.elements).toEqual([]);
    });

    it('b.1) Deve criar um compasso com uma Pausa de 1/4', () => {
        const pausa = new Pausa(new TempoDuracao(1, 4));
        const compasso = new Compasso([pausa]);
        expect(compasso.elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.elements[0].duracao.toString()).toBe('1/4');
    });

    it("b.2) Deve criar um compasso com uma Nota 'C' de 1/4", () => {
        const nota = new Nota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 4));
        const compasso = new Compasso([nota]);
        expect(compasso.elements[0]).toBeInstanceOf(Nota);
        expect(compasso.elements[0].altura.abc).toBe('C');
        expect(compasso.elements[0].duracao.toString()).toBe('1/4');
    });

    it('b.3) Deve criar um compasso com uma Pausa e duas Notas', () => {
        const pausa = new Pausa(new TempoDuracao(1, 8));
        const nota1 = new Nota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8));
        const nota2 = new Nota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 4));
        const compasso = new Compasso([pausa, nota1, nota2]);
        expect(compasso.elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.elements[1]).toBeInstanceOf(Nota);
        expect(compasso.elements[2]).toBeInstanceOf(Nota);
        expect(compasso.elements.length).toBe(3);
    });

    it('b.4) Deve criar um compasso com Pausa, Notas e Unissono', () => {
        const pausa = new Pausa(new TempoDuracao(1, 8));
        const nota1 = new Nota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8));
        const nota2 = new Nota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 8));
        const unissono = new Unissono(
            [
                new Nota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 8)),
                new Nota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8)),
                new Nota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 8)),
                new Nota(NotaFrequencia.getByAbc('g'), new TempoDuracao(1, 8)),
            ],
            new TempoDuracao(1, 8)
        );
        const compasso = new Compasso([pausa, nota1, nota2, unissono]);
        expect(compasso.elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.elements[1]).toBeInstanceOf(Nota);
        expect(compasso.elements[2]).toBeInstanceOf(Nota);
        expect(compasso.elements[3]).toBeInstanceOf(Unissono);
        expect(compasso.elements.length).toBe(4);
    });

    it('c) Deve testar as propriedades de saída dos compassos', () => {
        const nota = new Nota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 4));
        const compasso = new Compasso([nota], { index: 1 });
        expect(compasso.index).toBe(1);
        expect(compasso.elements[0].altura.abc).toBe('C');
    });

    it('e) Deve forçar erros e acertar na string esperada do erro', () => {
        // Erro ao setar elements com tipo incorreto
        expect(() => new Compasso('string')).toThrow(TypeError);
        expect(() => new Compasso('string')).toThrow('Compasso: Elementos devem ser um Array.');

        const compasso = new Compasso();
        // Erro ao setar voz com tipo incorreto
        expect(() => {
            compasso.voz = 'string';
        }).toThrow('Compasso: O objeto deve ser uma instância de Voz.');

        // Erro ao setar metrica com tipo incorreto
        expect(() => {
            compasso.metrica = 'string';
        }).toThrow('Compasso: Deve ser instância de TempoMetrica.');

        // Erro ao setar mudancaDeTom com valor inválido
        expect(() => {
            compasso.mudancaDeTom = 'inválido';
        }).toThrow('Compasso: A tonalidade deve ser um membro válido do Enum Tonalidade.');

        // Erro ao setar obra com tipo incorreto
        expect(() => {
            compasso.obra = 'string';
        }).toThrow('Compasso: Obra deve ser uma instância de Obra.');

        // Erro ao setar unidadeTempo com tipo incorreto
        expect(() => {
            compasso.unidadeTempo = 'string';
        }).toThrow("O 'unidadeTempo' do compasso deve ser do tipo TempoDuracao.");

        // Erro ao setar letra com tipo incorreto
        expect(() => {
            compasso.letra = 'string';
        }).toThrow("Compasso: A propriedade 'letra' deve ser um Array de strings.");
    });
});
