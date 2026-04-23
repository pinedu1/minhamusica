import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Nota } from "@domain/nota/Nota.js";
import { Quialtera } from "@domain/nota/Quialtera.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";

export class QuialteraAbc extends ElementoMusicalAbc {
	/**
	 * Cria a string abcJs do quialtera.
	 * @param quialtera {Quialtera} {}
	 * @return {string}
	 */
	static toAbc( quialtera ) {
		let abc = "";
		const opt = quialtera.options;
		if ( opt ) {
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
		}

		// Grace Notes (Adornos)
		if (typeof this._toGraceNotes === "function") {
			abc += this._toGraceNotes( quialtera );
		}
		if (quialtera.notas && quialtera.notas.length > 0) {
			/**
			 * DEFINIÇÃO DOS COMPONENTES DA QUIÁLTERA (p:q:r)
			 * p (quantidadeNotas) -> O "Corpo": Quantas notas físicas serão entregues.
			 * q (espacoDeTempo)   -> A "Mente": Em quanto tempo (unidades de L) elas devem caber.
			 * r (escopoVisual)    -> O "Olho": Quantas notas a linha/chave visual deve abraçar na pauta.
			 */

			// 1. O 'p' é nativo: a contagem física de elementos no array.
			const p = quialtera.notas.length;

			// 2. Cálculo do 'q' (O Orçamento de Tempo):
			// Pegamos a duração alvo (ex: 1/4 para um tempo) e multiplicamos pelo denominador de L.
			// Se L:1/4 e a quialtera deve durar 1 tempo (1/4 de semibreve), q = (1/4 * 4) = 1.
			const denominadorL = quialtera.getUnidadeTempo().denominador;
			let qCalculado = Math.round(quialtera.duracao.razao * denominadorL);
			qCalculado = (qCalculado <= 0) ? 1 : qCalculado;

			// 3. O 'r' visual por padrão acompanha a quantidade de notas.
			const rCalculado = p;

			/**
			 * SOBREPOSIÇÃO PELO MAESTRO (options)
			 * Caso o usuário queira forçar uma regra específica que fuja da matemática
			 * padrão (ex: uma quialtera de 16 notas onde o colchete visual só abraça 8).
			 */
			const pFinal = p;
			const qFinal = quialtera.options?.forceQ ?? qCalculado;
			const rFinal = quialtera.options?.forceR ?? rCalculado;

			/**
			 * RENDERIZAÇÃO DAS NOTAS
			 * Importante: As notas dentro da quiáltera são renderizadas em sua
			 * duração "nominal" (baseada em L). O prefixo (p:q:r) é quem faz
			 * a compressão elástica do tempo e do desenho.
			 */
			const notasAbc = quialtera.notas.map(elemento => {
				// false: não é nota única isolada | true: está dentro de grupo (quialtera)
				return this._toElementoAbc(elemento, false, true);
			}).join('');

			/**
			 * CONSTRUÇÃO DA STRING FINAL ABCJS
			 * Sintaxe: (p:q:r onde:
			 * p = pFinal
			 * q = qFinal
			 * r = rFinal
			 */
			abc += `(${pFinal}:${qFinal}:${rFinal}${notasAbc}`;
		}

		// Ligaduras (Prolongamento/Tie)
		if (opt.ligada || opt.hammerOn || opt.pullOff) {
			abc += "-";
		}
		return abc;
	}

