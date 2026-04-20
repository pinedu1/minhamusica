import { describe, it, expect } from 'vitest';
import { UnissonoJson } from '@adapters/persistence/UnissonoJson.js';
import { UnissonoAbc } from '@adapters/abcjs/UnissonoAbc.js';

describe( 'Unissono Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = {
      notas: [
        { altura: { key: 'G4' }, duracao: { duracao: '1/1' } },
        { altura: { key: 'G5' }, duracao: { duracao: '1/1' } },
        { altura: { key: 'B5' }, duracao: { duracao: '1/1' } },
        { altura: { key: 'D5' }, duracao: { duracao: '1/1' } },
      ],
      duracao: { duracao: '1/1' },
      options: {
	      unidadeTempo: '1/1'
      },
    };

    // 2. Instanciar via UnissonoJson (JSON -> Domínio)
    const unissonoDominio = UnissonoJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    const abcResult = UnissonoAbc.toAbc( unissonoDominio );
    expect( abcResult ).toBe( '[Ggbd]' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '[Cceg]';

    // 2. Instanciar via UnissonoAbc (ABC -> Domínio)
    const unissonoDominio = UnissonoAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    const jsonResult = UnissonoJson.toJson( unissonoDominio );
    expect( jsonResult ).toEqual( {
	    tipo: 'unissono',
	    notas: [
		    { tipo: 'nota', altura: 'C4', duracao: '1/1', options: {} },
		    { tipo: 'nota', altura: 'C5', duracao: '1/1', options: {} },
		    { tipo: 'nota', altura: 'E5', duracao: '1/1', options: {} },
		    { tipo: 'nota', altura: 'G5', duracao: '1/1', options: {} },
	    ],
	    duracao: '1/1',
	    options: {},
    } );
  } );
} );
