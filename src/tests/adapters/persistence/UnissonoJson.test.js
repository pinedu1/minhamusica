import { describe, it, expect, beforeEach } from "vitest";
import { UnissonoJson } from '@adapters/persistence/UnissonoJson.js';
import { Unissono } from '@domain/nota/Unissono.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { unissonoOutputSchema, unissonoSchema } from "@schemas/unissonoSchema.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'UnissonoJson', () => {
  describe( 'fromJson', () => {
	  it( 'deve criar um unissono a partir de um JSON completo', () => {
		  const json = {
			  id: 0,
			  notas: [
				  { id: 0, altura: { key: 'C4' }, duracao: { duracao: '1/4' } },
				  { id: 0, altura: { key: 'E4' }, duracao: { duracao: '1/4' } },
				  { id: 0, altura: { key: 'G4' }, duracao: { duracao: '1/4' } },
			  ],
			  duracao: { duracao: '1/4' },
			  options: {
				  acordes: [ 'C' ],
				  fermata: true,
				  unidadeTempo: '1/4'
			  }
		  };
		  const unissono = UnissonoJson.fromJson( json );
		  expect( unissono.notas.length ).toBe( 3 );
		  expect( unissono.duracao.toString() ).toBe( '1/4' );
		  expect( unissono.acordes ).toEqual( [ 'C' ] );
		  expect( unissono.fermata ).toBe( true );
	  } );

    it( 'deve criar um unissono a partir de um JSON mínimo', () => {
      const json = {
		  id: 0,
	      notas: [
		      { id: 0, altura: { key: 'C4' }, duracao: { duracao: '1/4' } },
	      ],
	      duracao: { duracao: '1/4' },
      };
      const unissono = UnissonoJson.fromJson( json );
      expect( unissono.notas.length ).toBe( 1 );
      expect( unissono.duracao.toString() ).toBe( '1/4' );
      expect( unissono.acordes ).toEqual( [] );
      expect( unissono.fermata ).toBe( false );
    } );

    it( 'deve rejeitar JSON inválido', () => {
      expect( () => UnissonoJson.fromJson( {} ) ).toThrow(); // Missing notas and duracao
      expect( () => UnissonoJson.fromJson( { notas: [] } ) ).toThrow(); // Missing duracao
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para um JSON completo', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), duracao ),
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'E4' ), duracao ),
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'G4' ), duracao ),
      ];
      const unissono = ObjectFactory.newUnissono( notas, duracao, {
        acordes: [ 'C' ],
        fermata: true,
      } );
      const json = UnissonoJson.toJson( unissono );
      const parsed = unissonoSchema.parse( json );
      expect( parsed ).toEqual( {
	      id: 0,
	      tipo: 'unissono',
	      notas: [
		      { id: 0, tipo: 'nota', altura: 'C4', duracao: '1/4', options: {} },
		      { id: 0, tipo: 'nota', altura: 'E4', duracao: '1/4', options: {} },
		      { id: 0, tipo: 'nota', altura: 'G4', duracao: '1/4', options: {} },
	      ],
	      duracao: '1/4',
	      options: {
		      acordes: [ 'C' ],
		      fermata: true,
	      }
      } );
    } );

    it( 'deve exportar para um JSON mínimo', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), duracao ),
      ];
      const unissono = ObjectFactory.newUnissono( notas, duracao );
      const json = UnissonoJson.toJson( unissono );
      const parsed = unissonoSchema.parse( json );
      expect( parsed ).toEqual( {
	      id: 0,
	      tipo: "unissono",
	      notas: [
		      {
			      id: 0,
			      tipo: "nota",
			      altura: "C4",
			      duracao: "1/4",
			      options: {}
		      }
	      ],
	      duracao: '1/4',
	      options: {}
      } );
    } );
  } );
} );
