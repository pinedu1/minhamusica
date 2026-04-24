import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

export class ElementoMusicalAbc extends AdapterUtils {
	/**
	 * Calcula a duração real de um elemento interpretando a string rítmica do ABC dentro do contexto musical.
	 * * @description
	 * Este método realiza o "Bubble Up" na hierarquia de domínio para localizar os parâmetros L (unidadeTempo)
	 * e M (metrica). A lógica de cálculo segue a especificação ABC:
	 * 1. Uma nota sem número (ex: "C") tem a duração exata de L.
	 * 2. Um número após a nota (ex: "C2") multiplica L.
	 * 3. Uma fração ou barra (ex: "C/2", "C1/4") divide L.
	 * * Hierarquia de busca (options): Elemento -> Grupo -> Compasso -> Voz -> Obra.
	 *
	 *  A estrutura do elemento possui em options:
	 *  Ex: {
	 *  elemento: {
	 *      options: {
	 *         obra: {
	 *            options: { metrica: { numerador: 4, denominador: 4 }, unidadeTempo: { numerador: 1, denominador: 4 }, andamento: { numerador: 1, denominador: 4, bpm: 90 } }
	 *               , vozes: [
	 *                  {
	 *                      options: { unidadeTempo: { numerador: 1, denominador: 4 } }
	 *                         , compassos: [
	 *                            {
	 *                               options: { unidadeTempo: { numerador: 1, denominador: 4 } }
	 *                                  , elementos: [
	 *                                     {
	 *                                         options: { unidadeTempo: { numerador: 1, denominador: 4 } }
	 *                                           , elements: [
	 *                                              Pausa | Nota | Unissono | Quialtera
	 *                                           ]
	 *                                     }
	 *                                   ]
	 *                             }
	 *                         ]
	 *                  }
	 *              ]
	 *         }
	 *      }
	 * }
	 * Cada Objeto base: [Nota | Pausa] desta hierarquia possui um metodo: getUnidadeTempo(), que sobe na hierarquia na seguinte ordem: [ unissono | quialtera ] -> compasso > vozes > obra, buscando a primeira incidencia do objeto unidadeTempo
	 * Cada Objeto base: [Nota | Pausa] desta hierarquia possui um metodo: getMetrica(), que sobe na hierarquia na seguinte ordem: [ unissono | quialtera ] -> compasso > vozes > obra, buscando a primeira incidencia do objeto metrica
	 * Obtendo os paramentros minimos para calcular o tempo da unidade base dentro do seu contexto.
	 *
	 * @param {ElementoMusical} contextOptions - O objeto (Nota, Pausa, etc.) que solicita o cálculo.
	 * @param {string} duracaoString - O sufixo rítmico capturado no regex (ex: "2", "1/2", "/4", "").
	 * @returns {TempoDuracao} Uma nova instância com a duração absoluta calculada.
	 * @static
	 */
	static _calcularDuracaoAbcString( contextOptions, duracaoString ) {
		// 1. OBTENÇÃO DO CONTEXTO (L e M)
		// Utilizamos os métodos de escalonamento que você definiu nas classes de domínio.
		// Se o elemento não estiver vinculado a uma árvore, o fallback padrão é L:1/4.
		const unidadeTempo = (function() {
			if (contextOptions?.unidadeTempo) {
				return contextOptions.unidadeTempo;
			}
			if (contextOptions?.compasso) {
				const compasso = contextOptions.voz;
				if ( compasso.getUnidadeTempo() && compasso.getUnidadeTempo() instanceof TempoDuracao ) {
					return compasso.getUnidadeTempo();
				}
			}
			if (contextOptions?.voz) {
				const voz = contextOptions.voz;
				if ( voz.getUnidadeTempo() && voz.getUnidadeTempo() instanceof TempoDuracao ) {
					return voz.getUnidadeTempo();
				}
			}
			if (contextOptions?.obra) {
				const obra = contextOptions.obra;
				if ( obra.getUnidadeTempo() && obra.getUnidadeTempo() instanceof TempoDuracao ) {
					return obra.getUnidadeTempo();
				}
			}
			return new TempoDuracao(1,1);
		})();


		// 2. PARSING DA STRING ABC
		// Regex para identificar [multiplicador][barra][divisor]
		const regexRitmo = /^(\d*)(\/?)(\d*)$/;
		const match = (duracaoString || "").match(regexRitmo);

		let numMultiplicador = 1;
		let numDivisor = 1;

		if (match) {
			const [ , multiplicador, temBarra, divisor ] = match;

			// Se existe multiplicador antes da barra (ex: "3/2" -> 3) ou sem barra (ex: "2" -> 2)
			if (multiplicador) numMultiplicador = parseInt(multiplicador, 10);

			// Se existe uma barra "/"
			if (temBarra) {
				// Se tem número após a barra (ex: "/4" -> 4), senão o padrão ABC para "/" é 2
				numDivisor = divisor ? parseInt(divisor, 10) : 2;
			}
		}

		/**
		 * 3. CÁLCULO MATEMÁTICO
		 * A duração final é: (L.numerador * multiplicador) / (L.denominador * divisor)
		 */
		const novoNumerador = unidadeTempo.numerador * numMultiplicador;
		const novoDenominador = unidadeTempo.denominador * numDivisor;

		// Retornamos a nova instância de TempoDuracao que será atribuída ao elemento
		return new TempoDuracao(novoNumerador, novoDenominador);
	}
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
	static _toDedilhado( nota ) {
		const opt = nota.options;
		const dedilhado = opt.dedilhado;
		if ( dedilhado && ( dedilhado.length > 0) ) {
			return dedilhado.map(d => `"^${d}"`).join('');
		}
	}
	static _toAbcOutput( nota ) {
		let abc = "";
		const opt = nota.options;
		if (opt.beQuad) abc += "=";
		abc += nota.altura.abc;
		return abc;
	}