	/**
	 * Cria uma nova instância de Quialtera a partir de uma string de notação ABC.
	 * Suporta os formatos (p, (p:q ou (p:q:r.
	 * @param {string} quialteraString - A string do quialtera (ex: "(3abc" ou "(8:1:8cdefgabc'").
	 * @param {Object} contextOptions - Opções de contexto (L, M, K, voz, obra).
	 * @returns {Quialtera} Uma nova instância da classe Quialtera.
	 */
	static fromAbc(quialteraString, contextOptions = {} ) {
		let str = quialteraString.trim();

		// 1. SEPARAÇÃO DO PAYLOAD GLOBAL (O que vem antes do '(')
		const matchInicioParenteses = str.match(/\(/);
		if (!matchInicioParenteses) return null;

		const indiceCorte = matchInicioParenteses.index;
		const payloadGlobalStr = str.substring(0, indiceCorte).trim();
		let restoQuialtera = str.substring(indiceCorte);

		// Chamada para o formato do trataPayLoad (herdado de ElementoMusicalAbc)
		const { payloadString, optionsGerado } = this._trataPayLoad(payloadGlobalStr);
		// 2. EXTRAÇÃO DO CORPO DA QUIALTERA
		// Captura (p, opcionalmente :q, opcionalmente :r, opcionalmente -, e o corpo de notas
		const quialteraRegex = /^\(([0-9]+)(?::([0-9]+))?(?::([0-9]+))?(-)?(.*)$/;
		const match = restoQuialtera.match(quialteraRegex);

		if (!match) {
			throw new Error(`QuialteraAbc.fromAbc: Sintaxe de quiáltera inválida: "${quialteraString}"`);
		}

		const [ , pStr, qStr, rStr, tracoLigadura, corpoNotas] = match;

		const p = parseInt(pStr, 10);
		const forceQ = qStr ? parseInt(qStr, 10) : null;
		const forceR = rStr ? parseInt(rStr, 10) : null;

		const finalOptions = {
			...optionsGerado,
		};
		if (forceQ) {
			finalOptions.forceQ = forceQ;
		}
		if (forceR) {
			finalOptions.forceR = forceR;
		}

		if (tracoLigadura === '-') finalOptions.ligada = true;

		const unidadeTempo = this._calcularDuracaoAbcString( contextOptions, '' );

		// 3. CÁLCULO DA DURACAO OCUPADA
		let qMusical;
		if (forceQ) {
			qMusical = forceQ;
		} else {
			if (p === 3 || p === 6 || p === 12) qMusical = (p * 2) / 3;
			else if (p === 2 || p === 4) qMusical = 3;
			else qMusical = p;
		}

		const duracaoOcupada = new TempoDuracao(qMusical * unidadeTempo.numerador, unidadeTempo.denominador);

		// 4. INSTÂNCIA ANTECIPADA (Para passar de contexto, se necessário)
		const notas = [];
		const quialteraInstance = new Quialtera(notas, duracaoOcupada, finalOptions);
		finalOptions.quialtera = quialteraInstance;

		// --- 5. LOOP DE ELEMENTOS (NOTAS INTERNAS) ---
		// MESMA LÓGICA DO UNÍSSONO PARA O CORPO DAS NOTAS
		let strLoop = corpoNotas;
		let payloadAcumulado = "";
		let contador = 0; // Controle de quantas notas físicas foram extraídas
		const limiteNotas = forceR || p;

		const reUnissono  = /^\[[^\]]+\][\d/]*\-?/;
		const rePausa     = /^[zxyZXY][\d/]*\-?/;
		// Na quialtera, não processamos quialteras aninhadas por padrão ABC puro, mas mantemos o suporte à nota:
		const reNota      = /^[=^_]?[a-gA-G][,']*[\d/]*\-?/;

		while (strLoop.length > 0 && contador < limiteNotas) {
			let matchElemento = null;
			let tipoEncontrado = null;

			if ((matchElemento = strLoop.match(reUnissono))) {
				tipoEncontrado = 'unissono';
			} else if ((matchElemento = strLoop.match(rePausa))) {
				tipoEncontrado = 'pausa';
			} else if ((matchElemento = strLoop.match(reNota))) {
				tipoEncontrado = 'nota';
			}

			if (matchElemento) {
				const textoCorpo = matchElemento[0];
				const fullToken = payloadAcumulado + textoCorpo;

				switch (tipoEncontrado) {
					case 'unissono':
						notas.push(UnissonoAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'pausa':
						notas.push(PausaAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'nota':
						notas.push(NotaAbc.fromAbc(fullToken, contextOptions));
						break;
				}

				payloadAcumulado = "";
				strLoop = strLoop.substring(textoCorpo.length);
				contador++;
			} else {
				payloadAcumulado += strLoop[0];
				strLoop = strLoop.substring(1);
			}
		}

		// Se sobrou string não processada (porque atingimos o limite do contador p/r)
		if (strLoop.length > 0) {
			// Aviso opcional de log para rastreio
			console.warn(`QuialteraAbc: Texto excedente ignorado após capturar ${limiteNotas} elementos -> "${strLoop}"`);
		}

		quialteraInstance.notas = notas;
		return quialteraInstance;
	}
}