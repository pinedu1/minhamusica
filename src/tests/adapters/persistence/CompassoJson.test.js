import { describe, it, expect, beforeEach } from "vitest";
import { Compasso } from '@domain/compasso/Compasso.js';
import { Nota } from '@domain/nota/Nota.js';
import { Pausa } from '@domain/nota/Pausa.js';
import { Unissono } from '@domain/nota/Unissono.js';
import { Quialtera } from '@domain/nota/Quialtera.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { Tonalidade } from '@domain/compasso/Tonalidade.js';
import { TipoBarra } from '@domain/compasso/TipoBarra.js';
import { CompassoJson } from '@persistence/CompassoJson.js';
import { Obra } from '@domain/obra/Obra.js';
import { GrupoElemento } from '@domain/compasso/GrupoElemento.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('CompassoJson', () => {

    const obraMock = new Obra(1, [], {
        metrica: new TempoMetrica(4, 4),
        unidadeTempo: new TempoDuracao(1, 4),
        tonalidade: Tonalidade.create('C'),
    });

    describe('toJson()', () => {

        it('deve serializar um compasso com múltiplos grupos e notas', () => {
            const n1 = ObjectFactory.newNota(NotaFrequencia.getByKey('C4'), new TempoDuracao(1, 4));
            const n2 = ObjectFactory.newNota(NotaFrequencia.getByKey('D4'), new TempoDuracao(1, 4));
            const n3 = ObjectFactory.newNota(NotaFrequencia.getByKey('E4'), new TempoDuracao(1, 4));
            const n4 = ObjectFactory.newNota(NotaFrequencia.getByKey('F4'), new TempoDuracao(1, 4));
            const g1 = ObjectFactory.newGrupoElemento([n1, n2]);
            const g2 = ObjectFactory.newGrupoElemento([n3, n4]);
            const compasso = ObjectFactory.newCompasso([], { obra: obraMock });
            compasso.grupos = [g1, g2];

            const json = CompassoJson.toJson(compasso);

            expect(json.grupos).toHaveLength(2);
            expect(json.grupos[0].elements[0].altura).toBe('C4');
            expect(json.grupos[1].elements[1].altura).toBe('F4');
        });

        it('deve serializar anotações e acordes em um grupo', () => {
            const n1 = ObjectFactory.newNota(NotaFrequencia.getByKey('C4'), new TempoDuracao(1, 4));
            const g1 = ObjectFactory.newGrupoElemento([n1]);
            g1.addAnotacao("dedilhado", 0, "^");
            g1.addAcorde("Cmaj7", 0);
            const compasso = ObjectFactory.newCompasso([], { obra: obraMock });
            compasso.grupos = [g1];

            const json = CompassoJson.toJson(compasso);

            expect(json.grupos[0].options.anotacoes[0]).toEqual({ texto: "dedilhado", posicao: 0, local: "^" });
            expect(json.grupos[0].options.acordes[0]).toEqual({ texto: "Cmaj7", posicao: 0 });
        });

        it('deve serializar barras, métrica e mudança de tom', () => {
            const compasso = ObjectFactory.newCompasso([], {
                metrica: new TempoMetrica(3, 4),
                mudancaDeTom: Tonalidade.create('G'),
                barraInicial: TipoBarra.REPEAT_OPEN,
                barraFinal: TipoBarra.REPEAT_CLOSE,
                unidadeTempo: new TempoDuracao(1, 8),
            });

            const json = CompassoJson.toJson(compasso);

            expect(json.options.metrica).toBe('3/4');
            expect(json.options.mudancaDeTom).toBe('G');
            expect(json.options.barraInicial).toBe(TipoBarra.REPEAT_OPEN.nome);
            expect(json.options.barraFinal).toBe(TipoBarra.REPEAT_CLOSE.nome);
            expect(json.options.unidadeTempo).toBe('1/8');
        });

        it('deve serializar a letra em diferentes níveis (nota, grupo, compasso)', () => {
            const n1 = ObjectFactory.newNota(NotaFrequencia.getByKey('C4'), new TempoDuracao(1, 4), { letra: 'A' });
            const n2 = ObjectFactory.newNota(NotaFrequencia.getByKey('D4'), new TempoDuracao(1, 4));
            const g1 = ObjectFactory.newGrupoElemento([n1, n2], { letra: ['ti'] });
            const compasso = ObjectFactory.newCompasso([], { obra: obraMock, letra: ['rei', 'o'] });
            compasso.grupos = [g1];

            const json = CompassoJson.toJson(compasso);

            expect(json.grupos[0].elements[0].options.letra).toBe('A');
            expect(json.grupos[0].options.letra).toEqual(['ti']);
            expect(json.options.letra).toEqual(['rei', 'o']);
        });

        it('deve serializar um uníssono com ornamentos', () => {
            const unissono = ObjectFactory.newUnissono(
                [ObjectFactory.newNota(NotaFrequencia.getByKey('E4'), new TempoDuracao(1, 2))],
                new TempoDuracao(1, 2),
                { staccato: true, acento: true }
            );
            const grupo = ObjectFactory.newGrupoElemento([unissono]);
            const compasso = ObjectFactory.newCompasso([], { obra: obraMock });
            compasso.grupos = [grupo];

            const json = CompassoJson.toJson(compasso);
            const unissonoJson = json.grupos[0].elements[0];

            expect(unissonoJson.tipo).toBe('unissono');
            expect(unissonoJson.options.staccato).toBe(true);
            expect(unissonoJson.options.acento).toBe(true);
        });
    });

    describe('fromJson()', () => {
        it('deve desserializar um JSON para um compasso com múltiplos grupos', () => {
            const json = {
				id: 0,
                grupos: [
                    { id: 0, elements: [{ id: 0, tipo: 'nota', altura: { key: 'C4' }, duracao: '1/4' }] },
                    { id: 0, elements: [{ id: 0, tipo: 'nota', altura: { key: 'D4' }, duracao: '1/4' }] }
                ],
                options: { metrica: '4/4', unidadeTempo: '1/4' }
            };

            const compasso = CompassoJson.fromJson(json);

            expect(compasso.grupos).toHaveLength(2);
            expect(compasso.grupos[0]).toBeInstanceOf(GrupoElemento);
            expect(compasso.grupos[1].elements[0].altura.key).toBe('D4');
            expect(compasso.pulsosOcupados).toBe(2);
        });

        it('deve desserializar anotações e acordes', () => {
            const json = {
	            id: 0,
	            grupos: [{
	                id: 0,
	                elements: [{ id: 0, tipo: 'nota', altura: { key: 'C4' }, duracao: '1/4' }],
                    options: {
                        anotacoes: [{ texto: "teste", posicao: 0, local: "_" }],
                        acordes: [{ texto: "Am", posicao: 0 }]
                    }
                }],
                options: { metrica: '4/4', unidadeTempo: '1/4' }
            };

            const compasso = CompassoJson.fromJson(json);
            const grupo = compasso.grupos[0];

            expect(grupo.options.anotacoes[0].texto).toBe("teste");
            expect(grupo.options.acordes[0].texto).toBe("Am");
        });

        it('deve desserializar barras, métrica e tom', () => {
            const json = {
	            id: 0,
	            grupos: [],
                options: {
                    metrica: '3/4',
                    mudancaDeTom: 'G',
                    barraInicial: 'REPEAT_OPEN',
                    barraFinal: 'REPEAT_CLOSE',
                    unidadeTempo: '1/8'
                }
            };

            const compasso = CompassoJson.fromJson(json);

            expect(compasso.metrica.toString()).toBe('3/4');
            expect(compasso.mudancaDeTom.valor).toBe(Tonalidade.create('G').valor);
            expect(compasso.barraInicial).toBe(TipoBarra.REPEAT_OPEN);
            expect(compasso.barraFinal).toBe(TipoBarra.REPEAT_CLOSE);
            expect(compasso.unidadeTempo.toString()).toBe('1/8');
        });

        it('deve desserializar um compasso com quiáltera e uníssono', () => {
            const json = {
	            id: 0,
	            grupos: [
                    {
	                    id: 0,
	                    elements: [
                            {
	                            id: 0, tipo: 'quialtera', duracao: '1/4', notas: [
                                    { id: 0, tipo: 'nota', altura: { key: 'A4' }, duracao: '1/8' },
                                    { id: 0, tipo: 'nota', altura: { key: 'B4' }, duracao: '1/8' },
                                    { id: 0, tipo: 'nota', altura: { key: 'C5' }, duracao: '1/8' },
                                ]
                            },
                            {
	                            id: 0, tipo: 'unissono', duracao: '1/4', notas: [
                                    { id: 0, tipo: 'nota', altura: { key: 'E4' }, duracao: '1/4' }
                                ]
                            }
                        ]
                    }
                ],
                options: { metrica: '4/4', unidadeTempo: '1/4' }
            };

            const compasso = CompassoJson.fromJson(json);
            const grupo = compasso.grupos[0];

            expect(grupo.elements[0]).toBeInstanceOf(Quialtera);
            expect(grupo.elements[1]).toBeInstanceOf(Unissono);
            expect(grupo.elements[0].notas[1].altura.key).toBe('B4');
            expect(compasso.pulsosOcupados).toBe(2);
        });

        it('deve desserializar uma nota com staccato e roll', () => {
            const json = {
	            id: 0,
	            grupos: [{
		            id: 0,
		            elements: [{
			            id: 0,
			            tipo: 'nota',
                        altura: { key: 'G4' }, 
                        duracao: '1/4', 
                        options: { staccato: true, roll: true } 
                    }]
                }],
                options: { metrica: '4/4', unidadeTempo: '1/4' }
            };

            const compasso = CompassoJson.fromJson(json);
            const nota = compasso.grupos[0].elements[0];

            expect(nota).toBeInstanceOf(Nota);
            expect(nota.staccato).toBe(true);
            expect(nota.roll).toBe(true);
        });
    });
});
