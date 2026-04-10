import { describe, it, expect } from 'vitest';
import { Compasso } from '../model/compasso/Compasso.js';
import { TipoBarra } from '../model/compasso/TipoBarra.js';
import { TempoMetrica } from '../model/tempo/TempoMetrica.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';
import { Tonalidade } from '../model/compasso/Tonalidade.js';
import { Nota } from '../model/nota/Nota.js';
import { Pausa } from '../model/nota/Pausa.js';
import { Acorde } from '../model/nota/Acorde.js';

describe('Classe Compasso', () => {

    const ref14 = new TempoDuracao(1, 4); // L: 1/4
    const metrica44 = new TempoMetrica(4, 4); // M: 4/4

    describe('Funcionalidades Básicas e Construtor', () => {
        it('deve instanciar um compasso vazio com valores padrão', () => {
            const compasso = new Compasso();
            expect(compasso.elements).toEqual([]);
            expect(compasso.index).toBe(0);
            expect(compasso.barraInicial).toBe(TipoBarra.NONE);
            expect(compasso.barraFinal).toBe(TipoBarra.STANDARD);
            expect(compasso.letra).toBeNull();
        });

        it('deve lançar erro se elementos não forem Nota, Pausa ou Acorde', () => {
            expect(() => {
                new Compasso(["Não sou uma nota"]);
            }).toThrow("Compasso: Apenas instâncias de Nota, Pausa ou Acorde são permitidas.");
        });

        it('deve salvar e retornar a propriedade "letra" corretamente (sem impactar o toAbc)', () => {
            const compasso = new Compasso([], { letra: "A - mém" });
            expect(compasso.letra).toBe("A - mém");
            expect(compasso.toAbc()).not.toContain("A - mém"); // A letra é responsabilidade da Voz
        });
        
        it('deve gerar string ABC com barras, métrica e tom', () => {
            const compasso = new Compasso([], {
                barraInicial: TipoBarra.REPEAT_OPEN,
                barraFinal: TipoBarra.REPEAT_CLOSE,
                metrica: metrica44,
                mudancaDeTom: Tonalidade.G
            });
            
            expect(compasso.toAbc()).toBe("|:[M:4/4][K:G]:|");
        });
    });

    describe('Geração ABC e Agrupamento (Beaming)', () => {
        it('deve agrupar corretamente compassos pares (M: 4/4, 4 semínimas)', () => {
            // Em 4/4 com 4 notas de 1 tempo, o corte é no meio (após 2 pulsos)
            const compasso = Compasso.create({
                elementos: [
                    { freq: "C", tempo: "1/4" },
                    { freq: "D", tempo: "1/4" },
                    { freq: "E", tempo: "1/4" },
                    { freq: "F", tempo: "1/4" }
                ],
                metrica: "4/4",
                options: { duracao: "1/4" }
            });
            
            // L: 1/4. Notas são C, D, E, F. 
            // Esperado: "CD EF|" (corte no meio)
            expect(compasso.toAbc()).toBe("[M:4/4]CD EF|");
        });

        it('deve agrupar compassos ímpares dando prioridade à primeira metade (M: 3/4, 3 semínimas)', () => {
            // Em 3/4 com 3 notas, Math.ceil(3/2) = 2 pulsos.
            // O espaço deve vir após a segunda nota.
            const compasso = Compasso.create({
                elementos: [
                    { freq: "C", tempo: "1/4" },
                    { freq: "D", tempo: "1/4" },
                    { freq: "E", tempo: "1/4" }
                ],
                metrica: "3/4",
                options: { duracao: "1/4" }
            });
            
            // L: 1/4. Esperado: "CD E|"
            expect(compasso.toAbc()).toBe("[M:3/4]CD E|");
        });

        it('deve adicionar anotações e cifras corretamente aos elementos', () => {
            const compasso = Compasso.create({
                elementos: [{ freq: "C", tempo: "1/4" }, { freq: "E", tempo: "1/4" }],
                metrica: "4/4",
                options: { duracao: "1/4" }
            });
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("p", 1, "^"); // ^p sobre a segunda nota

            expect(compasso.toAbc()).toBe('[M:4/4]"Am"C"^p"E|');
        });
        it('deve adicionar anotações e cifras corretamente aos elementos Tempo2', () => {
            const compasso = Compasso.create({
                elementos: [{ freq: "C", tempo: "1/2" }, { freq: "E", tempo: "1/2" }],
                metrica: "4/4",
                options: { duracao: "1/4" }
            });
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("p", 1, "^"); // ^p sobre a segunda nota

            expect(compasso.toAbc()).toBe('[M:4/4]"Am"C2 "^p"E2|');
        });
    });

    describe('Helper estático Compasso.create() com JSON', () => {
        it('deve instanciar Nota, Pausa e Acorde implicitamente pelas propriedades do JSON', () => {
            const compasso = Compasso.create({
                elementos: [
                    { }, // Pausa implícita
                    { freq: "f" }, // Nota implícita
                    { notas: [{ freq: "e" }, { freq: "d" }] } // Acorde implícito
                ],
                options: { tempo: "1/4", duracao: "1/8" }
            });
            
            expect(compasso.elements).toHaveLength(3);
            expect(compasso.elements[0]).toBeInstanceOf(Pausa);
            expect(compasso.elements[1]).toBeInstanceOf(Nota);
            expect(compasso.elements[2]).toBeInstanceOf(Acorde);
        });

        it('deve herdar as propriedades do options (tempo e unidadeTempo) para os elementos', () => {
            const compasso = Compasso.create({
                elementos: [{ freq: "C" }],
                options: { tempo: "2", duracao: "1/4" } // L: 1/4, tempo da nota: 2
            });
            
            const nota = compasso.elements[0];
            expect(nota.duracao.razao).toBe(2); // ratio de 2/1
            expect(nota.unidadeTempo.razao).toBe(0.25); // ratio de 1/4
            expect(nota.toAbc()).toBe("C8"); // 2 / 0.25 = 8
        });

        it('deve inicializar metrica e letra a partir do nível raiz do JSON e suportar chaves menores (Fm)', () => {
            const compasso = Compasso.create({
                elementos: [],
                metrica: "6/8",
                letra: "A - mém",
                mudancaDeTom: Tonalidade.Fm
            });
            
            expect(compasso.letra).toBe("A - mém");
            expect(compasso.metrica.numerador).toBe(6);
            expect(compasso.metrica.denominador).toBe(8);
            expect(compasso.mudancaDeTom).toBe(Tonalidade.Fm);
            expect(compasso.toAbc()).toBe("[M:6/8][K:Fm]|");
        });
        
        it('deve permitir instanciar elementos usando classes reais em vez de objetos vazios', () => {
            const nota = Nota.create({ freq: "G", tempo: "1/4", duracao: "1/4" });
            const compasso = Compasso.create({
                elementos: [nota],
                metrica: "4/4"
            });
            
            expect(compasso.elements[0]).toBe(nota);
            expect(compasso.toAbc()).toBe("[M:4/4]G|");
        });
    });
});
