import { Duracao } from './Duracao.js';

/**
 * Classe para representar a marcação de tempo (Tempo Marking) no ABC.
 * Q:referencia=bpm
 */
export class TempoBase {
    /**
     * @param {number} bpm - Batidas por minuto (ex: 120)
     * @param {DuracaoBase} duracaoReferencia - Uma instância do Enum Duracao (ex: Duracao.SEMINIMA)
     */
    constructor(bpm, duracaoReferencia = Duracao.SEMINIMA) {
        this.bpm = bpm;
        this.referencia = duracaoReferencia;
    }

    /**
     * Retorna a diretiva Q: do padrão ABC.
     * Extrai o valor da fração do atributo 'abc' da duração.
     */
    toAbc() {
        // Se a duração for SEMINIMA, this.referencia.abc é '1/4'
        // Resultando em: Q:1/4=120
        return `Q:${this.referencia.abc}=${this.bpm}\n`;
    }

    /**
     * Altera o valor numérico do BPM.
     */
    setBpm(novoBpm) {
        this.bpm = novoBpm;
        return this; // Permite encadeamento
    }

    /**
     * Altera a nota de referência (ex: mudar de Semínima para Colcheia).
     */
    setReferencia(novaDuracao) {
        this.referencia = novaDuracao;
        return this;
    }
}
