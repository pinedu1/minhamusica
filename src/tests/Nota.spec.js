import { describe, it, expect } from 'vitest';
import { Nota } from '../model/nota/Nota.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';
import { NotaFrequencia } from '../model/nota/NotaFrequencia.js';

describe('Nota', () => {
    const ref14 = new TempoDuracao(1, 4); // L: 1/4
    const ref44 = new TempoDuracao(4, 4); // L: 4/4
    const mockObra = { options: { unidadeTempo: ref44 }, get unidadeTempo() { return this.options.unidadeTempo; } };
    const mockVoz = { options: { unidadeTempo: TempoDuracao.create({duracao: "3/4"}) }, get unidadeTempo() { return this.options.unidadeTempo; } };
    const mockCompasso = { options: { unidadeTempo: TempoDuracao.create({duracao: "2/4"}) }, get unidadeTempo() { return this.options.unidadeTempo; } };
    const mockPropria = TempoDuracao.create({duracao: "1/4"});
    describe('Construtor Manual', () => {
        it('deve mesclar as opções corretamente na instância: altura ByKey', () => {
            const altura = NotaFrequencia.getByKey("C4");
            const duracao = TempoDuracao.create({duracao:"1/4"});
            const options = {
                acento: true,
                staccato: true,
                fermata: true,
                ligada: true
            };
            
            const nota = new Nota(altura, duracao, options);
            
            expect(nota.altura).toBe(altura);
            expect(nota.duracao).toBe(duracao);
            expect(nota.options.acento).toBe(true);
            expect(nota.options.staccato).toBe(true);
            expect(nota.options.fermata).toBe(true);
            expect(nota.ligada).toBe(true);
        });
        it('deve mesclar as opções corretamente na instância: altura ByAbc', () => {
            const altura = NotaFrequencia.getByAbc("C");
            const duracao = TempoDuracao.create({duracao:"1/4"});
            const options = {
                acento: true,
                staccato: true,
                fermata: true,
                ligada: true
            };

            const nota = new Nota(altura, duracao, options);

            expect(nota.altura).toBe(altura);
            expect(nota.duracao).toBe(duracao);
            expect(nota.options.acento).toBe(true);
            expect(nota.options.staccato).toBe(true);
            expect(nota.options.fermata).toBe(true);
            expect(nota.ligada).toBe(true);
        });
    });
    describe('Factory Method (create)', () => {
        it('deve criar uma instância real de TempoDuracao quando passado um JSON limpo', () => {
            const json = {
                altura: "C",
                duracao: "1/4",
                options: {
                    unidadeTempo: "4/4",
                    acento: true
                }
            };

            const nota = Nota.create(json);

            expect(nota).toBeInstanceOf(Nota);

            // Garantindo que as propriedades foram resolvidas para instâncias reais.
            // (Nota: caso exista inversão de dependências no construtor dentro do create,
            // o teste falhará propositalmente seguindo o TDD para correção posterior)
            expect(nota.duracao).toBeInstanceOf(TempoDuracao);
            expect(nota.altura).toBeInstanceOf(NotaFrequencia);
            expect(nota.options.acento).toBe(true);
        });
        it('deve lançar TypeError se a duração não for enviada (rejeição do Zod)', () => {
            const jsonInvalido = {
                altura: "C4",
                options: {
                    unidadeTempo: "4/4"
                }
            }; // Faltando a propriedade 'duracao' obrigatória

            expect(() => Nota.create(jsonInvalido)).toThrow(TypeError);
        });
    });
    describe('Regra de Recursão (unidadeTempo)', () => {
        it('deve respeitar a prioridade de busca: Própria Nota -> Compasso -> Voz -> Obra', () => {
            // Utilizando objetos simples conforme exigido nas regras estritas

            const altura = NotaFrequencia.getByAbc("C");
            const duracao = TempoDuracao.create({duracao:"1/4"});

            const nota = new Nota(altura, duracao, {
                unidadeTempo: mockPropria,
                compasso: mockCompasso,
                voz: mockVoz,
                obra: mockObra
            });

            // 1. Própria Nota
            expect(nota.getUnidadeTempo()).toBe(mockPropria);

            // 2. Compasso (removendo a unidade de tempo própria)
            nota.options.unidadeTempo = null;
            expect(nota.getUnidadeTempo()).toBe(mockCompasso.options.unidadeTempo);

            // 3. Voz (removendo o compasso)
            nota.options.compasso = null;
            expect(nota.getUnidadeTempo()).toBe(mockVoz.options.unidadeTempo);

            // 4. Obra (removendo a voz)
            nota.options.voz = null;
            expect(nota.getUnidadeTempo()).toBe(mockObra.options.unidadeTempo);
        });

        it('deve lançar o erro "A unidade de Tempo Global deve ser definida" quando a recursão falha', () => {
            const altura = NotaFrequencia.getByAbc("C");
            const duracao = TempoDuracao.create({duracao:"1/4"});
            
            const nota = new Nota(altura, duracao, {
                unidadeTempo: null,
                compasso: null,
                voz: null,
                obra: null
            });

            // O teste verifica a regra de negócio exigida validando o lançamento do erro.
            // (Caso o getter retorne null silenciosamente, o teste falhará acusando o bug)
            expect(() => nota.getUnidadeTempo()).toThrowError("A unidadeTempo Global deve ser definida em algum nível da hierarquia (Pausa/Compasso/Voz/Obra).");
        });
    });
    describe('Funcionalidades Básicas', () => {
        it('deve calcular corretamente a razão rítmica sem sufixo quando duração == unidadeTempo', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14} });
            expect(nota.toAbc()).toBe("C");
        });
        it('deve calcular sufixo numérico quando duração for múltipla da unidadeTempo', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/2", options: {unidadeTempo: ref14} });
            expect(nota.toAbc()).toBe("C2");
        });
        it('deve calcular sufixo de fração (/) quando duração for metade da unidadeTempo', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/8", options: {unidadeTempo: ref14} });
            expect(nota.toAbc()).toBe("C/");
        });
        it('deve formatar corretamente acidentes locais (sustenido e bequadro)', () => {
            const notaSust = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, sustenido: true }});
            expect(notaSust.toAbc()).toBe("^C");

            const notaBeQuad = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, beQuad: true }});
            expect(notaBeQuad.toAbc()).toBe("=C");
        });
        it('deve aplicar staccato e acento simultaneamente em ordem correta', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, staccato: true, acento: true }});
            expect(nota.toAbc()).toBe("!accent!.C");
        });
        it('deve aplicar staccato e acento simultaneamente em ordem correta', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, staccato: true, acento: true }});
            expect(nota.toAbc()).toBe("!accent!.C");
        });

        it('deve respeitar a exclusividade de atributos (marcato tem precedência sobre acento)', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, acento: true, marcato: true }});
            expect(nota.toAbc()).toContain("!marcato!");
            expect(nota.toAbc()).not.toContain("!accent!");
        });
        it('deve renderizar notas fantasma (!style=x!)', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, ghostNote: true }});
            expect(nota.toAbc()).toBe("!style=x!C");
        });
        it('deve incluir grace notes (adornos) entre chaves antes da nota principal', () => {
            const adornoD = Nota.create({ altura: "D", duracao: "1/16", options: {unidadeTempo: ref14, ghostNote: true }});
            const adornoE = Nota.create({ altura: "E", duracao: "1/16", options: {unidadeTempo: ref14, ghostNote: true }});

            const notaPrincipal = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, graceNote: [adornoD, adornoE]}});
            expect(notaPrincipal.toAbc()).toBe("{D/4E/4}C");
        });
        it('deve lançar TypeError se graceNote for inválido (não array, etc)', () => {
            expect(() => {
                Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, graceNote: "isso nao é um array" }});
            }).toThrow(TypeError);
        });
        it('deve aplicar ligadura de prolongamento (-)', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, ligada: true }});
            expect(nota.toAbc()).toBe("C-");
        });
        it('deve gerar string simplificada quando isAcorde for true', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: {unidadeTempo: ref14, sustenido: true, staccato: true }});
            expect(nota.toAbc(true)).toBe("^C");
        });
        it('deve herdar a unidadeTempo de uma classe Pai (Obra)', () => {
            const nota = Nota.create({ altura: "C", duracao: "1/4", options: { obra: mockObra }});

            expect(nota).toBeInstanceOf(Nota);
            expect(nota.getUnidadeTempo()).toBe(ref44);
        });
    });
    describe('toJSON', () => {
        it('deve serializar uma nota simples para JSON', () => {
            const nota = Nota.create({ altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } });
            const json = nota.toJSON();
            console.log("-----------------------");
            console.log(json);
            console.log("-----------------------");
            expect(json).to.deep.equal({
                altura: 'C',
                duracao: '1/4'
            });
        });

        it('deve serializar uma nota com opções para JSON', () => {
            const nota = Nota.create({
                altura: 'D',
                duracao: '1/2',
                options: {
                    unidadeTempo: "1/4",
                    staccato: true,
                    sustenido: true
                }
            });
            const json = nota.toJSON();
            console.log("-----------------------");
            console.log(json);
            console.log("-----------------------");
            expect(json).to.deep.equal({
                altura: 'D',
                duracao: '1/2',
                options: {
                    staccato: true,
                    sustenido: true
                }
            });
        });

        it('deve serializar uma nota com grace notes para JSON', () => {
            const graceNote = Nota.create({ altura: 'E', duracao: '1/8', options: { unidadeTempo: "1/4" } });
            const nota = Nota.create({
                altura: 'F',
                duracao: '1/1',
                options: {
                    unidadeTempo: "1/4",
                    graceNote: [graceNote]
                }
            });
            const json = nota.toJSON();
            console.log("-----------------------");
            console.log(json);
            console.log("-----------------------");
            expect(json).to.deep.equal({
                altura: 'F',
                duracao: '1/1',
                options: {
                    graceNote: [{
                        altura: 'E',
                        duracao: '1/8'
                    }]
                }
            });
        });

        it('não deve serializar opções com valores padrão', () => {
            const nota = Nota.create({
                altura: 'G',
                duracao: '1/4',
                options: {
                    unidadeTempo: "1/4",
                    staccato: false, // Valor padrão
                    ligada: false // Valor padrão
                }
            });
            const json = nota.toJSON();
            console.log("-----------------------");
            console.log(json);
            console.log("-----------------------");
            expect(json).to.deep.equal({
                altura: 'G',
                duracao: '1/4'
            });
        });

        it('deve reconstruir a nota a partir do JSON serializado', () => {
            const original = Nota.create({
                altura: 'A',
                duracao: '1/2',
                options: {
                    unidadeTempo: "1/4",
                    staccato: true,
                    acento: true
                }
            });
            const json = original.toJSON();
            console.log("-----------------------");
            console.log(json);
            console.log("-----------------------");
            json.options.unidadeTempo = "1/4";
            const reconstruida = Nota.create({ ...json, options: { ...json.options } });

            expect(reconstruida.altura.abc).to.equal(original.altura.abc);
            expect(reconstruida.duracao.toString()).to.equal(original.duracao.toString());
            expect(reconstruida._options.staccato).to.be.true;
            expect(reconstruida._options.acento).to.be.true;
        });
    });
});
