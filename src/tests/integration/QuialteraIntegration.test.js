import { describe, it, expect } from 'vitest';
import { QuialteraJson } from '@adapters/persistence/QuialteraJson.js';
import { QuialteraAbc } from '@adapters/abcjs/QuialteraAbc.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { Obra } from "@domain/obra/Obra.js";

describe( 'Quialtera Integration', () => {
	// Contexto musical necessário para os cálculos de renderização e parsing
	let obraMock = new Obra(1);
	const contextoPadrao = {
		obra: obraMock,
	};
	it( 'deve fazer o fluxo completo JSON -> Domínio -> ABC', () => {
		// 1. Receber JSON
		// CORREÇÃO: Para a saída ABC ser 'Ggbd' sem sufixos, a duração interna das notas
		// deve ser igual à unidade de tempo base L (1/4).
		const jsonData = {
			tipo: 'quialtera',
			notas: [
				{ tipo: 'nota', altura: { key: 'G4' }, duracao: { numerador: 1, denominador: 4 } },
				{ tipo: 'nota', altura: { key: 'G5' }, duracao: { numerador: 1, denominador: 4 } },
				{ tipo: 'nota', altura: { key: 'B5' }, duracao: { numerador: 1, denominador: 4 } },
				{ tipo: 'nota', altura: { key: 'D5' }, duracao: { numerador: 1, denominador: 4 } },
			],
			duracao: { numerador: 1, denominador: 4 },
			options: { ...contextoPadrao },
		};

		// 2. Instanciar via QuialteraJson (JSON -> Domínio)
		const quialteraDominio = QuialteraJson.fromJson( jsonData );

		// 3. Validar a saída ABC (Domínio -> ABC)
		// O toAbc usará a unidade de tempo injetada nas options para calcular o 'q' do prefixo.
		const abcResult = QuialteraAbc.toAbc( quialteraDominio );
		expect( abcResult ).toBe( '(4:1:4Ggbd' );
	} );

	it( 'deve fazer o fluxo completo ABC -> Domínio -> JSON', () => {
		// 1. Receber ABC
		const abcData = '(4:1:4Cceg';

		// 2. Instanciar via QuialteraAbc (ABC -> Domínio)
		// Passamos o contextoPadrao para que o parser saiba que L:1/4
		const quialteraDominio = QuialteraAbc.fromAbc( abcData, contextoPadrao );

		// 3. Validar a saída JSON (Domínio -> JSON)
		// O seu QuialteraJson utiliza o Zod Output Schema que simplifica a estrutura.
		const jsonResult = QuialteraJson.toJson( quialteraDominio );

		expect( jsonResult ).toMatchObject( {
			tipo: 'quialtera',
			notas: [
				{ tipo: 'nota', altura: 'C4', duracao: '1/4' },
				{ tipo: 'nota', altura: 'C5', duracao: '1/4' },
				{ tipo: 'nota', altura: 'E5', duracao: '1/4' },
				{ tipo: 'nota', altura: 'G5', duracao: '1/4' },
			],
			duracao: '1/4'
		} );
	} );
} );