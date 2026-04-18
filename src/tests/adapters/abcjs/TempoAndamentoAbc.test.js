import { describe, it, expect } from 'vitest';
import { TempoAndamentoAbc } from '@abcjs/TempoAndamentoAbc.js';
import { TempoAndamento } from '@domain/tempo/TempoAndamento.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'TempoAndamentoAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "1/4=120"', () => {
      const tempo = TempoAndamentoAbc.fromAbc( '1/4=120' );
      expect( tempo.andamento.numerador ).toBe( 1 );
      expect( tempo.andamento.denominador ).toBe( 4 );
      expect( tempo.bpm ).toBe( 120 );
    } );

    it( 'deve criar a partir de "1/2=90"', () => {
      const tempo = TempoAndamentoAbc.fromAbc( '1/2=90' );
      expect( tempo.andamento.numerador ).toBe( 1 );
      expect( tempo.andamento.denominador ).toBe( 2 );
      expect( tempo.bpm ).toBe( 90 );
    } );

    it( 'deve criar a partir de "2/1=60"', () => {
      const tempo = TempoAndamentoAbc.fromAbc( '2/1=60' );
      expect( tempo.andamento.numerador ).toBe( 2 );
      expect( tempo.andamento.denominador ).toBe( 1 );
      expect( tempo.bpm ).toBe( 60 );
    } );
  } );

  describe( 'toAbc', () => {
    it( 'deve retornar a string com prefixo Q:', () => {
      const duracao = new TempoDuracao( 3, 4 );
      const tempo = new TempoAndamento( duracao, 100 );
      expect( TempoAndamentoAbc.toAbc( tempo ) ).toBe( 'Q:3/4=100' );
    } );
  } );

  describe( 'toCompasso e toVoz', () => {
    it( 'deve envelopar em [Q:...]', () => {
      const duracao = new TempoDuracao( 3, 8 );
      const tempo = new TempoAndamento( duracao, 80 );
      expect( TempoAndamentoAbc.toCompasso( tempo ) ).toBe( '[Q:3/8=80]' );
      expect( TempoAndamentoAbc.toVoz( tempo ) ).toBe( '[Q:3/8=80]' );
    } );
  } );
} );
