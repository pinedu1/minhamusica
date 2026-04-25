import { Compasso } from '@domain/compasso/Compasso';
import { Nota } from '@domain/nota/Nota';
import { Pausa } from '@domain/nota/Pausa';
import { Unissono } from '@domain/nota/Unissono';
import { TempoDuracao } from '@domain/tempo/TempoDuracao';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia';
import { describe, it, expect, beforeEach } from "vitest";
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('Compasso', () => {
    it('a) Deve criar um compasso simples, com as propriedades obrigatórias do construtor', () => {
        const compasso = ObjectFactory.newCompasso();
        expect(compasso).toBeInstanceOf(Compasso);
        expect(compasso.grupos).toBeInstanceOf(Array);
        expect(compasso.grupos.length).toBe(1); // O getter inicializa um grupo vazio se não houver
        expect(compasso.grupos[0].elements).toEqual([]);
    });

    it('b.1) Deve criar um compasso com uma Pausa de 1/4', () => {
        const pausa = ObjectFactory.newPausa(new TempoDuracao(1, 4));
        const grupo = ObjectFactory.newGrupoElemento([pausa]);
        const compasso = ObjectFactory.newCompasso([grupo]);
        expect(compasso.grupos[0].elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.grupos[0].elements[0].duracao.toString()).toBe('1/4');
    });

    it("b.2) Deve criar um compasso com uma Nota 'C' de 1/4", () => {
        const nota = ObjectFactory.newNota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 4));
        const grupo = ObjectFactory.newGrupoElemento([nota]);
        const compasso = ObjectFactory.newCompasso([grupo]);
        expect(compasso.grupos[0].elements[0]).toBeInstanceOf(Nota);
        expect(compasso.grupos[0].elements[0].altura.abc).toBe('C');
        expect(compasso.grupos[0].elements[0].duracao.toString()).toBe('1/4');
    });

    it('b.3) Deve criar um compasso com uma Pausa e duas Notas', () => {
        const pausa = ObjectFactory.newPausa(new TempoDuracao(1, 8));
        const nota1 = ObjectFactory.newNota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8));
        const nota2 = ObjectFactory.newNota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 4));
        const grupo = ObjectFactory.newGrupoElemento([pausa, nota1, nota2]);
        const compasso = ObjectFactory.newCompasso([grupo]);
        expect(compasso.grupos[0].elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.grupos[0].elements[1]).toBeInstanceOf(Nota);
        expect(compasso.grupos[0].elements[2]).toBeInstanceOf(Nota);
        expect(compasso.grupos[0].elements.length).toBe(3);
    });

    it('b.4) Deve criar um compasso com Pausa, Notas e Unissono', () => {
        const pausa = ObjectFactory.newPausa(new TempoDuracao(1, 8));
        const nota1 = ObjectFactory.newNota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8));
        const nota2 = ObjectFactory.newNota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 8));
        const unissono = ObjectFactory.newUnissono(
            [
                ObjectFactory.newNota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 8)),
                ObjectFactory.newNota(NotaFrequencia.getByAbc('c'), new TempoDuracao(1, 8)),
                ObjectFactory.newNota(NotaFrequencia.getByAbc('e'), new TempoDuracao(1, 8)),
                ObjectFactory.newNota(NotaFrequencia.getByAbc('g'), new TempoDuracao(1, 8)),
            ],
            new TempoDuracao(1, 8)
        );
        const grupo = ObjectFactory.newGrupoElemento([pausa, nota1, nota2, unissono]);
        const compasso = ObjectFactory.newCompasso([grupo]);
        expect(compasso.grupos[0].elements[0]).toBeInstanceOf(Pausa);
        expect(compasso.grupos[0].elements[1]).toBeInstanceOf(Nota);
        expect(compasso.grupos[0].elements[2]).toBeInstanceOf(Nota);
        expect(compasso.grupos[0].elements[3]).toBeInstanceOf(Unissono);
        expect(compasso.grupos[0].elements.length).toBe(4);
    });

    it('c) Deve testar as propriedades de saída dos compassos', () => {
        const nota = ObjectFactory.newNota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 4));
        const grupo = ObjectFactory.newGrupoElemento([nota]);
        const compasso = ObjectFactory.newCompasso([grupo]);
        expect(compasso.id).toBeDefined();
        expect(compasso.grupos[0].elements[0].altura.abc).toBe('C');
    });

    it('e) Deve forçar erros e acertar na string esperada do erro', () => {
        // Erro ao setar grupos com tipo incorreto
        expect(() => ObjectFactory.newCompasso('string')).toThrow(TypeError);
        expect(() => ObjectFactory.newCompasso('string')).toThrow('Compasso: A propriedade "grupos" deve ser um Array de instâncias de GrupoElemento.');

        const compasso = ObjectFactory.newCompasso();
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