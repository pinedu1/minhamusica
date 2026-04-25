import { describe, it, expect } from 'vitest';
import { Compasso } from '../src/domain/Compasso.js'; // Ajuste o caminho se necessário
import { EstruturaTempo } from '../src/domain/EstruturaTempo.js';
import { Clave } from '../src/domain/Clave.js';
import { ClaveTipo } from "../src/domain/ClaveTipo.js";
import { ArmaduraClave } from "../src/domain/ArmaduraClave.js";
import { Nota } from "../src/domain/Nota.js";
import { Duracao } from "../src/domain/Duracao.js";
import { Altura } from "../src/domain/Altura.js";

describe('Classe Compasso', () => {

    it('1. Deve instanciar corretamente com valores padrão', () => {
        const compasso = ObjectFactory.newCompasso(1);

        expect(compasso.indice).toBe(1);
        expect(compasso.vozes).toEqual([]);
        expect(compasso.estruturaTempo).toBeNull();
        expect(compasso.toAbc()).toBe('|'); // Compasso vazio deve retornar apenas a barra simples
    });

    it('2. Deve renderizar ABC com mudanças estruturais (Tempo, Clave, Armadura)', () => {
        // Criando Mocks (Dublês) das dependências com o método toAbc() esperado
        const mockTempo = new EstruturaTempo(3, 4);
        const mockClave = new Clave( ClaveTipo.TREBLE );
        const mockArmadura = new ArmaduraClave( 'G', 'maior' );

        const compasso = ObjectFactory.newCompasso(2, {
            estruturaTempo: mockTempo,
            clave: mockClave,
            armaduraClave: mockArmadura
        });

        const resultadoAbc = compasso.toAbc();
        console.log("--- RESULTADO COMPASSO ---");
        console.log(resultadoAbc);
        console.log("---------------------");

        // Esperamos que ele concatene as estruturas e feche com a barra
        expect(resultadoAbc).toBe('[M:3/4][clef=treble][K:G]|');
    });

    it('3. Deve renderizar ABC contendo notas inseridas', () => {
        const compasso = ObjectFactory.newCompasso(3);

        // Criando Mocks de notas
        const mockNota1 = ObjectFactory.newNota( Altura.resolverAltura('C' ), Duracao.QUARTER);  //{ toAbc: () => 'C2' };
        const mockNota2 = ObjectFactory.newNota( Altura.resolverAltura('E' ), Duracao.SIXTEENTH);  //{ toAbc: () => 'E/' };
        const mockNota3 = ObjectFactory.newNota( Altura.resolverAltura('G' ), Duracao.SIXTEENTH);  //{ toAbc: () => 'G/' };

        // ATENÇÃO: Você precisará criar o método adicionarNota() na classe Compasso!
        compasso.notaAppend(mockNota1);
        compasso.notaAppend(mockNota2);
        compasso.notaAppend(mockNota3);

        const resultadoAbc = compasso.toAbc();
        console.log("--- RESULTADO COMPASSO ---");
        console.log(resultadoAbc);
        console.log("---------------------");
        expect(resultadoAbc).toBe('C2E/G/|');
    });

    it('4. Deve renderizar ABC com notas e acordes (acordes) sincronizados pelo índice', () => {
        const compasso = ObjectFactory.newCompasso(4);

        const mockNota1 = ObjectFactory.newNota( Altura.resolverAltura('E' ), Duracao.QUARTER);  //{ toAbc: () => 'E2' };
        const mockNota2 = ObjectFactory.newNota( Altura.resolverAltura('B' ), Duracao.QUARTER);  //{ toAbc: () => 'B2' };
        compasso.notaAppend(mockNota1);
        compasso.notaAppend(mockNota2);

        // Mocks de Acordes apontando para as posições rítmicas (índices 0 e 1)
        const mockAcordes = [
            { posicao: 0, acorde: 'E' },
            { posicao: 1, acorde: 'B7' }
        ];

        // ATENÇÃO: Você precisará criar o método definirAcordes() na classe Compasso!
        compasso.acordes = mockAcordes;

        const resultadoAbc = compasso.toAbc();
        console.log("--- RESULTADO COMPASSO ---");
        console.log(resultadoAbc);
        console.log("---------------------");
        expect(resultadoAbc).toBe('"E"E2"B7"B2|');
    });

    it('5. Deve renderizar uma barra de fechamento personalizada', () => {
        const compasso = ObjectFactory.newCompasso(5);

        // ATENÇÃO: Você precisará criar o setter setTipoBarra() na classe Compasso!
        compasso.tipoBarraFechamento = '||';
        const resultado = compasso.toAbc();
        console.log("--- RESULTADO COMPASSO ---");
        console.log(resultado);
        console.log("---------------------");
        expect(resultado).toBe('||');
    });

    it('6. Deve adicionar quebra de linha ao final do compasso se configurado', () => {
        const compasso = ObjectFactory.newCompasso(6);

        // ATENÇÃO: Você precisará criar o setter setQuebraDeLinha() na classe Compasso!
        compasso.quebraDeLinha = true;

        // Compasso vazio + barra simples + quebra de linha (\n)
        const resultado = compasso.toAbc();
        console.log("--- RESULTADO COMPASSO ---");
        console.log(resultado);
        console.log("---------------------");
        expect(resultado).toBe('|\n');
    });
});