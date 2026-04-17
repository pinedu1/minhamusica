/*
import { describe, it, expect } from 'vitest';
import { Voz } from '../domain/voz/Voz.js';
import { Compasso } from '../domain/compasso/Compasso.js';
import { Clave } from '../domain/obra/Clave.js';
import { ClaveTipo } from '../domain/obra/ClaveTipo.js';
import { Obra } from '../domain/obra/Obra.js';
import { TempoMetrica } from '../domain/tempo/TempoMetrica.js';
import { TempoDuracao } from '../domain/tempo/TempoDuracao.js';

describe('Voz', () => {
/!*
    it('deve criar uma instância de Voz com valores padrão', () => {
        const voz = new Voz();
        expect(voz).toBeInstanceOf(Voz);
        expect(voz.compassos).toEqual([]);
        expect(voz.id).toBeNull();
    });

    it('deve criar uma instância de Voz com opções', () => {
        const clave = new Clave(ClaveTipo.TREBLE);
        const obra = new Obra();
        const voz = new Voz([], {
            id: 'V1',
            nome: 'Violino',
            sinonimo: 'Vln',
            direcaoHaste: 'up',
            clave: clave,
            stafflines: 5,
            middle: 'B',
            obra: obra
        });

        expect(voz.id).toBe('V1');
        expect(voz.obra).toBe(obra);
        expect(obra.vozes).toContain(voz);
    });

    it('deve adicionar um compasso à voz', () => {
        const voz = new Voz();
        const compasso = new Compasso();
        voz.addCompasso(compasso);

        expect(voz.compassos).toHaveLength(1);
        expect(voz.compassos[0]).toBe(compasso);
        expect(compasso.voz).toBe(voz);
        expect(compasso.index).toBe(1);
    });
*!/

    it('deve gerar a string ABC corretamente', () => {
        const clave = new Clave(ClaveTipo.TREBLE);
        const metrica = new TempoMetrica(4, 4);
        const unidadeTempo = new TempoDuracao(1, 2);
        const voz = new Voz([], {
            id: 1,
            nome: 'Melodia',
            clave: clave,
            metrica: metrica,
            unidadeTempo: unidadeTempo
        });
        const compasso1 = Compasso.create({ elementos: [{ freq: 'C' }] });
        const compasso2 = Compasso.create({ elementos: [{ freq: 'D' }] });
        voz.addCompasso(compasso1);
        voz.addCompasso(compasso2);

        const expectedAbc = `V:1 name="Melodia" clef=treble\n[M:4/4]|C D|\n`;
        const result = voz.toAbc();
        console.log("--------------------");
        console.log(result);
        console.log("--------------------");
        // Normalize line endings and remove extra spaces for comparison
        const normalize = (str) => str.replace(/\\r\\n/g, '\\n').replace(/\\s+/g, ' ').trim();
        expect(normalize( result )).toBe(normalize(expectedAbc));
    });
/!*

    it('deve criar uma Voz a partir de um JSON', () => {
        const json = {
            "compassos": [
                { "elementos": [{ "freq": "C" }] },
                { "elementos": [{ "freq": "E" }] }
            ],
            "options": {
                "id": "V2",
                "nome": "Baixo",
                "clave": { "tipo": "TREBLE" }
            }
        };

        const voz = Voz.create(json);
        expect(voz).toBeInstanceOf(Voz);
        expect(voz.id).toBe('V2');
        expect(voz.compassos).toHaveLength(2);
        expect(voz.compassos[0]).toBeInstanceOf(Compasso);
        expect(voz.compassos[0].elementos[0].freq).toBe('C');
    });

    it('deve lidar com quebra de linha no toAbc', () => {
        const voz = new Voz([], { id: 1, quebraDeLinha: 2 });
        for (let i = 0; i < 4; i++) {
            voz.addCompasso(Compasso.create({ elementos: [{ freq: 'C' }] }));
        }

        const expectedAbc = `V:1
|C C
C C|
`;
        const normalize = (str) => str.replace(/\\r\\n/g, '\\n').replace(/\\s+/g, ' ').trim();
        expect(normalize(voz.toAbc())).toBe(normalize(expectedAbc));
    });

    it('deve lançar um erro se um não-compasso for adicionado', () => {
        const voz = new Voz();
        expect(() => voz.addCompasso({})).toThrow(TypeError);
    });

    it('deve definir a métrica corretamente', () => {
        const metrica = new TempoMetrica(3, 4);
        const voz = new Voz();
        voz.metrica = metrica;
        expect(voz.metrica).toBe(metrica);
    });

    it('deve lançar um erro ao definir uma métrica inválida', () => {
        const voz = new Voz();
        expect(() => { voz.metrica = {}; }).toThrow(TypeError);
    });
*!/
});
*/
