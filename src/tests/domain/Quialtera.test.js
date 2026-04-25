import { describe, it, expect, beforeEach } from "vitest";
import { Quialtera } from '@domain/nota/Quialtera.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'Quialtera', () => {
  describe( 'Instanciação com sucesso', () => {
    it( 'deve criar uma quiáltera com parâmetros mínimos', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const quialtera = ObjectFactory.newQuialtera( [], duracao );
      expect( quialtera ).toBeInstanceOf( Quialtera );
      expect( quialtera.notas ).toEqual( [] );
      expect( quialtera.duracao ).toBe( duracao );
    } );

    it( 'deve criar uma quiáltera com unidade de tempo', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const unidadeTempo = new TempoDuracao( 1, 8 );
      const quialtera = ObjectFactory.newQuialtera( [], duracao, { unidadeTempo } );
      expect( quialtera.unidadeTempo ).toBe( unidadeTempo );
    } );

    it( 'deve criar uma quiáltera com 3 notas', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), new TempoDuracao( 1, 12 ) ),
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'D4' ), new TempoDuracao( 1, 12 ) ),
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'E4' ), new TempoDuracao( 1, 12 ) ),
      ];
      const quialtera = ObjectFactory.newQuialtera( notas, duracao );
      expect( quialtera.notas.length ).toBe( 3 );
    } );
  } );

  describe( 'Instanciação com falha', () => {

    it( 'deve falhar se os notas não forem um array', () => {
      const duracao = new TempoDuracao( 1, 4 );
      expect( () => ObjectFactory.newQuialtera( {}, duracao ) ).toThrow( 'Os notas devem ser fornecidos como um array.' );
    } );

    it( 'deve falhar se um elemento não for uma instância de ElementoMusical', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), new TempoDuracao( 1, 12 ) ),
        {},
      ];
      expect( () => ObjectFactory.newQuialtera( notas, duracao ) ).toThrow( 'Os itens da quiáltera devem ser instâncias de Nota, Pausa ou Unissono.' );
    } );
  } );
} );
