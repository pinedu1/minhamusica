import { describe, it, expect } from 'vitest';
import { Nota } from '../src/model/Nota.js';
import { Altura } from '../src/model/Altura.js';
import { Duracao, DuracaoBase } from '../src/model/Duracao.js';
import { EstruturaTempo } from '../src/model/EstruturaTempo.js';
import { UnidadeDuracao } from '../src/model/UnidadeDuracao.js';
describe('Classe Nota', () => {
    it('deve calcular corretamente o sufixo de duração baseado na unidadeBase 4 tempos', () => {
        const altura = Altura.resolverAltura("G");

        // Nota: Mínima (1/2 ou 2/4 = 0.5)
        // Unidade Base: Colcheia (1/8 = 0.125)
        // Razão: 0.5 / 0.125 = 4 -> Resultado ABC: "4"
        const duracaoNota = new Duracao(
            new EstruturaTempo(1, 2), // Representa a Mínima
            new UnidadeDuracao(1, 8)  // Representa a unidade base L: 1/8
        );

        const nota = new Nota(altura, duracaoNota);
        const resultado = nota.toAbc();

        console.log("--- RESULTADO ABC ---");
        console.log(resultado);
        console.log("---------------------");


        expect( resultado ).toBe("G4");
    });
    it('deve renderizar o ABC básico de uma nota Sem estrutura de tempo, herdando do Compasso', () => {
        const altura = Altura.resolverAltura("G");
        const formula = new EstruturaTempo(4, 4);
        const lBase = new UnidadeDuracao(1, 4); // L: 1/4 (0.25)

        // Criamos uma Semínima (0.25). Como L: também é 1/4 (0.25), a razão é 1.
        const nota = new Nota(altura, null, {compasso: {estruturaTempo: formula, unidadeBase: lBase}});

        const resultado = nota.toAbc();

        console.log("--- RESULTADO ABC ---");
        console.log(resultado);
        console.log("---------------------");


        expect(resultado).toBe("G");
    });
    it('Tempo fracionado 3/4', () => {
        const altura = Altura.resolverAltura("G");
        const duracaoNota = new Duracao(
            new EstruturaTempo(3, 4), // M: 3/4 -> Pulso de 1/4
            new UnidadeDuracao(3, 8) // L: 3/8 -> Base de 3/8
        );
        // Criamos uma Semínima (0.25). Como L: também é 1/4 (0.25), a razão é 1.
        const nota = new Nota(altura, duracaoNota);

        const resultado = nota.toAbc();

        console.log("--- RESULTADO ABC ---");
        console.log(resultado);
        console.log("---------------------");


        expect(resultado).toBe("G2/3");
    });

    /*
        it('deve renderizar sufixo numérico quando a nota for múltiplo da unidade base', () => {
            const altura = Altura.resolverAltura("C");
            const formula = new EstruturaTempo(4, 4);
            const lBase = new EstruturaTempo(1, 8); // L: 1/8 (0.125)
            const contexto = new Duracao(formula, lBase);

            // Mínima (0.5). Razão contra L(0.125) = 4.
            const nota = new Nota(altura, contexto.MINIMA, lBase);

            expect(nota.toAbc()).toBe("C4");
        });

        it('deve renderizar sufixo de fração (barra) quando a nota for menor que a unidade base', () => {
            const altura = Altura.resolverAltura("D");
            const formula = new EstruturaTempo(4, 4);
            const lBase = new EstruturaTempo(1, 4); // L: 1/4 (0.25)
            const contexto = new Duracao(formula, lBase);

            // Colcheia (0.125). Razão contra L(0.25) = 0.5 (Representado por "/")
            const nota = new Nota(altura, contexto.COLCHEIA, lBase);

            expect(nota.toAbc()).toBe("D/");
        });

        it('deve aplicar ligadura de prolongamento (-) corretamente', () => {
            const altura = Altura.resolverAltura("E");
            const formula = new EstruturaTempo(4, 4);
            const lBase = new EstruturaTempo(1, 4);
            const contexto = new Duracao(formula, lBase);

            const nota = new Nota(altura, contexto.SEMINIMA, lBase);
            nota.ligada = true;

            expect(nota.toAbc()).toBe("E-");
        });

        it('deve renderizar nota fantasma com o prefixo !style=x!', () => {
            const altura = Altura.resolverAltura("F");
            const formula = new EstruturaTempo(4, 4);
            const lBase = new EstruturaTempo(1, 4);
            const contexto = new Duracao(formula, lBase);

            // Usamos o construtor completo para ativar ghostNote
            const nota = new Nota(altura, contexto.SEMINIMA, lBase, [], null, true);

            expect(nota.toAbc()).toBe("!style=x!F");
        });

        it('deve priorizar a unidadeBase local da nota sobre o fallback passado no toAbc', () => {
            const altura = Altura.resolverAltura("A");
            const formula = new EstruturaTempo(4, 4);

            const lLocal = new EstruturaTempo(1, 8);  // L: 1/8 (0.125)
            const lFallback = new EstruturaTempo(1, 4); // L: 1/4 (0.25)

            const contexto = new Duracao(formula, lLocal);

            // Nota Semínima (0.25).
            // Se usar lLocal(0.125) -> A2
            // Se usar lFallback(0.25) -> A
            const nota = new Nota(altura, contexto.SEMINIMA, lLocal);

            expect(nota.toAbc(lFallback)).toBe("A2");
        });

        it('deve usar o fallback se a nota não possuir unidadeBase interna', () => {
            const altura = Altura.resolverAltura("B");
            const formula = new EstruturaTempo(4, 4);
            const lFallback = new EstruturaTempo(1, 8); // 0.125
            const contexto = new Duracao(formula, lFallback);

            // Nota sem unidadeBase no construtor
            const nota = new Nota(altura, contexto.SEMINIMA, null);

            // Deve calcular contra o fallback: 0.25 / 0.125 = 2
            expect(nota.toAbc(lFallback)).toBe("B2");
        });
    */
});
