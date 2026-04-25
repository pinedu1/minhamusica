import { describe, it, expect, beforeEach } from 'vitest';
import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'Pausa', () => {
    it( 'deve inicializar com os valores padrão corretamente', () => {
        const duracaoMock = {
            valor: 1
        };
        const pausa = ObjectFactory.newPausa( duracaoMock );

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
        const pausa = ObjectFactory.newPausa( duracaoMock, options );

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
		const pausa = ObjectFactory.newPausa( duracaoMock, options );

		expect( pausa.duracao ).toBe( duracaoMock );
		expect( pausa.invisivel ).toBe( true );
		expect( pausa.fermata ).toBe( true );
		expect( pausa.breath ).toBe( true );
		expect( pausa.acordes ).toEqual( [ 'C', 'Am' ] );
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
		const pausa = ObjectFactory.newPausa( duracaoMock, options );

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
			const pausa = ObjectFactory.newPausa(new TempoDuracao(1, 4), {
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

	describe( 'Pausa de Compasso', () => {
		it( 'deve identificar uma pausa de compasso quando a duração coincide com a métrica', () => {
			// Setup: Compasso 4/4 (Razão 1.0)
			const mockMetrica = new TempoMetrica( 4, 4 );
			const mockCompasso = {
				options: { metrica: mockMetrica }
				, getMetrica() { return this.options.metrica; }
			};

			// Pausa de Semibreve (1/1 = Razão 1.0)
			const duracaoSemibreve = new TempoDuracao( 1, 1 );
			const pausa = ObjectFactory.newPausa( duracaoSemibreve, { compasso: mockCompasso, pausaDeCompasso: true } );

			// No domínio, ela deve detectar que ocupa o compasso todo
			expect( pausa.pausaDeCompasso ).toBe( true );
			expect( pausa.calcularTempoPausaDeCompasso() ).toBe( 1 );
		} );

		it( 'deve identificar pausa de múltiplos compassos (ex: Z2)', () => {
			// Setup: Compasso 3/4 (Razão 0.75)
			const mockMetrica = new TempoMetrica( 3, 4 );
			const mockCompasso = {
				options: { metrica: mockMetrica }
				, getMetrica() { return this.options.metrica; }
			};

			// Pausa que dura 6 tempos de 1/4 (Razão 1.5, ou seja, 2 compassos de 3/4)
			const duracaoLonga = new TempoDuracao( 6, 4 );
			const pausa = ObjectFactory.newPausa( duracaoLonga, { compasso: mockCompasso, pausaDeCompasso: true } );

			expect( pausa.pausaDeCompasso ).toBe( true );
			expect( pausa.calcularTempoPausaDeCompasso() ).toBe( 2 );
		} );

		it( 'não deve ser pausa de compasso se a duração for menor que a métrica', () => {
			const mockMetrica = new TempoMetrica( 4, 4 );
			const mockCompasso = {
				options: { metrica: mockMetrica }
				, getMetrica() { return this.options.metrica; }
			};

			// Pausa de 1/4 num compasso 4/4
			const duracaoMinima = new TempoDuracao( 1, 4 );
			const pausa = ObjectFactory.newPausa( duracaoMinima, { compasso: mockCompasso, pausaDeCompasso: true } );

			expect( pausa.pausaDeCompasso ).toBe( true );
			expect( pausa.calcularTempoPausaDeCompasso() ).toBe( false );
		} );

		it( 'deve respeitar a invisibilidade em pausas de compasso (X vs Z)', () => {
			const mockMetrica = new TempoMetrica( 4, 4 );
			const mockCompasso = {
				options: { metrica: mockMetrica }
				, getMetrica() { return this.options.metrica; }
			};

			const pausaInvisivel = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), {
				compasso: mockCompasso
				, invisivel: true
				, pausaDeCompasso: true
			} );

			expect( pausaInvisivel.pausaDeCompasso ).toBe( true );
			expect( pausaInvisivel.invisivel ).toBe( true );
		} );
	} );

	describe( 'Pausa de Compasso (State-based)', () => {
		it( 'deve registrar explicitamente que é uma pausa de compasso via options', () => {
			const duracaoMock = new TempoDuracao( 1, 1 );
			const options = {
				pausaDeCompasso: true
				, invisivel: false
			};
			const pausa = ObjectFactory.newPausa( duracaoMock, options );

			// Valida se o estado foi gravado corretamente
			expect( pausa.options.pausaDeCompasso ).toBe( true );
			expect( pausa.pausaDeCompasso ).toBe( true ); // Assumindo que você tem um getter
		} );

		it( 'deve retornar a quantidade de compassos ocupados quando for pausa de compasso', () => {
			// Setup de métrica 4/4 (Razão 1.0)
			const mockMetrica = new TempoMetrica( 4, 4 );
			const mockCompasso = {
				getMetrica() { return mockMetrica; }
			};

			// Pausa de 2/1 (Razão 2.0) em um compasso 4/4 deve resultar em 2 compassos
			const duracaoDupla = new TempoDuracao( 2, 1 );
			const pausa = ObjectFactory.newPausa( duracaoDupla, {
				compasso: mockCompasso,
				pausaDeCompasso: true
			} );

			const qtd = pausa.calcularTempoPausaDeCompasso();
			expect( qtd ).toBe( 2 );
		} );

		it( 'deve retornar false para o cálculo se a flag pausaDeCompasso for false', () => {
			const mockMetrica = new TempoMetrica( 4, 4 );
			const mockCompasso = { getMetrica() { return mockMetrica; } };

			const duracaoSemibreve = new TempoDuracao( 1, 1 );
			const pausa = ObjectFactory.newPausa( duracaoSemibreve, {
				compasso: mockCompasso,
				pausaDeCompasso: false
			} );

			// Mesmo que a duração case com a métrica, a flag manda no comportamento
			expect( pausa.pausaDeCompasso ).toBe( false );
			expect( pausa.calcularTempoPausaDeCompasso() ).toBe( false );
		} );

		it( 'deve validar a combinação de pausa de compasso e invisibilidade (X)', () => {
			const pausaInvisivel = ObjectFactory.newPausa( new TempoDuracao( 1, 1 ), {
				pausaDeCompasso: true,
				invisivel: true
			} );

			expect( pausaInvisivel.pausaDeCompasso ).toBe( true );
			expect( pausaInvisivel.invisivel ).toBe( true );
		} );
	} );
} );
