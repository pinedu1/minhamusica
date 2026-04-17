import { Pausa } from '@domain/nota/Pausa.js';
import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracaoAbc } from "@abcjs/TempoDuracaoAbc.js";
import { Pausa } from "@domain/pausa/Pausa.js";

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
	static toAbc( pausa, isAcorde = false ) {
		let abc = "";
		const opt = pausa.options;

		// Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
		if ( isAcorde === true ) {
			if (opt.sustenido) abc += "^";
			if (opt.beQuad) abc += "=";
			abc += pausa.altura.abc;
			return abc;
		}

		// 1. PREFIXOS (Decoradores e Ornamentos)
		if (opt.fermata) abc += "!fermata!";
		if (opt.breath) abc += "!breath!";


		// Grace Notes (Adornos)
		abc += PausaAbc.toGraceNotes( pausa );

		// 3. SUFIXO DE DURAÇÃO
		abc += PausaAbc.formatarDuracaoAbc( pausa );

		return abc;
	}

	/**
	 * Factory: Converte uma string ABC complexa em uma instância de Pausa.
	 * Captura acordes (ex: "Am""G"), decoradores, altura e duração.
	 * @param {string} abcString - A string completa vinda do parser ABC.
	 * @returns {Pausa}
	 */
	/**
	 * Factory: Converte uma string ABC de pausa em uma instância de Pausa.
	 * Captura acordes, trata invisibilidade (x/z) e extrai a duração.
	 * @param {string} abcString - A string vinda do parser (ex: '"Am"z2' ou '"G""C"x').
	 * @returns {Pausa}
	 */
	static fromAbc ( abcString ) {
		const options = {
			fermata: false
			, ligada: false
			, invisivel: false
			, breath: false
			, acordes: [ ]
		};

		let tempAbc = abcString;

		// 1. CAPTURA DE ACORDES (Ex: "Am", "G""C")
		// O regex captura o conteúdo entre aspas duplas
		const matchesAcordes = tempAbc.match ( /"(.*?)"/g );
		if ( matchesAcordes ) {
			options.acordes = matchesAcordes.map ( a => a.replace ( /"/g , '' ) );
			// Limpa as aspas da string para não interferir na captura da pausa/duração
			tempAbc = tempAbc.replace ( /"(.*?)"/g , '' );
		}

		// 2. IDENTIFICAÇÃO DE DECORADORES E ORNAMENTOS
		if ( tempAbc.includes ( "!fermata!" ) ) options.fermata = true;
		if ( tempAbc.includes ( "!breath!" ) ) options.breath = true;
		if ( tempAbc.endsWith ( "-" ) ) options.ligada = true;

		// 4. EXTRAÇÃO DO CARACTERE DE PAUSA E DURAÇÃO
		// Removemos o que restou de decoradores para isolar a pausa pura (ex: z2 ou x)
		const pausaLimpa = tempAbc.replace ( /!.*?!/g , "" )
			.replace ( /[.~^=$]/g , "" )
			.replace ( /^-/ , "" )
			.trim ( )
		;

		// Captura o tipo (z/x) e a duração numérica/fracionária
		const matchPausa = pausaLimpa.match ( /([zZxX])(.*)/ );

		if ( matchPausa ) {
			const charPausa = matchPausa[ 1 ].toLowerCase ( );
			// Define invisibilidade conforme sua regra: x/X = true, z/Z = false
			if ( charPausa === 'x' ) {
				options.invisivel = true;
			}

			const duracaoString = matchPausa[ 2 ] || "";
			const duracao = TempoDuracaoAbc.fromAbc ( duracaoString );

			return new Pausa ( duracao , options );
		}

		return null;
	}
}
