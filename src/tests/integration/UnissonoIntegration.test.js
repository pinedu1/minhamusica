import { describe, it, expect, beforeEach } from "vitest";
import { UnissonoJson } from '@adapters/persistence/UnissonoJson.js';
import { UnissonoAbc } from '@adapters/abcjs/UnissonoAbc.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'Unissono Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = {
		id: 0,
	    notas: [
		    { id: 0, altura: { key: 'G4' }, duracao: { duracao: '1/1' } },
		    { id: 0, altura: { key: 'G5' }, duracao: { duracao: '1/1' } },
		    { id: 0, altura: { key: 'B5' }, duracao: { duracao: '1/1' } },
		    { id: 0, altura: { key: 'D5' }, duracao: { duracao: '1/1' } },
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
	    id: 0,
	    tipo: 'unissono',
	    notas: [
		    { id: 0, tipo: 'nota', altura: 'C4', duracao: '1/1', options: {} },
		    { id: 0, tipo: 'nota', altura: 'C5', duracao: '1/1', options: {} },
		    { id: 0, tipo: 'nota', altura: 'E5', duracao: '1/1', options: {} },
		    { id: 0, tipo: 'nota', altura: 'G5', duracao: '1/1', options: {} },
	    ],
	    duracao: '1/1',
	    options: {},
    } );
  } );
} );
