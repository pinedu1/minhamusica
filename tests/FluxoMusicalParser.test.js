import { describe, it, expect, beforeEach } from 'vitest';
import { Musica } from '../src/model/Musica.js';
import { FluxoMusicalParser } from '../src/parser/FluxoMusicalParser.js';
import { EstruturaTempo } from '../src/model/EstruturaTempo.js';
import { Duracao } from '../src/model/Duracao.js';

describe('Parser Musica - Integração ABC', () => {
    let minhaMusica;
    beforeEach(() => {
        minhaMusica = new Musica("Amargurado", "Tião Carreiro & Pardinho", "Guarânia");
    });



    it('deve parsear uma sequência simples de notas e preencher os compassos', () => {
        const formula = new EstruturaTempo(4, 4); // 4/4
        const unidadeBase = Duracao.getByValor(0.5);
        //const unidadeBase = Duracao.getByTempo('1/8');
        const textoAbc = "A B c d | e f g a";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);

        // No 4/4 com L:1/8, cada compasso cabe 8 notas de valor 0.5
        // "A B c d" são 4 notas -> 2.0 de tempo. 
        // Como o parser só vira o compasso se estourar ou se houver barras (embora o regex atual ignore barras),
        // vamos verificar a estrutura resultante.
        expect(compassos.length).toBeGreaterThan(0);
        expect(compassos[0].notas.length).toBe(8); 
    });

    it('deve lidar com durações customizadas (multiplicadores e frações)', () => {
        const formula = new EstruturaTempo(3, 4); // 3/4 (valor total 3.0)
        //const unidadeBase = Duracao.getByTempo('1/1');
        const unidadeBase = Duracao.getByValor(1.0);
        const textoAbc = "A2 B/2 C3";
        // A2 = 2.0, B/2 = 0.5, C3 = 3.0. Total = 5.5

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);

        // Compasso 1 (3.0): A2 (2.0) + B/2 (0.5) + parte de C3 (0.5). C3 fica ligada.
        // Compasso 2 (3.0): Restante de C3 (2.5).
        expect(compassos.length).toBe(2);
        expect(compassos[0].notas[2].ligada).toBe(true);
        expect(compassos[1].notas[0].altura.abc).toBe("C");
    });

    it('deve aplicar ligaduras (ties) quando o caractere "-" está presente', () => {
        const formula = new EstruturaTempo(4, 4);
        const unidadeBase = Duracao.getByTempo('1/1');
        const textoAbc = "A- A";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);
        expect(compassos[0].notas[0].ligada).toBe(true);
    });

    it('deve resolver alturas corretamente incluindo acidentes e oitavas', () => {
        const formula = new EstruturaTempo(4, 4);
        const unidadeBase = Duracao.getByTempo('1/4');
        const textoAbc = "^F, G' _B";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);
        console.log(compassos[0].notas[0]);
        expect(compassos[0].notas[0].altura.abc).toBe("^F,");
        expect(compassos[0].notas[1].altura.abc).toBe("G'");
        expect(compassos[0].notas[2].altura.abc).toBe("_B");
    });
    it('deve resolver alturas corretamente incluindo acidentes e oitavas (1)', () => {
        const formula = new EstruturaTempo(4, 4);
        const unidadeBase = Duracao.getByTempo('1/4');
        const textoAbc = "^F,G'_B";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);
        console.log(compassos[0].notas[0]);
        expect(compassos[0].notas[0].altura.abc).toBe("^F,");
        expect(compassos[0].notas[1].altura.abc).toBe("G'");
        expect(compassos[0].notas[2].altura.abc).toBe("_B");
    });
});
