import { describe, it, expect } from 'vitest';
import { TempoAndamentoJson } from '@adapters/json/TempoAndamentoJson.js';
import { TempoAndamentoAbc } from '@adapters/abcjs/TempoAndamentoAbc.js';

describe( 'TempoAndamento Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC (toCompasso)', () => {
    // 1. Receber JSON
    const jsonData = { andamento: '1/2=90' };

    // 2. Instanciar via TempoAndamentoJson (JSON -> Domínio)
    const tempoDominio = TempoAndamentoJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    expect( TempoAndamentoAbc.toCompasso( tempoDominio ) ).toBe( '[Q:1/2=90]' );
  } );

  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC (toAbc)', () => {
    // 1. Receber JSON
    const jsonData = { andamento: '2/4=60' };

    // 2. Instanciar via TempoAndamentoJson (JSON -> Domínio)
    const tempoDominio = TempoAndamentoJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    expect( TempoAndamentoAbc.toAbc( tempoDominio ) ).toBe( 'Q:2/4=60' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '3/8=80';

    // 2. Instanciar via TempoAndamentoAbc (ABC -> Domínio)
    const tempoDominio = TempoAndamentoAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    expect( TempoAndamentoJson.toJson( tempoDominio ) ).toEqual( { andamento: '3/8=80' } );
  } );
} );
