/**
 * Enum para Tipos de Ligaduras.
 * Define a semântica e a execução da união entre notas.
 * @enum {{valor: string, titulo: string, descricao: string}}
 */
export const TipoLigadura = Object.freeze({
    // Une duas notas de mesma altura para somar seus tempos.
    VALOR: {
        valor: '-',
        titulo: 'Ligadura de Valor (Tie)',
        descricao: 'Soma a duração de notas idênticas.'
    },
    // Indica que as notas devem ser tocadas de forma fluida (Legato).
    EXPRESSAO: {
        valor: '()',
        titulo: 'Ligadura de Expressão (Slur)',
        descricao: 'Agrupa notas diferentes em um único sopro ou arcada.'
    },
    // Técnica de cordas: a segunda nota soa pelo impacto do dedo (mão esquerda).
    HAMMER_ON: {
        valor: 'H',
        titulo: 'Ligado Ascendente',
        descricao: 'Técnica de cordas: martelada da mão esquerda.'
    },
    // Técnica de cordas: a segunda nota soa ao "puxar" a corda com o dedo.
    PULL_OFF: {
        valor: 'P',
        titulo: 'Ligado Descendente',
        descricao: 'Técnica de cordas: beliscada da mão esquerda.'
    },
    // Deslize entre duas notas mantendo a pressão na corda.
    SLIDE: {
        valor: 'S',
        titulo: 'Slide / Glissando',
        descricao: 'Deslize linear entre alturas diferentes.'
    }
});