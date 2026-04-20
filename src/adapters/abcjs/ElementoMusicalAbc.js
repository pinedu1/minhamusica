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
	static toGraceNote( nota ) {
		let abc = "";
		if (this._options.sustenido) abc += "^";
		if (this._options.beQuad) abc += "=";
		if ( this.constructor.name === "Nota" ) {
			abc += this.altura.abc;
		}
		abc += this._formatarDuracaoAbc();
		return abc;
	}
	/**
	 * Converte um array de Notas para uma string de notas de enfeite (grace notes).
	 * @param {Array<Nota>} notas - O array de notas a serem convertidas.
	 * @returns {string} A string de notas de enfeite formatada.
	 */
	static _toGraceNotes( nota ) {
		const gn = nota.options.graceNote;
		if (!Array.isArray(gn) || gn.length === 0) return "";
		const notasGraceAbc = gn.map(nota => NotaAbc.toGraceNote(nota)).join('');
		return `{${notasGraceAbc}}`;
	}
	static _toAcorde(nota) {
		return this._toAbcOutput( nota )
	}
	static _toQuialtera(nota) {
		return this._toAbcOutput( nota )
	}
	static _toAbcOutput( nota ) {
		let abc = "";
		const opt = nota.options;
		// Acidentes locais
		//if (opt.sustenido) abc += "^";
		//else if (opt.bemol) abc += "_";
		if (opt.beQuad) abc += "=";
		abc += nota.altura.abc;
		return abc;
	}
	static _toDedilhado( nota ) {
		const opt = nota.options;
		const dedilhado = opt.dedilhado;
		if ( dedilhado && ( dedilhado.length > 0) ) {
			return dedilhado.map(d => `"^${d}"`).join('');
		}
	}
	static _toElementoAbc( elemento, isAcorde = false, isQuialtera = false ) {
		if ( isAcorde === true ) return this._toAcorde( elemento );
		if ( isQuialtera === true ) return this._toQuialtera( elemento );
		let abc = "";
		const opt = elemento.options;

		// Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
		// 0. ACORDES
		if ( opt ) {
			if ( opt.acordes && opt.acordes.length > 0 ) {
				abc = opt.acordes.map( acorde => `"${ acorde }"` ).join( " " );
			}
			// 1. PREFIXOS (Decoradores e Ornamentos)
			if ( opt.ghostNote ) abc += "!style=x!";
			// Na exportação, usamos sempre a notação canônica primária
			if ( opt.fermata ) abc += "!fermata!";
			if ( opt.fermataInvertida ) abc += "!invertedfermata!";
			if ( opt.arpeggio ) abc += "!arpeggio!";
			if ( opt.breath ) abc += "!breath!";

			// Acentuação (Exclusiva)
			if ( opt.marcato ) abc += "!marcato!";
			else if ( opt.acento ) abc += "!accent!";

			// Articulações (Exclusiva)
			if ( opt.staccatissimo ) abc += "!staccatissimo!";
			else if ( opt.staccato ) abc += ".";
			else if ( opt.tenuto ) abc += "!tenuto!";

			// Ornamentos
			if ( opt.trinado ) abc += "!trill!";
			else if ( opt.mordente ) abc += "!lowermordent!"; // Padronizado para lowermordent
			else if ( opt.upperMordent ) abc += "!uppermordent!";

			if ( opt.turn ) abc += "!turn!";
			if ( opt.roll ) abc += "~";

			// Técnicas e Arcos
			if ( opt.pizzicato ) abc += "!+!";
			if ( opt.snapPizzicato ) abc += "!snap!";
			if ( opt.downBow ) abc += "!downbow!";
			if ( opt.upBow ) abc += "!upbow!";
			if ( opt.openString ) abc += "!open!";
			if ( opt.thumb ) abc += "!thumb!";

			// Dinâmicas
			if ( opt.dinamicaSuave ) {
				if ( opt.dinamicaSuave === 3 ) abc += "!ppp!";
				else if ( opt.dinamicaSuave === 2 ) abc += "!pp!";
				else if ( opt.dinamicaSuave === 1 ) abc += "!p!";
			}
			if ( opt.dinamicaForte ) {
				if ( opt.dinamicaForte === 3 ) abc += "!fff!";
				else if ( opt.dinamicaForte === 2 ) abc += "!ff!";
				else if ( opt.dinamicaForte === 1 ) abc += "!f!";
			}

			if ( opt.dinamicaMeioForte ) abc += "!mf!";

			// Expressão (Crescendo e Diminuendo)
			if ( opt.crescendo ) {
				if ( opt.crescendo === "inicio" ) abc += "!crescendo(!";
				else if ( opt.crescendo === "fim" ) abc += "!crescendo)!";
			}
			if ( opt.diminuendo ) {
				if ( opt.diminuendo === "inicio" ) abc += "!diminuendo(!";
				else if ( opt.diminuendo === "fim" ) abc += "!diminuendo)!";
			}

			// Grace Notes (Adornos)
			if ( opt.graceNote && typeof this._toGraceNotes === "function" ) {
				abc += this._toGraceNotes( elemento );
			}
			// SUFIXOS (Dedilhado e Ligaduras)
			if ( opt.dedilhado && ( opt.dedilhado.length > 0 ) ) {
				abc += this._toDedilhado( elemento );
			}
		}

		// Acidentes locais
		abc += this._toAbcOutput( elemento )

		// 3. SUFIXO DE DURAÇÃO
		if (typeof this.formatarDuracaoAbc === "function") {
			abc += this.formatarDuracaoAbc( elemento );
		}

		// Ligaduras (Prolongamento/Tie)
		if (opt.ligada || opt.hammerOn || opt.pullOff) {
			abc += "-";
		}
		return abc;
	}
}