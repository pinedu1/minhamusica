import { describe, it, expect, beforeEach } from 'vitest';
import { Musica } from './Musica.js'; // Ajuste o caminho conforme sua estrutura
import { Compasso } from './Compasso.js'; // Assumindo que exista

describe('Classe Musica - Integração ABC', () => {
    let minhaMusica;

    beforeEach(() => {
        minhaMusica = new Musica("Saudade da Viola", "Tião Carreiro", "Pagode");
    });

    it('deve gerar o cabeçalho técnico correto com L: e Q:', () => {
        const abc = minhaMusica.toAbc();

        // Verifica metadados básicos
        expect(abc).toContain("T:Saudade da Viola");
        expect(abc).toContain("C:Tião Carreiro");

        // Verifica a saída das classes Duracao e TempoBase que modelamos
        // Se Duracao.SEMINIMA.toAbc() retorna "L:1/4\n"
        expect(abc).toContain("L:1/4");

        // Se BatidaPorMinuto.toAbc() retorna "Q:1/4=120\n"
        expect(abc).toContain("Q:1/4=120");
    });

    it('deve gerenciar a inserção e reindexação de compassos na LinkedList', () => {
        // Criando compassos fictícios (Mocks) que respondam ao toAbc()
        const c1 = { toAbc: () => "| CEG ", indice: 0 };
        const c2 = { toAbc: () => "| DFA |", indice: 0 };

        minhaMusica.compassoAppend(c1);
        minhaMusica.compassoAppend(c2);

        expect(minhaMusica.total).toBe(2);

        const abcCompleto = minhaMusica.toAbc();
        expect(abcCompleto).toContain("| CEG");
        expect(abcCompleto).toContain("| DFA |");
    });

    it('deve validar a integridade dos campos privados via Getters', () => {
        expect(minhaMusica.titulo).toBe("Saudade da Viola");
        expect(minhaMusica.total).toBe(0);
    });

    it('deve imprimir a string ABC completa', () => {
        // ... adicione compassos aqui ...

        const resultado = minhaMusica.toAbc();

        console.log("--- RESULTADO ABC ---");
        console.log(resultado);
        console.log("---------------------");

        expect(resultado).toContain("T:Saudade");
    });
});