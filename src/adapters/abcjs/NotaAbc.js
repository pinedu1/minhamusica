import { Nota } from '@domain/nota/Nota.js';
import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracaoAbc as NotaFrequenciaAbc, TempoDuracaoAbc } from "@abcjs/TempoDuracaoAbc.js";
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
    static toAbc( nota, isAcorde = false ) {
	    let abc = "";
	    const opt = nota.options;

	    // Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
	    if ( isAcorde === true ) {
		    if (opt.sustenido) abc += "^";
		    if (opt.beQuad) abc += "=";
		    abc += nota.altura.abc;
		    return abc;
	    }

	    // 1. PREFIXOS (Decoradores e Ornamentos)
	    if (opt.ghostNote) abc += "!style=x!";
	    if (opt.fermata) abc += "!fermata!";
	    if (opt.arpeggio) abc += "!arpeggio!";

	    // Acentuação (Exclusiva)
	    if (opt.marcato) abc += "!marcato!";
	    else if (opt.acento) abc += "!accent!";

	    // Articulações (Exclusiva)
	    if (opt.staccatissimo) abc += "!staccatissimo!";
	    else if (opt.staccato) abc += ".";
	    else if (opt.tenuto) abc += "!tenuto!";

	    // Acidentes locais
	    if (opt.sustenido) abc += "^";
	    if (opt.beQuad) abc += "=";

	    // Ornamentos (Exclusiva)
	    if (opt.trinado) abc += "!trill!";
	    else if (opt.mordente) abc += "!mordent!";
	    else if (opt.upperMordent) abc += "!uppermordent!";

	    if (opt.roll) abc += "~";

	    // Grace Notes (Adornos)
	    abc += NotaAbc.toGraceNotes( nota );

	    // 2. ALTURA DA NOTA
	    abc += nota.altura.abc;

	    // 3. SUFIXO DE DURAÇÃO
	    abc += NotaAbc.formatarDuracaoAbc( nota );

	    // 4. SUFIXOS (Dedilhado e Ligaduras)
	    if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;

	    // Ligaduras (Prolongamento/Tie)
	    if (opt.ligada || opt.hammerOn || opt.pullOff) {
		    abc += "-";
	    }

	    return abc;
    }

	/**
	 * Factory: Converte uma string ABC complexa em uma instância de Nota.
	 * Captura acordes (ex: "Am""G"), decoradores, altura e duração.
	 * @param {string} abcString - A string completa vinda do parser ABC.
	 * @returns {Nota}
	 */
	static fromAbc ( abcString ) {
		const options = {
			ghostNote: false
			, fermata: false
			, arpeggio: false
			, marcato: false
			, acento: false
			, staccatissimo: false
			, staccato: false
			, tenuto: false
			, sustenido: false
			, beQuad: false
			, trinado: false
			, mordente: false
			, upperMordent: false
			, roll: false
			, dedilhado: null
			, ligada: false
			, acordes: [ ] // <- Inicializado vazio
		};

		let tempAbc = abcString;

		// 1. CAPTURA DE ACORDES (Texto entre aspas: "Am""G")
		const matchesAcordes = tempAbc.match ( /"(.*?)"/g );
		if ( matchesAcordes ) {
			options.acordes = matchesAcordes.map ( a => a.replace ( /"/g, '' ) );
			// Remove os acordes da string temporária para não lixar o restante do parser
			tempAbc = tempAbc.replace ( /"(.*?)"/g, '' );
		}

		// 2. IDENTIFICAÇÃO DE DECORADORES E ORNAMENTOS
		if ( tempAbc.includes ( "!style=x!" ) ) options.ghostNote = true;
		if ( tempAbc.includes ( "!fermata!" ) ) options.fermata = true;
		if ( tempAbc.includes ( "!arpeggio!" ) ) options.arpeggio = true;
		if ( tempAbc.includes ( "!marcato!" ) ) options.marcato = true;
		if ( tempAbc.includes ( "!accent!" ) ) options.acento = true;
		if ( tempAbc.includes ( "!staccatissimo!" ) ) options.staccatissimo = true;
		if ( tempAbc.includes ( "!tenuto!" ) ) options.tenuto = true;
		if ( tempAbc.includes ( "!trill!" ) ) options.trinado = true;
		if ( tempAbc.includes ( "!mordent!" ) ) options.mordente = true;
		if ( tempAbc.includes ( "!uppermordent!" ) ) options.upperMordent = true;

		if ( tempAbc.includes ( "." ) ) options.staccato = true;
		if ( tempAbc.includes ( "~" ) ) options.roll = true;

		// 3. ACIDENTES, DEDILHADO E LIGADURAS
		if ( tempAbc.includes ( "^" ) ) options.sustenido = true;
		if ( tempAbc.includes ( "=" ) ) options.beQuad = true;

		if ( tempAbc.includes ( "$" ) ) {
			const matchDedilhado = tempAbc.match ( /\$"(.*?)"/ );
			if ( matchDedilhado ) options.dedilhado = matchDedilhado[ 1 ];
		}

		if ( tempAbc.endsWith ( "-" ) ) {
			options.ligada = true;
		}

		// 4. EXTRAÇÃO DA ALTURA E DURAÇÃO (Nota Pura)
		const notaLimpa = tempAbc.replace ( /!.*?!/g, "" )
			.replace ( /[.~^=$]/g, "" )
			.replace ( /".*?"/g, "" ) // Garante remoção de qualquer aspa residual
			.replace ( /^-/, "" )
			.trim ( )
		;

		const matchNota = notaLimpa.match ( /([A-Ga-g][',]*)(.*)/ );

		const alturaString = matchNota
			? matchNota[ 1 ]
			: "C"
		;

		const duracaoString = matchNota
			? matchNota[ 2 ]
			: ""
		;

		const duracao = TempoDuracaoAbc.fromAbc( duracaoString );
		const frequencia = NotaFrequenciaAbc.fromAbc( alturaString );

		return new Nota ( frequencia, duracao, options );
	}
}
