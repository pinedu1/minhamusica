import { describe, it, expect } from 'vitest';
import { Acorde } from '../model/nota/Acorde.js';
import { Nota } from '../model/nota/Nota.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';

describe('Classe Acorde', () => {

    const ref14 = new TempoDuracao(1, 4); // L: 1/4
    const ref18 = new TempoDuracao(1, 8); // L: 1/16
    const ref116 = new TempoDuracao(1, 16); // L: 1/16

    describe('Funcionalidades Básicas e Renderização ABC', () => {
        it('deve gerar a string ABC agrupando as notas com colchetes e aplicando sufixo de duração fora', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "G", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/4",
                options: { unidadeTempo: ref14 }
            });
            const result = acorde.toAbc();
            // console.log("-----------------");
            // console.log(result);
            // console.log("-----------------");
            expect(result).toBe("[CEG]");
        });
        it('deve formatar acidentes de notas corretamente dentro do acorde', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/4",
                options: { unidadeTempo: ref14 }
            });
            expect(acorde.toAbc()).toBe("[CE]");
        });
        it('deve calcular corretamente a duração global do acorde', () => {
            // duração: 1/2, referência: 1/4 -> razao 2
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/2",
                options: { unidadeTempo: ref14 }
            });
            expect(acorde.toAbc()).toBe("[CE]2");
        });
        it('deve calcular divisor (/) global para o acorde quando menor que a unidadeTempo', () => {
            // duração: 1/8, referência: 1/4 -> razao 1/2 (/)
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/8",
                options: { unidadeTempo: ref14 }
            });
            expect(acorde.toAbc()).toBe("[CE]/");
        });
        it('deve renderizar prefixos globais de execução (fermata, staccato)', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/8",
                options: {
                    unidadeTempo: ref14,
                    fermata: true,
                    staccato: true
                }
            });
            expect(acorde.toAbc()).toBe("!fermata!.[CE]/");
        });
        it('deve aplicar grace notes globais antes do acorde', () => {

            const adorno = Nota.create({ altura: "D", duracao: ref116, options: { unidadeTempo: ref14 } });
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                    , { altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } }
                ],
                duracao: "1/4",
                options: {
                    unidadeTempo: ref14,
                    graceNote: [adorno]
                }
            });
            expect(acorde.toAbc()).toBe("{D/4}[CE]");
        });
        it('deve instanciar grace notes a partir de JSON via create() do Acorde', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "F", duracao: "1/4", options: { unidadeTempo: ref14 } }
                    , { altura: "A", duracao: "1/4", options: { unidadeTempo: ref14 } }
                ]
                , duracao: "1/4"
                , options: {
                    unidadeTempo: ref14
                    , graceNote: [{ altura: "G", duracao: "1/16", options: { unidadeTempo: "1/4" } }]
                }
            });
            expect(acorde.toAbc()).toBe("{G/4}[FA]");
        });
        it('deve aplicar sufixos (ligadura e dedilhado) ao final do acorde', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } }
                ]
                , duracao: "1/4"
                , options: {
                    unidadeTempo: ref14
                    , ligada: true
                    , dedilhado: "1"
                }
            });
            expect(acorde.toAbc()).toBe("[C]$\"1\"-");
        });

    });
    describe('Helper estático Acorde.create()', () => {
        it('deve lançar erro se a propriedade notas não for um array no objeto de config', () => {
            expect(() => {
                Acorde.create({ duracao: "1/4", options: { unidadeTempo: ref14 }});
            }).toThrow(/Acorde.create: Erro na estrutura dos dados/);
            // Usando Regex para validar o início da mensagem
        });
        it('deve aceitar instâncias pré-existentes de Nota no array do JSON', () => {

            const n1 = Nota.create({ altura: "C", duracao: ref14, options: { unidadeTempo: ref14 } });
            const n2 = Nota.create({ altura: "E", duracao: ref14, options: { unidadeTempo: ref14 } });
            const acorde = Acorde.create({
                notas: [n1, n2]
                , duracao: "1/4"
                , options: { unidadeTempo: ref14 }
            });
            expect(acorde.toAbc()).toBe("[CE]");
        });
        it('deve instanciar um Acorde baseado inteiramente em strings', () => {
            const acorde = Acorde.create({
                notas: [
                    { altura: "C", duracao: "1/4", options: { unidadeTempo: "1/4", sustenido: true } }
                    , { altura: "E,", duracao: "1/4", options: { unidadeTempo: "1/4" } }
                ]
                , duracao: "1/2"
                , options: { unidadeTempo: "1/4" }
            });

            expect(acorde).toBeInstanceOf(Acorde);
            expect(acorde.notas[0]).toBeInstanceOf(Nota);
            expect(acorde.toAbc()).toBe("[^CE,]2");
        });
    });
    describe('toJSON', () => {
        it('deve serializar um acorde simples para JSON', () => {
            const acorde = new Acorde([
                Nota.create({ altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } }),
                Nota.create({ altura: 'E', duracao: '1/4', options: { unidadeTempo: "1/4" } }),
                Nota.create({ altura: 'G', duracao: '1/4', options: { unidadeTempo: "1/4" } })
            ], '1/4', { unidadeTempo: "1/4" });
            const json = acorde.toJSON();
            expect(json).to.deep.equal({
                notas: [
                    { altura: 'C', duracao: '1/4' },
                    { altura: 'E', duracao: '1/4' },
                    { altura: 'G', duracao: '1/4' }
                ],
                duracao: '1/4'
            });
        });
        it('deve serializar um acorde com opções para JSON', () => {
            const notas = [
                Nota.create({ altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } }),
                Nota.create({ altura: 'E', duracao: '1/4', options: { unidadeTempo: "1/4", sustenido: true } })
            ];
            const acorde = new Acorde(notas, '1/4', { unidadeTempo: "1/4", staccato: true, fermata: true });
            const json = acorde.toJSON();
            expect(json).to.deep.equal({
                notas: [
                    { altura: 'C', duracao: '1/4' },
                    { altura: 'E', duracao: '1/4', options: { sustenido: true } }
                ],
                duracao: '1/4',
                options: {
                    staccato: true,
                    fermata: true
                }
            });
        });
        it('deve serializar um acorde com grace notes para JSON', () => {
            const graceNote = Nota.create({ altura: 'D', duracao: '1/8', options: { unidadeTempo: "1/4" } });
            const notas = [
                Nota.create({ altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } }),
                Nota.create({ altura: 'E', duracao: '1/4', options: { unidadeTempo: "1/4" } })
            ];
            const acorde = new Acorde(notas, '1/4', { unidadeTempo: "1/4", graceNote: [graceNote] });
            const json = acorde.toJSON();
            expect(json).to.deep.equal({
                notas: [
                    { altura: 'C', duracao: '1/4' },
                    { altura: 'E', duracao: '1/4' }
                ],
                duracao: '1/4',
                options: {
                    graceNote: [{
                        altura: 'D',
                        duracao: '1/8'
                    }]
                }
            });
        });
        it('não deve serializar opções com valores padrão', () => {
            const notas = [
                Nota.create({ altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } })
            ];
            const acorde = new Acorde(notas, '1/4', { unidadeTempo: "1/4", staccato: false, ligada: false });
            const json = acorde.toJSON();
            expect(json).to.deep.equal({
                notas: [
                    { altura: 'C', duracao: '1/4' }
                ],
                duracao: '1/4'
            });
        });
        it('deve reconstruir o acorde a partir do JSON serializado', () => {
            const original = Acorde.create({
                notas: [
                    { altura: 'C', duracao: '1/4', options: { unidadeTempo: "1/4" } }
                    , { altura: 'E', duracao: '1/4', options: { unidadeTempo: "1/4", sustenido: true } }
                ],
                duracao: '1/4',
                options: {
                    unidadeTempo: "1/4",
                    staccato: true
                }
            });
            const json = original.toJSON();
            json.options.unidadeTempo = "1/4";
            const reconstruido = Acorde.create({ ...json, options: { ...json.options } });

            expect(reconstruido.notas.length).to.equal(2);
            expect(reconstruido.notas[0].altura.abc).to.equal('C');
            expect(reconstruido.notas[1].altura.abc).to.equal('E');
            expect(reconstruido.notas[1]._options.sustenido).to.be.true;
            expect(reconstruido.duracao.toString()).to.equal('1/4');
            expect(reconstruido._options.staccato).to.be.true;
        });
    });
});