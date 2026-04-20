import { Nota } from '@domain/nota/Nota.js';
import { ElementoMusicalAbc } from "@adapters/abcjs/ElementoMusicalAbc.js";
import { TempoDuracaoAbc } from "@adapters/abcjs/TempoDuracaoAbc.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";

/**
 * @file NotaAbc.js
 * @description Adaptador para manipular entrada e saída no formato ABCJS para Notas.
 */
export class NotaAbc extends ElementoMusicalAbc {
	/**
	 * Converte a nota para sua representação completa no formato ABC.
	 * Inclui notas de enfeite (grace notes) se houverem.
	 * @param {Nota} nota - A nota a ser convertida.
	 * @returns {string} A string correspondente à nota em notação ABC.
	 * @example
	 * const abc = NotaAbc.toAbc( notaInstance ); // Ex: "{C}D2"
	 */
	static toAbc( nota, isAcorde = false, isQuialtera = false ) {
		return this._toElementoAbc( nota, isAcorde, isQuialtera );
	}
	/**
	 * Factory: Converte uma string ABC complexa em uma instância de Nota.
	 * Captura acordes (ex: "Am""G"), decoradores, altura e duração.
	 * @param {string} abcString - A string completa vinda do parser ABC.
	 * @returns {Nota}
	 */
	static fromAbc ( abcString ) {
		// Inicializa o options completo para cobrir todos os atributos da classe
		const options = {
			ghostNote: false,
			fermata: false,
			fermataInvertida: false,
			arpeggio: false,
			marcato: false,
			acento: false,
			staccatissimo: false,
			staccato: false,
			tenuto: false,
			breath: false,
			sustenido: false,
			bemol: false,
			beQuad: false,
			trinado: false,
			mordente: false,
			upperMordent: false,
			turn: false,
			roll: false,
			pizzicato: false,
			snapPizzicato: false,
			downBow: false,
			upBow: false,
			openString: false,
			thumb: false,
			dinamicaSuave: 0,
			dinamicaForte: 0,
			dinamicaMeioForte: false,
			crescendo: null,
			diminuendo: null,
			dedilhado: null,
			ligada: false,
			acordes: []
		};

		let tempAbc = abcString;

		// 1. CAPTURA DE ACORDES (Texto entre aspas: "Am""G")
		const matchesAcordes = tempAbc.match ( /"(.*?)"/g );
		if ( matchesAcordes ) {
			options.acordes = matchesAcordes.map ( a => a.replace ( /"/g, '' ) );
			// Remove os acordes da string temporária
			tempAbc = tempAbc.replace ( /"(.*?)"/g, '' );
		}

		// 2. IDENTIFICAÇÃO DE DECORADORES E ORNAMENTOS (Infra e Articulações)
		// -> Adicionados os mapeamentos duplos (Alternativas do ABC)
		if ( tempAbc.includes ( "!style=x!" ) ) options.ghostNote = true;
		if ( tempAbc.includes ( "!fermata!" ) || tempAbc.includes( "H" ) ) options.fermata = true;
		if ( tempAbc.includes ( "!invertedfermata!" ) ) options.fermataInvertida = true;
		if ( tempAbc.includes ( "!arpeggio!" ) ) options.arpeggio = true;
		if ( tempAbc.includes ( "!marcato!" ) ) options.marcato = true;
		if ( tempAbc.includes ( "!accent!" ) || tempAbc.includes( "!emphasis!" ) ) options.acento = true;
		if ( tempAbc.includes ( "!staccatissimo!" ) ) options.staccatissimo = true;
		if ( tempAbc.includes ( "!tenuto!" ) ) options.tenuto = true;
		if ( tempAbc.includes ( "!breath!" ) ) options.breath = true;

		if ( tempAbc.includes ( "!trill!" ) ) options.trinado = true;
		if ( tempAbc.includes ( "!mordent!" ) || tempAbc.includes( "!lowermordent!" ) ) options.mordente = true;
		if ( tempAbc.includes ( "!uppermordent!" ) || tempAbc.includes( "!pralltriller!" ) ) options.upperMordent = true;
		if ( tempAbc.includes ( "!turn!" ) ) options.turn = true;

		// Técnicas e Arcos
		if ( tempAbc.includes ( "!+!" ) ) options.pizzicato = true;
		if ( tempAbc.includes ( "!snap!" ) ) options.snapPizzicato = true;
		if ( tempAbc.includes ( "!downbow!" ) ) options.downBow = true;
		if ( tempAbc.includes ( "!upbow!" ) ) options.upBow = true;
		if ( tempAbc.includes ( "!open!" ) ) options.openString = true;
		if ( tempAbc.includes ( "!thumb!" ) ) options.thumb = true;

		// Dinâmicas
		if ( tempAbc.includes ( "!ppp!" ) ) options.dinamicaSuave = 3;
		else if ( tempAbc.includes ( "!pp!" ) ) options.dinamicaSuave = 2;
		else if ( tempAbc.includes ( "!p!" ) ) options.dinamicaSuave = 1;

		if ( tempAbc.includes ( "!fff!" ) ) options.dinamicaForte = 3;
		else if ( tempAbc.includes ( "!ff!" ) ) options.dinamicaForte = 2;
		else if ( tempAbc.includes ( "!f!" ) ) options.dinamicaForte = 1;

		if ( tempAbc.includes ( "!mf!" ) ) options.dinamicaMeioForte = true;

		// Expressão (Crescendo / Diminuendo)
		if ( tempAbc.includes ( "!crescendo(!" ) ) options.crescendo = 'inicio';
		else if ( tempAbc.includes ( "!crescendo)!" ) ) options.crescendo = 'fim';

		if ( tempAbc.includes ( "!diminuendo(!" ) ) options.diminuendo = 'inicio';
		else if ( tempAbc.includes ( "!diminuendo)!" ) ) options.diminuendo = 'fim';

		if ( tempAbc.includes ( "." ) ) options.staccato = true;
		if ( tempAbc.includes ( "~" ) ) options.roll = true;

		// 3. ACIDENTES, DEDILHADO E LIGADURAS
		if ( tempAbc.includes ( "^" ) ) options.sustenido = true;
		if ( tempAbc.includes ( "_" ) ) options.bemol = true;
		if ( tempAbc.includes ( "=" ) ) options.beQuad = true;

		if ( tempAbc.includes ( "$" ) ) {
			const matchDedilhado = tempAbc.match ( /\$"(.*?)"/ );
			if ( matchDedilhado ) options.dedilhado = parseInt(matchDedilhado[ 1 ], 10);
		}

		if ( tempAbc.endsWith ( "-" ) ) {
			options.ligada = true;
		}

		// 4. EXTRAÇÃO DA ALTURA E DURAÇÃO (Nota Pura)
		// -> Adicionado o 'H' na lista de caracteres regex para limpar a string corretamente
		const notaLimpa = tempAbc.replace ( /!.*?!/g, "" ) // Remove blocos entre !...!
			.replace ( /[.~^=$H]/g, "" ) // 'H' adicionado aqui para garantir que "HC4" se torne "C4"
			.replace ( /".*?"/g, "" ) // Garante remoção de qualquer aspa residual
			.replace ( /^-/, "" )
			.trim ( )
		;

		const matchNota = notaLimpa.match ( /([A-Ga-g][',]*)(.*)/ );

		let alturaString = matchNota
			? matchNota[ 1 ]
			: "C"
		;
		if ( options.sustenido ) alturaString = `^${alturaString}`;
		if ( options.bemol ) alturaString = `_${alturaString}`;

		const duracaoString = matchNota
			? matchNota[ 2 ]
			: ""
		;

		const duracao = TempoDuracaoAbc.fromAbc( (duracaoString !== '') ? duracaoString: '1' );
		const frequencia = NotaFrequencia.getByAbc( alturaString );

		return new Nota ( frequencia, duracao, options );
	}
}