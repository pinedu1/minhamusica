import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { ElementoMusical } from '@domain/nota/ElementoMusical.js';

/**
 * Representa um silêncio (pausa) na pauta musical, focada exclusivamente no estado do domínio.
 *
 * @example
 * const duracao = new TempoDuracao( 1, 4 );
 * const pausa = new Pausa( duracao, { invisivel: true } );
 */
export class Pausa extends ElementoMusical {
    /**
     * @param {import('@domain/tempo/TempoDuracao').TempoDuracao} duracao - Duração da pausa.
     * @param {Object} [options={}] - Configurações opcionais.
     * @param {string|string[]|null} [options.acordes] - Acorde(s) na posição da pausa.
     * @param {boolean} [options.invisivel=false] - Define se é pausa de espaço (x).
     * @param {Object} [options.voz] - Instância da voz a que pertence.
     */
    constructor( duracao, options = {} ) {
        super( duracao, options );
        this._options = {
            obra: null
            , voz: null
            , compasso: null
            , unidadeTempo: null
            , fermata: false
	        , fermataInvertida: false
            , breath: false
            , invisivel: false
	        , pausaDeCompasso: false
            , acordes: []
	        , ...options
        };
        this._duracao = duracao;
    }

    /**
     * Retorna se a pausa possui fermata.
     *
     * @returns {boolean} Verdadeiro se possui fermata.
     * @example
     * const temFermata = pausa.fermata;
     */
    get fermata() {
        return this._options.fermata === true;
    }

    /**
     * Retorna se a pausa possui marcação de respiração.
     *
     * @returns {boolean} Verdadeiro se possui marcação de respiração.
     * @example
     * const temBreath = pausa.breath;
     */
    get breath() {
        return this._options.breath === true;
    }

    /**
     * Retorna se a pausa é invisível (pausa de espaço).
     *
     * @returns {boolean} Verdadeiro se a pausa for invisível.
     * @example
     * const ehInvisivel = pausa.invisivel;
     */
    get invisivel() {
        return this._options.invisivel === true;
    }

    /**
     * Retorna os acordes associados à pausa.
     *
     * @returns {string|string[]|null} Acordes atribuídos à pausa.
     * @example
     * const meusAcordes = pausa.acordes;
     */
    get acordes() {
        return this.getAcordes();
    }

    /**
     * Retorna as opções internas da pausa.
     *
     * @returns {Object} Objeto com as opções de estado.
     * @example
     * const voz = pausa.options.voz;
     */
    get options() {
        return this._options;
    }

    /**
     * Retorna a duração definida para a pausa.
     *
     * @returns {import('@domain/tempo/TempoDuracao').TempoDuracao} Instância com a duração da pausa.
     * @example
     * const duracaoAtual = pausa.duracao;
     */
    get duracao() {
        return this._duracao;
    }
	get unidadeTempo() {
		return this._options.unidadeTempo;
	}
	set unidadeTempo(val) {
		if ( val === null || val === undefined ) {
			this._options.unidadeTempo = null;
			return;
		}
		if ( !(val instanceof TempoDuracao) ) {
			throw new TypeError("Pausa.unidadeTempo: valor deve ser Uma instancia de TempoDuracao.");
		}
		this._options.unidadeTempo = val;
	}
	/**
	 * Calcula a quantidade de compassos que esta pausa ocupa.
	 * @returns {number|boolean} Retorna o número inteiro de compassos ou false se não for uma pausa de compasso válida.
	 */
	calcularTempoPausaDeCompasso() {
		// 1. Só calcula se a flag de estado estiver ativa
		if ( !this.pausaDeCompasso ) {
			return false;
		}

		// 2. Recupera a métrica (M:) para saber o tamanho do "recipiente" (compasso)
		const metrica = this.getMetrica();

		if ( !metrica ) {
			return false;
		}

		/**
		 * CÁLCULO DA QUANTIDADE:
		 * Dividimos a razão da duração da pausa pela razão da métrica.
		 * Ex 1: Pausa 1/1 (1.0) em Compasso 4/4 (1.0) = 1 compasso.
		 * Ex 2: Pausa 2/1 (2.0) em Compasso 4/4 (1.0) = 2 compassos (Z2).
		 * Ex 3: Pausa 6/4 (1.5) em Compasso 3/4 (0.75) = 2 compassos (Z2).
		 */
		const quantidade = this.duracao.razao / metrica.razao;

		// 3. VALIDAÇÃO DE INTEGRIDADE
		// O padrão ABC exige que 'Z' seja seguido por um número inteiro.
		// Usamos arredondamento com uma margem de erro (epsilon) para evitar problemas de precisão decimal do JS.
		const valorInteiro = Math.round( quantidade );
		const diferenca = Math.abs( quantidade - valorInteiro );

		if ( diferenca < 1e-10 && valorInteiro > 0 ) {
			return valorInteiro;
		}

		// Se a duração da pausa não preencher compassos inteiros (ex: 1.5 compassos), é inválido para Z.
		return false;
	}
	get pausaDeCompasso() { return this._options.pausaDeCompasso; }
	get fermataInvertida() { return this._options.fermataInvertida; }
	get fermata() { return this._options.fermata; }
	get invisivel() { return this._options.invisivel; }
	get breath() { return this._options.breath; }
}
