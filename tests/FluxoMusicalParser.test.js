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
    it('deve parsear acordes entre colchetes e aplicar a duração correta ao conjunto', () => {
        const formula = new EstruturaTempo(4, 4);
        const unidadeBase = Duracao.getByTempo('1/8'); // L:1/8

        // [GEB,]2 -> Acorde de 3 notas com duração de Semínima (2 * 1/8)
        // [Ac]/4  -> Acorde de 2 notas com duração de Fusa (1/4 * 1/8)
        const textoAbc = "[GEB,]2 [Ac]/4";

        const compassos = FluxoMusicalParser.parse(textoAbc, formula, unidadeBase);

        const compasso = compassos[0];

        // Verificação do primeiro elemento: Acorde [GEB,]2
        const acorde1 = compasso.notas[0];
        expect(acorde1).toBeInstanceOf(Acorde);
        expect(acorde1.notas.length).toBe(3);
        expect(acorde1.notas[2].altura.abc).toBe("B,");
        // Verifica se a duração QUARTER (valor 1.0) foi atribuída (2 * 0.5 da base)
        expect(acorde1.duracao.valor).toBe(1.0);

        // Verificação do segundo elemento: Acorde [Ac]/4
        const acorde2 = compasso.notas[1];
        expect(acorde2).toBeInstanceOf(Acorde);
        expect(acorde2.notas.length).toBe(2);
        expect(acorde2.notas[0].altura.abc).toBe("A");
        expect(acorde2.notas[1].altura.abc).toBe("c");
        // Verifica se a duração foi dividida corretamente (0.5 base / 4 = 0.125)
        expect(acorde2.duracao.valor).toBe(0.125);
    });
});
