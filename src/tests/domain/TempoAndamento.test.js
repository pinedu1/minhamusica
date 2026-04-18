import { describe, it, expect } from 'vitest';
import { TempoAndamento } from '@domain/tempo/TempoAndamento.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'TempoAndamento', () => {
  it( 'deve instanciar corretamente com valores válidos', () => {
    const duracao = new TempoDuracao( 1, 4 );
    const tempo = new TempoAndamento( duracao, 120 );
    expect( tempo.andamento ).toBe( duracao );
    expect( tempo.bpm ).toBe( 120 );
  } );

  it( 'deve retornar a razao corretamente', () => {
    const duracao = new TempoDuracao( 3, 8 );
    const tempo = new TempoAndamento( duracao, 90 );
    expect( tempo.razao ).toBe( ( 3 / 8 ) / 90 );
  } );

  it( 'deve validar erros no construtor', () => {
    const duracaoValida = new TempoDuracao( 1, 4 );
    
    expect( () => new TempoAndamento( null, 120 ) ).toThrow( "Falha ao criar TempoAndamento: 'andamento' ser válido." );
    expect( () => new TempoAndamento( {}, 120 ) ).toThrow( "Falha ao criar TempoAndamento: 'andamento' deve ser Uma instancia de TempoDuracao." );
    expect( () => new TempoAndamento( duracaoValida, null ) ).toThrow( "Falha ao criar TempoAndamento: 'bpm' ser válido." );
    expect( () => new TempoAndamento( duracaoValida, 0 ) ).toThrow( "Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero." );
    expect( () => new TempoAndamento( duracaoValida, -1 ) ).toThrow( "Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero." );
    expect( () => new TempoAndamento( duracaoValida, 1.5 ) ).toThrow( "Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero." );
  } );

  it( 'deve retornar a string formatada corretamente', () => {
    const duracao = new TempoDuracao( 3, 4 );
    const tempo = new TempoAndamento( duracao, 100 );
    expect( tempo.toString() ).toBe( '3/4=100' );
  } );
} );
