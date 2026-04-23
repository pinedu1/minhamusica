import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { AcordeTransposer } from "@domain/nota/AcordeTransposer.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";

export class ElementoMusical {
    /** @type {TempoDuracao} */
    _duracao;
    _options;

    constructor(duracao, options = {}) {
        this._duracao = duracao;
        this._options = options;
    }


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
    set unidadeTempo(tempo) {
		this._options.unidadeTempo = tempo;
	}
	get metrica() {
		if (this._options.metrica === undefined || this._options.metrica === null) {
			return null;
		}
		return this._options.metrica;
	}
	set metrica(val) {
		if (val == null) { this.options.metrica = null; return; }
		if (!(val instanceof TempoMetrica)) throw new TypeError('TempoMetrica inválido.');
		this._options.metrica = val;
	}
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
        const hierarquia = ['quialtera','unissono', 'grupo', 'compasso', 'voz', 'obra'];

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
        throw new TypeError("A unidadeTempo Global deve ser definida em algum nível da hierarquia ([Pausa|Nota|Unissono|Quialtera]/Compasso/Voz/Obra).");
    }
	/**
	 * Busca a unidade de tempo ativa na hierarquia da nota/pausa/unissono.
	 * esta propriedade será definida nos objetos superiores. (compasso|voz|obra)
	 * @returns {TempoDuracao}
	 */
	getMetrica() {
		// 1. Retorna imediatamente se a unidade de tempo estiver no próprio elemento
		if (this._options.metrica) {
			return this._options.metrica;
		}

		// 2. Define a ordem de subida na árvore de hierarquia
		const hierarquia = [ 'quialtera', 'unissono', 'compasso', 'voz', 'obra'];

		// 3. Percorre os pais dinamicamente
		for (const nivel of hierarquia) {
			const pai = this._options[nivel];

			if (!pai) continue; // Pula para o próximo se este pai não existir

			// Duck typing: Se o objeto tiver o método, executa. Senão, busca a propriedade direta (útil para JSON cru).
			const tempo = (pai && (typeof pai.getMetrica === 'function'))
				? pai.getMetrica()
				: pai.metrica;

			if (tempo) {
				return tempo;
			}
		}

		// 4. Lança o erro se chegar ao topo da árvore sem encontrar nada
		throw new TypeError("A Metrica Global deve ser definida em algum nível da hierarquia ([Pausa|Nota|Unissono|Quialtera]/Compasso/Voz/Obra).");
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

	_addDedilhado(dedo) {
		this._options.dedilhado.push(dedo);
	}
	get dedilhado() {
		if (this._options.dedilhado === undefined || this._options.dedilhado === null) {
			return [];
		}
		return this._options.dedilhado;
	}

	set dedilhado(val) {
		this._options.dedilhado = [];
		// 1. Testa se é um Array
		// 2. Testa se todos os itens dentro do Array são do tipo string
		if (!Array.isArray(val) || !val.every(item => typeof item === 'string')) {
			throw new TypeError("Dedilhado: O valor deve ser um array de strings (Array<String>).");
		}
		val.forEach(item => {
			this._addDedilhado(item);
		})
	}
	_addGraceNote(gn) {
		if (!(gn instanceof ElementoMusical)) {
			throw new TypeError('O elemento para graceNote deve ser uma instância de ElementoMusical (Nota, Pausa, Unissono ou Quialtera).');
		}
		this._options.graceNote.push(gn);
	}
	get graceNote() {
		if (this._options.graceNote === undefined || this._options.graceNote === null) {
			return [];
		}
		return this._options.graceNote;
	}
	set graceNote(val) {
		if (val === null || val === undefined) {
			this._options.graceNote = [];
			return;
		}
		if (!Array.isArray(val)) {
			throw new TypeError('GraceNote: deve ser um array de instâncias de Nota | Pausa | Unissono | Quialtera.');
		}
		if (val.some(e => !(e instanceof ElementoMusical))) {
			throw new TypeError('Todos os elementos do array de notas devem ser instâncias de Nota | Pausa | Unissono | Quialtera.');
		}
		this._options.graceNote = [];
		val.forEach(item => {
			this._addGraceNote(item);
		})
	}
}