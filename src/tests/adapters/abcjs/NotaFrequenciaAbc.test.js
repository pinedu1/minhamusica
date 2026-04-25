import { describe, it, expect, beforeEach } from "vitest";
import { NotaFrequenciaAbc } from '@adapters/abcjs/NotaFrequenciaAbc.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'NotaFrequenciaAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "c\'"', () => {
      const nota = NotaFrequenciaAbc.fromAbc( "c'" );
      expect( nota.key ).toBe( 'C6' );
    } );

    it( 'deve criar a partir de "^C,,"', () => {
      const nota = NotaFrequenciaAbc.fromAbc( '^C,,' );
      expect( nota.key ).toBe( 'Cs2' );
    } );

    it( "deve criar a partir de '_B'", () => {
      const nota = NotaFrequenciaAbc.fromAbc( "_B'" );
      expect( nota.key ).toBe( 'Bb5_ALT' );
    } );
  } );

  describe( 'toAbc', () => {
    it( "deve exportar para c'", () => {
      const nota = NotaFrequencia.getByKey( 'C6' );
      expect( NotaFrequenciaAbc.toAbc( nota ) ).toBe( "c'" );
    } );

    it( 'deve exportar para "^C,,"', () => {
      const nota = NotaFrequencia.getByKey( 'Cs2' );
      expect( NotaFrequenciaAbc.toAbc( nota ) ).toBe( '^C,,' );
    } );

    it( "deve exportar para '_B''", () => {
      const nota = NotaFrequencia.getByKey( 'Bb5_ALT' );
      expect( NotaFrequenciaAbc.toAbc( nota ) ).toBe( "_B'" );
    } );
  } );
} );
