import { describe, it, expect } from 'vitest';
import { QuialteraJson } from '@adapters/persistence/QuialteraJson.js';
import { Quialtera } from '@domain/nota/Quialtera.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { quialteraSchema } from '@schemas/quialteraSchema.js';

describe( 'QuialteraJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar uma quialtera a partir de um JSON completo', () => {
      const json = {
        notas: [
          { tipo: 'nota', altura: { key: 'C4' }, duracao: { duracao: '1/16' } },
          { tipo: 'nota', altura: { key: 'D4' }, duracao: { duracao: '1/16' } },
          { tipo: 'nota', altura: { key: 'E4' }, duracao: { duracao: '1/16' } },
        ],
        duracao: { duracao: '1/4' },
        options: {
          acordes: [ 'C' ],
          fermata: true,
        }
      };
      const quialtera = QuialteraJson.fromJson( json );
      expect( quialtera.notas.length ).toBe( 3 );
      expect( quialtera.duracao.toString() ).toBe( '1/4' );
      expect( quialtera.acordes ).toEqual( [ 'C' ] );
      expect( quialtera.fermata ).toBe( true );
    } );

    it( 'deve criar uma quialtera a partir de um JSON mínimo', () => {
      const json = {
        notas: [
          { tipo: 'nota', altura: { key: 'C4' }, duracao: { duracao: '1/12' } },
          { tipo: 'nota', altura: { key: 'D4' }, duracao: { duracao: '1/12' } },
          { tipo: 'nota', altura: { key: 'E4' }, duracao: { duracao: '1/12' } },
        ],
        duracao: { duracao: '1/4' },
      };
      const quialtera = QuialteraJson.fromJson( json );
      expect( quialtera.notas.length ).toBe( 3 );
      expect( quialtera.duracao.toString() ).toBe( '1/4' );
      expect( quialtera.acordes ).toEqual( [] );
      expect( quialtera.fermata ).toBe( false );
    } );

    it( 'deve rejeitar JSON inválido', () => {
      expect( () => QuialteraJson.fromJson( {} ) ).toThrow(); // Missing notas and duracao
      expect( () => QuialteraJson.fromJson( { notas: [] } ) ).toThrow(); // Missing duracao
    } );
  } );

  describe( 'toJson', () => {
	  it( 'deve exportar para um JSON completo', () => {
		  const duracao = new TempoDuracao( 1, 4 );
		  const notas = [
			  new Nota( NotaFrequencia.getByKey( 'C4' ), new TempoDuracao( 1, 12 ) ),
			  new Nota( NotaFrequencia.getByKey( 'D4' ), new TempoDuracao( 1, 12 ) ),
			  new Nota( NotaFrequencia.getByKey( 'E4' ), new TempoDuracao( 1, 12 ) ),
		  ];
		  const quialtera = new Quialtera( notas, duracao, {
			  acordes: [ 'C' ],
			  fermata: true,
		  } );
		  quialtera.unidadeTempo = new TempoDuracao( 1, 8 );
		  const json = QuialteraJson.toJson( quialtera );
		  const parsed = quialteraSchema.parse( json );
		  expect( parsed ).toEqual( {
			  tipo: 'quialtera',
			  notas: [
				  { tipo: 'nota', altura: 'C4', duracao: '1/12', options: {} },
				  { tipo: 'nota', altura: 'D4', duracao: '1/12', options: {} },
				  { tipo: 'nota', altura: 'E4', duracao: '1/12', options: {} },
			  ],
			  duracao: '1/4',
			  options: {
				  acordes: [ 'C' ],
				  fermata: true,
				  unidadeTempo: "1/8"
			  }
		  } );
	  } );
	  it( 'deve exportar para um JSON mínimo', () => {
		  const duracao = new TempoDuracao( 1, 4 );
		  const notas = [
			  new Nota( NotaFrequencia.getByKey( 'C4' ), new TempoDuracao( 1, 12 ) ),
			  new Nota( NotaFrequencia.getByKey( 'D4' ), new TempoDuracao( 1, 12 ) ),
			  new Nota( NotaFrequencia.getByKey( 'E4' ), new TempoDuracao( 1, 12 ) ),
		  ];
		  const quialtera = new Quialtera( notas, duracao );
		  quialtera.unidadeTempo = new TempoDuracao( 1, 1 );
		  const json = QuialteraJson.toJson( quialtera );
		  const parsed = quialteraSchema.parse( json );
		  expect( parsed ).toEqual( {
			  tipo: 'quialtera',
			  notas: [
				  { tipo: 'nota', altura: 'C4', duracao: '1/12', options: {} },
				  { tipo: 'nota', altura: 'D4', duracao: '1/12', options: {} },
				  { tipo: 'nota', altura: 'E4', duracao: '1/12', options: {} },
			  ],
			  duracao: '1/4',
			  options: {unidadeTempo: "1/1"}
		  } );
	  } );

  } );
} );
