import { describe, it, expect } from 'vitest';
import { QuialteraAbc } from '@adapters/abcjs/QuialteraAbc.js';
import { Quialtera } from '@domain/nota/Quialtera.js';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'QuialteraAbc', () => {
  describe( 'fromAbc', () => {
    it( 'deve criar a partir de "(4:1:4Ggbd"', () => {
      const quialtera = QuialteraAbc.fromAbc( '(4:1:4Ggbd' );
      expect( quialtera.notas.length ).toBe( 4 );
      expect( quialtera.notas[0].altura.key ).toBe( 'G4' );
      expect( quialtera.notas[1].altura.key ).toBe( 'G5' );
      expect( quialtera.notas[2].altura.key ).toBe( 'B5' );
      expect( quialtera.notas[3].altura.key ).toBe( 'D5' );
      expect( quialtera.duracao.toString() ).toBe( '1/4' );
    } );

    it( 'deve criar a partir de "(8:1:8cdefgabc\'"', () => {
      const quialtera = QuialteraAbc.fromAbc( '(8:1:8cdefgabc\'' );
      expect( quialtera.notas.length ).toBe( 8 );
      expect( quialtera.notas[0].altura.key ).toBe( 'C5' );
      expect( quialtera.notas[7].altura.key ).toBe( 'C6' );
      expect( quialtera.duracao.toString() ).toBe( '1/4' );
    } );

    it( 'deve criar a partir de "(4:1:4Cceg"', () => {
      const quialtera = QuialteraAbc.fromAbc( '(4:1:4Cceg' );
      expect( quialtera.notas.length ).toBe( 4 );
      expect( quialtera.notas[0].altura.key ).toBe( 'C4' );
      expect( quialtera.notas[1].altura.key ).toBe( 'C5' );
      expect( quialtera.notas[2].altura.key ).toBe( 'E5' );
      expect( quialtera.notas[3].altura.key ).toBe( 'G5' );
      expect( quialtera.duracao.toString() ).toBe( '1/4' );
    } );
  } );

  describe( 'toAbc', () => {
    it( 'deve exportar para "(4:1:4Ggbd"', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        new Nota( NotaFrequencia.getByKey( 'G4' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'G5' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'B5' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'D5' ), new TempoDuracao( 1, 16 ) ),
      ];
      const quialtera = new Quialtera( notas, duracao, {unidadeTempo: new TempoDuracao( 1, 8 )} );
      expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(4:1:4Ggbd' );
    } );

    it( 'deve exportar para "(8:1:8cdefgabc\'"', () => {
      const duracao = new TempoDuracao( 1, 8 );
      const notas = [
        new Nota( NotaFrequencia.getByKey( 'C5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'D5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'E5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'F5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'G5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'A5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'B5' ), new TempoDuracao( 1, 64 ) ),
        new Nota( NotaFrequencia.getByKey( 'C6' ), new TempoDuracao( 1, 64 ) ),
      ];
      const quialtera = new Quialtera( notas, duracao );
      expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(8:1:8cdefgabc\'' );
    } );

    it( 'deve exportar para "(4:1:4Cceg"', () => {
      const duracao = new TempoDuracao( 1, 4 );
      const notas = [
        new Nota( NotaFrequencia.getByKey( 'C4' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'C5' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'E5' ), new TempoDuracao( 1, 16 ) ),
        new Nota( NotaFrequencia.getByKey( 'G5' ), new TempoDuracao( 1, 16 ) ),
      ];
      const quialtera = new Quialtera( notas, duracao );
      expect( QuialteraAbc.toAbc( quialtera ) ).toBe( '(4:1:4Cceg' );
    } );
  } );
} );
