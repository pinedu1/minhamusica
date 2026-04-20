import { describe, it, expect } from 'vitest';
import { Nota } from '@domain/nota/Nota.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";


describe( 'Nota', () => {
    it( 'deve inicializar com valores padrão', () => {
        const alturaMock = Object.create( NotaFrequencia.prototype );
        const duracaoMock = new TempoDuracao(1,4);
        const nota = new Nota( alturaMock, duracaoMock );

        expect( nota.altura ).toBe( alturaMock );
        expect( nota.duracao ).toBe( duracaoMock );
        expect( nota.ligada ).toBe( false );
        expect( nota._options.acento ).toBe( false );
        expect( nota._options.fermata ).toBe( false );
    } );

    it( 'deve falhar se altura não for NotaFrequencia', () => {
        const duracaoMock = new TempoDuracao(1,4);
        expect( () => new Nota( {}, duracaoMock ) ).toThrowError( "A altura deve ser NotaFrequencia." );
    } );

    it( 'deve configurar opções personalizadas', () => {
        const alturaMock = NotaFrequencia.getByKey('C1');
        const duracaoMock = new TempoDuracao(1,4);
        const options = {
            ligada: true
            , acento: true
            , fermata: true
            , staccato: true
            , staccatissimo: false
            , voz: 'Voz 1'
        };
        const nota = new Nota( alturaMock, duracaoMock, options );

        expect( nota.ligada ).toBe( true );
        expect( nota._options.acento ).toBe( true );
        expect( nota._options.fermata ).toBe( true );
        expect( nota._options.staccato ).toBe( true );
        expect( nota._options.voz ).toBe( 'Voz 1' );
    } );

    it( 'deve permitir atualizar ligada', () => {
        const alturaMock = NotaFrequencia.getByAbc('^C');
        const duracaoMock = new TempoDuracao( 1, 4 );
        const nota = new Nota( alturaMock, duracaoMock );
        
        expect( nota.ligada ).toBe( false );
        nota.ligada = true;
        expect( nota.ligada ).toBe( true );
    } );

    it( 'deve falhar se graceNote for inválido', () => {
        const alturaMock = Object.create( NotaFrequencia.prototype );
        const duracaoMock = new TempoDuracao(1,4);
        expect( () => new Nota( alturaMock, duracaoMock, { graceNote: true } ) ).toThrowError( "Nota: graceNote deve ser Array, null ou false." );
        expect( () => new Nota( alturaMock, duracaoMock, { graceNote: {} } ) ).toThrowError( "Nota: graceNote deve ser Array, null ou false." );
    } );
	it( 'deve falhar se dedilhado for inválido', () => {
		const alturaMock = Object.create( NotaFrequencia.prototype );
		const duracaoMock = new TempoDuracao(1,4);
		expect( () => new Nota( alturaMock, duracaoMock, { dedilhado: true } ) ).toThrowError( "Nota: dedilhado deve ser Array, null ou false." );
		expect( () => new Nota( alturaMock, duracaoMock, { dedilhado: {} } ) ).toThrowError( "Nota: dedilhado deve ser Array, null ou false." );
		expect( () => new Nota( alturaMock, duracaoMock, { dedilhado: [] } ) ).not.toThrowError();
	} );
	it( 'deve falhar ao adicionar dedilhado posteriormente', () => {
		const alturaMock = Object.create( NotaFrequencia.prototype );
		const duracaoMock = new TempoDuracao(1,4);
		const nota = new Nota( alturaMock, duracaoMock );
		expect( () => nota.dedilhado = '1-2-3' ).toThrowError("Dedilhado: O valor deve ser um array de strings (Array<String>).");
	} );
	it( 'deve adicionar dedilhado posteriormente', () => {
		const alturaMock = Object.create( NotaFrequencia.prototype );
		const duracaoMock = new TempoDuracao(1,4);
		const nota = new Nota( alturaMock, duracaoMock );
		expect( () => nota.dedilhado = ['p', '1'] ).not.toThrowError();
		expect( nota.dedilhado ).toEqual(['p', '1']);
	} );
} );
