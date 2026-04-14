import { describe, it, expect } from 'vitest';
import { Voz } from '../model/voz/Voz.js';
import { Compasso } from '../model/compasso/Compasso.js';
import { Nota } from '../model/nota/Nota.js';
import { TempoMetrica } from '../model/tempo/TempoMetrica.js';
import { TempoDuracao } from '../model/tempo/TempoDuracao.js';

// Mocks simples para simular as dependências externas que a Voz usa
class MockClave {
    constructor(abc = "K:clef=treble") { this.abc = abc; }
    toAbc() { return this.abc; }
}

class MockObra {}

describe('Classe Voz', () => {

    describe('Inicialização e Associações', () => {
        it('deve inicializar com ID e valores padrão corretos', () => {
            const voz = new Voz("V1");
            expect(voz.id).toBe("V1");
            expect(voz.direcaoHaste).toBe("auto");
            expect(voz.compassos).toEqual([]);
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
    });

    describe('Geração de Notação ABC (toAbc)', () => {
        it('deve gerar o cabeçalho completo da voz com todas as opções preenchidas', () => {
            const voz = new Voz("Melodia_Principal", [], {
                nome: "Viola Ponteada",
                sinonimo: "vla",
                direcaoHaste: "down",
                stafflines: 5,
                middle: "B",
                clave: new MockClave("clef=treble"),
                metrica: new TempoMetrica(3, 4)
            });

            const abc = voz.toAbc();

            // Verifica a primeira linha (Cabeçalho)
            expect(abc).toContain('V:Melodia_Principal name="Viola Ponteada" nm="vla" clef=treble stem=down stafflines=5 middle=B');
            // Verifica se a métrica foi impressa logo em seguida
            expect(abc).toContain('[M:3/4]');
        });

        it('deve quebrar a linha a cada N compassos de acordo com as options', () => {
            const voz = new Voz("V1", [], { quebraDeLinha: 3 });

            // Adiciona 4 compassos vazios
            voz.addCompasso(new Compasso()); // 1
            voz.addCompasso(new Compasso()); // 2
            voz.addCompasso(new Compasso()); // 3 (Aqui deve quebrar a linha)
            voz.addCompasso(new Compasso()); // 4 (Último, sem separador extra)

            const abc = voz.toAbc();
            const compassosABC = abc.split('|').filter(c => c.trim() !== '' && !c.includes('V:'));

            // O join no toAbc faz: C1 + ' ' + C2 + ' ' + C3 + '\n' + C4
            // Verifica se a quebra de linha ocorreu imediatamente antes do compasso 4
            expect(abc).toMatch(/\|\n\|$/); // O penúltimo caractere é \n antes da barra final
        });

        it('deve agrupar as letras (lyrics) dos compassos e gerar a tag w: no final', () => {
            const c1 = new Compasso([], { letra: ["A-", "mém"] });
            const c2 = new Compasso([]); // Compasso sem letra
            const c3 = new Compasso([], { letra: ["Se-", "nhor"] });

            const voz = new Voz("V1");
            voz.compassos = [c1, c2, c3];

            const abc = voz.toAbc();
            expect(abc).toContain('w: A- mém - Se- nhor');
        });
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
            }).toThrow(/O ID da voz é obrigatório/);
        });
    });
});