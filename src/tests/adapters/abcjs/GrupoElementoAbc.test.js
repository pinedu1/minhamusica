import { describe, it, expect, beforeEach } from 'vitest';
import { GrupoElementoAbc } from '@abcjs/GrupoElementoAbc.js';
import { ObjectFactory } from '@factory/ObjectFactory.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('GrupoElementoAbc Adapter', () => {
	let compassoPadrao;
	let contextOptions;

	beforeEach(() => {
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

	it('1) fromAbc e toAbc com 1 pausa (z)', () => {
		const abcOriginal = "z";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(1);
		expect(grupoParsed.elements[0].tipo).toBe('pausa');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('2) fromAbc e toAbc com 1 pausa e 1 nota', () => {
		const abcOriginal = "zC";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(2);
		expect(grupoParsed.elements[0].tipo).toBe('pausa');
		expect(grupoParsed.elements[1].tipo).toBe('nota');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('3) fromAbc e toAbc com 1 pausa, 1 nota e 1 unissono', () => {
		const abcOriginal = "zC[CEG]";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(3);
		expect(grupoParsed.elements[2].tipo).toBe('unissono');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('4) fromAbc e toAbc com 1 pausa, 1 nota, 1 unissono e 1 quialtera', () => {
		const abcOriginal = "zC[CEG](3CDE";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(4);
		expect(grupoParsed.elements[3].tipo).toBe('quialtera');
		//expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe('zC[CEG](3:2:3CDE');

	});

	it('5) fromAbc e toAbc com 4 notas', () => {
		const abcOriginal = "CDEF";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(4);
		expect(grupoParsed.elements.every(e => e.tipo === 'nota')).toBe(true);
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('6) fromAbc e toAbc com 1 pausa e 3 notas', () => {
		const abcOriginal = "zCDE";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(4);
		expect(grupoParsed.elements[0].tipo).toBe('pausa');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('7) fromAbc e toAbc com 2 unissonos e 2 pausas alternados', () => {
		const abcOriginal = "[CEG]z[FAC]z";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(4);
		expect(grupoParsed.elements[0].tipo).toBe('unissono');
		expect(grupoParsed.elements[1].tipo).toBe('pausa');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('8) fromAbc e toAbc com 1 nota e 1 quialtera', () => {
		const abcOriginal = "C(3CDE";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(2);
		expect(grupoParsed.elements[0].tipo).toBe('nota');
		expect(grupoParsed.elements[1].tipo).toBe('quialtera');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe('C(3:2:3CDE');
	});

	it('9) fromAbc e toAbc com 3 notas e 1 pausa no final', () => {
		const abcOriginal = "CDEz";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(4);
		expect(grupoParsed.elements[3].tipo).toBe('pausa');
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('10) fromAbc e toAbc com Acordes Sincronizados ("Cmaj7"C)', () => {
		const abcOriginal = '"Cmaj7"C';
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(1);
		const abcGerado = GrupoElementoAbc.toAbc(grupoParsed);
		expect(abcGerado).toBe(abcOriginal);
	});

	it('11) fromAbc e toAbc com 2 quialteras seguidas', () => {
		const abcOriginal = "(3CDE(3FGA";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(2);
		expect(grupoParsed.elements[0].tipo).toBe('quialtera');
		expect(grupoParsed.elements[1].tipo).toBe('quialtera');
		const abcGerado = GrupoElementoAbc.toAbc(grupoParsed);
		expect(abcGerado).toBe('(3:2:3CDE(3:2:3FGA');
	});

	it('12) fromAbc e toAbc com 1 unissono, 1 pausa, 1 unissono', () => {
		const abcOriginal = "[CE]z[EG]";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(3);
		expect(GrupoElementoAbc.toAbc(grupoParsed)).toBe(abcOriginal);
	});

	it('13) fromAbc e toAbc com 1 nota, 1 pausa, 1 quialtera', () => {
		const abcOriginal = "Cz(3CDE";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		const abcGerado = GrupoElementoAbc.toAbc(grupoParsed);
		expect(grupoParsed.elements.length).toBe(3);
		expect(abcGerado).toBe('Cz(3:2:3CDE');
	});

	it('14) fromAbc e toAbc com 1 quialtera e 1 unissono', () => {
		const abcOriginal = "(3CDE[CEG]";
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		expect(grupoParsed.elements.length).toBe(2);
		expect(grupoParsed.elements[0].tipo).toBe('quialtera');
		expect(grupoParsed.elements[1].tipo).toBe('unissono');
		const abcGerado = GrupoElementoAbc.toAbc(grupoParsed);
		expect( abcGerado ).toBe('(3:2:3CDE[CEG]');
	});

	it('15) Teste de integração de toAbc construindo manualmente do Domínio e adicionando anotação', () => {
		const grupo = criarGrupo([criarNota("C"), criarPausa(1,4), criarUnissono(["C", "E"])]);
		// Adiciona Acorde via options intrinsecas do GrupoElemento (para fallback de toAbc)
		grupo.addAcorde("G7", 0);
		grupo.addAnotacao("Texto", 1, "^");
		
		const abcGerado = GrupoElementoAbc.toAbc(grupo);
		expect(abcGerado).toContain('"G7"');
		expect(abcGerado).toContain('"^Texto"');
	});

	it('16) Validação do compasso contextual provido pelo fromAbc', () => {
		const abcOriginal = "CDEF"; // 4 notas
		const grupoParsed = GrupoElementoAbc.fromAbc(abcOriginal, contextOptions);
		
		// Confirma que as referências pai de contexto chegaram ao grupo
		expect(grupoParsed.getUnidadeTempo().razao).toBe(0.25);
		expect(grupoParsed.getMetrica().razao).toBe(1.0);
		expect(grupoParsed.elements.length).toBe(4);
	});
});