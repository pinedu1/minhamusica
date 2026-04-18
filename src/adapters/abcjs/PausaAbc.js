import { Pausa } from '@domain/nota/Pausa.js';
import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracaoAbc } from "@abcjs/TempoDuracaoAbc.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
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

		// 1. TRATAMENTO DE PAUSA DE COMPASSO (Z ou X)
		if ( opt.pausaDeCompasso === true ) {
			const pausaChar = opt.invisivel ? "X" : "Z";
			const qtdCompassos = pausa.calcularTempoPausaDeCompasso();

			// Se for apenas 1 compasso, retorna apenas a letra. Se for > 1, anexa o número.
			const sufixo = ( qtdCompassos === false || qtdCompassos <= 1 ) ? "" : qtdCompassos;
			return `${pausaChar}${sufixo}`;
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
		return `${prefixo}${pausaChar}${duracaoAbc}`;
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
	static fromAbc( abcString ) {
		const options = {
			fermata: false
			, fermataInvertida: false
			, breath: false
			, invisivel: false
			, acordes: []
		};

		let tempAbc = abcString;

		// 1. EXTRAÇÃO DE ACORDES
		const matchesAcordes = tempAbc.match( /"(.*?)"/g );
		if ( matchesAcordes ) {
			options.acordes = matchesAcordes.map( a => a.replace( /"/g , "" ) );
			tempAbc = tempAbc.replace( /"(.*?)"/g , "" );
		}

		// 2. CAPTURA E LIMPEZA DE DECORADORES (Regex Power)
		// Procuramos por !fermata! ou o atalho 'H'
		if ( /(!fermata!|H)/.test( tempAbc ) ) {
			options.fermata = true;
			tempAbc = tempAbc.replace( /(!fermata!|H)/g , "" );
		}

		if ( /!invertedfermata!/.test( tempAbc ) ) {
			options.fermataInvertida = true;
			tempAbc = tempAbc.replace( /!invertedfermata!/g , "" );
		}

		if ( /!breath!/.test( tempAbc ) ) {
			options.breath = true;
			tempAbc = tempAbc.replace( /!breath!/g , "" );
		}

		// 3. IDENTIFICAÇÃO DE TIPO E INVISIBILIDADE
		// O caractere 'x' ou 'X' define a pausa invisível
		const matchPausa = tempAbc.trim().match( /^([zZxX])(.*)$/ );

		if ( matchPausa ) {
			const charPausa = matchPausa[ 1 ].toLowerCase();
			options.invisivel = ( charPausa === "x" );

			const duracaoString = matchPausa[ 2 ] || "";
			const duracao = TempoDuracaoAbc.fromAbc( duracaoString );

			return new Pausa( duracao , options );
		}

		return null;
	}
}
