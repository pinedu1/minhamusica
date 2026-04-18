import { describe, it, expect } from 'vitest';
import { TempoDuracaoJson } from '@adapters/persistence/TempoDuracaoJson.js';
import { TempoDuracaoAbc } from '@adapters/abcjs/TempoDuracaoAbc.js';

describe( 'TempoDuracao Integration', () => {
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC para: { duracao: "1/2" }', () => {
		// 1. Receber JSON
		const jsonData = { duracao: '1/2' };

		// 2. Instanciar via TempoDuracaoJson (JSON -> Domínio)
		const tempoDominio = TempoDuracaoJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		expect( TempoDuracaoAbc.toNota( tempoDominio ) ).toBe( '/' );
	} );
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC para: { duracao: "/" }', () => {
		// 1. Receber JSON
		const jsonData = { duracao: '1/2' };

		// 2. Instanciar via TempoDuracaoJson (JSON -> Domínio)
		const tempoDominio = TempoDuracaoJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		expect( TempoDuracaoAbc.toNota( tempoDominio ) ).toBe( '/' );
	} );
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC para: { duracao: "6/8" }', () => {
		// 1. Receber JSON
		const jsonData = { duracao: '6/8' };

		// 2. Instanciar via TempoDuracaoJson (JSON -> Domínio)
		const tempoDominio = TempoDuracaoJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		expect( TempoDuracaoAbc.toNota( tempoDominio ) ).toBe( '6/8' );
	} );
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC para Compasso', () => {
		// 1. Receber JSON
		const jsonData = { duracao: '1/2' };

		// 2. Instanciar via TempoDuracaoJson (JSON -> Domínio)
		const tempoDominio = TempoDuracaoJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		expect( TempoDuracaoAbc.toCompasso( tempoDominio ) ).toBe( '[L:1/2]' );
	} );
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC para Voz', () => {
		// 1. Receber JSON
		const jsonData = { duracao: '1/2' };

		// 2. Instanciar via TempoDuracaoJson (JSON -> Domínio)
		const tempoDominio = TempoDuracaoJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		expect( TempoDuracaoAbc.toVoz( tempoDominio ) ).toBe( '[L:1/2]' );
	} );

	it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON para: 3/8', () => {
		// 1. Receber ABC
		const abcData = '3/8';

		// 2. Instanciar via TempoDuracaoAbc (ABC -> Domínio)
		const tempoDominio = TempoDuracaoAbc.fromAbc( abcData );

		// 3. Validar a saída JSON (Domínio -> JSON)
		expect( TempoDuracaoJson.toJson( tempoDominio ) ).toEqual( { duracao: '3/8' } );
	} );
	it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON para: /', () => {
		// 1. Receber ABC
		const abcData = '/';

		// 2. Instanciar via TempoDuracaoAbc (ABC -> Domínio)
		const tempoDominio = TempoDuracaoAbc.fromAbc( abcData );

		// 3. Validar a saída JSON (Domínio -> JSON)
		expect( TempoDuracaoJson.toJson( tempoDominio ) ).toEqual( { duracao: '1/2' } );
	} );
	it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON para: /2', () => {
		// 1. Receber ABC
		const abcData = '/2';

		// 2. Instanciar via TempoDuracaoAbc (ABC -> Domínio)
		const tempoDominio = TempoDuracaoAbc.fromAbc( abcData );

		// 3. Validar a saída JSON (Domínio -> JSON)
		expect( TempoDuracaoJson.toJson( tempoDominio ) ).toEqual( { duracao: '1/2' } );
	} );
} );
