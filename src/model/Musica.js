import { LinkedList } from './LinkedList.js';
import { Prefacio } from "./Prefacio.js";
import { EstruturaTempo } from './EstruturaTempo.js';
import { Duracao } from './Duracao.js';
import { Clave } from './Clave.js';
import { ArmaduraClave } from './ArmaduraClave.js';
import { Instrumento } from './Instrumento.js';
import { TempoBase } from './TempoBase.js';
import {ClaveTipo} from "./ClaveTipo.js";

/**
 * Classe Raiz que representa uma obra musical completa.
 * Gerencia a coleção de compassos e metadados globais.
 */
export class Musica {
    /** @type {string} */
    #titulo;
    /** @type {string} */
    #autor;
    /** @type {string} */
    #ritmo; // Ex: "Guarânia", "Pagode de Viola", "Cururu"
    /** @type {number} */
    #ano;
    /**
     * USAGE:
     * Define um Conto, Causo, Poesia antes do início da Musica
     * Se for null, nada.
     * @type {Prefacio | null}
     * @example
     * this.#prefacio = new Prefacio(['Atras daquela pedra','Tinha um homem que tinha um cachorro', 'E ele tinha um cachorro que tinha um homem']);
     */
    #prefacio = null;
    /** * USAGE:
     * Lista duplamente ligada de compassos.
     * Proporciona inserção e remoção eficiente em qualquer ponto da obra.
     * @type {LinkedList}
     */
    #compassos;
    /**
     * @param {string} titulo - Nome da obra.
     * @param {string} autor - Nome do compositor/maestro.
     * @param {string} ritmo - Gênero musical para contexto de execução.
     */
    constructor(titulo = "Sem Título", autor = "Anônimo", ritmo = "Livre") {
        this.#titulo = titulo;
        this.#autor = autor;
        this.#ritmo = ritmo;
        this.#compassos = new LinkedList();
        this.#ano = new Date().getFullYear(); [];
    }

    /** * USAGE:
     * Definições mestras que regem a obra.
     * Compassos que possuem estas propriedades como 'null' herdarão estes valores.
     */
    #configuracoesGlobais = {
        /** @type {number} - Identificador X: no ABC */
        id: 1,
        /** @type {EstruturaTempo} - M: */
        tempo: new EstruturaTempo(4, 4),
        /** @type {Clave} - V: ... clef= */
        clave: new Clave( ClaveTipo.TREBLE, 2),
        /** @type {ArmaduraClave} - K: */
        armadura: new ArmaduraClave('C'),
        /** @type {Instrumento} */
        instrumento: Instrumento.VIOLAO_NYLON,
        /** @type {Duracao} */
        duracao: Duracao.SEMINIMA,
        /** @type {TempoBase} */
        bpm: new TempoBase(120, Duracao.SEMINIMA)
    };
    /**
     * Gera a string ABC completa integrando metadados, prefácio e compassos.
     * @returns {string}
     */
    toAbc() {
        const global = this.#configuracoesGlobais;

        let abc = `X:${global.id}\n`;
        if ( this.#titulo ) {
            abc += `T:${this.#titulo}\n`;
        }
        if ( this.#autor ) {
            abc += `C:${this.#autor}\n`;
        }
        // 1. Prefácio (Diretivas %%text)
        if (this.#prefacio) {
            abc += this.#prefacio.toAbc();
        }

        // 2. Cabeçalho Técnico (Fallbacks Globais)
        abc += global.tempo.toAbc();
        abc += global.duracao.toAbc(); // Unidade de nota padrão
        abc += global.bpm.toAbc();
        abc += global.armadura.toAbc();

        // 3. Definição de Voz padrão para Viola
        abc += global.instrumento.toAbcVoice( global.clave );
        abc += global.instrumento.toAbcMidi();

        // 4. Corpo da Música (Iteração pela LinkedList)
        abc += `V:1\n`;
        for (const compasso of this.#compassos) {
            abc += compasso.toAbc();
        }

        return abc;
    }
    // --- Getters ---

    /** @returns {string} */
    get titulo() { return this.#titulo; }

    /** @returns {string} */
    get autor() { return this.#autor; }

    /** * Retorna a lista ligada completa.
     * @returns {LinkedList}
     */
    get compassos() { return this.#compassos; }

    /** * Atalho para o total de compassos na obra.
     * @returns {number}
     */
    get total() { return this.#compassos.length; }
    /**
     * Adiciona um compasso ao final da obra.
     * USAGE:
     * Utilizado para expansão linear da partitura. O índice do compasso
     * é definido automaticamente como o último da sequência.
     * @param {Compasso} compasso - Instância de Compasso a ser anexada.
     * @returns {Compasso} A própria instância para encadeamento.
     */
    compassoAppend(compasso) {
        const novoIndice = this.#compassos.length;
        compasso.indice = novoIndice;
        this.#compassos.append(compasso);
        return compasso;
    }
    /**
     * Insere um compasso em uma posição específica, deslocando os sucessores.
     * USAGE:
     * Essencial para inserções de preparações, introduções ou compassos
     * de repetição no meio da estrutura já existente.
     * Dispara a reindexação automática de todos os nós subsequentes.
     * @param {number} n - O índice alvo da inserção (Base 0).
     * @param {Compasso} compasso - A instância a ser inserida.
     * @returns {Compasso}
     */
    compassoInsertAt(n, compasso) {
        this.#compassos.insertAt(n, compasso);
        this.#reindexarCompassos(n);
        return compasso;
    }
    /**
     * Substitui o conteúdo musical de um compasso específico.
     * USAGE:
     * Altera a instância de Compasso na posição N sem modificar a
     * estrutura da LinkedList. Ideal para operações de "Refazer" ou
     * troca de variações rítmicas completas.
     * @param {number} n - Índice do compasso a ser substituído.
     * @param {Compasso} compasso - A nova instância de Compasso.
     * @returns {boolean} True se a substituição foi bem-sucedida.
     */
    compassoUpdate(n, compasso) {
        if (this.#compassos.set(n, compasso)) {
            compasso.indice = n;
            return true;
        }
        return false;
    }
    /**
     * Remove permanentemente um compasso da sequência.
     * USAGE:
     * Exclui o nó da LinkedList e reconecta os vizinhos (prev/next).
     * Após a remoção, decrementa o índice de todos os compassos
     * que vinham depois do item excluído para manter a integridade da pauta.
     * @param {number} n - Índice do compasso a ser removido.
     * @returns {boolean} True se o item existia e foi removido.
     */
    compassoDelete(n) {
        if (this.#compassos.remove(n)) {
            this.#reindexarCompassos(n);
            return true;
        }
        return false;
    }
    /**
     * Sincroniza o atributo interno #indice dos objetos Compasso com sua posição real na lista.
     * USAGE:
     * Método de integridade referencial. Deve ser chamado sempre que a
     * ordem da LinkedList for alterada (Insert/Delete).
     * Garante que a renderização do Canvas e o roteamento de áudio saibam
     * exatamente qual compasso estão processando.
     * @param {number} inicio - Posição inicial da varredura.
     * @private
     */
    #reindexarCompassos(inicio) {
        let atual = this.#compassos.head;
        let i = 0;

        while (atual) {
            if (i >= inicio) {
                atual.data.indice = i;
            }
            atual = atual.next;
            i++;
        }
    }

    /**
     * Permite iterar diretamente pela música: for (const compasso of musica)
     */
    *[Symbol.iterator]() {
        yield* this.#compassos;
    }
}