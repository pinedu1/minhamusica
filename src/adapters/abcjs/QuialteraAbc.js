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
	static fromAbc(quialteraString, contextOptions) {
		/**
		 * REGEX DE QUIÁLTERA
		 * Captura:
		 * 1. p (quantidade de notas)
		 * 2. q (opcional: orçamento de tempo)
		 * 3. r (opcional: escopo visual)
		 * 4. O restante da string (as notas em si)
		 */
		const quialteraRegex = /^\(([0-9]+)(?::([0-9]+):([0-9]+))?(.*)$/;
		const match = quialteraString.match(quialteraRegex);

		if (!match) {
			throw new Error(`QuialteraAbc.fromAbc: Sintaxe de quiáltera inválida: "${quialteraString}"`);
		}

		const [ , pStr, qStr, rStr, corpoNotas] = match;

		const p = parseInt(pStr, 10);
		const forceQ = qStr ? parseInt(qStr, 10) : null;
		const forceR = rStr ? parseInt(rStr, 10) : null;

		const quialteraOptions = {
			...contextOptions,
			forceQ: forceQ,
			forceR: forceR
		};

		// 1. Recuperação da Unidade de Tempo (L)
		const unidadeTempo = (function() {
			const ref = contextOptions?.voz || contextOptions?.obra;
			if (ref && typeof ref.getUnidadeTempo === 'function') {
				const ut = ref.getUnidadeTempo();
				if (ut instanceof TempoDuracao) return ut;
			}
			return new TempoDuracao(1, 4); // Fallback padrão L:1/4
		})();

		/**
		 * 2. CÁLCULO DA DURACAO OCUPADA (Ocupação no Compasso)
		 * No ABCJS, se 'q' não é fornecido, a regra é:
		 * p=3 -> q=2 | p=2 -> q=3 | p=4 -> q=3 | p=6 -> q=4, etc.
		 */
		let qMusical;
		if (forceQ) {
			qMusical = forceQ;
		} else {
			// Lógica padrão da teoria musical para quiálteras simples
			if (p === 3 || p === 6 || p === 12) qMusical = (p * 2) / 3; // Tercinas, sextinas
			else if (p === 2 || p === 4) qMusical = 3; // Duinas, quartinas
			else qMusical = p; // Fallback: 1 por 1
		}

		// A duração absoluta da quiáltera em relação à semibreve
		// duracao = (q / denominadorL)
		const duracaoOcupada = new TempoDuracao(qMusical * unidadeTempo.numerador, unidadeTempo.denominador);

		// 3. PARSING DAS NOTAS INTERNAS
		// O corpoNotas contém algo como "abcde" ou "c/8d/8e/8"
		// Aqui você deve usar o seu parser de notas/unissonos para extrair os objetos
		const notas = [];

		/**
		 * NOTA: Como a quiáltera termina após 'p' notas, precisamos de um parser
		 * que consuma a string e retorne exatamente 'p' ElementosMusicais.
		 * Aqui uso uma simplificação para extrair as notas:
		 */
		const notaInternaRegex = /([=^_]?[a-gA-G][,']*[\d/]*|\[[^\]]+\][\d/]*|z[\d/]*)/g;
		let notaMatch;
		let contador = 0;

		while ((notaMatch = notaInternaRegex.exec(corpoNotas)) !== null && contador < (forceR || p)) {
			const elementoStr = notaMatch[0];
			// Delegamos a criação do objeto para os respectivos Adapters
			let elemento;
			if (elementoStr.startsWith('z')) {
				elemento = PausaAbc.fromAbc(elementoStr, contextOptions);
			} else if (elementoStr.startsWith('[')) {
				elemento = UnissonoAbc.fromAbc(elementoStr, contextOptions);
			} else {
				elemento = NotaAbc.fromAbc(elementoStr, contextOptions);
			}

			notas.push(elemento);
			contador++;
		}

		return new Quialtera(notas, duracaoOcupada, quialteraOptions);
	}
}