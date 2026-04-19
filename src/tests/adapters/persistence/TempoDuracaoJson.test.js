import { describe, it, expect } from 'vitest';
import { TempoDuracaoJson } from '@persistence/TempoDuracaoJson.js'
import { tempoDuracaoSchema } from '@schemas/tempoDuracaoSchema.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'TempoDuracaoJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar a partir de { numerador: 3, denominador: 4 }', () => {
      const tempo = TempoDuracaoJson.fromJson( { numerador: 3, denominador: 4 } );
      expect( tempo.numerador ).toBe( 3 );
      expect( tempo.denominador ).toBe( 4 );
    } );

    it( 'deve criar a partir de { duracao: "1/8" }', () => {
      const tempo = TempoDuracaoJson.fromJson( { duracao: '1/8' } );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 8 );
    } );

    it( 'deve rejeitar estruturas inválidas', () => {
      expect( () => TempoDuracaoJson.fromJson( { duracao: '1/0' } ) ).toThrow();
      expect( () => TempoDuracaoJson.fromJson( { numerador: 0, denominador: 4 } ) ).toThrow();
      expect( () => TempoDuracaoJson.fromJson( { duracao: 'a/b' } ) ).toThrow();
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para o formato { numerador: 5, denominador: 16 }', () => {
      const tempo = new TempoDuracao( 5, 16 );
      const json = TempoDuracaoJson.toJson( tempo );
      const parsed = tempoDuracaoSchema.parse( json );
      expect( parsed ).toStrictEqual( { numerador: 5, denominador: 16 } );
    } );
  } );
} );
