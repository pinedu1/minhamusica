/**
 * Enum para as técnicas de ataque (palhetada ou dedilhado).
 * @enum {{nome: string, abc: string}}
 */
export const TecnicaPalhetada = Object.freeze({
    BAIXO: { nome: 'Para Baixo', abc: 'v' }, // Símbolo de arco/palhetada descendente
    CIMA:  { nome: 'Para Cima',  abc: 'u' }, // Símbolo de arco/palhetada ascendente
    ABAFADO: { nome: 'Abafado', abc: '!+!' } // Representa o "mudo" ou percussivo
});