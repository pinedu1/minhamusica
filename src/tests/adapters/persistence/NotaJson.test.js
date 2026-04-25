import { describe, it, expect, beforeEach } from "vitest";
import { NotaJson } from '@adapters/persistence/NotaJson.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { notaSchema, notaOutputSchema } from '@schemas/notaSchema.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'NotaJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar uma nota a partir de um JSON completo', () => {
      const json = {
		  id: 0,
	      altura: { key: 'C4' },
	      duracao: '1/4',
	      options: {
		      acordes: [ 'C', 'G' ],
		      fermata: true,
		      ligada: true,
	      }
      };
      const nota = NotaJson.fromJson( json );
      expect( nota.altura.key ).toBe( 'C4' );
      expect( nota.duracao.toString() ).toBe( '1/4' );
      expect( nota.acordes ).toEqual( [ 'C', 'G' ] );
      expect( nota.fermata ).toBe( true );
      expect( nota.ligada ).toBe( true );
    } );

    it( 'deve criar uma nota a partir de um JSON mínimo', () => {
      const json = {
	      id: 0,
	      altura: { key: 'D5' },
	      duracao: { duracao: '1/2' },
      };
      const nota = NotaJson.fromJson( json );
      expect( nota.altura.key ).toBe( 'D5' );
      expect( nota.duracao.toString() ).toBe( '1/2' );
      expect( nota.acordes ).toEqual( [] );
      expect( nota.fermata ).toBe( false );
      expect( nota.ligada ).toBe( false );
    } );

    it( 'deve rejeitar JSON inválido', () => {
      expect( () => NotaJson.fromJson( {} ) ).toThrow(); // Missing altura and duracao
      expect( () => NotaJson.fromJson( { altura: { key: 'C4' } } ) ).toThrow(); // Missing duracao
      expect( () => NotaJson.fromJson( { duracao: { duracao: '1/4' } } ) ).toThrow(); // Missing altura
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para um JSON completo', () => {
      const altura = NotaFrequencia.getByKey( 'A4' );
      const duracao = new TempoDuracao( 1, 4 );
      const nota = ObjectFactory.newNota( altura, duracao, {
        acordes: [ 'Am' ],
        fermata: true,
        ligada: true,
      } );
      const json = NotaJson.toJson( nota );
      expect( json ).toEqual( {
	      id: 0,
	      tipo: 'nota',
	      altura: 'A4',
	      duracao: '1/4',
	      options: {
		      acordes: [ 'Am' ],
		      fermata: true,
		      ligada: true,
	      }
      } );
    } );

    it( 'deve exportar para um JSON mínimo', () => {
      const altura = NotaFrequencia.getByKey( 'B5' );
      const duracao = new TempoDuracao( 1, 2 );
      const nota = ObjectFactory.newNota( altura, duracao );
      const json = NotaJson.toJson( nota );
      expect( json ).toStrictEqual( {
	      id: 0,
	      tipo: 'nota',
	      altura: 'B5',
	      duracao: '1/2',
	      options: {}
      } );
    } );
  } );
} );
