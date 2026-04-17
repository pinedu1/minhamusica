import { describe, it, expect, beforeEach } from 'vitest';
import { Musica } from '../src/domain/Musica.js';
import { FluxoMusicalParser } from '../src/parser/FluxoMusicalParser.js';
import { EstruturaTempo } from '../src/domain/EstruturaTempo.js';
import { Duracao } from '../src/domain/Duracao.js';
import { Acorde } from '../src/domain/Acorde.js';

describe('Parser Musica - Integração ABC', () => {
    let minhaMusica;
    beforeEach(() => {
        minhaMusica = new Musica("Amargurado", "Tião Carreiro & Pardinho", "Guarânia");
    });

    it('deve parsear uma sequência simples de notas e preencher os compassos', () => {
        const formula = new EstruturaTempo(4, 4); // Total 1.0
        const lBase = new EstruturaTempo(1, 8);   // L: 1/8
        const contexto = new Duracao(formula, lBase);
        const unidadeBase = contexto.COLCHEIA; // 0.125
        
        const textoAbc = "A B c d | e f g a";
        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);

        expect(compassos.length).toBeGreaterThan(0);
        // Cada nota A vale 0.125. 8 notas * 0.125 = 1.0 (um compasso 4/4)
        expect(compassos[0].vozes[0].notas.length).toBe(8);
    });

    it('deve lidar com durações customizadas (multiplicadores e frações)', () => {
        const formula = new EstruturaTempo(3, 4); // Total 0.75
        const lBase = new EstruturaTempo(1, 4);   // L: 1/4 (0.25)
        const contexto = new Duracao(formula, lBase);
        const unidadeBase = contexto.SEMINIMA; // 0.25
        
        const textoAbc = "A2 B/2 C3";
        // A2 = 0.25 * 2 = 0.5
        // B/2 = 0.25 / 2 = 0.125
        // C3 = 0.25 * 3 = 0.75. Total = 1.375

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);

        // Compasso 1 (0.75): A2(0.5) + B/2(0.125) + parte de C3(0.125)
        expect(compassos.length).toBe(2);
        expect(compassos[0].vozes[0].notas[2].ligada).toBe(true);
        expect(compassos[0].vozes[0].notas[2].duracao).toBe(0.125); 
    });

    it('deve parsear acordes entre colchetes e aplicar a duração correta ao conjunto', () => {
        const formula = new EstruturaTempo(4, 4); // Total 1.0
        const lBase = new EstruturaTempo(1, 8); // L: 1/8 = 0.125
        const contexto = new Duracao(formula, lBase);
        const unidadeBase = contexto.COLCHEIA;

        // [GEB,]2 -> (0.125 * 2) = 0.25
        // [Ac]4   -> (0.125 * 4) = 0.5
        const textoAbc = "[GEB,]2 [Ac]4";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);
        const acorde1 = compassos[0].vozes[0].notas[0];
        
        expect(acorde1).toBeInstanceOf(Acorde);
        expect(acorde1.duracao.valor).toBe(0.25);

        const acorde2 = compassos[0].vozes[0].notas[1];
        expect(acorde2.duracao.valor).toBe(0.5);
    });

    it('deve parsear acordes com tempos divididos e transbordo', () => {
        const formula = new EstruturaTempo(4, 4); // Total 1.0
        const lBase = new EstruturaTempo(1, 4);   // L: 1/4 (0.25)
        const contexto = new Duracao(formula, lBase);
        const unidadeBase = contexto.SEMINIMA;

        // [GEB,]/2 -> 0.125
        // [Ac]4    -> 1.0 (Semibreve)
        const textoAbc = "[GEB,]/2 [Ac]4";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);
        const notas = compassos[0].vozes[0].notas;

        expect(notas[0].duracao.valor).toBe(0.125);
        // O acorde2 tem 1.0. 
        // No primeiro compasso, resta: 1.0 - 0.125 = 0.875.
        // O que sobra do acorde vai para o próximo compasso: 1.0 - 0.875 = 0.125.
        expect(notas[1].duracao).toBe(0.875); 
        expect(compassos[1].vozes[0].notas[0].duracao).toBe(0.125);
    });
});
