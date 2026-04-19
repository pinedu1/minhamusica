import { describe, it, expect } from 'vitest';
import { TempoMetricaJson } from '@persistence/TempoMetricaJson.js';
import { tempoMetricaSchema } from '@schemas/tempoMetricaSchema.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';

describe( 'TempoMetricaJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar a partir de { numerador: 3, denominador: 4 }', () => {
      const tempo = TempoMetricaJson.fromJson( { numerador: 3, denominador: 4 } );
      expect( tempo.numerador ).toBe( 3 );
      expect( tempo.denominador ).toBe( 4 );
    } );

    it( 'deve criar a partir de { metrica: "1/8" }', () => {
      const tempo = TempoMetricaJson.fromJson( { metrica: '1/8' } );
      expect( tempo.numerador ).toBe( 1 );
      expect( tempo.denominador ).toBe( 8 );
    } );

    it( 'deve rejeitar estruturas inválidas', () => {
      expect( () => TempoMetricaJson.fromJson( { metrica: '1/0' } ) ).toThrow();
      expect( () => TempoMetricaJson.fromJson( { numerador: 0, denominador: 4 } ) ).toThrow();
      expect( () => TempoMetricaJson.fromJson( { metrica: 'a/b' } ) ).toThrow();
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para o formato { numerador: 5, denominador: 16 }', () => {
      const tempo = new TempoMetrica( 5, 16 );
      const json = TempoMetricaJson.toJson( tempo );
      const parsed = tempoMetricaSchema.parse( json );
      expect( parsed ).toStrictEqual( { numerador: 5, denominador: 16 } );
    } );
  } );
} );
