import { describe, it, expect, beforeEach } from "vitest";
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'TempoMetrica', () => {
	it( 'deve instanciar com valores padrão ( 4, 4 )', () => {
		const tempo = new TempoMetrica();
		expect( tempo.numerador ).toBe( 4 );
		expect( tempo.denominador ).toBe( 4 );
	} );

	it( 'deve retornar a razao corretamente', () => {
		const tempo = new TempoMetrica( 3, 8 );
		expect( tempo.razao ).toBe( 3 / 8 );
	} );

	it( 'deve validar erros nos setters', () => {
		const tempo = new TempoMetrica();
		expect( () => ( tempo.numerador = 0 ) ).toThrow( 'O numerador deve ser um número positivo maior que zero. Recebido: 0' );
		expect( () => ( tempo.numerador = -1 ) ).toThrow( 'O numerador deve ser um número positivo maior que zero. Recebido: -1' );
		expect( () => ( tempo.numerador = 1.5 ) ).toThrow( 'O numerador deve ser um número inteiro. Recebido: 1.5' );
		expect( () => ( tempo.denominador = 0 ) ).toThrow( 'O denominador deve ser um número positivo maior que zero (para evitar divisão por zero). Recebido: 0' );
		expect( () => ( tempo.denominador = -1 ) ).toThrow( 'O denominador deve ser um número positivo maior que zero (para evitar divisão por zero). Recebido: -1' );
		expect( () => ( tempo.denominador = 1.5 ) ).toThrow( 'O denominador deve ser um número inteiro. Recebido: 1.5' );
	} );

	it( 'deve retornar a string formatada corretamente', () => {
		const tempo = new TempoMetrica( 3, 4 );
		expect( tempo.toString() ).toBe( '3/4' );
	} );
	it( 'deve retornar a string formatada corretamente para inteiro', () => {
		const tempo = new TempoMetrica( 2, 1 );
		expect( tempo.toString() ).toBe( '2/1' );
	} );
} );
