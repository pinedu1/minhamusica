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
import { CompassoAbc } from '@abcjs/CompassoAbc.js';
import { CompassoJson } from '@persistence/CompassoJson.js';
import { Obra } from '@domain/obra/Obra.js';
import { GrupoElemento } from '@domain/compasso/GrupoElemento.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('Integração de Compasso - Ciclo Completo (Domain -> ABC -> JSON)', () => {

    const obraMock = new Obra(1, [], {
        metrica: new TempoMetrica(4, 4),
        unidadeTempo: new TempoDuracao(1, 4),
        tonalidade: Tonalidade.create('C'),
    });
	const obraMockJson = {
		options: {
			metrica: '4/4'
			, unidadeTempo: '1/4'
			, tonalidade: 'C'
		}
	};

    const criarCompassoComplexo = () => {
        const n1 = ObjectFactory.newNota(NotaFrequencia.getByKey('C4'), new TempoDuracao(1, 8), { letra: 'Do' });
        const n2 = ObjectFactory.newNota(NotaFrequencia.getByKey('D4'), new TempoDuracao(1, 8));
        const g1 = ObjectFactory.newGrupoElemento([n1, n2], { acordes: [{texto: 'C', posicao: 0}] });

        const p1 = ObjectFactory.newPausa(new TempoDuracao(1, 4));
        const g2 = ObjectFactory.newGrupoElemento([p1]);

        const q1 = ObjectFactory.newQuialtera(
            [
                ObjectFactory.newNota(NotaFrequencia.getByKey('A4'), new TempoDuracao(1, 8)),
                ObjectFactory.newNota(NotaFrequencia.getByKey('B4'), new TempoDuracao(1, 8)),
                ObjectFactory.newNota(NotaFrequencia.getByKey('C5'), new TempoDuracao(1, 8)),
            ],
            new TempoDuracao(1, 4)
        );
        const g3 = ObjectFactory.newGrupoElemento([q1]);
        
        const u1 = ObjectFactory.newUnissono(
            [ObjectFactory.newNota(NotaFrequencia.getByKey('E4'), new TempoDuracao(1, 4)), ObjectFactory.newNota(NotaFrequencia.getByKey('G4'), new TempoDuracao(1, 4))],
            new TempoDuracao(1, 4),
            { staccato: true }
        );
        const g4 = ObjectFactory.newGrupoElemento([u1]);

        const compasso = ObjectFactory.newCompasso([], { 
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
		const abcStringParts = abcString.split('\n');
		const abcStringPartsCompasso = abcStringParts[0];
	    const abcStringPartsLetra = abcStringParts[1];
        const compassoFromAbc = CompassoAbc.fromAbc(abcStringPartsCompasso, { ...obraMock.options, letraString: abcStringPartsLetra.substring(2) });
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
	    json.options = { ...json.options, ...obraMockJson.options };
        const compassoFromJson = CompassoJson.fromJson(json);

        expect(compassoFromJson).toEqual(compassoOriginal);
    });

    it('deve garantir consistência entre as representações ABC e JSON', () => {
	    // Removemos propriedades que podem causar falsos negativos na comparação
        const compassoOriginal = criarCompassoComplexo();
		const jsonOriginal = CompassoJson.toJson(compassoOriginal);
        // Caminho 1: Domain -> ABC -> Domain -> JSON
        const abcOriginal = CompassoAbc.toAbc(compassoOriginal);

	    const compassoFromAbc = CompassoAbc.fromAbc(abcOriginal, compassoOriginal.obra);

	    compassoFromAbc.obra = compassoOriginal.obra;
		const abc2 = CompassoAbc.toAbc(compassoFromAbc);
		const jsonFromAbc = CompassoJson.toJson(compassoFromAbc);

        // Caminho 2: Domain -> JSON -> Domain -> ABC
	    jsonOriginal.options.obra = obraMockJson;
	    const compassoFromJson = CompassoJson.fromJson(jsonOriginal);
	    compassoFromJson.obra = compassoOriginal.obra;
        const abcFromJson = CompassoAbc.toAbc(compassoFromJson);

        expect(abcFromJson).toEqual(abcOriginal);
    });
});