import { describe, it, expect } from 'vitest';
import { NotaFrequenciaJson } from '@adapters/persistence/NotaFrequenciaJson.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { notaFrequenciaSchema } from '@schemas/notaFrequenciaSchema.js';

describe( 'NotaFrequenciaJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar a partir de um objeto com chave', () => {
      const nota = NotaFrequenciaJson.fromJson( { key: 'C4' } );
      expect( nota.key ).toBe( 'C4' );
    } );

    it( 'deve criar a partir de um objeto completo', () => {
      const nota = NotaFrequenciaJson.fromJson( { key: 'D5', abc: 'd', midi: 74 } );
      expect( nota.key ).toBe( 'D5' );
    } );

    it( 'deve rejeitar estruturas inválidas', () => {
      expect( () => NotaFrequenciaJson.fromJson( '' ) ).toThrow();
      expect( () => NotaFrequenciaJson.fromJson( { invalid: 'data' } ) ).toThrow();
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para o formato de objeto', () => {
      const nota = NotaFrequencia.getByKey( 'A4' );
      const json = NotaFrequenciaJson.toJson( nota );
      const parsed = notaFrequenciaSchema.parse( json );
      expect( parsed ).toEqual( { key: 'A4', abc: 'A', midi: 69 } );
    } );
  } );
} );
