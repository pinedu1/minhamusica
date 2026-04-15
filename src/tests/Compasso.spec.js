import { describe, it, expect } from 'vitest';
import { Compasso } from '../model/compasso/Compasso.js';
import { Nota } from '../model/nota/Nota.js';
import { Pausa } from '../model/nota/Pausa.js';
import { Acorde } from '../model/nota/Acorde.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';
import { TempoMetrica } from '../model/tempo/TempoMetrica.js';
import { Tonalidade } from '../model/compasso/Tonalidade.js';
// Mocks simples baseados na suposição da sua estrutura de Enums
const MockTipoBarra = {
    NONE: { abc: "" },
    STANDARD: { abc: "|" },
    REPEAT_BEGIN: { abc: "|:" },
    REPEAT_END: { abc: ":|" }
};

const MockTonalidade = {
    C: { valor: "C" },
    G: { valor: "G" }
};

describe('Classe Compasso', () => {
    // Referências globais de tempo para facilitar
    const ref14 = new TempoDuracao(1, 4);
    const ref18 = new TempoDuracao(1, 8);
    const metrica44 = new TempoMetrica(4, 4);

    describe('Inicialização e Vínculos', () => {
        it('deve vincular a referência do compasso aos seus elementos automaticamente', () => {
            const nota1 = Nota.create({ altura: "C", duracao: "1/4", options: { unidadeTempo: ref14 }});
            const pausa = Pausa.create({ duracao: "1/4", options: { unidadeTempo: ref14 }});

            const compasso = new Compasso();
            // Ao usar o setter, os elementos devem receber o compasso em suas options
            compasso.elements = [nota1, pausa];

            expect(nota1.options.compasso).toBe(compasso);
            expect(pausa.options.compasso).toBe(compasso);
        });

        it('deve lançar erro se a propriedade letra não for um Array', () => {
            const compasso = new Compasso();
            expect(() => {
                compasso.letra = "Letra da música inteira";
            }).toThrow("Compasso: A propriedade 'letra' deve ser um Array de strings.");
        });
    });
    describe('Cálculos de Tempo (Hierarquia e Pulsos)', () => {
        it('deve calcular corretamente a quantidade de pulsos (Ex: M:4/4 com L:1/8 = 8 pulsos)', () => {
            const compasso = new Compasso([], {
                metrica: metrica44,
                unidadeTempo: ref18
            });

            // (4/4) / (1/8) = 1 / 0.125 = 8
            const pulsos = compasso.getPulsos(compasso.getUnidadeTempo());
            expect(pulsos).toBe(8);
        });
        it('deve usar a soma das durações dos elementos como fallback de pulsos se não houver métrica', () => {
            const nota1 = Nota.create({ altura: "C", duracao: "1/4", options: { unidadeTempo: ref14 }});
            const nota2 = Nota.create({ altura: "E", duracao: "1/4", options: { unidadeTempo: ref14 }});

            const compasso = new Compasso([nota1, nota2], {
                unidadeTempo: TempoDuracao.create("1/4")
                , metrica: TempoMetrica.create("2/4")
            });

            // Soma das razões (0.25 + 0.25) / L (0.25) = 2
            const pulsos = compasso.getPulsos(compasso.getUnidadeTempo());
            expect(pulsos).toBe(2);
        });
        describe('Renderização ABC e Quebra de Agrupamento (Beams)', () => {
            it('deve inserir o espaço para quebrar o agrupamento na metade do compasso (4 pulsos de 8)', () => {
                // Cria 4 colcheias (L:1/8)
                const compasso = new Compasso([], {
                    unidadeTempo: ref18,
                    barraInicial: MockTipoBarra.NONE,
                    barraFinal: MockTipoBarra.NONE
                });
                const n1 = Nota.create({ altura: "C", duracao: ref18, options: { compasso: compasso} } );
                const n2 = Nota.create({ altura: "D", duracao: ref18, options: { compasso: compasso} } );
                const n3 = Nota.create({ altura: "E", duracao: ref18, options: { compasso: compasso} } );
                const n4 = Nota.create({ altura: "F", duracao: ref18, options: { compasso: compasso} } );
                compasso.elements = [n1, n2, n3, n4];

                // Como não há métrica, pulsosTotais = 4. Metade = 2.
                // Logo, após as duas primeiras notas, deve inserir um espaço.
                const abcResult = compasso.toAbc();

                // O retorno das notas toAbc() deve gerar as letras normais.
                // Pelo código implementado: CDEF com L:1/8 (onde 1/8 / 1/8 = 1, sufixo vazio)
                // Agrupamento quebra no meio: "CD EF"
                expect(abcResult).toBe("CD EF");
            });
        });
        it('deve renderizar cifras e anotações atreladas às posições', () => {
            const compasso = new Compasso([], {
                unidadeTempo: ref14,
                barraInicial: MockTipoBarra.NONE,
                barraFinal: MockTipoBarra.NONE
            });
            const n1 = Nota.create({ altura: "C", duracao: ref14, options: { compasso: compasso} });
            compasso.elements = [n1];
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("dedilhado especial", 0, "^");

            const abcResult = compasso.toAbc();
            expect(abcResult).toContain('"Am"');
            expect(abcResult).toContain('"^dedilhado especial"');
            expect(abcResult.endsWith("C")).toBe(true);
        });
        it('deve renderizar a mudança de métrica e mudança de tom', () => {
            const compasso = new Compasso([], {
                metrica: metrica44,
                mudancaDeTom: MockTonalidade.G,
                barraInicial: MockTipoBarra.REPEAT_BEGIN,
                barraFinal: MockTipoBarra.REPEAT_END,
                unidadeTempo: ref14
            });

            const abcResult = compasso.toAbc();
            // Ordem esperada: Barra -> Metrica -> Tom -> (elementos vazios) -> Barra final
            expect(abcResult).toBe("|:[M:4/4][K:G] z4:|");
        });
        describe('Helper estático Compasso.create()', () => {
            it('deve instanciar Notas, Pausas e Acordes a partir de um JSON puro', () => {
                const jsonCompasso = {
                    elementos: [
                        { altura: "C", duracao: "1/4" }, // Identificado como Nota
                        { duracao: "1/4" },              // Identificado como Pausa
                        { notas: [{altura:"E", duracao:"1/4"}, {altura:"G", duracao:"1/4"}], duracao: "1/4" } // Acorde
                    ],
                    options: {
                        unidadeTempo: "1/4",
                        metrica: { numerador: 4, denominador: 4 },
                        cifras: [{ texto: "C", posicao: 0 }]
                    }
                };

                const compasso = Compasso.create(jsonCompasso);

                expect(compasso).toBeInstanceOf(Compasso);
                expect(compasso.elements[0]).toBeInstanceOf(Nota);
                expect(compasso.elements[1]).toBeInstanceOf(Pausa);
                expect(compasso.elements[2]).toBeInstanceOf(Acorde);
                expect(compasso.getMetrica()).toBeInstanceOf(TempoMetrica);
            });
        });
        it('deve aceitar instâncias já criadas de notas dentro da Factory via refine do Zod', () => {
            const notaViva = Nota.create({ altura: "D", duracao: "1/8", options: { unidadeTempo: "1/8" }});

            const compasso = Compasso.create({
                elementos: [notaViva],
                options: { unidadeTempo: "1/8" }
            });

            expect(compasso.elements[0]).toBe(notaViva);
        });
        it('deve lançar TypeError se a estrutura do JSON for inválida', () => {
            const jsonInvalido = {
                elementos: "isto não é um array"
            };

            expect(() => {
                Compasso.create(jsonInvalido);
            }).toThrow(/Compasso.create: Erro na estrutura dos dados/);
        });
    });
    describe('Geração ABC e Agrupamento (Beaming)', () => {
        it('deve agrupar corretamente compassos pares (M: 4/4, 4 semínimas)', () => {
            // Em 4/4 com 4 notas de 1 tempo, o corte é no meio (após 2 pulsos)
            const compasso = Compasso.create({
                elementos: [
                    { altura: "C", duracao: "1/4" },
                    { altura: "D", duracao: "1/4" },
                    { altura: "E", duracao: "1/4" },
                    { altura: "F", duracao: "1/4" }
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
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
                    { altura: "C", duracao: "1/4" },
                    { altura: "D", duracao: "1/4" },
                    { altura: "E", duracao: "1/4" },
                ],
                options: { metrica: "3/4", unidadeTempo: "1/4" }
            });

            // L: 1/4. Esperado: "CD E|"
            expect(compasso.toAbc()).toBe("[M:3/4]CD E|");
        });
        it('deve adicionar anotações e cifras corretamente aos elementos', () => {
            const compasso = Compasso.create({
                elementos: [
                    { altura: "C", duracao: "1/4" },
                    { altura: "E", duracao: "1/4" },
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("p", 1, "^"); // ^p sobre a segunda nota

            expect(compasso.toAbc()).toBe('[M:4/4]"Am"C"^p"E z2|');
        });
        it('deve adicionar anotações e cifras corretamente aos elementos Tempo2', () => {
            const compasso = Compasso.create({
                elementos: [
                    { altura: "C", duracao: "1/2" },
                    { altura: "E", duracao: "1/2" },
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("p", 1, "^"); // ^p sobre a segunda nota

            expect(compasso.toAbc()).toBe('[M:4/4]"Am"C2 "^p"E2|');
        });
        it('deve adicionar anotações e cifras corretamente aos elementos Tempo3', () => {
            const compasso = Compasso.create({
                elementos: [
                    { altura: "C", duracao: "1/2" },
                    { altura: "E", duracao: "1/2" },
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });
            compasso.addCifra("Am", 0);
            compasso.addAnotacao("p", 0, "_"); // ^p sobre a segunda nota
            const result = compasso.toAbc();
            expect(result).toBe('[M:4/4]"Am""_p"C2 E2|');
        });
    });
    describe('Helper estático Compasso.create() com JSON', () => {
        it('deve instanciar Nota, Pausa e Acorde implicitamente pelas propriedades do JSON', () => {
            const compasso = Compasso.create({
                elementos: [
                    { duracao: "1/4" }, // Vírgula normal
                    { altura: "f", duracao: "1/4" }, // Vírgula normal
                    {
                        notas: [
                            { altura: "e", duracao: "1/4" },
                            { altura: "d", duracao: "1/4" }
                        ],
                        duracao: "1/4",
                    }
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });
            const result = compasso.toAbc();
            expect(result).toBe('[M:4/4]zf [ed] z|');
            expect(compasso.elements).toHaveLength(3);
            expect(compasso.elements[0]).toBeInstanceOf(Pausa);
            expect(compasso.elements[1]).toBeInstanceOf(Nota);
            expect(compasso.elements[2]).toBeInstanceOf(Acorde);
        });
        it('deve herdar as propriedades do options (tempo e unidadeTempo) para os elementos', () => {
            const compasso = Compasso.create({
                elementos: [{notas:[{ altura: "C", duracao: "2/1" }],duracao: "2/1"}],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });

            const acorde = compasso.elements[0];
            expect(acorde.duracao.razao).toBe(2); // ratio de 2/1
            expect(acorde.getUnidadeTempo().razao).toBe(0.25); // ratio de 1/4
            const result = compasso.toAbc();
            expect(result).toBe("[M:4/4][C]8|"); // 2 / 0.25 = 8
        });
        it('deve inicializar metrica e letra a partir do nível raiz do JSON e suportar chaves menores (Fm)', () => {
            const compasso = Compasso.create({
                elementos: []
                , options: { metrica: "6/8", unidadeTempo: "1/4", mudancaDeTom: Tonalidade.create('Fm'), letra: ["A","mém"] }
            });

            expect(compasso.letra).toEqual(["A","mém"]);
            expect(compasso.metrica.numerador).toBe(6);
            expect(compasso.metrica.denominador).toBe(8);
            expect(compasso.mudancaDeTom.valor).toBe(Tonalidade.create('Fm').valor);
            const result = compasso.toAbc();
            expect(result).toBe("[M:6/8][K:Fm] z3|");
        });
        it('deve permitir instanciar elementos usando classes reais em vez de objetos vazios', () => {
            const nota = Nota.create({ altura: "G", duracao: "1/4", options: { unidadeTempo: "1/4"} });
            const compasso = Compasso.create({
                elementos: [nota],
                options: {metrica: "4/4", unidadeTempo: "1/4"}
            });

            expect(compasso.elements[0]).toBe(nota);
            expect(compasso.toAbc()).toBe("[M:4/4]G z3|");
        });
        it('deve instanciar uma nota G pontuada (3/8) e preencher o resto do compasso', () => {
            // 3/8 é o valor matemático de uma semínima (1/4) pontuada
            const nota = Nota.create({ altura: "G", duracao: "3/8", options: { unidadeTempo: "1/4"} });

            const compasso = Compasso.create({
                elementos: [nota],
                options: {metrica: "4/4", unidadeTempo: "1/4"}
            });

            expect(compasso.elements[0]).toBe(nota);

            // Matemática do ABC:
            // L:1/4
            // Duração do G (3/8) -> (3/8) / (1/4) = 1.5 pulsos
            // Pulsos totais (4/4) = 4.0 pulsos
            // Falta = 4.0 - 1.5 = 2.5 pulsos
            const result = compasso.toAbc();
            expect(result).toBe("[M:4/4]G3/2 z5/2|");
        });
    });

    describe('Método toJSON()', () => {
        it('deve serializar um compasso simples para um JSON limpo', () => {
            const compasso = Compasso.create({
                elementos: [
                    { duracao: "1/4" },
                    { altura: "f", duracao: "1/4" },
                    {
                        notas: [
                            { altura: "e", duracao: "1/4" },
                            { altura: "d", duracao: "1/4" }
                        ],
                        duracao: "1/4",
                    }
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            });

            const json = compasso.toJSON();

            const expectedJSON = {
                elementos: [
                    { duracao: "1/4" },
                    { altura: "f", duracao: "1/4" },
                    {
                        notas: [
                            { altura: "e", duracao: "1/4" },
                            { altura: "d", duracao: "1/4" }
                        ],
                        duracao: "1/4",
                    }
                ],
                options: { metrica: "4/4", unidadeTempo: "1/4" }
            };

            expect(json).toEqual(expectedJSON);
        });

        it('deve ser o inverso exato do Compasso.create()', () => {
            const originalJSON = {
                elementos: [
                    { duracao: "1/8" },
                    { altura: "a", duracao: "1/8", options: { staccato: true } },
                    {
                        notas: [
                            { altura: "c", duracao: "1/4" },
                            { altura: "e", duracao: "1/4" }
                        ],
                        duracao: "1/4",
                        options: { arpeggio: true }
                    }
                ],
                options: {
                    metrica: "3/4",
                    unidadeTempo: "1/8",
                    mudancaDeTom: "Am",
                    cifras: [{ texto: "Am", posicao: 1 }],
                    letra: ["Teste"]
                }
            };

            const compasso = Compasso.create(originalJSON);
            const jsonGerado = compasso.toJSON();
            console.log(JSON.stringify(jsonGerado, null, 2));
            // O JSON gerado deve ser "deeply equal" ao original
            expect(jsonGerado).toEqual(originalJSON);


            // Bônus: Recriar a partir do JSON gerado deve produzir um objeto idêntico
            const compassoRecriado = Compasso.create(jsonGerado);
            expect(compassoRecriado).toEqual(compasso);
        });

        it('deve omitir o campo "options" se nenhuma opção relevante for fornecida', () => {
            // Cria um compasso com o mínimo necessário para a validação dos elementos filhos
            const ut = new TempoDuracao(1, 4);
            const pausa = new Pausa(ut, { unidadeTempo: ut });
            const compasso = new Compasso([pausa], {}); // Nenhuma opção no compasso

            const json = compasso.toJSON();

            // O campo 'options' não deve existir se estiver vazio
            expect(json.options).toBeUndefined();
        });
    });
});