import { describe, it, expect } from 'vitest';
import { TempoDuracaoAbc } from '@adapters/abcjs/TempoDuracaoAbc.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'TempoDuracaoAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "1/4"', () => {
      const tempo = TempoDuracaoAbc.fromAbc( '1/4' );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 4 );
    } );

    it( 'deve criar a partir de "/2"', () => {
      const tempo = TempoDuracaoAbc.fromAbc( '/2' );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 2 );
    } );

    it( 'deve criar a partir de "/"', () => {
      const tempo = TempoDuracaoAbc.fromAbc( '/' );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 2 );
    } );

    it( 'deve criar a partir de "2"', () => {
      const tempo = TempoDuracaoAbc.fromAbc( '2' );
      expect( tempo.numerador ).toBe( 2 );
      expect( tempo.denominador ).toBe( 1 );
    } );

    it( 'deve criar a partir de "1/"', () => {
      const tempo = TempoDuracaoAbc.fromAbc( '1/' );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 2 );
    } );
  } );

  describe( 'toAbc', () => {
    it( 'deve retornar a string com prefixo L:', () => {
      const tempo = new TempoDuracao( 3, 4 );
      expect( TempoDuracaoAbc.toAbc( tempo ) ).toBe( 'L:3/4' );
    } );
  } );

  describe( 'toNota', () => {
    it( 'deve simplificar para "" em 1/1', () => {
      const tempo = new TempoDuracao( 1, 1 );
      expect( TempoDuracaoAbc.toNota( tempo ) ).toBe( '' );
    } );

    it( 'deve simplificar para "/" em 1/2', () => {
      const tempo = new TempoDuracao( 1, 2 );
      expect( TempoDuracaoAbc.toNota( tempo ) ).toBe( '/' );
    } );

    it( 'deve simplificar para "2" em 2/1', () => {
      const tempo = new TempoDuracao( 2, 1 );
      expect( TempoDuracaoAbc.toNota( tempo ) ).toBe( '2' );
    } );
  } );

  describe( 'toCompasso e toVoz', () => {
    it( 'deve envelopar em [L:...]', () => {
      const tempo = new TempoDuracao( 3, 8 );
      expect( TempoDuracaoAbc.toCompasso( tempo ) ).toBe( '[L:3/8]' );
      expect( TempoDuracaoAbc.toVoz( tempo ) ).toBe( '[L:3/8]' );
    } );
  } );
} );
