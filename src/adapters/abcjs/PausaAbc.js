import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracaoAbc } from "@abcjs/TempoDuracaoAbc.js";
import { Pausa } from "@domain/nota/Pausa.js";

/**
 * Classe responsável por traduzir Pausas entre o modelo de domínio e o formato ABCJS.
 * @file PausaAbc.js
 * @description Adaptador para manipular entrada e saída no formato ABCJS para Pausas.
 */
export class PausaAbc extends ElementoMusicalAbc {
	/**
	 * Converte a pausa para sua representação completa no formato ABC.
	 * Inclui pausas de enfeite (grace notes) se houverem.
	 * @param {Pausa} pausa - A pausa a ser convertida.
	 * @returns {string} A string correspondente à pausa em pausação ABC.
	 * @example
	 * const abc = PausaAbc.toAbc( pausaInstance ); // Ex: "{C}D2"
	 */
	static toAbc( pausa ) {
		const opt = pausa.options;
		let prefixo = "";
		// 0 - Dropar os acordes (ex: "Am""G")
		if ( opt.acordes.length > 0 ) {
			opt.acordes.forEach( acorde => prefixo += `"${acorde}"` );
		}
		// 1. TRATAMENTO DE PAUSA DE COMPASSO (Z ou X)
		if ( opt.pausaDeCompasso === true ) {
			const pausaChar = opt.invisivel ? "X" : "Z";
			const qtdCompassos = pausa.calcularTempoPausaDeCompasso();

			// Se for apenas 1 compasso, retorna apenas a letra. Se for > 1, anexa o número.
			const sufixo = ( qtdCompassos === false || qtdCompassos <= 1 ) ? "" : qtdCompassos;
			return `${prefixo}${pausaChar}${sufixo}`;
		}

		// 2. PAUSAS COMUNS (z ou x)
		const pausaChar = opt.invisivel ? "x" : "z";

		// A) PREFIXOS: Devem vir ANTES do caractere (ex: !fermata!z)
		if ( opt.fermata ) {
			prefixo += "!fermata!";
		} else if ( opt.fermataInvertida ) {
			prefixo += "!invertedfermata!";
		}

		if ( opt.breath ) {
			prefixo += "!breath!";
		}

		// B) SUFIXO DE DURAÇÃO: Deve vir DEPOIS do caractere (ex: z2)
		const duracaoAbc = PausaAbc.formatarDuracaoAbc( pausa );

		// ORDEM FINAL: [Prefixos][Caractere][Duração]
		const out = `${prefixo}${pausaChar}${duracaoAbc}`;
		return out;
	}
	/**
	 * Factory: Converte uma string ABC de pausa em uma instância de Pausa.
	 * Captura acordes, trata invisibilidade (x/z) e extrai a duração.
	 * @param {string} abcString - A string vinda do parser (ex: '"Am"z2' ou '"G""C"x').
	 * Ex:
	 * "Am"z
	 * "Bm"Hz
	 * "C#m"H!breath!z2
	 * "D#m"H!breath!x
	 * "D#m"!fermata!!breath!z4
	 * "D#m"!invertedfermata!!breath!z
	 * @returns {Pausa}
	 */
	static fromAbc( abcString, contextOptions = {} ) {
		let tempAbc = abcString;

		let { conteudoEncontrado, conteudoRestante} = this._consomePayloadInicioSentenca( tempAbc );
		let { payloadString, optionsGerado} = this._trataPayLoad( conteudoEncontrado )
		const options = {
			...optionsGerado
		};

		tempAbc = conteudoRestante;

		// 3. IDENTIFICAÇÃO DE TIPO E INVISIBILIDADE
		// O caractere 'x' ou 'X' define a pausa invisível
		const matchPausa = tempAbc.trim().match( /^([zZxX])(.*)$/ );
		if ( matchPausa ) {
			const charOriginal = matchPausa[ 1 ]; // Captura o caractere exato (z, Z, x ou X)
			const charMinusculo = charOriginal.toLowerCase();

			// 1. Define a Invisibilidade (x ou X)
			options.invisivel = ( charMinusculo === "x" );

			// 2. Define se é Pausa de Compasso (Z ou X)
			// Se o caractere original for igual ao seu UpperCase, ele é maiúsculo.
			options.pausaDeCompasso = ( charOriginal === charOriginal.toUpperCase() );

			const duracaoString = matchPausa[ 2 ] || "1/1";

			// Para Z/X, o número que segue é a quantidade de compassos
			// Para z/x, é a duração rítmica normal baseada em L:
			const duracao = this._calcularDuracaoAbcString( contextOptions, duracaoString ?? '');

			return new Pausa( duracao , options );
		}

		return null;
	}
}
