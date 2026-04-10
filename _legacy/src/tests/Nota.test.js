import { describe, it, expect } from 'vitest';
import { Nota } from '../model/nota/Nota.js';
import { NotaFrequencia } from '../model/nota/NotaFrequencia.js';
import { TempoNota } from '../model/tempo/TempoNota.js';
import { TempoPadrao } from '../model/tempo/TempoPadrao.js';

describe('Classe Nota', () => {
    
    // Preparação de dados básicos
    const doCentral = NotaFrequencia.getByAbc("C"); 
    const semina = new TempoNota(1, 4);
    const colcheiaRef = new TempoPadrao(1, 8); // L: 1/8

    it('deve lançar erro se nenhum tempoReferencia for fornecido', () => {
        expect(() => {
            new Nota(doCentral, semina, {});
        }).toThrow("Falha ao criar Nota: 'tempoReferencia' (L:) não encontrado.");
    });

    it('deve calcular corretamente a razão rítmica (ex: Semínima em L:1/8 -> C2)', () => {
        const nota = new Nota(doCentral, semina, { tempoReferencia: colcheiaRef });
        expect(nota.toAbc()).toBe("C2");
    });

    it('deve incluir grace notes (adorno) enfileirados entre chaves', () => {
        // Criamos notas de adorno (D e E)
        const notaD = new Nota(NotaFrequencia.getByAbc("D"), new TempoNota(1, 16), { tempoReferencia: colcheiaRef });
        const notaE = new Nota(NotaFrequencia.getByAbc("E"), new TempoNota(1, 16), { tempoReferencia: colcheiaRef });

        const notaPrincipal = new Nota(doCentral, semina, { 
            tempoReferencia: colcheiaRef,
            graceNote: [notaD, notaE] // Nova implementação: Array de Notas
        });

        // Esperado: {DE}C2 (As notas de adorno D e E perdem a duração individual se for 1 na razão, ou enfileiram altura+duração)
        // Nota: No nosso toAbc(true), ele pega altura + duração formatada.
        // D(1/16) em L:1/8 vira D/
        expect(notaPrincipal.toAbc()).toBe("{D/E/}C2");
    });

    it('deve lançar TypeError se graceNote não for false, null ou Array de Notas', () => {
        expect(() => {
            new Nota(doCentral, semina, { 
                tempoReferencia: colcheiaRef,
                graceNote: "string-invalida" 
            });
        }).toThrow("Falha ao criar Nota: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
    });

    it('deve ocultar o sufixo quando a duração é igual à referência', () => {
        const seminaRef = new TempoPadrao(1, 4);
        const nota = new Nota(doCentral, semina, { tempoReferencia: seminaRef });
        expect(nota.toAbc()).toBe("C");
    });

    it('deve aplicar staccato e acento corretamente', () => {
        const nota = new Nota(doCentral, semina, { 
            tempoReferencia: colcheiaRef,
            staccato: true,
            acento: true
        });
        expect(nota.toAbc()).toBe("!accent!.C2");
    });

    it('deve respeitar a exclusividade de acentuação', () => {
        const nota = new Nota(doCentral, semina, { 
            tempoReferencia: colcheiaRef,
            acento: true,
            marcato: true
        });
        expect(nota.toAbc()).toContain("!marcato!");
        expect(nota.toAbc()).not.toContain("!accent!");
    });

    it('deve renderizar notas fantasma', () => {
        const nota = new Nota(doCentral, semina, { 
            tempoReferencia: colcheiaRef,
            ghostNote: true
        });
        expect(nota.toAbc()).toBe("!style=x!C2");
    });

    it('deve herdar o tempoReferencia do contexto', () => {
        const mockCompasso = { tempoReferencia: colcheiaRef };
        const nota = new Nota(doCentral, semina, { compasso: mockCompasso });
        expect(nota.toAbc()).toBe("C2");
    });
});
