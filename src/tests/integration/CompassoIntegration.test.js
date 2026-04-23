import { describe, it, expect } from 'vitest';
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
import { CompassoAbc } from '@abcjs/CompassoAbc.js';
import { CompassoJson } from '@persistence/CompassoJson.js';
import { Obra } from '@domain/obra/Obra.js';
import { GrupoElemento } from '@domain/compasso/GrupoElemento.js';

describe('Integração de Compasso - Ciclo Completo (Domain -> ABC -> JSON)', () => {

    const obraMock = new Obra(1, [], {
        metrica: new TempoMetrica(4, 4),
        unidadeTempo: new TempoDuracao(1, 4),
        tonalidade: Tonalidade.create('C'),
    });

    const criarCompassoComplexo = () => {
        const n1 = new Nota(NotaFrequencia.getByKey('C4'), new TempoDuracao(1, 8), { letra: 'Do' });
        const n2 = new Nota(NotaFrequencia.getByKey('D4'), new TempoDuracao(1, 8));
        const g1 = new GrupoElemento([n1, n2], { cifras: [{texto: 'C', posicao: 0}] });

        const p1 = new Pausa(new TempoDuracao(1, 4));
        const g2 = new GrupoElemento([p1]);

        const q1 = new Quialtera(
            [
                new Nota(NotaFrequencia.getByKey('A4'), new TempoDuracao(1, 8)),
                new Nota(NotaFrequencia.getByKey('B4'), new TempoDuracao(1, 8)),
                new Nota(NotaFrequencia.getByKey('C5'), new TempoDuracao(1, 8)),
            ],
            new TempoDuracao(1, 4)
        );
        const g3 = new GrupoElemento([q1]);
        
        const u1 = new Unissono(
            [new Nota(NotaFrequencia.getByKey('E4'), new TempoDuracao(1, 4)), new Nota(NotaFrequencia.getByKey('G4'), new TempoDuracao(1, 4))],
            new TempoDuracao(1, 4),
            { staccato: true }
        );
        const g4 = new GrupoElemento([u1]);

        const compasso = new Compasso([], { 
            obra: obraMock,
            barraInicial: TipoBarra.REPEAT_OPEN,
            barraFinal: TipoBarra.STANDARD,
        });
        compasso.grupos = [g1, g2, g3, g4];
        return compasso;
    };

    it('deve manter a integridade dos dados após o ciclo Domain -> ABC -> Domain', () => {
        const compassoOriginal = criarCompassoComplexo();
        
        const abcString = CompassoAbc.toAbc(compassoOriginal);
        const compassoFromAbc = CompassoAbc.fromAbc(abcString, obraMock.options);

        // A comparação direta de objetos pode falhar, então comparamos propriedades chave
        expect(compassoFromAbc.grupos.length).toBe(compassoOriginal.grupos.length);
        expect(compassoFromAbc.pulsosOcupados).toBeCloseTo(compassoOriginal.pulsosOcupados);
        expect(compassoFromAbc.barraInicial).toEqual(compassoOriginal.barraInicial);
        
        // Verificando um elemento específico
        const unissonoOriginal = compassoOriginal.grupos[3].elements[0];
        const unissonoFromAbc = compassoFromAbc.grupos[3].elements[0];
        expect(unissonoFromAbc).toBeInstanceOf(Unissono);
        expect(unissonoFromAbc.staccato).toBe(unissonoOriginal.staccato);
    });

    it('deve manter a integridade dos dados após o ciclo Domain -> JSON -> Domain', () => {
        const compassoOriginal = criarCompassoComplexo();

        const json = CompassoJson.toJson(compassoOriginal);
        const compassoFromJson = CompassoJson.fromJson(json);

        expect(compassoFromJson).toEqual(compassoOriginal);
    });

    it('deve garantir consistência entre as representações ABC e JSON', () => {
        const compassoOriginal = criarCompassoComplexo();

        // Caminho 1: Domain -> ABC -> Domain -> JSON
        const abcString = CompassoAbc.toAbc(compassoOriginal);
        const compassoFromAbc = CompassoAbc.fromAbc(abcString, obraMock.options);
        const jsonFromAbc = CompassoJson.toJson(compassoFromAbc);

        // Caminho 2: Domain -> JSON -> Domain -> ABC
        const jsonString = CompassoJson.toJson(compassoOriginal);
        const compassoFromJson = CompassoJson.fromJson(jsonString);
        const abcFromJson = CompassoAbc.toAbc(compassoFromJson);

        // As strings ABC podem ter pequenas diferenças de formatação (espaços)
        // A comparação de JSON é mais robusta aqui se a estrutura for a mesma
        const jsonFromOriginal = CompassoJson.toJson(compassoOriginal);
        
        // Removemos propriedades que podem causar falsos negativos na comparação
        const cleanJson = (j) => {
            j.grupos.forEach(g => {
                delete g.options.compasso;
                g.elements.forEach(e => {
                    delete e.options.compasso;
                    delete e.options.grupo;
                });
            });
            return j;
        }

        expect(cleanJson(jsonFromAbc)).toEqual(cleanJson(jsonFromOriginal));
        expect(abcFromJson.replace(/\s+/g, '')).toEqual(abcString.replace(/\s+/g, ''));
    });
});
