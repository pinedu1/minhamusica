import { describe, it, expect } from 'vitest';
import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

describe( 'Pausa', () => {
    it( 'deve inicializar com os valores padrão corretamente', () => {
        const duracaoMock = {
            valor: 1
        };
        const pausa = new Pausa( duracaoMock );

        expect( pausa.duracao ).toBe( duracaoMock );
        expect( pausa.invisivel ).toBe( false );
        expect( pausa.fermata ).toBe( false );
        expect( pausa.breath ).toBe( false );
        expect( pausa.acordes ).toEqual( [] );
        expect( pausa.options.voz ).toBeNull();
    } );

    it( 'deve inicializar com opções personalizadas', () => {
        const duracaoMock = {
            valor: 2
        };
        const options = {
            invisivel: true
            , fermata: true
            , breath: true
            , acordes: [ 'C', 'Am' ]
            , voz: 'Voz 1'
        };
        const pausa = new Pausa( duracaoMock, options );

        expect( pausa.duracao ).toBe( duracaoMock );
        expect( pausa.invisivel ).toBe( true );
        expect( pausa.fermata ).toBe( true );
        expect( pausa.breath ).toBe( true );
        expect( pausa.acordes ).toEqual( [ 'C', 'Am' ] );
        expect( pausa.options.voz ).toBe( 'Voz 1' );
    } );
	it( 'deve inicializar com opções personalizadas, Transpor 2s semitons acima', () => {
		const mockObra = { options:{ unidadeTempo: new TempoDuracao(4, 4) }, get unidadeTempo() { return this.options.unidadeTempo;} };
		const duracaoMock = {
			valor: 2
		};
		const options = {
			obra: mockObra
			, invisivel: true
			, fermata: true
			, breath: true
			, acordes: [ 'C', 'Am' ]
			, voz: 'Voz 1'
			, transposeUnits: 2
		};
		const pausa = new Pausa( duracaoMock, options );

		expect( pausa.duracao ).toBe( duracaoMock );
		expect( pausa.invisivel ).toBe( true );
		expect( pausa.fermata ).toBe( true );
		expect( pausa.breath ).toBe( true );
		expect( pausa.acordes ).toEqual( [ 'D', 'Bm' ] );
		expect( pausa.options.voz ).toBe( 'Voz 1' );
	} );
	it( 'deve inicializar com opções personalizadas, Transpor 2s semitons acima deve subir na cadeia de objetos para obter o transpose', () => {
		const mockObra = { options:{ transposeUnits: 2, unidadeTempo: new TempoDuracao(4, 4) }, get unidadeTempo() { return this.options.unidadeTempo;} };
		const duracaoMock = {
			valor: 2
		};
		const options = {
			obra: mockObra
			, invisivel: true
			, fermata: true
			, breath: true
			, acordes: [ 'D', 'Bm' ]
			, voz: 'Voz 1'
		};
		const pausa = new Pausa( duracaoMock, options );

		expect( pausa.duracao ).toBe( duracaoMock );
		expect( pausa.invisivel ).toBe( true );
		expect( pausa.fermata ).toBe( true );
		expect( pausa.breath ).toBe( true );
		expect( pausa.acordes ).toEqual( [ 'D', 'Bm' ] );
		expect( pausa.options.voz ).toBe( 'Voz 1' );
	} );
	describe('Regra de Recursão (unidadeTempo)', () => {
		it('deve respeitar a ordem exata de prioridade: Própria -> Compasso -> Voz -> Obra', () => {
			// Mocks simples de acordo com as regras estritas (duck typing)
			const mockObra = { options:{ unidadeTempo: new TempoDuracao(4, 4) }, get unidadeTempo() { return this.options.unidadeTempo;} };
			const mockVoz = { options:{ unidadeTempo: new TempoDuracao(3, 4) }, get unidadeTempo() { return this.options.unidadeTempo;} };
			const mockCompasso = { options:{ unidadeTempo: new TempoDuracao(2, 4) }, get unidadeTempo() { return this.options.unidadeTempo;} };
			const mockPropria = new TempoDuracao(1, 4);

			// Criamos a pausa injetando o contexto diretamente
			const pausa = new Pausa(new TempoDuracao(1, 4), {
				obra: mockObra,
				voz: mockVoz,
				compasso: mockCompasso,
				unidadeTempo: mockPropria
			});

			// 1. Prioridade máxima: deve encontrar a Própria unidadeTempo
			expect(pausa.getUnidadeTempo()).toEqual(mockPropria);

			// 2. Removendo a Propria, deve encontrar a da Compasso
			pausa.unidadeTempo = null;
			expect(pausa.getUnidadeTempo()).toEqual(mockCompasso.unidadeTempo);

			// 3. Removendo a Compasso, deve encontrar a do Voz
			pausa.compasso = null;
			expect(pausa.getUnidadeTempo()).toEqual(mockVoz.unidadeTempo);

			// 4. Removendo o Voz, deve encontrar a unidadeTempo da Obra
			pausa.voz = null;
			expect(pausa.getUnidadeTempo()).toEqual(mockObra.unidadeTempo);
		});
	});
} );
