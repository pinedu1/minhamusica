import { Dinamica } from './Dinamica.js';
import { TipoBarra } from './TipoBarra.js';
import { EstruturaTempo } from './EstruturaTempo.js';
import { Clave } from './Clave.js';
import { Voz } from './Voz.js';
import { Ligadura } from './Ligadura.js';
import { ArmaduraClave } from './ArmaduraClave.js';
import { Anotacao } from './Anotacao.js';
import { Acorde } from './Acorde.js';
import { TipoBarra } from './TipoBarra.js';
import { Nota } from './Nota.js';
import { MarcaExpressao } from './MarcaExpressao.js';

export class Compasso {
    /** @type {number} */
    #indice = 0;

    /** * USAGE:
     * Lista ordenada de eventos musicais que preenchem a grade rítmica do compasso.
     * Aceita instâncias de Nota (com som) ou Pausa (silêncio).
     * A soma das durações desses elementos deve respeitar a Fórmula de Compasso.
     * @type {Array<Nota | Pausa>}
     * @example
     * // Um compasso 4/4 preenchido:
     * this.#notas = [
     * new Nota(AlturasMidi.E4, Duracao.METADE), // 2 tempos
     * new Pausa(Duracao.QUARTER),              // 1 tempo
     * new Nota(Altura.G4, Duracao.QUARTER)  // 1 tempo
     * ];
     */
    #notas = [];

    /**
     * USAGE:
     * Define a métrica rítmica (Fórmula de Compasso).
     * Se for null, o compasso herda a métrica do anterior.
     * @type {EstruturaTempo | null}
     * @example
     * // Configurando um compasso de Guarânia (3/4):
     * this.#estruturaTempo = new EstruturaTempo(3, 4);
     */
    #estruturaTempo = null;

    /**
     * USAGE:
     * Define o referencial de altura das notas (Clave) para este compasso.
     * Se for null, o sistema herda a clave do compasso anterior.
     * @type {Clave | null}
     * @example
     * // Definindo Clave de Sol (Padrão para Viola):
     * this.#clave = new Clave( ClaveTipo.TREBLE, 2); // Sol na 2ª linha
     */
    #clave = null;

    /**
     * USAGE:
     * Define a tonalidade atual do compasso.
     * Se for null, o sistema assume a armadura do compasso anterior.
     * @type {ArmaduraClave | null}
     * @example
     * // Definindo Clave de Sol (Padrão para Viola):
     * this.#armaduraClave = new ArmaduraClave( Tonalidade.C, 'maior');
     * */
    #armaduraClave = null;

    /**
     * USAGE:
     * Coleção de camadas musicais independentes (Vozes) que compõem o compasso.
     * Permite a escrita polifônica (ex: Melodia e Baixo simultâneos).
     * @type {Array<Voz>}
     * @example
     * // Em um ponteado de Viola:
     * const melodia = new Voz("Ponteado");
     * const acompanhamento = new Voz("Baixo");
     * this.#vozes = [ melodia, acompanhamento ];
     */
    #vozes = [];

    /** * USAGE:
     * Define a semântica e a grafia da barra de fechamento do compasso.
     * Utiliza as chaves do Enum TipoBarra (ex: 'DUPLA', 'REPETICAO_FIM').
     * Se for null, o motor abcjs assume a barra simples padrão '|'.
     * @type {keyof typeof TipoBarra | null}
     * @example
     * // Para encerrar uma introdução de ponteado:
     * this.#tipoBarra = TipoBarra.DUPLA; // Renderiza '||'
     */
    #tipoBarra = null;

    /**
     * USAGE:
     * Representa a lista de variações de volume (intensidade) no compasso.
     * @type {Array<{tipo: keyof typeof Dinamica, posicao: number}> | null}
     * @example
     * // Começa pianíssimo (pp) e muda para forte (f) no terceiro tempo:
     * this.#dinamicas = [
     * { tipo: 'pp', posicao: 0 },
     * { tipo: 'f',  posicao: 2 }
     * ];
     */
    #dinamicas = null;

    /**
     * USAGE:
     * Representa a lista de marcas de interpretação aplicadas ao compasso.
     * * @type {Array<{tipo: keyof typeof MarcaExpressao, posicao: number}>}
     * * @example
     * // Aplicando um Staccato no início e um Dolce no terceiro tempo (3/4):
     * this.#marcasExpressao = [
     * { tipo: 'STACCATO', posicao: 0 },
     * { tipo: 'DOLCE', posicao: 2 }
     * ];
     */
    #marcasExpressao = [];

