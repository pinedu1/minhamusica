import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectFactory } from '@factory/ObjectFactory.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { GrupoElemento } from '@domain/compasso/GrupoElemento.js';

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe('GrupoElemento Domain', () => {
	let compassoPadrao;

	beforeEach(() => {
		compassoPadrao = ObjectFactory.newCompasso([], {
			unidadeTempo: new TempoDuracao(1, 4),
			metrica: new TempoMetrica(4, 4)
		});
	});

	const criarPausa = (num = 1, den = 4) => ObjectFactory.newPausa(new TempoDuracao(num, den));
	const criarNota = (num = 1, den = 4) => ObjectFactory.newNota(NotaFrequencia.DEFAULT, new TempoDuracao(num, den));
	const criarUnissono = (num = 1, den = 4) => ObjectFactory.newUnissono([criarNota(num, den), criarNota(num, den)], new TempoDuracao(num, den));
	const criarQuialtera = (num = 1, den = 4) => ObjectFactory.newQuialtera([criarNota(num, den), criarNota(num, den), criarNota(num, den)], new TempoDuracao(num, den));

	const criarGrupo = (elementos) => ObjectFactory.newGrupoElemento(elementos, { compasso: compassoPadrao });

	it('1) Deve instanciar corretamente com 1 pausa e calcular tempo', () => {
		const grupo = criarGrupo([criarPausa(1, 4)]);
		expect(grupo.elements.length).toBe(1);
		expect(grupo.elements[0].tipo).toBe('pausa');
		expect(grupo.pulsosOcupados).toBe(1);
		expect(grupo.getPulsos()).toBe(4);
	});

	it('2) Deve instanciar corretamente com 1 pausa e 1 nota', () => {
		const grupo = criarGrupo([criarPausa(1, 8), criarNota(1, 8)]);
		expect(grupo.elements.length).toBe(2);
		expect(grupo.pulsosOcupados).toBe(1); // 0.5 + 0.5 pulso (unidade é 1/4)
	});

	it('3) Deve instanciar corretamente com 1 pausa, 1 nota e 1 unissono', () => {
		const grupo = criarGrupo([criarPausa(1, 4), criarNota(1, 4), criarUnissono(1, 4)]);
		expect(grupo.elements.length).toBe(3);
		expect(grupo.pulsosOcupados).toBe(3);
	});

	it('4) Deve instanciar corretamente com 1 pausa, 1 nota, 1 unissono e 1 quialtera', () => {
		const grupo = criarGrupo([criarPausa(1, 4), criarNota(1, 4), criarUnissono(1, 4), criarQuialtera(1, 4)]);
		expect(grupo.elements.length).toBe(4);
		expect(grupo.pulsosOcupados).toBe(4);
		expect(grupo.elements[3].tipo).toBe('quialtera');
	});

	it('5) Deve instanciar corretamente com 4 notas', () => {
		const grupo = criarGrupo([criarNota(1, 4), criarNota(1, 4), criarNota(1, 4), criarNota(1, 4)]);
		expect(grupo.elements.length).toBe(4);
		expect(grupo.pulsosOcupados).toBe(4);
		expect(grupo.elements.every(e => e.tipo === 'nota')).toBe(true);
	});

	it('6) Deve instanciar corretamente com 1 pausa e 3 notas', () => {
		const grupo = criarGrupo([criarPausa(1, 4), criarNota(1, 4), criarNota(1, 4), criarNota(1, 4)]);
		expect(grupo.elements.length).toBe(4);
		expect(grupo.pulsosOcupados).toBe(4);
		expect(grupo.elements[0].tipo).toBe('pausa');
	});

	it('7) Deve instanciar corretamente com 2 unissonos e 2 pausas', () => {
		const grupo = criarGrupo([criarUnissono(1, 8), criarPausa(1, 8), criarUnissono(1, 8), criarPausa(1, 8)]);
		expect(grupo.elements.length).toBe(4);
		expect(grupo.pulsosOcupados).toBe(2); // 4 * 0.5 = 2 pulsos
	});

	it('8) Deve instanciar corretamente com 1 nota e 1 quialtera e garantir pulsoElemento', () => {
		const grupo = criarGrupo([criarNota(1, 4), criarQuialtera(1, 2)]);
		expect(grupo.elements.length).toBe(2);
		expect(grupo.pulsosOcupados).toBe(3); // 1 + 2
	});

	it('9) Deve instanciar corretamente com 3 notas e 1 pausa', () => {
		const grupo = criarGrupo([criarNota(1, 8), criarNota(1, 8), criarNota(1, 8), criarPausa(1, 8)]);
		expect(grupo.elements.length).toBe(4);
		expect(grupo.pulsosOcupados).toBe(2); // 4 * 0.5 = 2 pulsos
	});

	it('10) Deve testar propriedades do GrupoElemento, como unidadeTempo e metrica enviadas em options (indiretamente pelo compasso)', () => {
		const compasso = ObjectFactory.newCompasso([], {
			unidadeTempo: new TempoDuracao(1, 8), // Unidade diferente
			metrica: new TempoMetrica(3, 4) // 3/4
		});
		const grupo = ObjectFactory.newGrupoElemento([], { compasso });
		
		expect(grupo.getUnidadeTempo().razao).toBe(0.125);
		expect(grupo.getMetrica().razao).toBe(0.75);
		expect(grupo.getPulsos()).toBe(6); // 0.75 / 0.125 = 6 pulsos
	});

	it('11) Deve testar a adição de acordes e anotações ao GrupoElemento', () => {
		const grupo = criarGrupo([criarNota(1, 4)]);
		grupo.addAcorde('Cmaj7', 0);
		grupo.addAnotacao('Legato', 0, '^');
		
		expect(grupo.acordes.length).toBe(1);
		expect(grupo.acordes[0].texto).toBe('Cmaj7');
		expect(grupo.options.anotacoes.length).toBe(1);
		expect(grupo.options.anotacoes[0].texto).toBe('Legato');
	});

	it('12) Deve recuperar as letras do GrupoElemento em conformidade', () => {
		const notaComLetra = criarNota(1, 4);
		notaComLetra.letra = "A";
		const grupo = criarGrupo([notaComLetra, criarNota(1, 4)]);
		grupo.letra = ["B"]; // Letra própria do grupo
		
		const letras = grupo.getLetras();
		expect(letras).toEqual(["A", "B"]);
	});

	it('13) Deve lançar erro se instanciar grupo com elementos que não são ElementoMusical', () => {
		expect(() => criarGrupo([ { tipo: 'fake' } ])).toThrow(TypeError);
	});

	it('14) Deve instanciar com 1 nota, 1 pausa, 1 quialtera em métrica 6/8', () => {
		const comp68 = ObjectFactory.newCompasso([], {
			unidadeTempo: new TempoDuracao(1, 8),
			metrica: new TempoMetrica(6, 8)
		});
		const grupo = ObjectFactory.newGrupoElemento([
			criarNota(1, 8), criarPausa(1, 8), criarQuialtera(1, 4)
		], { compasso: comp68 });
		
		expect(grupo.pulsosOcupados).toBe(4); // 1 + 1 + 2 (unidade 1/8)
	});

	it('15) Deve calcular corretamente os pulsosOcupados num grupo complexo com 6 variados', () => {
		const grupo = criarGrupo([
			criarNota(1, 16), criarNota(1, 16), // 0.25 + 0.25 pulso
			criarPausa(1, 8),                   // 0.5 pulso
			criarUnissono(1, 8),                // 0.5 pulso
			criarQuialtera(1, 8),               // 0.5 pulso
			criarNota(1, 4)                     // 1 pulso
		]);
		expect(grupo.elements.length).toBe(6);
		expect(grupo.pulsosOcupados).toBe(3); // Total 3 pulsos
	});

	it('16) Deve adicionar elemento via addElemento respeitando setter interno de options.grupo', () => {
		const grupo = criarGrupo([]);
		const nota = criarNota(1, 4);
		grupo.addElemento(nota);
		
		expect(grupo.elements.length).toBe(1);
		expect(nota.options.grupo).toBe(grupo);
		expect(nota.getUnidadeTempo().razao).toBe(0.25);
	});
});