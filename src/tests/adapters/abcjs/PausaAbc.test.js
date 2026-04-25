import { describe, it, expect } from 'vitest';
import { PausaAbc } from '@adapters/abcjs/PausaAbc.js';
import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

describe( 'PausaAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "Am"z', () => {
      const pausa = PausaAbc.fromAbc( '"Am"z' );
      expect( pausa.acordes ).toEqual( [ 'Am' ] );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );
    it( 'deve criar a partir de "Bm"Hz', () => {
      const pausa = PausaAbc.fromAbc( '"Bm"Hz' );
      expect( pausa.acordes ).toEqual( [ 'Bm' ] );
      expect( pausa.fermata ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "C#m"H!breath!z', () => {
      const pausa = PausaAbc.fromAbc( '"C#m"H!breath!z' );
      expect( pausa.acordes ).toEqual( [ 'C#m' ] );
      expect( pausa.fermata ).toBe( true );
      expect( pausa.breath ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "D#m"H!breath!x', () => {
      const pausa = PausaAbc.fromAbc( '"D#m"H!breath!x' );
      expect( pausa.acordes ).toEqual( [ 'D#m' ] );
      expect( pausa.fermata ).toBe( true );
      expect( pausa.breath ).toBe( true );
      expect( pausa.invisivel ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "D#m"!fermata!!breath!x', () => {
      const pausa = PausaAbc.fromAbc( '"D#m"!fermata!!breath!x' );
      expect( pausa.acordes ).toEqual( [ 'D#m' ] );
      expect( pausa.fermata ).toBe( true );
      expect( pausa.breath ).toBe( true );
      expect( pausa.invisivel ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "D#m"!invertedfermata!!breath!z', () => {
      const pausa = PausaAbc.fromAbc( '"D#m"!invertedfermata!!breath!z' );
      expect( pausa.acordes ).toEqual( [ 'D#m' ] );
      expect( pausa.fermataInvertida ).toBe( true );
      expect( pausa.breath ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "Am"Z', () => {
      const pausa = PausaAbc.fromAbc( '"Am"Z' );
      expect( pausa.acordes ).toEqual( [ 'Am' ] );
      expect( pausa.pausaDeCompasso ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "Bm"Z2', () => {
      const pausa = PausaAbc.fromAbc( '"Bm"Z2' );
      expect( pausa.acordes ).toEqual( [ 'Bm' ] );
      expect( pausa.pausaDeCompasso ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '2/1' );
    } );

    it( 'deve criar a partir de "C#m"Z4', () => {
      const pausa = PausaAbc.fromAbc( '"C#m"Z4' );
      expect( pausa.acordes ).toEqual( [ 'C#m' ] );
      expect( pausa.pausaDeCompasso ).toBe( true );
      expect( pausa.duracao.toString() ).toBe( '4/1' );
    } );
  } );

  describe( 'toAbc', () => {
    it( 'deve exportar para "Am"z', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'Am' ], unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"Am"z' );
    } );

    it( 'deve exportar para "Bm"Hz', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'Bm' ], fermata: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"Bm"!fermata!z' );
    } );

    it( 'deve exportar para "C#m"H!breath!z', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'C#m' ], fermata: true, breath: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"C#m"!fermata!!breath!z' );
    } );

    it( 'deve exportar para "D#m"H!breath!x', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'D#m' ], fermata: true, breath: true, invisivel: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"D#m"!fermata!!breath!x' );
    } );

    it( 'deve exportar para "D#m"H!invertedfermata!!breath!z', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'D#m' ], fermataInvertida: true, breath: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"D#m"!invertedfermata!!breath!z' );
    } );

    it( 'deve exportar para "Am"Z', () => {
      const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), { acordes: [ 'Am' ], pausaDeCompasso: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
	  pausa.metrica = new TempoMetrica( 1, 1 );
      expect( PausaAbc.toAbc( pausa ) ).toBe( '"Am"Z' );
    } );

	  it( 'deve exportar para "Bm"Z2', () => {
		  const pausa = ObjectFactory.newPausa( new TempoDuracao( 2, 1 ), { acordes: [ 'Bm' ], pausaDeCompasso: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
		  pausa.metrica = new TempoMetrica( 1, 1 );
		  expect( PausaAbc.toAbc( pausa ) ).toBe( '"Bm"Z2' );
	  } );

	  it( 'deve exportar para "C#m"Z4', () => {
		  const pausa = ObjectFactory.newPausa( new TempoDuracao( 4, 1 ), { acordes: [ 'C#m' ], pausaDeCompasso: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
		  pausa.metrica = new TempoMetrica( 1, 1 );
		  expect( PausaAbc.toAbc( pausa ) ).toBe( '"C#m"Z4' );
	  } );
  } );
	describe( 'toAbc com Unidade de Tempo (L:)', () => {
		// Mock de contexto para métrica 4/4 (Razão 1.0)
		const mockMetrica44 = { getMetrica: () => ({ numerador: 4, denominador: 4, razao: 1.0 }) };

		it( 'deve exportar para "Am"z quando duracao igual a unidadeTempo', () => {
			const unidade = new TempoDuracao( 1, 4 ); // L: 1/4
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 4 ), {
				acordes: [ 'Am' ]
				, unidadeTempo: unidade
			} );
			// Se duração (1/4) / unidade (1/4) = 1, o sufixo é vazio
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"Am"z' );
		} );

		it( 'deve exportar para "Bm"Hz quando houver fermata (atalho H)', () => {
			const unidade = new TempoDuracao( 1, 4 );
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 4 ), {
				acordes: [ 'Bm' ]
				, fermata: true
				, unidadeTempo: unidade
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"Bm"!fermata!z' );
		} );

		it( 'deve exportar para "C#m"H!breath!z2 (Duração dobrada)', () => {
			const unidade = new TempoDuracao( 1, 8 ); // L: 1/8
			// Duração 1/4 é o dobro da unidade 1/8
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 4 ), {
				acordes: [ 'C#m' ]
				, fermata: true
				, breath: true
				, unidadeTempo: unidade
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"C#m"!fermata!!breath!z2' );
		} );

		it( 'deve exportar para "D#m"H!breath!x (Invisível)', () => {
			const unidade = new TempoDuracao( 1, 4 );
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 4 ), {
				acordes: [ 'D#m' ]
				, fermata: true
				, breath: true
				, invisivel: true
				, unidadeTempo: unidade
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"D#m"!fermata!!breath!x' );
		} );

		it( 'deve exportar para "D#m"!invertedfermata!!breath!z', () => {
			const unidade = new TempoDuracao( 1, 4 );
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 4 ), {
				acordes: [ 'D#m' ]
				, fermataInvertida: true
				, breath: true
				, unidadeTempo: unidade
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"D#m"!invertedfermata!!breath!z' );
		} );

		it( 'deve exportar para "Am"Z (Pausa de Compasso Inteiro)', () => {
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), {
				acordes: [ 'Am' ]
				, pausaDeCompasso: true
				, compasso: mockMetrica44 // Necessário para o cálculo de razão
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"Am"Z' );
		} );

		it( 'deve exportar para "Bm"Z2 (Pausa de 2 compassos)', () => {
			// 2/1 dividido por 4/4 (1.0) = 2
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 2, 1 ), {
				acordes: [ 'Bm' ]
				, pausaDeCompasso: true
				, compasso: mockMetrica44
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"Bm"Z2' );
		} );

		it( 'deve exportar para "C#m"Z4 (Pausa de 4 compassos)', () => {
			const pausa = ObjectFactory.newPausa( new TempoDuracao( 4, 1 ), {
				acordes: [ 'C#m' ]
				, pausaDeCompasso: true
				, compasso: mockMetrica44
				, unidadeTempo: new TempoDuracao( 1, 1 )
			} );
			expect( PausaAbc.toAbc( pausa ) ).toBe( '"C#m"Z4' );
		} );
	} );
} );
