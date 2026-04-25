import { describe, it, expect, beforeEach } from "vitest";
import { UnissonoAbc } from '@adapters/abcjs/UnissonoAbc.js';
import { Unissono } from '@domain/nota/Unissono.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'UnissonoAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "[Ggbd]"', () => {
      const unissono = UnissonoAbc.fromAbc( '[Ggbd]' );
      expect( unissono.notas.length ).toBe( 4 );
      expect( unissono.notas[0].altura.key ).toBe( 'G4' );
      expect( unissono.notas[1].altura.key ).toBe( 'G5' );
      expect( unissono.notas[2].altura.key ).toBe( 'B5' );
      expect( unissono.notas[3].altura.key ).toBe( 'D5' );
      expect( unissono.duracao.toString() ).toBe( '1/1' );
    } );

    it( 'deve criar a partir de "[Cceg]"', () => {
      const unissono = UnissonoAbc.fromAbc( '[Cceg]' );
      expect( unissono.notas.length ).toBe( 4 );
      expect( unissono.notas[0].altura.key ).toBe( 'C4' );
      expect( unissono.notas[1].altura.key ).toBe( 'C5' );
      expect( unissono.notas[2].altura.key ).toBe( 'E5' );
      expect( unissono.notas[3].altura.key ).toBe( 'G5' );
      expect( unissono.duracao.toString() ).toBe( '1/1' );
    } );
  } );

  describe( 'toAbc', () => {
    it( 'deve exportar para "[Ggbd]"', () => {
	    const duracao = new TempoDuracao( 1, 1 );
	    const notas = [
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'G4' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'G5' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'B5' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'D5' ), duracao ),
	    ];
	    const unissono = ObjectFactory.newUnissono( notas, duracao );
	    unissono.unidadeTempo = new TempoDuracao( 1, 1 );
	    expect( UnissonoAbc.toAbc( unissono ) ).toBe( '[Ggbd]' );
    } );

    it( 'deve exportar para "[Cceg]"', () => {
	    const duracao = new TempoDuracao( 1, 1 );
	    const notas = [
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'C4' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'C5' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'E5' ), duracao ),
		    ObjectFactory.newNota( NotaFrequencia.getByKey( 'G5' ), duracao ),
	    ];
	    const unissono = ObjectFactory.newUnissono( notas, duracao );
	    unissono.unidadeTempo = new TempoDuracao( 1, 1 );
	    expect( UnissonoAbc.toAbc( unissono ) ).toBe( '[Cceg]' );
    } );
  } );
} );
