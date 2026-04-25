import { describe, it, expect, beforeEach } from "vitest";
import { NotaFrequenciaJson } from '@adapters/persistence/NotaFrequenciaJson.js';
import { NotaFrequenciaAbc } from '@adapters/abcjs/NotaFrequenciaAbc.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'NotaFrequencia Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = { key: 'Gb4', abc: '_G', midi: 66 };

    // 2. Instanciar via NotaFrequenciaJson (JSON -> Domínio)
    const notaDominio = NotaFrequenciaJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    const abcResult = NotaFrequenciaAbc.toAbc( notaDominio );
    expect( abcResult ).toBe( '_G' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '^g';

    // 2. Instanciar via NotaFrequenciaAbc (ABC -> Domínio)
    const notaDominio = NotaFrequenciaAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    const jsonResult = NotaFrequenciaJson.toJson( notaDominio );
    expect( jsonResult ).toEqual( { key: 'Gs5', abc: '^g', midi: 80 } );
  } );
} );
