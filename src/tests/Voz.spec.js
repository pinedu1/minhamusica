import { describe, it, expect } from 'vitest';
import { Voz } from '../domain/voz/Voz.js';
import { Compasso } from '../domain/compasso/Compasso.js';
import { Nota } from '../domain/nota/Nota.js';
import { TempoMetrica } from '../domain/tempo/TempoMetrica.js';
import { TempoDuracao } from '../domain/tempo/TempoDuracao.js';
import { Clave } from '../domain/obra/Clave.js';
import { TipoBarra } from '../domain/compasso/TipoBarra.js';

describe('Classe Voz', () => {
    class MockObra {}
    const ref14 = new TempoDuracao(1, 4);
    const ref18 = new TempoDuracao(1, 8);
    const metrica44 = new TempoMetrica(4, 4);
    it('deve inicializar e obter a unidadeTempo corretamente', () => {
        const voz = new Voz(1);
        expect(voz).toBeInstanceOf(Voz);
    });
    describe('Inicialização e Associações', () => {
        it('deve inicializar com ID e valores padrão corretos', () => {
            const voz = new Voz("V1", [], {unidadeTempo: ref14});
            expect(voz.id).toBe("V1");
            expect(voz.direcaoHaste).toBe("auto");
            expect(voz.compassos).toEqual([]);
        });
    });
    it('deve vincular a referência da Voz e atualizar o index dos compassos ao adicionar', () => {
        const voz = new Voz("V1");
        const c1 = new Compasso();
        const c2 = new Compasso();

        voz.compassos = [c1, c2];

        expect(c1.options.voz).toBe(voz);
        expect(c2.options.voz).toBe(voz);
        expect(c1.index).toBe(1);
        expect(c2.index).toBe(2);
    });

    it('deve lançar erro se a direção da haste for inválida', () => {
        const voz = new Voz("V1");
        expect(() => {
            voz.direcaoHaste = "diagonal";
        }).toThrow(/Direção da haste deve ser 'auto', 'up' ou 'down'/);
    });
    describe('Geração de Notação ABC (toAbc)', () => {
        it('deve gerar o cabeçalho completo da voz com todas as opções preenchidas', () => {
            const voz = new Voz("Melodia_Principal", [], {
                nome: "Viola Ponteada",
                sinonimo: "vla",
                direcaoHaste: "down",
                stafflines: 5,
                middle: "B",
                clave: Clave.create({}),
                metrica: new TempoMetrica(3, 4)
            });

            const abc = voz.toAbc();

            // Verifica a primeira linha (Cabeçalho)
            expect(abc).toContain('V:Melodia_Principal name="Viola Ponteada" nm="vla" clef=treble stem=down stafflines=5 middle=B');
            // Verifica se a métrica foi impressa logo em seguida
            expect(abc).toContain('[M:3/4]');
        });
    });
    it('deve quebrar a linha a cada N compassos de acordo com as options', () => {
        const voz = new Voz("V1", [], { quebraDeLinha: 3, unidadeTempo: ref14 });

        // Adiciona 4 compassos vazios
        voz.addCompasso(new Compasso()); // 1
        voz.addCompasso(new Compasso()); // 2
        voz.addCompasso(new Compasso()); // 3 (Aqui deve quebrar a linha)
        voz.addCompasso(new Compasso()); // 4 (Último, sem separador extra)

        const abc = voz.toAbc();
        const compassosABC = abc.split('|').filter(c => c.trim() !== '' && !c.includes('V:'));

        // Garante que a última coisa gerada pela Voz é uma quebra de linha
        expect(abc).toMatch(/\n$/);
    });
    it('deve formatar 5 compassos corretamente (quebraDeLinha = 5) sem letra', () => {
        // 1. Instanciamos a Voz (adapte conforme o construtor real da sua classe)
        const voz = new Voz(1, [], { quebraDeLinha: 5, unidadeTempo: ref14 });

        // 2. Setup: Criamos e adicionamos 5 compassos reais na voz
        [1, 2, 3, 4, 5].forEach(num => {
            let opc = { index: num };
            if ( num === 1 ) {
                opc.barraInicial = TipoBarra.STANDARD;
            }
            voz.addCompasso(
                new Compasso(
                    [{ altura: "C", duracao: ref14 }], 
                    opc
                )
            );
        });

        // 3. Execução
        const abc = voz.toAbc();

        // 4. Asserções (Expects)

        // Verifica se a string final termina com o último compasso seguido APENAS do \n final
        expect(abc).toMatch(/C|\n$/);

        // Verifica a montagem exata da linha de compassos:
        // Barra inicial (|) + Compassos separados por espaço + Quebra de linha no final
        expect(abc).toContain('|C|C|C|C|C|\n');
    });
    it('deve agrupar as letras (lyrics) dos compassos e gerar a tag w: no final', () => {
        const c1 = new Compasso([], { letra: ["A", "mém"] });
        const c2 = new Compasso([]); // Compasso sem letra
        const c3 = new Compasso([], { letra: ["Se", "nhor"] });

        const voz = new Voz("V1", [], { unidadeTempo: ref14 });
        voz.compassos = [c1, c2, c3];

        const abc = voz.toAbc();
        expect(abc).toContain('w: A-mém - Se-nhor');
    });
    describe('Helper estático Voz.create() e Zod Schema', () => {
        it('deve instanciar uma Voz completa e seus compassos internos a partir de JSON', () => {
            const json = {
                id: "V1",
                options: { nome: "Voz 1", unidadeTempo: "1/8", metrica: "4/4" },
                compassos: [
                    {
                        elementos: [{ altura: "C", duracao: "1/8" }],
                        options: { letra: ["Lá"] }
                    }
                ]
            };

            const voz = Voz.create(json);

            expect(voz).toBeInstanceOf(Voz);
            expect(voz.id).toBe("V1");
            expect(voz.metrica).toBeInstanceOf(TempoMetrica);
            expect(voz.compassos[0]).toBeInstanceOf(Compasso);
            expect(voz.compassos[0].elements[0]).toBeInstanceOf(Nota);
        });
        it('deve barrar a criação se o ID contiver espaços (validação regex Zod)', () => {
            const jsonComEspaco = {
                id: "Viola Caipira", // Espaços não são permitidos no Zod agora!
                compassos: []
            };

            expect(() => {
                Voz.create(jsonComEspaco);
            }).toThrow(/O ID da voz deve conter apenas letras, números e sublinhados/);
        });
        it('deve permitir a criação com ID numérico', () => {
            const jsonNumerico = { id: 2, compassos: [] };
            const voz = Voz.create(jsonNumerico);
            expect(voz.id).toBe(2);
        });
        it('deve barrar a criação se o ID estiver ausente (obrigatório)', () => {
            const jsonSemId = { compassos: [] };

            expect(() => {
                Voz.create(jsonSemId);
            }).toThrow("Voz.create: Erro na estrutura dos dados: O ID da voz é obrigatório.");
        });
        it('deve gerar a string ABC corretamente', () => {
            const json = {
                id: "V1",
                options: { nome: "Melodia", unidadeTempo: "1/4", metrica: "4/4", clave: {} },
                compassos: [
                    {
                        elementos: [{ altura: "C", duracao: '1/4' }, { altura: "D", duracao: '1/4' }]
                        , options: { barraInicial: "|" }
                    }
                ]
            };
            const voz = Voz.create( json );

            const expectedAbc = `V:V1 name="Melodia" clef=treble\nV:V1\n[M:4/4]|CD z2|\n`;
            const result = voz.toAbc();
            // console.log("--------------------");
            // console.log(result);
            // console.log("--------------------");
            // Normalize line endings and remove extra spaces for comparison
            const normalize = (str) => str.replace(/\\r\\n/g, '\\n').replace(/\\s+/g, ' ').trim();
            expect(normalize( result )).toBe(normalize(expectedAbc));
        });
    });
    describe('Método toJSON()', () => {

        it('deve serializar uma voz simples para um JSON limpo', () => {
            const voz = Voz.create({
                id: "V1",
                options: { nome: "Melodia", unidadeTempo: "1/4", metrica: "4/4", clave: { tipo: 'TREBLE' } },
                compassos: [
                    {
                        elementos: [{ altura: "C", duracao: '1/4' }, { altura: "D", duracao: '1/4' }]
                    }
                ]
            });

            const json = voz.toJSON();

            const expectedJSON = {
                id: "V1",
                options: { nome: "Melodia", unidadeTempo: "1/4", metrica: "4/4", clave: { tipo: 'TREBLE', oitava: 0 } },
                compassos: [
                    {
                        elementos: [{ altura: "C", duracao: '1/4' }, { altura: "D", duracao: '1/4' }],
                        options: { unidadeTempo: "1/4", metrica: "4/4" }
                    }
                ]
            };

            // Compasso toJSON includes inherited options, so we need to adjust the expectation
            const compassoJson = voz.compassos[0].toJSON();
            expectedJSON.compassos[0] = compassoJson;

            expect(json).toEqual(expectedJSON);
        });
        it('deve ser o inverso exato do Voz.create()', () => {
            const originalJSON = {
                id: "V2",
                options: {
                    nome: "Baixo",
                    sinonimo: "bx",
                    unidadeTempo: "1/8",
                    metrica: "6/8",
                    clave: { tipo: 'BASS', oitava: 0 },
                    direcaoHaste: 'down'
                },
                compassos: [
                    {
                        elementos: [
                            { altura: "G,", duracao: "3/8" },
                            { altura: "D", duracao: "3/8" }
                        ]
                    },
                    {
                        elementos: [
                            { duracao: "6/8" }
                        ]
                    }
                ]
            };

            const voz = Voz.create(originalJSON);
            const jsonGerado = voz.toJSON();
            console.log( JSON.stringify(jsonGerado) );

            // Re-create from generated JSON to ensure it's a valid input
            const vozRecriada = Voz.create(jsonGerado);

            // The final JSON from the re-created object should match the generated one
            expect(vozRecriada.toJSON()).toEqual(jsonGerado);

            // And the re-created object should be deeply equal to the original one
            expect(vozRecriada).toEqual(voz);
        });

    });
});
