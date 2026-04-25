import { describe, it, expect, beforeEach } from 'vitest';
import { GrupoElementoJson } from '@persistence/GrupoElementoJson.js';
import { ObjectFactory } from '@factory/ObjectFactory.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';

describe('GrupoElementoJson Persistence Adapter', () => {
	let compassoPadrao;
	let contextOptions;

	beforeEach(() => {
		ObjectFactory.contextoTestes = true; // Congela a geração de IDs

		compassoPadrao = ObjectFactory.newCompasso([], {
			unidadeTempo: new TempoDuracao(1, 4),
			metrica: new TempoMetrica(4, 4)
		});
		contextOptions = { compasso: compassoPadrao };
	});

	const criarPausa = (num = 1, den = 4) => ObjectFactory.newPausa(new TempoDuracao(num, den));
	const criarNota = (abc = "C", num = 1, den = 4) => ObjectFactory.newNota(NotaFrequencia.resolverAltura(abc), new TempoDuracao(num, den));
	const criarUnissono = (notasStr = ["C", "E", "G"], num = 1, den = 4) => ObjectFactory.newUnissono(notasStr.map(n => criarNota(n, num, den)), new TempoDuracao(num, den));
	const criarQuialtera = (notasStr = ["C", "D", "E"], num = 1, den = 4) => ObjectFactory.newQuialtera(notasStr.map(n => criarNota(n, num, den)), new TempoDuracao(num, den));

	const criarGrupo = (elementos) => ObjectFactory.newGrupoElemento(elementos, contextOptions);

	it('1) toJson e fromJson com 1 pausa', () => {
		const grupo = criarGrupo([criarPausa(1, 4)]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao; // Restaura o contexto pai para cálculos

		expect(grupoRestaurado.elements.length).toBe(1);
		expect(grupoRestaurado.elements[0].tipo).toBe('pausa');
		expect(grupoRestaurado.pulsosOcupados).toBe(1);
	});

	it('2) toJson e fromJson com 1 pausa e 1 nota', () => {
		const grupo = criarGrupo([criarPausa(1, 8), criarNota("C", 1, 8)]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(2);
		expect(grupoRestaurado.elements[0].tipo).toBe('pausa');
		expect(grupoRestaurado.elements[1].tipo).toBe('nota');
		expect(grupoRestaurado.pulsosOcupados).toBe(1); // 0.5 + 0.5 pulso (unidade é 1/4)
	});

	it('3) toJson e fromJson com 1 pausa, 1 nota e 1 unissono', () => {
		const grupo = criarGrupo([criarPausa(1, 4), criarNota("C", 1, 4), criarUnissono(["C", "E", "G"], 1, 4)]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(3);
		expect(grupoRestaurado.elements[2].tipo).toBe('unissono');
		expect(grupoRestaurado.pulsosOcupados).toBe(3);
	});

	it('4) toJson e fromJson com 1 pausa, 1 nota, 1 unissono e 1 quialtera', () => {
		const grupo = criarGrupo([
			criarPausa(1, 4), 
			criarNota("C", 1, 4), 
			criarUnissono(["C", "E", "G"], 1, 4), 
			criarQuialtera(["C", "D", "E"], 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(4);
		expect(grupoRestaurado.elements[3].tipo).toBe('quialtera');
		expect(grupoRestaurado.pulsosOcupados).toBe(4);
	});

	it('5) toJson e fromJson com 4 notas', () => {
		const grupo = criarGrupo([
			criarNota("C", 1, 4), criarNota("D", 1, 4), 
			criarNota("E", 1, 4), criarNota("F", 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(4);
		expect(grupoRestaurado.elements.every(e => e.tipo === 'nota')).toBe(true);
		expect(grupoRestaurado.pulsosOcupados).toBe(4);
	});

	it('6) toJson e fromJson com 1 pausa e 3 notas', () => {
		const grupo = criarGrupo([
			criarPausa(1, 4), 
			criarNota("C", 1, 4), criarNota("D", 1, 4), criarNota("E", 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(4);
		expect(grupoRestaurado.elements[0].tipo).toBe('pausa');
		expect(grupoRestaurado.pulsosOcupados).toBe(4);
	});

	it('7) toJson e fromJson com 2 unissonos e 2 pausas', () => {
		const grupo = criarGrupo([
			criarUnissono(["C", "E"], 1, 8), 
			criarPausa(1, 8), 
			criarUnissono(["F", "A"], 1, 8), 
			criarPausa(1, 8)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(4);
		expect(grupoRestaurado.pulsosOcupados).toBe(2);
	});

	it('8) toJson e fromJson com 1 nota e 1 quialtera', () => {
		const grupo = criarGrupo([criarNota("C", 1, 4), criarQuialtera(["C", "D", "E"], 1, 2)]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(2);
		expect(grupoRestaurado.elements[1].tipo).toBe('quialtera');
		expect(grupoRestaurado.pulsosOcupados).toBe(3); // 1 pulso + 2 pulsos
	});

	it('9) toJson e fromJson com 3 notas e 1 pausa', () => {
		const grupo = criarGrupo([
			criarNota("C", 1, 8), criarNota("D", 1, 8), 
			criarNota("E", 1, 8), criarPausa(1, 8)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(4);
		expect(grupoRestaurado.pulsosOcupados).toBe(2);
	});

	it('10) toJson e fromJson retendo e preservando propriedades como opções (acordes/anotações)', () => {
		const grupo = criarGrupo([criarNota("C", 1, 4)]);
		grupo.addAcorde("Cmaj7", 0);
		grupo.addAnotacao("Expressivo", 0, "_");
		
		const json = GrupoElementoJson.toJson(grupo);
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		
		expect(grupoRestaurado.acordes.length).toBe(1);
		expect(grupoRestaurado.acordes[0].texto).toBe("Cmaj7");
		expect(grupoRestaurado.options.anotacoes.length).toBe(1);
		expect(grupoRestaurado.options.anotacoes[0].texto).toBe("Expressivo");
	});

	it('11) toJson e fromJson com 2 quialteras seguidas', () => {
		const grupo = criarGrupo([
			criarQuialtera(["C", "D", "E"], 1, 4),
			criarQuialtera(["F", "G", "A"], 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(2);
		expect(grupoRestaurado.elements[0].tipo).toBe('quialtera');
		expect(grupoRestaurado.elements[1].tipo).toBe('quialtera');
		expect(grupoRestaurado.pulsosOcupados).toBe(2);
	});

	it('12) toJson e fromJson com 1 unissono, 1 pausa, 1 unissono', () => {
		const grupo = criarGrupo([
			criarUnissono(["C", "E"], 1, 8),
			criarPausa(1, 8),
			criarUnissono(["E", "G"], 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(3);
		expect(grupoRestaurado.pulsosOcupados).toBe(2); // 0.5 + 0.5 + 1.0 = 2 pulsos
	});

	it('13) toJson e fromJson com 1 nota, 1 pausa, 1 quialtera', () => {
		const grupo = criarGrupo([
			criarNota("C", 1, 4),
			criarPausa(1, 4),
			criarQuialtera(["C", "D", "E"], 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(3);
		expect(grupoRestaurado.pulsosOcupados).toBe(3);
	});

	it('14) toJson e fromJson com 1 quialtera e 1 unissono', () => {
		const grupo = criarGrupo([
			criarQuialtera(["C", "D", "E"], 1, 4),
			criarUnissono(["C", "E", "G"], 1, 4)
		]);
		const json = GrupoElementoJson.toJson(grupo);
		
		const grupoRestaurado = GrupoElementoJson.fromJson(json);
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.elements.length).toBe(2);
		expect(grupoRestaurado.elements[0].tipo).toBe('quialtera');
		expect(grupoRestaurado.elements[1].tipo).toBe('unissono');
		expect(grupoRestaurado.pulsosOcupados).toBe(2);
	});

	it('15) Validação da não-perda de contexto hierárquico ao reconectar o Compasso após fromJson', () => {
		const grupo = criarGrupo([criarNota("C", 1, 8), criarPausa(1, 8)]); // 1 Pulso em 4/4

		const json = GrupoElementoJson.toJson(grupo);
		const grupoRestaurado = GrupoElementoJson.fromJson(json);

		// Ao ser desserializado, o Grupo não sabe seu Compasso-pai devido a circularidade no schema.
		// Restabelecemos para testar lógicas hierárquicas.
		grupoRestaurado.compasso = compassoPadrao;

		expect(grupoRestaurado.getUnidadeTempo().razao).toBe(0.25);
		expect(grupoRestaurado.getMetrica().razao).toBe(1.0);
		expect(grupoRestaurado.getPulsos()).toBe(4);
		expect(grupoRestaurado.pulsosOcupados).toBe(1);
	});

	it('16) Lança exceção de validação tipada se json injetado tiver estrutura corrompida', () => {
		const jsonInvalido = { elements: [ { tipo: 'desconhecido' } ], options: {} };
		
		expect(() => GrupoElementoJson.fromJson(jsonInvalido)).toThrow(Error);
	});
});