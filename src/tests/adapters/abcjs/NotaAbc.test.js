import { describe, it, expect } from 'vitest';
import { NotaAbc } from '@adapters/abcjs/NotaAbc.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { NotaFrequenciaAbc } from '@adapters/abcjs/NotaFrequenciaAbc.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'NotaAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de ""G"g2"', () => {
      const nota = NotaAbc.fromAbc( '"G"g2' );
      expect( nota.acordes ).toStrictEqual( [ 'G' ] );
      expect( nota.altura.key ).toBe( 'G5' );
      expect( nota.duracao.toString() ).toBe( '2/1' );
    } );

    it( 'deve criar a partir de ""D7"B"', () => {
      const nota = NotaAbc.fromAbc( '"D7"B' );
      expect( nota.acordes ).toEqual( [ 'D7' ] );
      expect( nota.altura.key ).toBe( 'B4' );
      expect( nota.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de ""C"~c"', () => {
      const nota = NotaAbc.fromAbc( '"C"~c' );
      expect( nota.acordes ).toEqual( [ 'C' ] );
      expect( nota.roll ).toBe( true );
      expect( nota.altura.key ).toBe( 'C5' );
      expect( nota.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "^f"', () => {
      const nota = NotaAbc.fromAbc( '^f' );
      expect( nota.altura.key ).toBe( 'Fs5' );
      expect( nota.duracao.toString() ).toBe( '1/1' );
    } );
	  it( 'deve criar a partir de "_e"', () => {
		  const nota = NotaAbc.fromAbc( '_e' );
		  expect( nota.altura.key ).toBe( 'Eb5' );
		  expect( nota.duracao.toString() ).toBe( '1/1' );
	  } );
  } );

  describe( 'toAbc', () => {
    it( 'deve exportar para ""G"g2"', () => {
      const altura = NotaFrequencia.getByKey( 'G5' );
      const duracao = new TempoDuracao( 2, 1 );
      const nota = new Nota( altura, duracao, { acordes: [ 'G' ], unidadeTempo: new TempoDuracao( 1, 1 ) } );
	  const abcString = NotaAbc.toAbc( nota );
      expect( abcString ).toBe( '"G"g2' );
    } );

    it( 'deve exportar para ""D7"B"', () => {
      const altura = NotaFrequencia.getByKey( 'B4' );
      const duracao = new TempoDuracao( 1, 1 );
      const nota = new Nota( altura, duracao, { acordes: [ 'D7' ], unidadeTempo: new TempoDuracao( 1, 1 ) } );
	  const abcString = NotaAbc.toAbc( nota );
      expect( abcString ).toBe( '"D7"B' );
    } );

    it( 'deve exportar para ""C"~c"', () => {
      const altura = NotaFrequencia.getByKey( 'C5' );
      const duracao = new TempoDuracao( 1, 1 );
      const nota = new Nota( altura, duracao, { acordes: [ 'C' ], roll: true, unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( NotaAbc.toAbc( nota ) ).toBe( '"C"~c' );
    } );

    it( 'deve exportar para "^f"', () => {
      const altura = NotaFrequencia.getByKey( 'Fs5' );
      const duracao = new TempoDuracao( 1, 1 );
      const nota = new Nota( altura, duracao, { unidadeTempo: new TempoDuracao( 1, 1 ) } );
      expect( NotaAbc.toAbc( nota ) ).toBe( '^f' );
    } );
  } );
} );
