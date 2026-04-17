import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { AcordeTransposer } from "@domain/nota/AcordeTransposer.js";

/**
 * Classe base para Nota e Pausa.
 * Gerencia a lógica de tempo e contexto hierárquico.
 */
export class ElementoMusical {
    /** @type {TempoDuracao} */
    _duracao;
    _options;

    constructor(duracao, options = {}) {
        this._duracao = duracao;
        this._options = options;
    }

	/**
	 * Formata a duração rítmica para o padrão textual do ABCJS.
	 * Sobrescreve o método base para garantir a compatibilidade.
	 * @returns {string} A duração formatada (ex: "1/4", "2").
	 * @example
	 * pausa.formatarDuracaoAbc( ); // Retorna "1/2"
	 */
	_formatarDuracaoAbc() {
        const razao = this._duracao.razao / this.getUnidadeTempo().razao;
        if (Math.abs(razao - 1) < 0.000001) return "";

        // Se for um número inteiro (ex: 2, 3, 4), retorna direto
        if (Number.isInteger(Number(razao.toFixed(8)))) {
            return Math.round(razao).toString();
        }

        const d = Number(razao.toFixed(8));

        // Transforma o decimal em uma fração musical perfeita (bases 2, 4, 8, 16...)
        for (let denominador = 2; denominador <= 64; denominador *= 2) {
            const numerador = Math.round(d * denominador);

            // Verifica se a fração bate perfeitamente com o decimal original
            if (Math.abs((numerador / denominador) - d) < 0.000001) {

                // Sintaxe simplificada do ABC para frações
                if (numerador === 1 && denominador === 2) return "/"; // Ex: C/
                if (numerador === 1) return `/${denominador}`;        // Ex: C/4

                // Retorna a fração completa
                return `${numerador}/${denominador}`;                 // Ex: C3/2, z5/2
            }
        }

        // Fallback de extrema segurança (teoricamente nunca deve cair aqui se a música estiver no compasso)
        return razao.toString();
    }

    // Getters e Setters comuns
	/**
	 * Duração da nota/pausa/unissono.
	 * @return {TempoDuracao}
	 * @example
	 * const tempo = new TempoDuracao(4, 4);
	 * const nota = new Nota(tempo);
	 * nota.duracao = tempo;
	 */
    get duracao() {
		if (this._duracao === undefined || this._duracao === null) {
			return null;
		}
		return this._duracao;
	}
    set duracao(val) {
        if (!(val instanceof TempoDuracao)) {
            throw new TypeError("Duração deve ser instância de TempoDuracao.");
        }
        this._duracao = val;
    }

	/**
	 * Unidade de tempo padrão da nota/pausa/unissono
	 * @return {TempoDuracao}
	 * @example
	 * const tempo = new TempoDuracao(4, 4);
	 * const unidadeTempo = new UnidadeTempo(tempo);
	 * nota.unidadeTempo = unidadeTempo;
    */
    get unidadeTempo() {
		if (this._options.unidadeTempo === undefined || this._options.unidadeTempo === null) {
			return null;
		}
		return this._options.unidadeTempo;
	}
    set unidadeTempo(tempo) { this._options.unidadeTempo = tempo; }
	transpoeAcorde(acorde) {
		const transposer = new AcordeTransposer();
		const semitones = this.getTransposeUnits();
		if ((semitones !== 0) && transposer.ehAcordeValido(acorde)) {
			return transposer.transporAcorde(acorde, semitones);
		}
		return acorde;
	}

