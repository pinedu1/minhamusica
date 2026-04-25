import { describe, it, expect, beforeEach } from "vitest";
import { Unissono } from '@domain/nota/Unissono.js';
import { Nota } from '@domain/nota/Nota.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { ObjectFactory } from "@factory/ObjectFactory.js";

beforeEach( () => {
	ObjectFactory.contextoTestes = true;
})
describe( 'Unissono', () => {
    it( 'deve inicializar com os valores padrão corretos para manter o estado', () => {
        const notaMock1 = Object.create( Nota.prototype );
        const notaMock2 = Object.create( Nota.prototype );
        const duracaoMock = Object.create( TempoDuracao.prototype );
        
        const unissono = ObjectFactory.newUnissono( [ notaMock1, notaMock2 ], duracaoMock );

        expect( unissono.notas.length ).toBe( 2 );
        expect( unissono.notas[ 0 ] ).toBe( notaMock1 );
        expect( unissono.notas[ 1 ] ).toBe( notaMock2 );
        expect( unissono.duracao ).toBe( duracaoMock );
        
        const opts = unissono._options;
        expect( opts.acento ).toBe( false );
        expect( opts.marcato ).toBe( false );
        expect( opts.staccato ).toBe( false );
        expect( opts.staccatissimo ).toBe( false );
        expect( opts.tenuto ).toBe( false );
        expect( opts.ligada ).toBe( false );
        expect( opts.arpeggio ).toBe( false );
        expect( opts.fermata ).toBe( false );
        expect( opts.ghostNote ).toBe( false );
        expect( opts.roll ).toBe( false );
        expect( opts.trinado ).toBe( false );
        expect( opts.mordente ).toBe( false );
        expect( opts.upperMordent ).toBe( false );
        expect( opts.graceNote ).toEqual( [] );
        expect( opts.dedilhado ).toEqual( [] );
    } );

    it( 'deve lançar exceção se notas não for um array ou contiver elementos que não são Nota', () => {
        const duracaoMock = Object.create( TempoDuracao.prototype );
        
        // Testando array com tipo inválido
        expect( () => ObjectFactory.newUnissono( [ {} ], duracaoMock ) ).toThrowError( "Todos os elementos do array de notas devem ser instâncias de Nota." );
        
        // Testando passagem de tipo que não é array
        expect( () => ObjectFactory.newUnissono( "não é array", duracaoMock ) ).toThrowError( "As notas de um unissono devem ser fornecidas como um array de instâncias de Nota." );
    } );

    it( 'deve configurar corretamente as opções personalizadas recebidas no construtor', () => {
        const notaMock = Object.create( Nota.prototype );
        const duracaoMock = Object.create( TempoDuracao.prototype );
        
        const options = {
            ligada: true
            , acento: true
            , fermata: true
            , staccato: true
            , arpeggio: true
            , dedilhado: ['1','2', '3']
        };
        
        const unissono = ObjectFactory.newUnissono( [ notaMock ], duracaoMock, options );

        expect( unissono._options.ligada ).toBe( true );
        expect( unissono._options.acento ).toBe( true );
        expect( unissono._options.fermata ).toBe( true );
        expect( unissono._options.staccato ).toBe( true );
        expect( unissono._options.arpeggio ).toBe( true );
        expect( unissono._options.dedilhado ).toEqual( ['1','2', '3'] );
    } );

    it( 'deve permitir leitura e atualização da propriedade notas através de getter e setter com validação', () => {
        const notaMock1 = Object.create( Nota.prototype );
        const duracaoMock = Object.create( TempoDuracao.prototype );
        const unissono = ObjectFactory.newUnissono( [ notaMock1 ], duracaoMock );
        
        expect( unissono.notas.length ).toBe( 1 );

        const notaMock2 = Object.create( Nota.prototype );
        const notaMock3 = Object.create( Nota.prototype );
        
        unissono.notas = [ notaMock2, notaMock3 ];
        
        expect( unissono.notas.length ).toBe( 2 );
        expect( unissono.notas[ 0 ] ).toBe( notaMock2 );
        expect( unissono.notas[ 1 ] ).toBe( notaMock3 );
        
        // Testar validação no setter
        expect( () => { unissono.notas = [ {} ]; } ).toThrowError( "Todos os elementos do array de notas devem ser instâncias de Nota." );
        expect( () => { unissono.notas = null; } ).toThrowError( "As notas de um unissono devem ser fornecidas como um array de instâncias de Nota." );
    } );

    it( 'deve validar corretamente o tipo da propriedade graceNote no construtor', () => {
        const notaMock = Object.create( Nota.prototype );
        const duracaoMock = Object.create( TempoDuracao.prototype );
        
        const msgErroTipo = "GraceNote: deve ser um array de instâncias de Nota | Pausa | Unissono | Quialtera.";
        const msgErroElementos = "Todos os elementos do array de notas devem ser instâncias de Nota | Pausa | Unissono | Quialtera.";
        
        expect( () => ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: true } ) ).toThrowError( msgErroTipo );
        expect( () => ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: {} } ) ).toThrowError( msgErroTipo );
        expect( () => ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: "nota" } ) ).toThrowError( msgErroTipo );
        
        expect( () => ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: [ {} ] } ) ).toThrowError( msgErroElementos );
        
        const graceNoteMock = Object.create( Nota.prototype );
        const unissonoComGrace = ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: [ graceNoteMock ] } );
        expect( unissonoComGrace._options.graceNote ).toEqual( [ graceNoteMock ] );
        
        const unissonoVazio = ObjectFactory.newUnissono( [ notaMock ], duracaoMock, { graceNote: [] } );
        expect( unissonoVazio._options.graceNote ).toEqual( [] );
        
    } );
} );
