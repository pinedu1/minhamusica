import { describe, it, expect } from 'vitest';
import { QuialteraJson } from '@adapters/persistence/QuialteraJson.js';
import { QuialteraAbc } from '@adapters/abcjs/QuialteraAbc.js';

describe( 'Quialtera Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = {
      notas: [
        { tipo: 'nota', altura: { key: 'G4' }, duracao: { duracao: '1/16' } },
        { tipo: 'nota', altura: { key: 'G5' }, duracao: { duracao: '1/16' } },
        { tipo: 'nota', altura: { key: 'B5' }, duracao: { duracao: '1/16' } },
        { tipo: 'nota', altura: { key: 'D5' }, duracao: { duracao: '1/16' } },
      ],
      duracao: { duracao: '1/4' },
      options: {},
    };

    // 2. Instanciar via QuialteraJson (JSON -> Domínio)
    const quialteraDominio = QuialteraJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    const abcResult = QuialteraAbc.toAbc( quialteraDominio );
    expect( abcResult ).toBe( '(4:1:4Ggbd' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '(4:1:4Cceg';

    // 2. Instanciar via QuialteraAbc (ABC -> Domínio)
    const quialteraDominio = QuialteraAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    const jsonResult = QuialteraJson.toJson( quialteraDominio );
    expect( jsonResult ).toEqual( {
      notas: [
        { tipo: 'nota', altura: 'C4', duracao: '1/16', options: {} },
        { tipo: 'nota', altura: 'C5', duracao: '1/16', options: {} },
        { tipo: 'nota', altura: 'E5', duracao: '1/16', options: {} },
        { tipo: 'nota', altura: 'G5', duracao: '1/16', options: {} },
      ],
      duracao: '1/4',
      options: {},
    } );
  } );
} );
