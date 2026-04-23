import { describe, it, expect } from 'vitest';
import { PausaJson } from '@adapters/persistence/PausaJson.js';
import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { pausaSchema } from '@schemas/pausaSchema.js';
import { z } from "zod";

describe( 'PausaJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar uma pausa a partir de um JSON completo', () => {
      const json = {
        duracao: { duracao: '1/4' },
        options: {
          invisivel: true,
          fermata: true,
          breath: true,
          acordes: [ 'C', 'G' ],
          pausaDeCompasso: true,
        }
      };
      const pausa = PausaJson.fromJson( json );
      expect( pausa.duracao.toString() ).toBe( '1/4' );
      expect( pausa.invisivel ).toBe( true );
      expect( pausa.fermata ).toBe( true );
      expect( pausa.breath ).toBe( true );
      expect( pausa.acordes ).toEqual( [ 'C', 'G' ] );
      expect( pausa.pausaDeCompasso ).toBe( true );
    } );

    it( 'deve criar uma pausa a partir de um JSON mínimo', () => {
      const json = { duracao: { duracao: '1/2' } };
      const pausa = PausaJson.fromJson( json );
      expect( pausa.duracao.toString() ).toBe( '1/2' );
      expect( pausa.invisivel ).toBe( false );
      expect( pausa.fermata ).toBe( false );
      expect( pausa.breath ).toBe( false );
      expect( pausa.acordes ).toEqual( [] );
      expect( pausa.pausaDeCompasso ).toBe( false );
    } );

    it( 'deve rejeitar JSON inválido', () => {
      expect( () => PausaJson.fromJson( {} ) ).toThrow(); // Missing duracao
      expect( () => PausaJson.fromJson( { duracao: 'invalid' } ) ).toThrow();
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para um JSON completo', () => {
	    const duracao = new TempoDuracao( 1, 4 );
	    const pausa = new Pausa( duracao, {
		    invisivel: true,
		    fermata: true,
		    fermataInvertida: false,
		    breath: true,
		    pausaDeCompasso: true,
		    acordes: [ 'C', 'G' ],
	    } );
      const json = PausaJson.toJson( pausa );
      const parsed = pausaSchema.parse( json );
      expect( parsed ).toStrictEqual(
	      {
		      tipo: 'pausa'
		      , duracao: '1/4'
		      , options: {
			      invisivel: true,
			      fermata: true,
			      breath: true,
			      acordes: [ 'C', 'G' ],
			      pausaDeCompasso: true,
		      }
	      }
      );
    } );

    it( 'deve exportar para um JSON mínimo', () => {
      const duracao = new TempoDuracao( 1, 2 );
      const pausa = new Pausa( duracao );
      const json = PausaJson.toJson( pausa );
      const parsed = pausaSchema.parse( json );
      expect( parsed ).toEqual(
	      {
		      tipo: 'pausa'
		      , duracao: '1/2'
		      , options: {
		      }
	      }
      );
    } );
  } );
} );