	/**
	 * Converte um elemento interno de um uníssono (acorde) para ABCJS.
	 * @param {Unissono} unissonoElement - O objeto uníssono contendo o array de notas.
	 * @returns {string} Fragmento ABCJS formatado como [abc...].
	 */
	static _toUnissono( unissonoElement ) {
		let abc = "";
		const opt = unissonoElement.options;

		// 1. DECORADORES DO BLOCO (Prefixos que afetam o acorde inteiro)
		if ( opt ) {
			// Acordes de Acorde (Texto sobre o bloco)
			if ( opt.acordes && opt.acordes.length > 0 ) {
				abc += opt.acordes.map( acorde => `"${ acorde }"` ).join( " " );
			}

			// Estilos e Símbolos de Bloco
			if ( opt.ghostNote ) abc += "!style=x!";
			if ( opt.fermata ) abc += "!fermata!";
			if ( opt.arpeggio ) abc += "!arpeggio!";
			if ( opt.breath ) abc += "!breath!";

			// Articulação do Bloco
			if ( opt.marcato ) abc += "!marcato!";
			else if ( opt.acento ) abc += "!accent!";

			if ( opt.staccatissimo ) abc += "!staccatissimo!";
			else if ( opt.staccato ) abc += ".";

			// Dinâmicas (Afetam o volume do uníssono como um todo)
			if ( opt.dinamicaSuave ) {
				const p = "!".repeat(opt.dinamicaSuave); // p, pp, ppp
				abc += `!${p}!`;
			}
			if ( opt.dinamicaForte ) {
				const f = "!".repeat(opt.dinamicaForte); // f, ff, fff
				abc += `!${f}!`;
			}
			if ( opt.dinamicaMeioForte ) abc += "!mf!";

			// Expressão
			if ( opt.crescendo === "inicio" ) abc += "!crescendo(!";
			if ( opt.diminuendo === "inicio" ) abc += "!diminuendo(!";
		}

		// 2. ABERTURA DO UNISSONO
		abc += "[";

		// 3. RENDERIZAÇÃO DAS NOTAS INTERNAS
		// Cada nota dentro do uníssono pode ter seu próprio dedilhado ou acidente.
		abc += unissonoElement.notas.map( nota => {
			let notaInternaAbc = "";

			// Dedilhado individual (Ex: Polegar na corda 6, indicador na 3)
			if ( nota.options?.dedilhado && nota.options.dedilhado.length > 0 ) {
				notaInternaAbc += this._toDedilhado( nota );
			}

			// Altura da nota (com acidentes calculados pelo toAbcOutput)

			return notaInternaAbc;
		} ).join( "" );

		// 4. FECHAMENTO E DURAÇÃO DO BLOCO
		abc += "]";

		// A duração do uníssono é aplicada uma única vez após o fechamento dos colchetes.
		if ( typeof this.formatarDuracaoAbc === "function" ) {
			abc += this.formatarDuracaoAbc( unissonoElement );
		}

		// 5. FINALIZADORES DE EXPRESSÃO E LIGADURAS
		if ( opt ) {
			if ( opt.crescendo === "fim" ) abc += "!crescendo)!";
			if ( opt.diminuendo === "fim" ) abc += "!diminuendo)!";
			if ( opt.ligada || opt.hammerOn || opt.pullOff ) abc += "-";
		}

		return abc;
	}
	/**
	 * Converte um elemento interno de uma quiáltera para ABCJS.
	 * Aplica ornamentos, articulações e dedilhados antes da nota.
	 * @param {ElementoMusical} quialteraElement - Nota, Pausa ou Unissono.
	 * @returns {string} Fragmento ABCJS formatado.
	 */
	static _toQuialtera(quialteraElement) {
		let abc = "";
		const opt = quialteraElement.options;

		// 0. ACORDES E DECORADORES INICIAIS
		if ( opt ) {
			// Acordes (letras de acorde sobre a nota)
			if ( opt.acordes && opt.acordes.length > 0 ) {
				abc += opt.acordes.map( acorde => `"${ acorde }"` ).join( " " );
			}

			// Estilos e Prefixos de Ornamentação
			if ( opt.ghostNote ) abc += "!style=x!";
			if ( opt.fermata ) abc += "!fermata!";
			if ( opt.fermataInvertida ) abc += "!invertedfermata!";
			if ( opt.arpeggio ) abc += "!arpeggio!";
			if ( opt.breath ) abc += "!breath!";

			// Acentuação e Articulação
			if ( opt.marcato ) abc += "!marcato!";
			else if ( opt.acento ) abc += "!accent!";

			if ( opt.staccatissimo ) abc += "!staccatissimo!";
			else if ( opt.staccato ) abc += ".";
			else if ( opt.tenuto ) abc += "!tenuto!";

			// Ornamentos Clássicos
			if ( opt.trinado ) abc += "!trill!";
			else if ( opt.mordente ) abc += "!lowermordent!";
			else if ( opt.upperMordent ) abc += "!uppermordent!";
			if ( opt.turn ) abc += "!turn!";
			if ( opt.roll ) abc += "~";

			// Técnicas e Dinâmicas Individuais
			if ( opt.pizzicato ) abc += "!+!";
			if ( opt.snapPizzicato ) abc += "!snap!";
			if ( opt.downBow ) abc += "!downbow!";
			if ( opt.upBow ) abc += "!upbow!";

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

			// Grace Notes (Notas de adorno antes da nota da quiáltera)
			if ( opt.graceNote && typeof this._toGraceNotes === "function" ) {
				abc += this._toGraceNotes( quialteraElement );
			}

			// Dedilhado (Essencial para sua ferramenta de música raiz)
			if ( opt.dedilhado && ( opt.dedilhado.length > 0 ) ) {
				abc += this._toDedilhado( quialteraElement );
			}
		}

		// 1. ALTURA (A nota em si, ex: ^C)
		abc += this._toAbcOutput( quialteraElement );

		// 2. SUFIXO DE DURAÇÃO (Visualização rítmica interna da quiáltera)
		if (typeof this.formatarDuracaoAbc === "function") {
			abc += this.formatarDuracaoAbc( quialteraElement );
		}

		// 3. LIGADURAS (Tie/Slur interno)
		if (opt && (opt.ligada || opt.hammerOn || opt.pullOff)) {
			abc += "-";
		}

		return abc;
	}
	static _toElementoAbc( elemento, isUnissono = false, isQuialtera = false ) {
		if ( isUnissono === true ) return this._toUnissono( elemento );
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

	static _consomePayloadInicioSentenca( strIn ) {
		let conteudoRestante = strIn.trim();
		let conteudoEncontrado = "";

		// REGEXES LIMPOS (Sem o /g no final)
		const regexAcordes = /^"(.*?)"/;
		const regexDedilhado = /^"\$\((.*?)\)"/; // O nosso dedilhado!
		const regexPulaLinha = /^\$(?!\()/;     // Blindado para ignorar o dedilhado
		const regexMarca = /^!(.*?)!/;
		const regexStaccato = /^\./;
		const regexFermata = /^H/;
		const regexRoll = /^~/;
		while (conteudoRestante.length > 0) {
			let achei = false; // Declarar no início do loop é o mais correto

			const matchRoll = conteudoRestante.match(regexRoll);
			if (matchRoll) {
				conteudoEncontrado += matchRoll[0]; // Adiciona um espaço de respiro
				conteudoRestante = conteudoRestante.substring(matchRoll[0].length).trimStart();
				achei = true;
			}
			const matchFermata = conteudoRestante.match(regexFermata);
			if (matchFermata) {
				conteudoEncontrado += matchFermata[0]; // Adiciona um espaço de respiro
				conteudoRestante = conteudoRestante.substring(matchFermata[0].length).trimStart();
				achei = true;
			}
			const matchStaccato = conteudoRestante.match(regexStaccato);
			if (matchStaccato) {
				conteudoEncontrado += matchStaccato[0]; // Adiciona um espaço de respiro
				conteudoRestante = conteudoRestante.substring(matchStaccato[0].length).trimStart();
				achei = true;
			}
			const matchDedilhado = conteudoRestante.match(regexDedilhado);
			if (matchDedilhado) {
				conteudoEncontrado += matchDedilhado[0]; // Adiciona um espaço de respiro
				conteudoRestante = conteudoRestante.substring(matchDedilhado[0].length).trimStart();
				achei = true;
			}

			const matchAcordes = conteudoRestante.match(regexAcordes);
			if (matchAcordes) {
				conteudoEncontrado += matchAcordes[0];
				conteudoRestante = conteudoRestante.substring(matchAcordes[0].length).trimStart();
				achei = true;
			}

			const matchPulaLinha = conteudoRestante.match(regexPulaLinha);
			if (matchPulaLinha) {
				conteudoEncontrado += matchPulaLinha[0];
				conteudoRestante = conteudoRestante.substring(matchPulaLinha[0].length).trimStart();
				achei = true;
			}

			const matchMarca = conteudoRestante.match(regexMarca);
			if (matchMarca) {
				conteudoEncontrado += matchMarca[0];
				conteudoRestante = conteudoRestante.substring(matchMarca[0].length).trimStart();
				achei = true;
			}
			conteudoRestante = conteudoRestante.trim();
			// Se passou por todas as verificações e não achou nada,
			// significa que bateu na nota musical. Hora de parar o loop!
			if (!achei) {
				break;
			}
		}
		if ( conteudoRestante.endsWith( "-" ) ) {
			conteudoRestante = conteudoRestante.substring(0, conteudoRestante.length - 1);
			conteudoEncontrado += '-';
		}
		// Dá um trim() final no payload caso ele tenha um espaço sobrando no fim
		return { conteudoEncontrado, conteudoRestante };
	}

	static _trataPayLoad(payloadString) {
		let options = {  };
		if ( payloadString.includes ( "!style=x!" ) ) {
			options.ghostNote = true;
			payloadString = payloadString.replaceAll("!style=x!", '');
		}
		if ( payloadString.includes ( "!fermata!" ) || payloadString.includes( "H" ) ) {
			options.fermata = true;
			payloadString = payloadString.replaceAll("!fermata!", '');
			payloadString = payloadString.replaceAll("H", '');
		}
		if ( payloadString.includes ( "!invertedfermata!" ) ) {
			options.fermataInvertida = true;
			payloadString = payloadString.replaceAll("!invertedfermata!", '');
		}
		if ( payloadString.includes ( "!arpeggio!" ) ) {
			options.arpeggio = true;
			payloadString = payloadString.replaceAll("!arpeggio!", '');
		}
		if ( payloadString.includes ( "!marcato!" ) ) {
			options.marcato = true;
			payloadString = payloadString.replaceAll("!marcato!", '');
		}
		if ( payloadString.includes ( "!accent!" ) || payloadString.includes( "!emphasis!" ) ) {
			options.acento = true;
			payloadString = payloadString.replaceAll("!accent!", '');
			payloadString = payloadString.replaceAll("!emphasis!", '');
		}
		if ( payloadString.includes ( "!staccatissimo!" ) ) {
			options.staccatissimo = true;
			payloadString = payloadString.replaceAll("!staccatissimo!", '');
		}
		if ( payloadString.includes ( "!tenuto!" ) ) {
			options.tenuto = true;
			payloadString = payloadString.replaceAll("!tenuto!", '');
		}
		if ( payloadString.includes ( "!breath!" ) ) {
			options.breath = true;
			payloadString = payloadString.replaceAll("!breath!",'');
		}
		if ( payloadString.includes ( "!trill!" ) ) {
			options.trinado = true;
			payloadString = payloadString.replaceAll("!trill!", '');
		}
		if ( payloadString.includes ( "!mordent!" ) || payloadString.includes( "!lowermordent!" ) ) {
			options.mordente = true;
			payloadString = payloadString.replaceAll("!mordent!", '');
			payloadString = payloadString.replaceAll("!lowermordent!", '');
		}
		if ( payloadString.includes ( "!uppermordent!" ) || payloadString.includes( "!pralltriller!" ) ) {
			options.upperMordent = true;
			payloadString = payloadString.replaceAll("!uppermordent!", '');
			payloadString = payloadString.replaceAll("!pralltriller!", '');
		}
		if ( payloadString.includes ( "!turn!" ) ) {
			options.turn = true;
			payloadString = payloadString.replaceAll("!turn!", '');
		}

		// Técnicas e Arcos
		if ( payloadString.includes ( "!+!" ) ) {
			options.pizzicato = true;
			payloadString = payloadString.replaceAll("!+!", '');
		}
		if ( payloadString.includes ( "!snap!" ) ) {
			options.snapPizzicato = true;
			payloadString = payloadString.replaceAll("!snap!", '');
		}
		if ( payloadString.includes ( "!downbow!" ) ) {
			options.downBow = true;
			payloadString = payloadString.replaceAll("!downbow!", '');
		}
		if ( payloadString.includes ( "!upbow!" ) ) {
			options.upBow = true;
			payloadString = payloadString.replaceAll("!upbow!", '');
		}
		if ( payloadString.includes ( "!open!" ) ) {
			options.openString = true;
			payloadString = payloadString.replaceAll("!open!", '');
		}
		if ( payloadString.includes ( "!thumb!" ) ) {
			options.thumb = true;
			payloadString = payloadString.replaceAll("!thumb!", '');
		}

		// Dinâmicas
		if ( payloadString.includes ( "!ppp!" ) ) {
			options.dinamicaSuave = 3;
			payloadString = payloadString.replaceAll("!ppp!", '');
		}
		else if ( payloadString.includes ( "!pp!" ) ) {
			options.dinamicaSuave = 2;
			payloadString = payloadString.replaceAll("!pp!", '');
		}
		else if ( payloadString.includes ( "!p!" ) ) {
			options.dinamicaSuave = 1;
			payloadString = payloadString.replaceAll("!p!", '');
		}

		if ( payloadString.includes ( "!fff!" ) ) {
			options.dinamicaForte = 3;
			payloadString = payloadString.replaceAll("!fff!", '');
		}
		else if ( payloadString.includes ( "!ff!" ) ) {
			options.dinamicaForte = 2;
			payloadString = payloadString.replaceAll("!ff!", '');
		}
		else if ( payloadString.includes ( "!f!" ) ) {
			options.dinamicaForte = 1;
			payloadString = payloadString.replaceAll("!f!", '');
		}

		if ( payloadString.includes ( "!mf!" ) ) {
			options.dinamicaMeioForte = true;
			payloadString = payloadString.replaceAll("!mf!", '');
		}

		// Expressão (Crescendo / Diminuendo)
		if ( payloadString.includes ( "!crescendo(!" ) ) {
			options.crescendo = "inicio";
			payloadString = payloadString.replaceAll("!crescendo(!", '');
		}
		else if ( payloadString.includes ( "!crescendo)!" ) ) {
			options.crescendo = "fim";
			payloadString = payloadString.replaceAll("!crescendo)!", '');
		}

		if ( payloadString.includes ( "!diminuendo(!" ) ) {
			options.diminuendo = "inicio";
			payloadString = payloadString.replaceAll("!diminuendo(!", '');
		}
		else if ( payloadString.includes ( "!diminuendo)!" ) ) {
			options.diminuendo = "fim";
			payloadString = payloadString.replaceAll("!diminuendo)!", '');
		}

		if ( payloadString.includes ( "." ) ) {
			options.staccato = true;
			payloadString = payloadString.replaceAll(".", '');
		}
		if ( payloadString.includes ( "~" ) ) {
			options.roll = true;
			payloadString = payloadString.replaceAll("~", '');
		}

		// 3. ACIDENTES, DEDILHADO E LIGADURAS
		if ( payloadString.includes ( "^" ) ) {
			options.sustenido = true;
			payloadString = payloadString.replaceAll("^", '');
		}
		if ( payloadString.includes ( "_" ) ) {
			options.bemol = true;
			payloadString = payloadString.replaceAll("_", '');
		}
		if ( payloadString.includes ( "=" ) ) {
			options.beQuad = true;
			payloadString = payloadString.replaceAll("=", '');
		}
		if ( payloadString.endsWith ( "-" ) ) {
			options.ligada = true;
			payloadString = payloadString.slice(0, -1);
		}

		// 1. DEDILHADO (Letras p, i, m, a, c OU números)
		if (payloadString.includes("$")) {
			// Regex explica: Começa com $, aspas, captura (letras p imac ou dígitos), fecha aspas
			const regexDedilhadoGlobal = /\$"(p|i|m|a|c|\d+)"/gi;
			const matchesDedilhado = payloadString.match(regexDedilhadoGlobal);

			if (matchesDedilhado) {
				// Extraímos os valores internos para análise
				const valores = matchesDedilhado.map(m => {
					const v = m.match(/\$"(.*?)"/i)[1];
					return v;
				});

				// Se houver um número, priorizamos para o 'options.dedilhado' (inteiro)
				const apenasNumero = valores.find(v => !isNaN(v));
				if (apenasNumero) {
					options.dedilhado = parseInt(apenasNumero, 10);
				}

				// Se houver uma letra (p, i, m, a), guardamos em outra propriedade de técnica
				const tecnicaMaoDireita = valores.find(v => /[pamac]/i.test(v));
				if (tecnicaMaoDireita) {
					options.maoDireita = tecnicaMaoDireita.toLowerCase();
				}

				// EXCLUSÃO TOTAL: Remove todos os $"..." da string para não confundir o próximo passo
				payloadString = payloadString.replace(regexDedilhadoGlobal, '');
			}
		}

		// 2. ACORDES (O que sobrar entre aspas)
		const regexAcordes = /"(.*?)"/g;
		const matchesAcordes = payloadString.match(regexAcordes);

		if (matchesAcordes) {
			options.acordes = matchesAcordes.map(a => a.replace(/"/g, ''));
			// Remove os acordes reais da string
			payloadString = payloadString.replace(regexAcordes, '');
		}

		return {payloadString: payloadString.trim(), optionsGerado: options};
	}

}