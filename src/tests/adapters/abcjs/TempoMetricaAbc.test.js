import { describe, it, expect } from 'vitest';
import { TempoMetricaAbc } from '@abcjs/TempoMetricaAbc.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';

describe( 'TempoMetricaAbc', () => {
  describe( 'fromAbc', () => {
	  it( 'deve criar a partir de "4/4"', () => {
		  const tempo = TempoMetricaAbc.fromAbc( '4/4' );
		  expect( tempo.numerador ).toBe( 4 );
		  expect( tempo.denominador ).toBe( 4 );
	  } );

	  it( 'Deve lançar erro ao tentar criar a partir de "C" (Sintaxe Inválida)' , () => {
		  // Para testar erros lançados (thrown), passamos uma função para o expect
		  expect( () => {
			  TempoMetricaAbc.fromAbc( 'C' );
		  } ).toThrow( TypeError );
	  } );
	  it( 'deve criar a partir de "2/4"', () => {
		  const tempo = TempoMetricaAbc.fromAbc( '2/4' );
		  expect( tempo.numerador ).toBe( 2 );
		  expect( tempo.denominador ).toBe( 4 );
	  } );
  } );

  describe( 'toAbc', () => {
    it( 'deve retornar a string com prefixo M:', () => {
      const tempo = new TempoMetrica( 3, 4 );
      expect( TempoMetricaAbc.toAbc( tempo ) ).toBe( 'M:3/4' );
    } );
  } );

  describe( 'toCompasso e toVoz', () => {
    it( 'deve envelopar em [M:...]', () => {
      const tempo = new TempoMetrica( 3, 8 );
      expect( TempoMetricaAbc.toCompasso( tempo ) ).toBe( '[M:3/8]' );
      expect( TempoMetricaAbc.toVoz( tempo ) ).toBe( '[M:3/8]' );
    } );
  } );
} );
