import { describe, it, expect } from 'vitest';
import { TempoMetricaJson } from '@adapters/persistence/TempoMetricaJson.js';
import { TempoMetricaAbc } from '@adapters/abcjs/TempoMetricaAbc.js';

describe( 'TempoMetrica Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC (toCompasso)', () => {
    // 1. Receber JSON
    const jsonData = { metrica: '1/2' };

    // 2. Instanciar via TempoMetricaJson (JSON -> Domínio)
    const tempoDominio = TempoMetricaJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    expect( TempoMetricaAbc.toCompasso( tempoDominio ) ).toBe( '[M:1/2]' );
  } );

  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC (toAbc)', () => {
    // 1. Receber JSON
    const jsonData = { metrica: '2/4' };

    // 2. Instanciar via TempoMetricaJson (JSON -> Domínio)
    const tempoDominio = TempoMetricaJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    expect( TempoMetricaAbc.toAbc( tempoDominio ) ).toBe( 'M:2/4' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '3/8';

    // 2. Instanciar via TempoMetricaAbc (ABC -> Domínio)
    const tempoDominio = TempoMetricaAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    expect( TempoMetricaJson.toJson( tempoDominio ) ).toEqual( { metrica: '3/8' } );
  } );
} );