	/**
	 * Busca Numero de semitons para tranpor a musica
	 * esta propriedade será definida nos objetos superiores. (compasso|voz|obra)
	 * @returns {Number} { Number of semitons to transpose the music}
	 */
	getTransposeUnits() {
		// 1. Retorna imediatamente se a unidade de tempo estiver no próprio elemento
		if ( this._options.transposeUnits ) {
			return this._options.transposeUnits;
		}

		// 2. Define a ordem de subida na árvore de hierarquia
		const hierarquia = [ 'compasso', 'voz', 'obra' ];

		// 3. Percorre os pais dinamicamente
		for ( const nivel of hierarquia ) {
			const pai = this._options[ nivel ];

			if ( !pai ) continue; // Pula para o próximo se este pai não existir

			// Duck typing: Se o objeto tiver o método, executa. Senão, busca a propriedade direta (útil para JSON cru).
			const semitons = (pai && (typeof pai.getTransposeUnits === 'function'))
				? pai.getTransposeUnits()
				: pai.transposeUnits;

			if ( semitons ) {
				return semitons;
			}
		}
		return 0;
	}
    /**
     * Busca a unidade de tempo ativa na hierarquia da nota/pausa/unissono.
     * esta propriedade será definida nos objetos superiores. (compasso|voz|obra)
     * @returns {TempoDuracao}
     */
    getUnidadeTempo() {
        // 1. Retorna imediatamente se a unidade de tempo estiver no próprio elemento
        if (this._options.unidadeTempo) {
            return this._options.unidadeTempo;
        }

        // 2. Define a ordem de subida na árvore de hierarquia
        const hierarquia = ['compasso', 'voz', 'obra'];

        // 3. Percorre os pais dinamicamente
        for (const nivel of hierarquia) {
            const pai = this._options[nivel];

            if (!pai) continue; // Pula para o próximo se este pai não existir

            // Duck typing: Se o objeto tiver o método, executa. Senão, busca a propriedade direta (útil para JSON cru).
            const tempo = (pai && (typeof pai.getUnidadeTempo === 'function'))
                ? pai.getUnidadeTempo()
                : pai.unidadeTempo;

            if (tempo) {
                return tempo;
            }
        }

        // 4. Lança o erro se chegar ao topo da árvore sem encontrar nada
        throw new TypeError("A unidadeTempo Global deve ser definida em algum nível da hierarquia (Pausa/Compasso/Voz/Obra).");
    }
    // E precisaria de getters para as heranças também
    get obra() {
		if (this._options.obra === undefined || this._options.obra === null) {
			return null;
		}
		return this._options.obra;
	}
    set obra(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.obra = null;
            return;
        }
        if (val.constructor.name !== 'Obra' && !(val instanceof Object)) {
            throw new TypeError("setObra: A obra deve ser uma instancia de Obra ou null.");
        }
        this._options.obra = val;
    }
    get voz() {
		if (this._options.voz === undefined || this._options.voz === null) {
			return null;
		}
		return this._options.voz;
	}
    set voz(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.voz = null;
            return;
        }
        if (val.constructor.name !== 'Voz' && !(val instanceof Object)) {
            throw new TypeError("setVoz: A Voz deve ser uma instancia de Voz ou null.");
        }
        this._options.voz = val;
    }
    get compasso() {
		if (this._options.compasso === undefined || this._options.compasso === null) {
			return null;
		}
		return this._options.compasso;
	}
    set compasso(val) {
        if (val === undefined) return;
        if (!val) {
            this._options.compasso = null;
            return;
        }
        if (val.constructor.name !== 'Compasso' && !(val instanceof Object)) {
            throw new TypeError("setCompasso: O Compasso deve ser uma instancia de Compasso ou null.");
        }
        this._options.compasso = val;
    }
    get options() {
		if (this._options === undefined || this._options === null) {
			return {};
		}
		return this._options;
	}
    set options(val) {
        if (val === undefined) return;
        if (!val) {
            this._options = {};
            return;
        }
        if (val.constructor.name !== 'Object') {
            throw new TypeError("setOptions: O valor deve ser um objeto.");
        }
        this._options = val;
    }
	getAcordes() {
		if (this._options.acordes === undefined || this._options.acordes === null) {
			return [];
		}
		if (this._options.acordes.constructor.name !== 'Array') {
			return [];
		}
		if (this._options.acordes.length === 0) {
			return this._options.acordes;
		}
		return this._options.acordes.map ( acorde => this.transpoeAcorde ( acorde ) );
	}
	setAcordes(acordes) {
		if (acordes === undefined) return;
		if (!acordes) {
			this._options.acordes = [];
			return;
		}
		if (!Array.isArray(acordes)) {}
	}
}