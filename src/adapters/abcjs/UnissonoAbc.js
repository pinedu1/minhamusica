import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Nota } from "@domain/nota/Nota.js";

export class UnissonoAbc extends ElementoMusicalAbc {
	/**
	 * Cria a string abcJs do unissono.
	 * @param unissono {Unissono}
	 * @return {string}
	 */
	static toAbc( unissono ) {
		let abc = "";
		const opt = unissono.options;

		// 1. PREFIXOS GLOBAIS
		if (opt.ghostNote) abc += "!style=x!";
		if (opt.fermata) abc += "!fermata!";
		if (opt.arpeggio) abc += "!arpeggio!";

		if (opt.marcato) abc += "!marcato!";
		else if (opt.acento) abc += "!accent!";

		if (opt.staccatissimo) abc += "!staccatissimo!";
		else if (opt.staccato) abc += ".";
		else if (opt.tenuto) abc += "!tenuto!";

		if (opt.trinado) abc += "!trill!";
		else if (opt.mordente) abc += "!mordent!";
		else if (opt.upperMordent) abc += "!uppermordent!";

		if (opt.roll) abc += "~";

		// Grace Notes (Adornos) aplicados ao unissono
		abc += UnissonoAbc.toGraceNotes(unissono);

		// 2. CORPO DO UNISSONO
		const notasAbc = unissono.notas.map(nota => nota.toAbc(true)).join('');
		abc += `[${notasAbc}]`;

		// 3. SUFIXO DE DURAÇÃO
		abc += UnissonoAbc.formatarDuracaoAbc(unissono);

		// 4. SUFIXOS FINAIS
		if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;
		if (opt.ligada) abc += "-";

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

		const [, notasStr, duracaoStr, ligadura] = match;
		const unissonoOptions = { ...contextOptions };

		// 1. Duração do Unissono
		const unidadeTempo = (function() {
			if (contextOptions.voz) {
				const voz = contextOptions.voz;
				if ( voz.getUnidadeTempo() && voz.getUnidadeTempo() instanceof TempoDuracao ) {
					return voz.getUnidadeTempo();
				}
			}
			if (contextOptions.obra) {
				const obra = contextOptions.obra;
				if ( obra.getUnidadeTempo() && obra.getUnidadeTempo() instanceof TempoDuracao ) {
					return obra.getUnidadeTempo();
				}
			}
			return new TempoDuracao(1, 8);
		})();
		let duracao;

		if (duracaoStr) {
			if (duracaoStr.includes('/')) {
				if (duracaoStr.startsWith('/')) { // ex: /2
					duracao = new TempoDuracao(unidadeTempo.numerador, unidadeTempo.denominador * 2);
				} else { // ex: 3/2
					const [numerador, denominador] = duracaoStr.split('/').map(Number);
					duracao = new TempoDuracao(unidadeTempo.numerador * numerador, unidadeTempo.denominador * denominador);
				}
			} else { // ex: 2
				duracao = new TempoDuracao(unidadeTempo.numerador * Number(duracaoStr), unidadeTempo.denominador);
			}
		} else {
			duracao = unidadeTempo;
		}

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
			const nota = Nota.parseAbc(notaMatch[0], contextOptions);
			notas.push(nota);
		}

		// 3. Criação do Unissono
		const unissono = new Unissono(notas, duracao, unissonoOptions);

		// Garante que a duração de cada nota individual seja a mesma do unissono
		unissono.notas.forEach(n => n.duracao = unissono.duracao);

		return unissono;
	}

}