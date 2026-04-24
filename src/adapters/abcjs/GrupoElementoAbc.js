import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";
import { PausaAbc } from "@abcjs/PausaAbc.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";
import { QuialteraAbc } from "@abcjs/QuialteraAbc.js";
import { UnissonoAbc } from "@adapters/abcjs/UnissonoAbc.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";

/**
 * Classe responsável por orquestrar a análise léxica (Lexer) e o parsing de strings
 * na notação ABC, convertendo-as em instâncias de domínio musical e vice-versa.
 */
export class GrupoElementoAbc {

	// --- 1. REGEXES CENTRALIZADOS ---
	static #REGEX = {
		unissono: /^\[[^\]]+\][\d/]*\-?/,
		quialtera: /^\([0-9]+(?::[0-9]+:[0-9]+)?\-?/,
		pausa: /^[zxyZXY][\d/]*\-?/,
		// A Nota tem uma regra especial: captura a letra apenas se NÃO for seguida por " (acorde)
		nota: /^[=^_]?[a-gA-G][,']*[\d/]*\-?/,
		// Captura 1 ou mais ocorrências de: acordes ("...") OU Dinâmicas (!...!) OU qualquer caractere
		// que NÃO seja início de Nota, Pausa, Uníssono, Quialtera ou Barras/Ligaduras
		payload: /^(?:"[^"]*"|![^!]*!|[^\[\(=^_a-gA-GzxyZXY\-\|:])+/
	};

	/**
	 * Orquestra a geração da string ABC completa do grupo/compasso.
	 * Agrupa as notas visivelmente baseando-se no total de pulsos ocupados e na metade do compasso.
	 * * @param {Compasso} grupoElemento - O compasso (ou grupo) a ser convertido para string ABC.
	 * @returns {string} A representação em texto ABC do grupo de elementos.
	 */
	static toAbc(grupoElemento) {
		let abc = "";
		const acordes = grupoElemento.options.acordes;
		grupoElemento.elements.forEach((elemento, idx) => {
			const acordesDaPosicao = acordes.filter(c => c.posicao === idx);
			acordesDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

			const anotacoesDaPosicao = grupoElemento.options.anotacoes.filter(a => a.posicao === idx);
			anotacoesDaPosicao.forEach(a => {
				const local = a.local || "_";
				abc += `"${local}${a.texto}"`;
			});
			abc += `${((el) => {
				if (el.constructor.name === "Pausa") {
					return PausaAbc.toAbc( el );
				}
				if (el.constructor.name === "Nota") {
					return NotaAbc.toAbc( el );
				}
				if (el.constructor.name === "Unissono") {
					return UnissonoAbc.toAbc( el );
				}
				if (el.constructor.name === "Quialtera") {
					return QuialteraAbc.toAbc( el );
				}
				return ''; // Fallback de segurança
			})(elemento)}`;
		});

		return abc;
	}

	/**
	 * Extrai anotações prévias (payloads) que precedem um elemento musical na string.
	 * Varre o início da string em busca de acordes (entre aspas) e marcações
	 * de salto de linha/dedilhado (iniciadas com $), separando-os da notação musical real.
	 * * @protected
	 * @param {string} strIn - A porção atual da string ABC a ser processada.
	 * @returns {{ conteudoEncontrado: string, conteudoRestante: string }} Objeto contendo o agrupamento dos payloads encontrados e a string limpa para o lexer.
	 */
	static _consomePayloadInicioSentenca( strIn ) {
		let conteudoRestante = strIn.trim();
		let conteudoEncontrado = "";

		// REGEXES LIMPOS (Sem o /g no final)
		const regexAcordes = /^"(.*?)"/;
		const regexPulaLinha = /^\$(?!\()/;     // Blindado para ignorar o dedilhado

		while (conteudoRestante.length > 0) {
			let achei = false;

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

			conteudoRestante = conteudoRestante.trim();

			if (!achei) {
				break;
			}
		}

		return { conteudoEncontrado, conteudoRestante };
	}

	/**
	 * Analisa a string de payload extraída e converte-a em objetos estruturados de domínio.
	 * Mapeia os acordes encontrados em texto para um array de opções contendo o texto e a posição de ancoragem.
	 * * @protected
	 * @param {string} payloadString - A string isolada contendo apenas os dados não-musicais (ex: `"C7""Am"`).
	 * @returns {{ payloadString: string, optionsGerado: { acordes: Array<{texto: string, posicao: number}>, anotacoes: Array<any> } }} Os dados limpos e o objeto de metadados extraídos.
	 */
	static _trataPayLoad(payloadString) {
		let options = { acordes: [], anotacoes: [] };
		const regexAcordes = /"(.*?)"/g;
		const matchesAcordes = payloadString.match(regexAcordes);

		if (matchesAcordes) {
			options.acordes = matchesAcordes.map(a => {
				const texto = a.replace(/"/g, '');
				const posicao = options.acordes.length;
				return {texto: texto, posicao: posicao};
			});
			payloadString = payloadString.replace(regexAcordes, '');
		}

		return {payloadString: payloadString.trim(), optionsGerado: options};
	}

	/**
	 * Tenta aplicar a fila de acordes gerados aos elementos musicais do grupo/compasso.
	 * Retém na fila os acordes que não puderam ser aplicados (por falta de posição ou colisão).
	 * * @private
	 * @param {{ acordes: Array<{texto: string, posicao: number}>, anotacoes: Array<any> }} optionsGerado - As opções extraídas do payload inicial.
	 * @param {Array<ElementoMusical>} elements - O array de instâncias de ElementoMusical recém-criadas.
	 * @throws {TypeError} Lança um erro se o acorde for mal formatado ou se o elemento ancorado for inválido.
	 */
	static #sincronizarAcordes(optionsGerado, elements) {
		if (!optionsGerado.acordes || optionsGerado.acordes.length === 0) {
			return;
		}

		let sucessoTotal = true;

		optionsGerado.acordes.forEach((c, idx) => {
			if (!c || typeof c !== 'object') {
				throw new TypeError(`Formato de acorde inválido no índice ${idx}. Esperado um objeto válido, recebido: ${JSON.stringify(c)}`);
			}

			const { texto, posicao } = c;

			if (posicao in elements) {
				const elemento = elements[posicao];

				if (!(elemento instanceof ElementoMusical)) {
					throw new TypeError(`O elemento dentro do Grupo deve ser um ElementoMusical`);
				}

				if (!elemento.acorde) {
					elemento.acorde = texto;
					optionsGerado.acordes[idx] = null;
				} else {
					sucessoTotal = false;
				}
			} else {
				sucessoTotal = false;
			}
		});

		if (sucessoTotal) {
			delete optionsGerado.acordes;
		} else {
			optionsGerado.acordes = optionsGerado.acordes.filter(c => c !== null);
		}
	}

	// ==========================================
	// MÉTODOS PRIVADOS DE ANÁLISE LÉXICA (LEXER)
	// ==========================================

	/**
	 * Sub-loop interno para extrair todos os payloads avulsos que precedem diretamente um elemento no meio do fluxo de texto.
	 * * @private
	 * @param {string} str - A string ABC em processo de leitura.
	 * @returns {{ payloadAcumulado: string, strSemPayload: string }} O payload capturado e a nova string após o corte.
	 */
	static #extrairPayloadsIntermediarios(str) {
		let payloadAcumulado = "";
		let matchPayload;
		while ((matchPayload = str.match(this.#REGEX.payload))) {
			payloadAcumulado += matchPayload[0];
			str = str.substring(matchPayload[0].length).trimStart();
		}
		return { payloadAcumulado, strSemPayload: str };
	}

	/**
	 * Identifica dinamicamente qual é o próximo token musical na string, avaliando as regras de prioridade do Regex.
	 * * @private
	 * @param {string} str - A string ABC pronta para leitura.
	 * @returns {{ tipo: 'unissono'|'quialtera'|'pausa'|'nota', textoCorpo: string } | null} Os dados de identificação do token ou null se for um caractere órfão.
	 */
	static #identificarElemento(str) {
		let match;
		if ((match = str.match(this.#REGEX.unissono))) return { tipo: 'unissono', textoCorpo: match[0] };
		if ((match = str.match(this.#REGEX.quialtera))) return { tipo: 'quialtera', textoCorpo: match[0] };
		if ((match = str.match(this.#REGEX.pausa))) return { tipo: 'pausa', textoCorpo: match[0] };
		if ((match = str.match(this.#REGEX.nota))) return { tipo: 'nota', textoCorpo: match[0] };

		return null;
	}

	/**
	 * Actua como uma Factory. Recebe o tipo do elemento identificado e delega a criação para a respectiva classe adaptadora.
	 * * @private
	 * @param {'unissono'|'quialtera'|'pausa'|'nota'} tipo - A categoria do elemento a fabricar.
	 * @param {string} textoCorpo - O trecho exacto que despoletou a identificação inicial.
	 * @param {string} payloadAcumulado - As anotações anexadas que precedem o elemento.
	 * @param {string} strAtual - A string matriz completa no momento atual.
	 * @param {object} contextOptions - Opções globais ou de compasso recebidas pelo Lexer superior.
	 * @returns {{ elemento: ElementoMusical, textoConsumido: string }} A instância fabricada e a totalidade do texto lido e processado.
	 */
	static #fabricarElemento(tipo, textoCorpo, payloadAcumulado, strAtual, contextOptions) {
		let fullToken = payloadAcumulado + textoCorpo;

		if (tipo === 'quialtera') {
			return this.#processarQuialtera(textoCorpo, strAtual, fullToken, contextOptions);
		}

		let elemento;
		switch (tipo) {
			case 'unissono': elemento = UnissonoAbc.fromAbc(fullToken, contextOptions); break;
			case 'pausa':    elemento = PausaAbc.fromAbc(fullToken, contextOptions); break;
			case 'nota':     elemento = NotaAbc.fromAbc(fullToken, contextOptions); break;
		}

		return {
			elemento: elemento,
			textoConsumido: textoCorpo
		};
	}

	/**
	 * Lida exclusivamente com a lógica complexa de caça a múltiplas notas, aninhamentos e metadados pertencentes a uma quiáltera estruturada.
	 * * @private
	 * @param {string} textoCorpo - A declaração de abertura da quiáltera (ex: "(3").
	 * @param {string} strAtual - O corpo total da string de entrada restante.
	 * @param {string} fullToken - O token musical acumulado da quiáltera até ao momento.
	 * @param {object} contextOptions - Opções estruturais recebidas no topo da análise.
	 * @returns {{ elemento: ElementoMusical, textoConsumido: string }} O Grupo/Quiáltera compilado e a dimensão de caracteres extraídos do fluxo de texto.
	 */
	static #processarQuialtera(textoCorpo, strAtual, fullToken, contextOptions) {
		const matchHeader = textoCorpo.match(/^\(([0-9]+)(?::([0-9]+))?(?::([0-9]+))?/);
		const p = parseInt(matchHeader[1], 10);
		const r = matchHeader[3] ? parseInt(matchHeader[3], 10) : null;
		const limiteNotas = r || p;

		let subStr = strAtual.substring(textoCorpo.length);
		let notasConsumidas = "";
		let contador = 0;

		while (subStr.length > 0 && contador < limiteNotas) {
			let matchSubPayload;
			while ((matchSubPayload = subStr.match(this.#REGEX.payload))) {
				notasConsumidas += matchSubPayload[0];
				subStr = subStr.substring(matchSubPayload[0].length);
			}

			let subElem = subStr.match(this.#REGEX.unissono) || subStr.match(this.#REGEX.pausa) || subStr.match(this.#REGEX.nota);
			if (subElem) {
				notasConsumidas += subElem[0];
				subStr = subStr.substring(subElem[0].length);
				contador++;
			} else {
				break;
			}
		}

		if (subStr.startsWith('-')) {
			notasConsumidas += '-';
		}

		fullToken += notasConsumidas;
		const textoConsumidoTotal = textoCorpo + notasConsumidas;

		return {
			elemento: QuialteraAbc.fromAbc(fullToken, contextOptions),
			textoConsumido: textoConsumidoTotal
		};
	}

	/**
	 * Ponto de entrada do Lexer. Instancia a colecção primária de elementos musicais e produz um objecto `GrupoElemento`.
	 * O motor de orquestração flui por: Limpeza e Payloads Iniciais -> Extracção Cíclica -> Sincronização Final.
	 * * @param {string} grupoElementoString - O texto bruto em notação ABC que corresponde aos limites deste compasso ou grupo.
	 * @param {object} contextOptions - Variáveis rítmicas ou opções suplementares derivadas da armação global.
	 * @returns {GrupoElemento} O contentor estruturado do compasso, com notas já indexadas e opções assinaladas.
	 */
	static fromAbc(grupoElementoString, contextOptions) {
		let str = grupoElementoString.trim();
		const elements = [];

		// --- 1. TRATAMENTO INICIAL DE PAYLOADS GLOBAIS ---
		let { conteudoEncontrado, conteudoRestante } = this._consomePayloadInicioSentenca(str);
		let { payloadString, optionsGerado } = this._trataPayLoad(conteudoEncontrado);
		str = conteudoRestante;

		// --- 2. LOOP PRINCIPAL DE EXTRAÇÃO ---
		while (str.length > 0) {
			str = str.trimStart();

			const { payloadAcumulado, strSemPayload } = this.#extrairPayloadsIntermediarios(str);
			str = strSemPayload;

			const item = this.#identificarElemento(str);

			if (item) {
				const { elemento, textoConsumido } = this.#fabricarElemento(
					item.tipo, item.textoCorpo, payloadAcumulado, str, contextOptions
				);

				elements.push(elemento);
				str = str.substring(textoConsumido.length).trimStart();
			} else {
				console.warn("Caractere ignorado pelo Lexer:", str);
				str = str.substring(1).trimStart();
			}
		}

		// --- 3. SINCRONIZAÇÃO E RETORNO ---
		this.#sincronizarAcordes(optionsGerado, elements);

		return new GrupoElemento(elements, {
			...contextOptions,
			...optionsGerado,
		});
	}
}