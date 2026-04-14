import { describe, it, expect } from 'vitest';
import { Obra } from '../model/obra/Obra.js';
import { Voz } from '../model/voz/Voz.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';
import { TempoMetrica } from '../model/tempo/TempoMetrica.js';
import { Ritmo } from '../model/obra/Ritmo.js';
import { GrupoInstrumento } from '../model/obra/GrupoInstrumento.js';

describe('Classe Obra', () => {
    describe('Construtor Manual', () => {
        it('deve inicializar com valores padrão se instanciado vazio', () => {
            const obra = new Obra(1);
            expect(obra.index).toBe(1);
            expect(obra.vozes.length).toBe(0);
            expect(obra.options.tonalidade.toAbc()).toBe('C'); // Fallback padrão
        });

        it('deve lançar erro ao definir index inválido', () => {
            const obra = new Obra(1);
            expect(() => { obra.index = -1; }).toThrow(RangeError);
            expect(() => { obra.index = "A"; }).toThrow(TypeError);
            expect(() => { obra.index = null; }).toThrow(TypeError);
        });

        it('deve aceitar vozes corretamente e injetar a dependência de obra', () => {
            const obra = new Obra(1);
            const voz = new Voz('V1');
            obra.vozes = [voz];
            expect(obra.vozes.length).toBe(1);
            expect(obra.vozes[0].options.obra).toBe(obra);
        });
    });

    describe('Factory Method (create)', () => {
        it('deve instanciar uma obra completa a partir do JSON de teste', () => {
            const json = {
                index: 88,
                options: {
                    unidadeTempo: "1/4",
                    metrica: "4/4",
                    clave: {}, // Pode usar o fallback default
                    areaGeografica: "América do Sul",
                    origemGeografica: "Brasil",
                    livro: ["Enciclopédia de Folclore", "Revista Toca-Toca"],
                    compositor: ["Zé da Silva", "João de Minas"],
                    discografia: ["Grandes Clássicos", "Zé da Silva - Coletânia, vol. 1"],
                    nomeArquivo: "http://www.mskl.com.br/amor-nao-chora.abc",
                    grupoInstrumento: "OUTROS",
                    historia: ["Música Incidental"],
                    informacoes: [],
                    tonalidade: "C",
                    notas: ["Esta música foi originalmente composta em cavaquinho", "Depois trasposta para Violão"],
                    partes: null,
                    tempoAndamento: { tempo: '1/4', duracao: 95 },
                    ritmo: 'TOADA',
                    fonte: ["Internet", "Sitio do caboclo"],
                    titulo: ["Amor não chora", "Semente minha"],
                    letra: null,
                    notaTranscricao: ["Antonio dedilhado"]
                }
                , vozes: [
                    {
                        id: "V1"
                        , options: { nome: "Melodia" }
                        , compassos: [{elementos: [{ altura: "C", duracao: '1/4' }, { altura: "E", duracao: '1/4' }]}]
                    }
                ]
            };

            const obra = Obra.create(json);
            
            expect(obra).toBeInstanceOf(Obra);
            expect(obra.index).toBe(88);
            expect(obra.vozes.length).toBe(1);
            expect(obra.vozes[0]).toBeInstanceOf(Voz);
            
            // Verificando hidratação das dependências
            expect(obra.options.unidadeTempo).toBeInstanceOf(TempoDuracao);
            expect(obra.options.metrica).toBeInstanceOf(TempoMetrica);
            expect(obra.options.ritmo).toBeInstanceOf(Ritmo);
            expect(obra.options.grupoInstrumento).toBeInstanceOf(GrupoInstrumento);
            
            expect(obra.options.compositor).toContain("Zé da Silva");
            expect(obra.options.titulo).toContain("Amor não chora");
            const result = obra.toAbc();
            console.log("-------------------------");
            console.log(result);
            console.log("-------------------------");
        });
    });

    describe('Método toAbc', () => {
        it('deve gerar a notação ABC do cabeçalho de metadados respeitando a ordem correta', () => {
            const obra = Obra.create({
                index: 10,
                options: {
                    titulo: ["Ode a Alegria"],
                    compositor: ["Beethoven"],
                    tonalidade: "D",
                    metrica: "4/4",
                    unidadeTempo: "1/4",
                    tempoAndamento: { tempo: "1/4", duracao: 120 },
                    ritmo: "WALTZ",
                    notas: ["Uma obra prima"]
                },
                vozes: []
            });

            const abc = obra.toAbc();

            const linhas = abc.split('\n');

            // Validando a regra de Ouro ABC:
            expect(linhas[0]).toBe('X:10'); // X: deve ser o primeiro
            expect(linhas[1]).toBe('T:Ode a Alegria'); // T: deve ser o segundo
            expect(abc).toContain('C:Beethoven');
            expect(abc).toContain('M:4/4');
            expect(abc).toContain('L:1/4');
            expect(abc).toContain('Q:1/4=120');
            expect(abc).toContain('R:Waltz');
            expect(abc).toContain('N:Uma obra prima');

            // K: deve ser a última linha antes do corpo da música
            const indexK = linhas.findIndex(linha => linha.startsWith('K:D'));
            expect(indexK).toBeGreaterThan(0);
        });
    });
});
