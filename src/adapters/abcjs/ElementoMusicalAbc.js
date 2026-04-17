export class ElementoMusicalAbc {
	/**
	 * Formata a duração rítmica para o padrão textual do ABCJS.
	 * Sobrescreve o método base para garantir a compatibilidade.
	 * @returns {string} A duração formatada (ex: "1/4", "2").
	 * @example
	 * pausa.formatarDuracaoAbc( ); // Retorna "1/2"
	 */
	static formatarDuracaoAbc( elemento ) {
		const razao = elemento.duracao.razao / elemento.getUnidadeTempo().razao;
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
	static plotaAcordes( elemento ) {
		const acordes = elemento.getAcordes();
		if ( !acordes ) return '';
		if ( Array.isArray( acordes ) ) {
			return acordes.map( ac => `"${ac}"` ).join( '' );
		} else if ( typeof acordes === 'string' ) {
			return `"${acordes}"`;
		}
		return '';
	}
	/**
	 * Converte uma Nota para uma string de notas de enfeite (grace note).
	 * @param {Nota} nota - A nota a ser convertida.
	 * @returns {string} A string de notas de enfeite formatada.
	 */
	static toGraceNote( nota) {
		let abc = "";
		if (this._options.sustenido) abc += "^";
		if (this._options.beQuad) abc += "=";
		abc += this.#altura.abc;
		abc += this._formatarDuracaoAbc();
		return abc;
	}
	/**
	 * Converte um array de Notas para uma string de notas de enfeite (grace notes).
	 * @param {Array<Nota>} notas - O array de notas a serem convertidas.
	 * @returns {string} A string de notas de enfeite formatada.
	 */
	static toGraceNotes( nota ) {
		const gn = nota.options.graceNote;
		if (!Array.isArray(gn) || gn.length === 0) return "";
		const notasGraceAbc = gn.map(nota => NotaAbc.toGraceNote(nota)).join('');
		return `{${notasGraceAbc}}`;
	}

}