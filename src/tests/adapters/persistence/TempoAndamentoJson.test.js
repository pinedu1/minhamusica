import { describe, it, expect } from 'vitest';
import { TempoAndamentoJson } from '@persistence/TempoAndamentoJson.js';
import { tempoAndamentoOutputSchema, tempoAndamentoSchema } from "@schemas/tempoAndamentoSchema.js";
import { TempoAndamento } from '@domain/tempo/TempoAndamento.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'TempoAndamentoJson', () => {
  describe( 'fromJson', () => {
    it( 'deve criar a partir de { andamento: { numerador: 3, denominador: 4 }, bpm: 120 }', () => {
      const tempo = TempoAndamentoJson.fromJson( { andamento: { numerador: 3, denominador: 4 }, bpm: 120 } );
      expect( tempo.andamento.numerador ).toBe( 3 );
      expect( tempo.andamento.denominador ).toBe( 4 );
      expect( tempo.bpm ).toBe( 120 );
    } );
	  it( 'deve criar a partir de { numerador: 3, denominador: 4, bpm: 120 }', () => {
		  const tempo = TempoAndamentoJson.fromJson( { numerador: 3, denominador: 4, bpm: 120 } );
		  expect( tempo.andamento.numerador ).toBe( 3 );
		  expect( tempo.andamento.denominador ).toBe( 4 );
		  expect( tempo.bpm ).toBe( 120 );
	  } );

    it( 'deve criar a partir de { andamento: "1/8=90" }', () => {
      const tempo = TempoAndamentoJson.fromJson( { andamento: '1/8=90' } );
      expect( tempo.andamento.numerador ).toBe( 1 );
      expect( tempo.andamento.denominador ).toBe( 8 );
      expect( tempo.bpm ).toBe( 90 );
    } );

    it( 'deve rejeitar estruturas inválidas', () => {
      expect( () => TempoAndamentoJson.fromJson( { andamento: '1/0=120' } ) ).toThrow();
      expect( () => TempoAndamentoJson.fromJson( { andamento: { numerador: 0, denominador: 4 }, bpm: 120 } ) ).toThrow();
      expect( () => TempoAndamentoJson.fromJson( { andamento: 'a/b=120' } ) ).toThrow();
      expect( () => TempoAndamentoJson.fromJson( { andamento: '1/4=0' } ) ).toThrow();
    } );
  } );

  describe( 'toJson', () => {
    it( 'deve exportar para o formato { andamento: "n/d=b" }', () => {
      const duracao = new TempoDuracao( 5, 16 );
      const tempo = new TempoAndamento( duracao, 75 );
      const json = TempoAndamentoJson.toJson( tempo );
      expect( json.andamento ).toBe( '5/16=75' );
    } );
  } );
} );
