import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Nota } from "@domain/nota/Nota.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";
import { PausaAbc } from "@abcjs/PausaAbc.js";
import { QuialteraAbc } from "@abcjs/QuialteraAbc.js";

export class UnissonoAbc extends ElementoMusicalAbc {
	/**
	 * Cria a string abcJs do unissono.
	 * @param unissono {Unissono}
	 * @return {string}
	 */
	static toAbc( unissono ) {
		let abc = "";
		const opt = unissono.options;

		// Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
		// 0. ACORDES
		if (opt.acordes && opt.acordes.length > 0) {
			abc = opt.acordes.map( acorde => `"${acorde}"` ).join ( " " );
		}
		// 1. PREFIXOS (Decoradores e Ornamentos)
		if (opt.ghostNote) abc += "!style=x!";
		// Na exportação, usamos sempre a notação canônica primária
		if (opt.fermata) abc += "!fermata!";
		if (opt.fermataInvertida) abc += "!invertedfermata!";
		if (opt.arpeggio) abc += "!arpeggio!";
		if (opt.breath) abc += "!breath!";

		// Acentuação (Exclusiva)
		if (opt.marcato) abc += "!marcato!";
		else if (opt.acento) abc += "!accent!";

		// Articulações (Exclusiva)
		if (opt.staccatissimo) abc += "!staccatissimo!";
		else if (opt.staccato) abc += ".";
		else if (opt.tenuto) abc += "!tenuto!";

		// Ornamentos
		if (opt.trinado) abc += "!trill!";
		else if (opt.mordente) abc += "!lowermordent!"; // Padronizado para lowermordent
		else if (opt.upperMordent) abc += "!uppermordent!";

		if (opt.turn) abc += "!turn!";
		if (opt.roll) abc += "~";

		// Técnicas e Arcos
		if (opt.pizzicato) abc += "!+!";
		if (opt.snapPizzicato) abc += "!snap!";
		if (opt.downBow) abc += "!downbow!";
		if (opt.upBow) abc += "!upbow!";
		if (opt.openString) abc += "!open!";
		if (opt.thumb) abc += "!thumb!";

		// Dinâmicas
		if (opt.dinamicaSuave) {
			if ( opt.dinamicaSuave === 3 ) abc += "!ppp!";
			else if ( opt.dinamicaSuave === 2 ) abc += "!pp!";
			else if ( opt.dinamicaSuave === 1 ) abc += "!p!";
		}
		if (opt.dinamicaForte) {
			if ( opt.dinamicaForte === 3 ) abc += "!fff!";
			else if ( opt.dinamicaForte === 2 ) abc += "!ff!";
			else if ( opt.dinamicaForte === 1 ) abc += "!f!";
		}

		if (opt.dinamicaMeioForte) abc += "!mf!";

		// Expressão (Crescendo e Diminuendo)
		if (opt.crescendo) {
			if ( opt.crescendo === "inicio" ) abc += "!crescendo(!";
			else if ( opt.crescendo === "fim" ) abc += "!crescendo)!";
		}
		if (opt.diminuendo) {
			if ( opt.diminuendo === "inicio" ) abc += "!diminuendo(!";
			else if ( opt.diminuendo === "fim" ) abc += "!diminuendo)!";
		}

		// Grace Notes (Adornos)
		if (typeof this._toGraceNotes === "function") {
			abc += this._toGraceNotes( unissono );
		}

		abc += `[${unissono.notas.map(elemento => {
			if (elemento.constructor.name === "Pausa") { 
				return PausaAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Nota") {
				return NotaAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Unissono") {
				return UnissonoAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Quialtera") {
				return QuialteraAbc.toAbc( elemento );
			}
		}).join('')}]`;


		// 3. SUFIXO DE DURAÇÃO
		if (typeof this.formatarDuracaoAbc === "function") {
			abc += this.formatarDuracaoAbc( unissono );
		}

		// Ligaduras (Prolongamento/Tie)
		if (opt.ligada || opt.hammerOn || opt.pullOff) {
			abc += "-";
		}
		return abc;
	}

	/**
	 * USAGE: Cria uma nova instância de Unissono a partir de uma string de notação ABC.
	 * @param {string} unissonoString - A string do unissono (ex: "[CEG]2").
	 * @param {Object} contextOptions - Opções de contexto (L, M, K).
	 * @returns {Unissono} Uma nova instância da classe Unissono.
	 */
	static fromAbc(unissonoString, contextOptions) {
		const unissonoRegex = /\[([^\]]+)\]([0-9]*\/*[0-9]*)?(-)?/;
		const match = unissonoString.match(unissonoRegex);

		if (!match) {
			throw new Error(`Unissono.parseAbc: String de unissono inválida: "${unissonoString}"`);
		}

		const [notasArray, notasStr, duracaoStr, ligadura] = match;
		const unissonoOptions = { ...contextOptions };

		const duracao = this._calcularDuracaoAbcString( unissonoOptions, duracaoStr ?? '');

		if (ligadura) {
			unissonoOptions.ligada = true;
		}

		// 2. Parsing das notas internas
		const notaInternaRegex = /([=^_]?[a-gA-G][,']*)/g;
		const notas = [];
		let notaMatch;
		while ((notaMatch = notaInternaRegex.exec(notasStr)) !== null) {
			// A duração de cada nota interna é a mesma do unissono.
			// Passamos a string da nota e o contexto, mas a duração será a do unissono.
			const nota = NotaAbc.fromAbc(notaMatch[0], contextOptions);
			notas.push(nota);
		}

		// 3. Criação do Unissono
		const unissono = new Unissono(notas, duracao, unissonoOptions);

		// Garante que a duração de cada nota individual seja a mesma do unissono
		unissono.notas.forEach(n => n.duracao = unissono.duracao);

		return unissono;
	}

}