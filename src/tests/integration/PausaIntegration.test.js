import { describe, it, expect } from 'vitest';
import { PausaJson } from '@adapters/persistence/PausaJson.js';
import { PausaAbc } from '@adapters/abcjs/PausaAbc.js';
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

describe( 'Pausa Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = {
      duracao: '1/1',
      options: {
        acordes: [ 'Gm' ],
        fermata: true,
        breath: true,
      }
    };

    // 2. Instanciar via PausaJson (JSON -> Domínio)
    const pausaDominio = PausaJson.fromJson( jsonData );
	pausaDominio.unidadeTempo = new TempoDuracao(1,1);

    // 3. Validar a saída ABC (Domínio -> ABC)
    const abcResult = PausaAbc.toAbc( pausaDominio );
    expect( abcResult ).toBe( '"Gm"!fermata!!breath!z' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '"D"Z4';

    // 2. Instanciar via PausaAbc (ABC -> Domínio)
    const pausaDominio = PausaAbc.fromAbc( abcData );

    // 3. Validar a saída JSON (Domínio -> JSON)
    const jsonResult = PausaJson.toJson( pausaDominio );
    expect( jsonResult ).toEqual(
	    {
		    tipo: 'pausa'
		    , duracao: '4/1'
		    , options: {
			    acordes: [ 'D' ]
			    , pausaDeCompasso: true
		    }
	    }
    );
  } );
} );
