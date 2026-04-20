import { describe, it, expect } from 'vitest';
import { NotaJson } from '@adapters/persistence/NotaJson.js';
import { NotaAbc } from '@adapters/abcjs/NotaAbc.js';
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

describe( 'Nota Integration', () => {
  it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
    // 1. Receber JSON
    const jsonData = {
      altura: { key: 'C4' },
      duracao: { duracao: '1/4' },
      options: {
        acordes: [ 'C' ],
        fermata: true,
	      unidadeTempo: { numerador: 1, denominador: 1 }
      }
    };

    // 2. Instanciar via NotaJson (JSON -> Domínio)
    const notaDominio = NotaJson.fromJson( jsonData );

    // 3. Validar a saída ABC (Domínio -> ABC)
    const abcResult = NotaAbc.toAbc( notaDominio );
    expect( abcResult ).toBe( '"C"!fermata!C/4' );
  } );

  it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
    // 1. Receber ABC
    const abcData = '"G"g2';

    // 2. Instanciar via NotaAbc (ABC -> Domínio)
    const notaDominio = NotaAbc.fromAbc( abcData );
	  //notaDominio.unidadeTempo = new TempoDuracao( 2, 1 );
    // 3. Validar a saída JSON (Domínio -> JSON)
    const jsonResult = NotaJson.toJson( notaDominio );
    expect( jsonResult ).toEqual(
	    {
		    tipo: 'nota',
		    altura: 'G5',
		    duracao: '2/1',
		    options: {
			    acordes: [ 'G' ],
		    }
	    }
    );
  } );
} );
