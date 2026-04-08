import { describe, it, expect } from 'vitest';
import { Acorde } from '../model/nota/Acorde.js';
import { Nota } from '../model/nota/Nota.js';
import { NotaFrequencia } from '../model/nota/NotaFrequencia.js';
import { TempoNota } from '../model/tempo/TempoNota.js';
import { TempoPadrao } from '../model/tempo/TempoPadrao.js';

describe('Classe Acorde', () => {
    
    // Preparação de dados básicos
    const doCentral = NotaFrequencia.getByAbc("C");
    const miCentral = NotaFrequencia.getByAbc("E");
    const solCentral = NotaFrequencia.getByAbc("G");
    
    const semina = new TempoNota(1, 4);
    const colcheiaRef = new TempoPadrao(1, 8); // L: 1/8 (0.125)

    // Helper para criar as notas internas (elas precisam de tempoReferencia por regra da Classe Nota)
    const criarNotas = () => [
        new Nota(doCentral, semina, { tempoReferencia: colcheiaRef }),
        new Nota(miCentral, semina, { tempoReferencia: colcheiaRef }),
        new Nota(solCentral, semina, { tempoReferencia: colcheiaRef })
    ];

    it('deve renderizar um acorde básico entre colchetes com duração (ex: [CEG]2)', () => {
        const acorde = new Acorde(criarNotas(), semina, { tempoReferencia: colcheiaRef });
        // Razão: 0.25 / 0.125 = 2
        expect(acorde.toAbc()).toBe("[CEG]2");
    });

    it('deve aplicar arpeggio e marcato globalmente ao acorde', () => {
        const acorde = new Acorde(criarNotas(), semina, { 
            tempoReferencia: colcheiaRef,
            arpeggio: true,
            marcato: true
        });
        expect(acorde.toAbc()).toBe("!arpeggio!!marcato![CEG]2");
    });

    it('deve enfileirar grace notes antes do acorde', () => {
        const notaAdorno = new Nota(NotaFrequencia.getByAbc("D"), new TempoNota(1, 16), { tempoReferencia: colcheiaRef });
        
        const acorde = new Acorde(criarNotas(), semina, { 
            tempoReferencia: colcheiaRef,
            graceNote: [notaAdorno]
        });
        
        // Adorno D(1/16) em L:1/8 vira D/
        expect(acorde.toAbc()).toBe("{D/}[CEG]2");
    });

    it('deve ignorar decorações individuais das notas internas', () => {
        // Criamos uma nota interna que tem staccato próprio
        const notaComStaccato = new Nota(doCentral, semina, { 
            tempoReferencia: colcheiaRef,
            staccato: true 
        });
        
        const acorde = new Acorde([notaComStaccato], semina, { tempoReferencia: colcheiaRef });
        
        // O staccato da nota interna não deve aparecer no acorde, apenas a altura
        expect(acorde.toAbc()).toBe("[C]2");
    });

    it('deve lançar TypeError se graceNote for inválido', () => {
        expect(() => {
            new Acorde(criarNotas(), semina, { 
                tempoReferencia: colcheiaRef,
                graceNote: {} 
            });
        }).toThrow("Falha ao criar Acorde: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
    });

    it('deve aplicar ligadura de prolongamento ao final do acorde', () => {
        const acorde = new Acorde(criarNotas(), semina, { 
            tempoReferencia: colcheiaRef,
            ligada: true
        });
        expect(acorde.toAbc()).toBe("[CEG]2-");
    });
});
