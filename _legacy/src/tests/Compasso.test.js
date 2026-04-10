import { describe, it, expect } from 'vitest';
import { Compasso } from '../model/compasso/Compasso.js';
import { Nota } from '../model/nota/Nota.js';
import { Pausa } from '../model/nota/Pausa.js';
import { NotaFrequencia } from '../model/nota/NotaFrequencia.js';
import { TempoNota } from '../model/tempo/TempoNota.js';
import { TempoPadrao } from '../model/tempo/TempoPadrao.js';
import { TempoCompasso } from '../model/tempo/TempoCompasso.js';
import { TipoBarra } from '../model/compasso/TipoBarra.js';
import { Tonalidade } from '../model/compasso/Tonalidade.js';

describe('Classe Compasso', () => {
    
    // Configuração de dados rítmicos padrão
    const ref44 = new TempoPadrao(1, 4); 
    const doCentral = NotaFrequencia.getByAbc("C");
    const semina = new TempoNota(1, 4);

    const criarNota = () => new Nota(doCentral, semina, { tempoReferencia: ref44 });

    it('deve renderizar o compasso complexo: | z f ed cB | (M:3/4, L:1/8, K:B)', () => {
        const ref18 = new TempoPadrao(1, 8); // L: 1/8
        const metric34 = new TempoCompasso(3, 4); // M: 3/4
        
        // Elementos do compasso: z f ed cB
        // No ABC, letras minúsculas (f, e, d, c, B) dependem da oitava no NotaFrequencia.
        // Assumindo as notas conforme solicitado:
        const elementos = [
            new Pausa(new TempoNota(1, 8), { tempoReferencia: ref18 }), // z
            new Nota(NotaFrequencia.getByAbc("f"), new TempoNota(1, 8), { tempoReferencia: ref18 }), // f
            new Nota(NotaFrequencia.getByAbc("e"), new TempoNota(1, 8), { tempoReferencia: ref18 }), // e
            new Nota(NotaFrequencia.getByAbc("d"), new TempoNota(1, 8), { tempoReferencia: ref18 }), // d
            new Nota(NotaFrequencia.getByAbc("c"), new TempoNota(1, 8), { tempoReferencia: ref18 }), // c
            new Nota(NotaFrequencia.getByAbc("B"), new TempoNota(1, 8), { tempoReferencia: ref18 })  // B
        ];

        const compasso = new Compasso(elementos, {
            barraInicial: TipoBarra.STANDARD,
            barraFinal: TipoBarra.STANDARD,
            tempoCompasso: metric34,
            mudancaDeTom: Tonalidade.B
        });

        const abc = compasso.toAbc();

        /**
         * EXPECTATIVA:
         * 1. Barra: |
         * 2. Métrica: [M:3/4]
         * 3. Tom: [K:B]
         * 4. Notas: z f e d c B
         * (Nota: Como L:1/8 e todas as notas são 1/8, não há sufixo numérico)
         */
        expect(abc).toBe("|[M:3/4][K:B]z f e d c B|");
    });

    it('deve renderizar a estrutura completa: barras, métrica, tom, cifras e anotações', () => {
        const n1 = criarNota();
        const n2 = criarNota();
        const metric = new TempoCompasso(3, 4);
        
        const compasso = new Compasso([n1, n2], {
            index: 1,
            barraInicial: TipoBarra.STANDARD,
            barraFinal: TipoBarra.STANDARD,
            tempoCompasso: metric,
            mudancaDeTom: Tonalidade.G
        });

        compasso.addCifra("G", 0);
        compasso.addAnotacao("Solo", 0);
        compasso.addCifra("D7", 1);

        const abc = compasso.toAbc();
        expect(abc).toBe('|[M:3/4][K:G]"G""_Solo"C "D7"C|');
    });

    it('deve validar a tonalidade contra o Enum Tonalidade', () => {
        const compasso = new Compasso();
        expect(() => { compasso.mudancaDeTom = Tonalidade.Eb; }).not.toThrow();
        expect(() => { compasso.mudancaDeTom = "C"; }).toThrow();
    });

    it('deve renderizar barras de repetição corretamente', () => {
        const n = criarNota();
        const compasso = new Compasso([n], {
            barraInicial: TipoBarra.REPEAT_OPEN,
            barraFinal: TipoBarra.REPEAT_CLOSE
        });
        expect(compasso.toAbc()).toBe("|:C:|");
    });

    it('deve gerenciar múltiplas anotações e cifras na mesma posição', () => {
        const n = criarNota();
        const compasso = new Compasso([n]);
        compasso.addCifra("G", 0);
        compasso.addCifra("B7", 0);
        compasso.addAnotacao("Pizz", 0, "_");
        
        const abc = compasso.toAbc();
        expect(abc).toBe('"G""B7""_Pizz"C|');
    });
});
