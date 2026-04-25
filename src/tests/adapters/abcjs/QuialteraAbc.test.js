import { describe, it, expect, beforeEach } from "vitest";
import { QuialteraAbc } from '@adapters/abcjs/QuialteraAbc.js';
import { Quialtera } from '@domain/nota/Quialtera.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'QuialteraAbc', () => {
	// Definimos o contexto padrão: M:4/4 e L:1/4 (Unidade de tempo é a semínima)
	const contextoPadrao = {
		unidadeTempo: new TempoDuracao( 1, 4 ),
		metrica: new TempoMetrica( 4, 4 )
	};

	describe( 'fromAbc', () => {
		it( 'deve criar a partir de "(4:1:4Ggbd"', () => {
			// Passamos o contexto para que o parser saiba que L:1/4
			const quialtera = QuialteraAbc.fromAbc( '(4:1:4Ggbd', contextoPadrao );

			expect( quialtera.notas.length ).toBe( 4 );
			expect( quialtera.notas[0].altura.key ).toBe( 'G4' );
			expect( quialtera.notas[1].altura.key ).toBe( 'G5' );
			expect( quialtera.notas[2].altura.key ).toBe( 'B5' );
			expect( quialtera.notas[3].altura.key ).toBe( 'D5' );

			// Como q=1 e L=1/4, a duração absoluta ocupada é 1/4 da semibreve (1 tempo)
			expect( quialtera.duracao.toString() ).toBe( '1/4' );
		} );

		it( 'deve criar a partir de "(8:1:8cdefgabc\'"', () => {
			const quialtera = QuialteraAbc.fromAbc( '(8:1:8cdefgabc\'', contextoPadrao );
			expect( quialtera.notas.length ).toBe( 8 );
			expect( quialtera.notas[0].altura.key ).toBe( 'C5' );
			expect( quialtera.notas[7].altura.key ).toBe( 'C6' );
			expect( quialtera.duracao.toString() ).toBe( '1/4' );
		} );

		it( 'deve criar a partir de "(4:1:4Cceg"', () => {
			const quialtera = QuialteraAbc.fromAbc( '(4:1:4Cceg', contextoPadrao );
			expect( quialtera.notas.length ).toBe( 4 );
			expect( quialtera.notas[0].altura.key ).toBe( 'C4' );
			expect( quialtera.notas[1].altura.key ).toBe( 'C5' );
			expect( quialtera.notas[2].altura.key ).toBe( 'E5' );
			expect( quialtera.notas[3].altura.key ).toBe( 'G5' );
			expect( quialtera.duracao.toString() ).toBe( '1/4' );
		} );
	} );

	describe( 'toAbc', () => {
		it( 'deve exportar para "(4:1:4Ggbd"', () => {
			// 1. A quiáltera ocupa 1 tempo total (1/4 da semibreve)
			const duracaoQuialtera = new TempoDuracao( 1, 4 );

			// 2. REGRA DE OURO: Para não aparecer sufixo (ex: G/4), a nota deve ter
			// a mesma duração que a Unidade de Tempo L (1/4).
			const duracaoNota = new TempoDuracao( 1, 4 );

			const notas = [
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'G4' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'G5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'B5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'D5' ), duracaoNota ),
			];

			// 3. Adicionamos a unidadeTempo no construtor para o renderizador calcular o 'q'
			const quialtera = ObjectFactory.newQuialtera( notas, duracaoQuialtera, contextoPadrao );

			expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(4:1:4Ggbd' );
		} );

		it( 'deve exportar para "(8:1:8cdefgabc\'"', () => {
			const duracaoQuialtera = new TempoDuracao( 1, 4 );
			const duracaoNota = new TempoDuracao( 1, 4 );

			const notas = [
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'C5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'D5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'E5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'F5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'G5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'A5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'B5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'C6' ), duracaoNota ),
			];

			const quialtera = ObjectFactory.newQuialtera( notas, duracaoQuialtera, contextoPadrao );
			expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(8:1:8cdefgabc\'' );
		} );

		it( 'deve exportar para "(4:1:4Cceg"', () => {
			const duracaoQuialtera = new TempoDuracao( 1, 4 );
			const duracaoNota = new TempoDuracao( 1, 4 );

			const notas = [
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'C5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'E5' ), duracaoNota ),
				ObjectFactory.newNota( NotaFrequencia.getByKey( 'G5' ), duracaoNota ),
			];

			const quialtera = ObjectFactory.newQuialtera( notas, duracaoQuialtera, contextoPadrao );
			expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(4:1:4Cceg' );
		} );
	} );
} );