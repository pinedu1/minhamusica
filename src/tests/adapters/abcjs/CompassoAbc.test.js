import { describe, it, expect, beforeEach } from 'vitest';
import { Compasso } from '@domain/compasso/Compasso.js';
import { Nota } from '@domain/nota/Nota.js';
import { Pausa } from '@domain/nota/Pausa.js';
import { Unissono } from '@domain/nota/Unissono.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { Tonalidade } from '@domain/compasso/Tonalidade.js';
import { TipoBarra } from '@domain/compasso/TipoBarra.js';
import { CompassoAbc } from '@abcjs/CompassoAbc.js';
import { Obra } from '@domain/obra/Obra.js';
import { Quialtera } from "@domain/nota/Quialtera.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js"; // Assuming Obra exists

describe('CompassoAbc', () => {
	describe('Sessão 1: Testes de parse de Compasso para ABC (toAbc)', () => {
		it('a) Teste de agrupamento de notas', () => {
			let obraMock = new Obra(1, [],{
				metrica: new TempoMetrica(4, 4),
				unidadeTempo: new TempoDuracao(1, 4),
				andamento: {
					bpm: 90,
					unidade: new TempoDuracao(1, 4)
				},
				tonalidade: Tonalidade.Dm,
			}); // O ID ou estrutura que a classe Obra exigir
			const compasso = new Compasso([], {
				barraInicial: TipoBarra.NONE,
				barraFinal: TipoBarra.NONE
			});
			compasso.obra = obraMock;
			const n1 = new Nota(NotaFrequencia.getByAbc('C'), new TempoDuracao(1, 4));
			const n2 = new Nota(NotaFrequencia.getByAbc('D'), new TempoDuracao(1, 4));
			const n3 = new Nota(NotaFrequencia.getByAbc('E'), new TempoDuracao(1, 4));
			const n4 = new Nota(NotaFrequencia.getByAbc('F'), new TempoDuracao(1, 4));
			const g1 = new GrupoElemento([n1, n2], {compasso: compasso});
			const g2 = new GrupoElemento([n3, n4], {compasso: compasso});
			compasso.grupos = [g1, g2];
			//compasso.elements = [n1, n2, n3, n4];

			// Como a métrica é 4/4, pulsosTotais = 4. Metade = 2.
			// Logo, após as duas primeiras notas, deve inserir um espaço.	/*

			// Pelo código implementado: CDEF com L:1/8 (onde 1/8 / 1/8 = 1, sufixo vazio)
			// Agrupamento quebra no meio: "CD EF"
			const abcResult = CompassoAbc.toAbc(compasso);
			expect(abcResult).toBe("CD EF");
		});

		it('b) Teste de anotações/cifras saída deve ser: ^dedilhado especial"C z3|', () => {
			let obraMock = new Obra(1, [],{
				metrica: new TempoMetrica(4, 4),
				unidadeTempo: new TempoDuracao(1, 4),
				andamento: {
					bpm: 90,
					unidade: new TempoDuracao(1, 4)
				},
				tonalidade: Tonalidade.Dm,
			}); // O ID ou estrutura que a classe Obra exigir
			const compasso = new Compasso([], {});
			compasso.obra = obraMock;
			const n1 = new Nota(NotaFrequencia.getByAbc("C"), new TempoDuracao(1, 4)); // Usando new Nota diretamente
			const g1 = new GrupoElemento([n1], {compasso: compasso});
			g1.addAnotacao("dedilhado especial", 0, "^");
			compasso.grupos = [g1];

			const abcResult = CompassoAbc.toAbc(compasso);
			expect(abcResult).toBe('"^dedilhado especial"C z3|');
		});
		it('c) Teste de Barras, Métrica e Tom, saída deve ser: |:[M:4/4][K:G]:|', () => {
			const compasso = new Compasso([], {
				metrica: new TempoMetrica(4, 4),
				mudancaDeTom: Tonalidade.create('G'),
				barraInicial: TipoBarra.get('REPEAT_OPEN'),
				barraFinal: TipoBarra.get('REPEAT_CLOSE'),
				unidadeTempo: new TempoDuracao(1, 4),
			});
			const abcResult = CompassoAbc.toAbc(compasso);
			// Ordem esperada: Barra -> Metrica -> Tom -> (elementos vazios) -> Barra final
			expect(abcResult).toBe("|:[M:4/4][K:G]:|");
		});
	});
	describe('Sessão 2: Testes de parse de ABC para Compasso (fromAbc) 4/4', () => {
		let obraMock = new Obra(1, [],{
			metrica: new TempoMetrica(4, 4),
			unidadeTempo: new TempoDuracao(1, 4),
			andamento: {
				bpm: 90,
				unidade: new TempoDuracao(1, 4)
			},
			tonalidade: Tonalidade.create('Dm'),
		}); // O ID ou estrutura que a classe Obra exigir
		it('1) Deve parsear "|:A/d/e/f/ d/|"', () => {
			const compassoString = "|:A/d/e/f/ d/|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);
			expect(compasso.grupos.length).toBe(2);

			let grupo = compasso.grupos[0]; // A, d, e, f
			expect(compasso.grupos.length).toBe(2);
			expect(grupo.elements.length).toBe(4);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('A');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8'); // L:1/4, A/ = 1/8

			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('d');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8');

			expect(grupo.elements[2]).toBeInstanceOf(Nota);
			expect(grupo.elements[2].altura.abc).toBe('e');
			expect(grupo.elements[2].duracao.toString()).toBe('1/8');

			expect(grupo.elements[3]).toBeInstanceOf(Nota);
			expect(grupo.elements[3].altura.abc).toBe('f');
			expect(grupo.elements[3].duracao.toString()).toBe('1/8');

			grupo = compasso.grupos[1]; // d
			expect(grupo.elements.length).toBe(1);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('d');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');

			expect(compasso.barraInicial).toEqual(TipoBarra.REPEAT_OPEN);
			expect(compasso.barraFinal).toEqual(TipoBarra.STANDARD);
		});
		it('2) Deve parsear "| cB F/G/|" com notas e durações variadas', () => {
			const compassoString = "| cB F/G/|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);

			let grupo = compasso.grupos[0];  // c, B
			expect(grupo.elements.length).toBe(2);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('c');
			expect(grupo.elements[0].duracao.toString()).toBe('1/4'); // L:1/4, c = 1/4

			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('B');
			expect(grupo.elements[1].duracao.toString()).toBe('1/4');

			grupo = compasso.grupos[1]; // F, G
			expect(grupo.elements.length).toBe(2);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('F');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8'); // F/ = 1/8

			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('G');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8'); // G/ = 1/8

			expect(compasso.barraInicial).equals(TipoBarra.STANDARD);
			expect(compasso.barraFinal).equals(TipoBarra.STANDARD);
		});
		it('3) Deve parsear "| a/g/f/g c\'/|"', () => {
			const compassoString = "| a/g/f/g c'/|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);

			let grupo = compasso.grupos[0];  // a, g, f, g
			expect(grupo.elements.length).toBe(4);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('a');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
			grupo = compasso.grupos[1];  // c
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe("c'");
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
		});
		it('4) Deve parsear "a3"', () => {
			const compassoString = "a3";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);
			expect(compasso.grupos.length).toBe(1);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(1);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('a');
			expect(grupo.elements[0].duracao.toString()).toBe('3/4');
		});
		it('5) Deve parsear "| f/e/d/f g/|"', () => {
			const compassoString = "| f/e/d/f g/|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(4);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('f');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
			grupo = compasso.grupos[1];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('g');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
		});
		it('6) Deve parsear "a3|" com barra final', () => {
			const compassoString = "a3|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(1);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(1);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('a');
			expect(grupo.elements[0].duracao.toString()).toBe('3/4');
			expect(compasso.barraFinal).toBe(TipoBarra.STANDARD);
		});
		it('7) Deve parsear "A/d/e/f d/|" com barra final', () => {
			const compassoString = "A/d/e/f d/|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(4);
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('A');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
			grupo = compasso.grupos[1];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('d');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
			expect(compasso.barraFinal).toBe(TipoBarra.STANDARD);
		});
	});
	describe('Sessão 3: Testes de parse de ABC para Compasso (fromAbc) 6/8 K:B', () => {
		let obraMock = new Obra(1, [],{
			metrica: new TempoMetrica(6, 8),
			unidadeTempo: new TempoDuracao(1, 8),
			andamento: {
				bpm: 90,
				unidade: new TempoDuracao(1, 8)
			},
			tonalidade: Tonalidade.create('B'),
		}); // O ID ou estrutura que a classe Obra exigir
		it('1) Deve parsear "|[Bd][Bd][Bd] [Bd][Ac][Bd]|" como unissonos', () => {
			// M:6/8, L:1/8, Q:1/4=94, K:B
			const compassoString = "|[Bd][Bd][Bd] [Bd][Ac][Bd]|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(3);
			expect(grupo.elements[0]).toBeInstanceOf(Unissono);
			expect(grupo.elements[0].notas.length).toBe(2);
			expect(grupo.elements[0].notas[0].altura.abc).toBe('B');
			expect(grupo.elements[0].notas[1].altura.abc).toBe('d');
			expect(grupo.elements[0].duracao.toString()).toBe('1/8');
			grupo = compasso.grupos[1];
			expect(grupo.elements.length).toBe(3);
			expect(grupo.elements[0]).toBeInstanceOf(Unissono);
			expect(grupo.elements[1].notas.length).toBe(2);
			expect(grupo.elements[1].notas[0].altura.abc).toBe('A');
			expect(grupo.elements[1].notas[1].altura.abc).toBe('c');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8');

			expect(compasso.barraInicial).toBe(TipoBarra.STANDARD);
			expect(compasso.barraFinal).toBe(TipoBarra.STANDARD);
		});
		it('2) Deve parsear "|z3 [Bd][Ac][Bd]|" como pausa e unissonos', () => {
			// M:6/8, L:1/8, Q:1/4=94, K:B
			const compassoString = "|z3 [Bd][Ac][Bd]|";
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(2);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(1);
			expect(grupo.elements[0]).toBeInstanceOf(Pausa);
			expect(grupo.elements[0].duracao.toString()).toBe('3/8');
			grupo = compasso.grupos[1];
			expect(grupo.elements[2]).toBeInstanceOf(Unissono);
			expect(grupo.elements[2].notas.length).toBe(2);
			expect(grupo.elements[2].notas[0].altura.abc).toBe('B');
			expect(grupo.elements[2].notas[1].altura.abc).toBe('d');
			expect(grupo.elements[2].duracao.toString()).toBe('1/8');

			expect(compasso.barraInicial).toBe(TipoBarra.STANDARD);
			expect(compasso.barraFinal).toBe(TipoBarra.STANDARD);
		});
	});
	describe('Sessão 4: Testes de parse de ABC para Compasso (fromAbc) 4/4 K:G', () => {
		let obraMock = new Obra(1, [],{
			metrica: new TempoMetrica(4, 4),
			unidadeTempo: new TempoDuracao(1, 8),
			andamento: {
				bpm: 90,
				unidade: new TempoDuracao(1, 8)
			},
			tonalidade: Tonalidade.create('G'),
		}); // O ID ou estrutura que a classe Obra exigir
		it('1) Deve parsear "| "G" [GAB]c dedB " com quialtera e cifra', () => {
			const compassoString = '| "G" [GAB]c dedB ';
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			let grupo = compasso.grupos[0];
			expect(grupo.acordes[0]).toBe('G');
			expect(compasso.grupos.length).toBe(3);
			grupo = compasso.grupos[1];
			expect(grupo.elements.length).toBe(2); // (GAB), c
			expect(grupo.elements[0]).toBeInstanceOf(Unissono); // Assuming Quialtera class exists
			expect(grupo.elements[0].notas.length).toBe(3); // G, A, B
			expect(grupo.elements[0].notas[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].notas[0].altura.abc).toBe('G');
			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('c');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8');
			grupo = compasso.grupos[2];
			expect(grupo.elements.length).toBe(4); // d, e, d, B
			expect(grupo.elements[0]).toBeInstanceOf(Nota); // Assuming Nota class exists
			expect(grupo.elements[3]).toBeInstanceOf(Nota);
			expect(grupo.elements[3].altura.abc).toBe('B');
			expect(grupo.elements[3].duracao.toString()).toBe('1/8');
		});
		it('2) Deve parsear "| "G" .d.e.d.B dedB |" com staccato e cifra', () => {
			const compassoString = '| "G" .d.e.d.B dedB |';
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(3);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(0); // .d, .e, .d, .B, d, e, d, B
			grupo = compasso.grupos[1];
			expect(grupo.elements.length).toBe(4); // .d, .e, .d, .B
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('d');
			expect(grupo.elements[0].staccato).toBe(true); // Assuming staccato property
			grupo = compasso.grupos[2];
			expect(grupo.elements.length).toBe(4); // d, e, d, B
			expect(grupo.elements[3]).toBeInstanceOf(Nota);
			expect(grupo.elements[3].altura.abc).toBe('B');
		});
		it('3) Deve parsear "| "C" ~c2ec "G" ~B2dB- |" com trinado e tie', () => {
			const compassoString = '| "C" ~c2ec "G" ~B2dB- |';
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(4);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(0); // ~c2, e, c, ~B2, d, B-
			grupo = compasso.grupos[1];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('c');
			expect(grupo.elements[0].roll).toBe(true); // Assuming roll property
			expect(grupo.elements[0].duracao.toString()).toBe('2/8'); // c2 = 2/8

			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('e');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8'); // e = 1/8
			grupo = compasso.grupos[3];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('B');
			expect(grupo.elements[0].roll).toBe(true);
			expect(grupo.elements[0].duracao.toString()).toBe('2/8');

			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('d');

			expect(grupo.elements[2]).toBeInstanceOf(Nota);
			expect(grupo.elements[2].altura.abc).toBe('B');
			expect(grupo.elements[2].ligada).toBe(true);
		});
		it('4) Deve parsear "| "C" [cde]- "Am" ec |" com quialtera e cifras', () => {
			const compassoString = '| "C" [cde]- "Am" ec |';
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(4);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(0);
			grupo = compasso.grupos[1];
			expect(grupo.elements.length).toBe(1);
			expect(grupo.elements[0]).toBeInstanceOf(Unissono);
			expect(grupo.elements[0].notas.length).toBe(3); // c, d, e, d, c
			expect(grupo.elements[0].notas[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].notas[0].altura.abc).toBe('c');
			expect(grupo.elements[0].ligada).toBe(true);
			grupo = compasso.grupos[3];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('e');
			expect(grupo.elements[1]).toBeInstanceOf(Nota);
			expect(grupo.elements[1].altura.abc).toBe('c');
			expect(grupo.elements[1].duracao.toString()).toBe('1/8');
		});
		it('5) Deve parsear "| "C" (5cdedc "Am" ec"Bm"B2"G"dB |" com quialtera e cifras', () => {
			const compassoString = '| "C" (5cdedc "Am" ec"Bm"B2"G"dB |';
			const compasso = CompassoAbc.fromAbc(compassoString, obraMock.options);

			expect(compasso.grupos.length).toBe(4);
			let grupo = compasso.grupos[0];
			expect(grupo.elements.length).toBe(0);
			grupo = compasso.grupos[1];
			expect(grupo.elements.length).toBe(1); // "C" (5cdedc, "Am" e, c, "Bm"B2, "~G"d, B
			expect(grupo.elements[0]).toBeInstanceOf(Quialtera);
			expect(grupo.elements[0].notas.length).toBe(5); // c, d, e, d, c
			expect(grupo.elements[0].notas[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].notas[0].altura.abc).toBe('c');
			grupo = compasso.grupos[2];
			expect(grupo.elements.length).toBe(0);
			grupo = compasso.grupos[3];
			expect(grupo.elements[0]).toBeInstanceOf(Nota);
			expect(grupo.elements[0].altura.abc).toBe('e');

			expect(grupo.elements[2]).toBeInstanceOf(Nota);
			expect(grupo.elements[2].altura.abc).toBe('B');
			expect(grupo.elements[2].duracao.toString()).toBe('2/8');

			expect(grupo.elements[4]).toBeInstanceOf(Nota);
			expect(grupo.elements[4].altura.abc).toBe('B');
		});
	});
});