    /**
     * USAGE:
     * Lista de instâncias da classe Ligadura aplicadas às vozes deste compasso.
     * @type {Array<Ligadura> | null}
     * @example
     * // Criando um martelado (Hammer-on) da primeira para a segunda nota:
     * const hammer = new Ligadura('HAMMER_ON', 0, 0.5);
     * this.#ligaduras = [ hammer ];
     */
    #ligaduras = null;

    /**
     * USAGE:
     * Objeto que centraliza a métrica física (Canvas) e temporal (Audio) do compasso.
     * @type {Dimensoes | null}
     * @example
     * this.#dimensoes = new Dimensoes(450, 4.0);
     */
    #dimensoes = null;

    /** @type {boolean} */
    #quebraDeLinha = false;
    /** @type {boolean} */
    #anacruse = false;

    /**
     * USAGE:
     * Lista de textos livres (anotações) ancorados a momentos rítmicos do compasso.
     * @type {Array<Anotacao> | null}
     * @example
     * this.#anotacoes = [ new Anotacao("Ponteado", 0, 'ACIMA') ];
     */
    #anotacoes = null;

    /**
     * USAGE:
     * Lista de acordes (cifras) que guiam a harmonia do compasso.
     * @type {Array<Acorde> | null}
     * @example
     * // Um compasso que começa em Mi Maior e muda para Si7 no meio:
     * this.#acordes = [
     * new Acorde("E", 0),
     * new Acorde("B7", 2)
     * ];
     */
    #acordes = null;

    constructor(indice = 0, { estruturaTempo = null, clave = null, armaduraClave = null} = {}) {
        // Identificador de sequência
        this.#indice = indice;

        // Elementos Estruturais (Podem ser nulos se herdados do compasso anterior)
        this.#estruturaTempo = estruturaTempo;
        this.#clave = clave;
        this.#armaduraClave = armaduraClave;

        // Inicialização de Coleções (Garante que nunca sejam undefined/null para evitar erros de iteração)
        this.#notas = [];
        this.#vozes = [];
        this.#marcasExpressao = [];

        // Inicialização de Campos Opcionais (Lazy Loading / Null por padrão)
        this.#tipoBarra = null;
        this.#dinamicas = null;
        this.#ligaduras = null;
        this.#anotacoes = null;
        this.#acordes = null;
        this.#dimensoes = null;

        // Flags de Estado
        this.#quebraDeLinha = false;
        this.#anacruse = false;
    }

    // Getters básicos para orquestração
    get indice() { return this.#indice; }
    get notas() { return this.#notas; }
    get estruturaTempo() { return this.#estruturaTempo; }
    toAbc() {
        let abc = "";

        // 1. Mudanças Estruturais Locais (Inline)
        // Se este compasso define uma nova métrica ou clave, o ABC permite mudar "no meio" da linha
        if (this.#estruturaTempo) abc += this.#estruturaTempo.toAbc();
        if (this.#clave) abc += `[V:1 clef=${this.#clave.toAbc()}]`;
        if (this.#armaduraClave) abc += this.#armaduraClave.toAbc();

        // 2. Processamento de Acordes e Notas
        // Aqui assumimos que notas e acordes podem estar em posições rítmicas diferentes.
        // Uma abordagem simples é iterar pelas notas:
        this.#notas.forEach((nota, idx) => {
            // Verifica se existe um acorde para esta posição rítmica
            if (this.#acordes) {
                const acordeAqui = this.#acordes.find(a => a.posicao === idx); // Simplificando por índice
                if (acordeAqui) abc += `"${acordeAqui.cifra}"`;
            }

            // Adiciona a nota (que já deve saber seu sufixo de duração)
            abc += nota.toAbc();
        });

        // 3. Fechamento do Compasso (Barra)
        // Se #tipoBarra for null, usamos a barra simples '|'
        const barra = this.#tipoBarra ? this.#tipoBarra : "|";
        abc += barra;

        // 4. Quebra de linha (se for o fim de um sistema)
        if (this.#quebraDeLinha) abc += "\n";

        return abc;
    }
}
