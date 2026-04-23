import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Compasso } from "@domain/compasso/Compasso.js";
import { PausaAbc } from "@abcjs/PausaAbc.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";
import { QuialteraAbc } from "@abcjs/QuialteraAbc.js";
import { TonalidadeAbc } from "@abcjs/TonalidadeAbc.js";
import { TempoMetricaAbc } from "@abcjs/TempoMetricaAbc.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { UnissonoAbc } from "@adapters/abcjs/UnissonoAbc.js";
import { Pausa } from "@domain/nota/Pausa.js";
import { TempoDuracaoAbc } from "@abcjs/TempoDuracaoAbc.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { GrupoElementoAbc } from "@abcjs/GrupoElementoAbc.js";


export class CompassoAbc {
	/**
	 * USAGE: Orquestra a geração da string ABC completa do compasso.
	 * Agrupa as notas visivelmente baseando-se no total de pulsosOcupados e na metade do compasso.
	 * @param {Compasso} compasso - O compasso a ser convertido.
	 * @returns {string}
	 */
	static toAbc(compasso) {
		let abc = "";
		// Resolvendo unidade de tempo local com fallback para 1/8 exclusivo deste método
		const ut = compasso.getUnidadeTempo();
		let pulsosTotais = compasso.getTotalPulsos(ut);

		if (compasso.options.barraInicial && (compasso.options.barraInicial !== TipoBarra.NONE)) {
			abc += compasso.options.barraInicial.abc;
		}

		if (compasso.options.metrica) {
			abc += TempoMetricaAbc.toCompasso( compasso.options.metrica );
		}

		if (compasso.options.mudancaDeTom) {
			abc += `[K:${TonalidadeAbc.toAbc(compasso.options.mudancaDeTom)}]`;
		}


		// Arredonda para cima para dar prioridade à primeira metade em casos ímpares
		const pontoDeCorte = Math.ceil(pulsosTotais / 2);

		let pulsosAcumulados = 0;
		let meioAlcancado = false;

		if (compasso.grupos.length > 0) {
			if (compasso.grupos[0].elements.length > 0) {
				const strMiolo = compasso.grupos.map( grupo => {
					return GrupoElementoAbc.toAbc( grupo );
				} ).join(' ');
				abc += strMiolo;
			}
		}

		compasso.elements.forEach((elemento, idx) => {
			const cifrasDaPosicao = compasso.options.cifras.filter(c => c.posicao === idx);
			cifrasDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

			const anotacoesDaPosicao = compasso.options.anotacoes.filter(a => a.posicao === idx);
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

			// Insere o espaço para quebrar o agrupamento (beam) na metade do compasso
			// Usa uma pequena margem (0.001) para contornar imprecisões de ponto flutuante
			if (!meioAlcancado && pulsosAcumulados >= pontoDeCorte - 0.001) {
				if (idx < compasso.elements.length - 1) {
					abc += " ";
				}
				meioAlcancado = true;
			}
		});
		pulsosAcumulados += compasso.pulsosOcupados;
		// --- NOVO BLOCO: COMPLEMENTO DE PAUSA (CORRIGIDO) ---
		const pulsosFaltantes = pulsosTotais - pulsosAcumulados;

		if (pulsosFaltantes > 0.001 && pulsosAcumulados > 0) {
			const razaoPausa = pulsosFaltantes * ut.razao;

			// Busca o denominador musical perfeito (1, 2, 4, 8, 16, 32, 64)
			let num = 0, den = 1;
			for (let d of [1, 2, 4, 8, 16, 32, 64]) {
				// Se a multiplicação der um número inteiro (ex: 0.75 * 4 = 3.000)
				if (Math.abs((razaoPausa * d) - Math.round(razaoPausa * d)) < 0.001) {
					num = Math.round(razaoPausa * d);
					den = d;
					break;
				}
			}

			const duracaoFaltante = new TempoDuracao(num, den);
			const pausaPreenchimento = new Pausa(duracaoFaltante, {
				unidadeTempo: ut,
			});
			abc += " " + PausaAbc.toAbc( pausaPreenchimento );
		}
		// --- FIM DO BLOCO NOVO ---
		if (compasso.barraFinal && (compasso.barraFinal !== TipoBarra.NONE)) {
			abc += compasso.barraFinal.abc;
		}
		const letras = compasso.getLetras();
		if (letras && letras.length > 0) {
			let str = '';
			if (compasso.options.barraInicial && (compasso.options.barraInicial !== TipoBarra.NONE)) {
				str += TipoBarra.STANDARD.abc;
			}
			str += letras.join(' ');
			if (compasso.barraFinal && (compasso.barraFinal !== TipoBarra.NONE)) {
				str += TipoBarra.STANDARD.abc;
			}
			abc += `\nw:${str}`;
		}
		return abc;
	}
	/**
	 * Consome metadados ([M:..], [K:..], etc) do início da string e retorna o que sobrou.
	 * @private
	 */
	static #extrairHeadersIniciais(str, inlineHeaders) {
		//Metrica: [M:4/4]
		str = str.trimStart(); // Limpa espaços antes de testar o próximo header
		let match = str.match(/^\[M:\s*([^\]]+)\]/i);
		if (match) {
			const [token, valor] = match; // token = "[M:4/4]", valor = "4/4"

			// Se tiver classe (ex: TonalidadeAbc), converte. Se não, guarda a string.
			inlineHeaders['metrica'] = TempoMetricaAbc.fromAbc(valor);
			// CORTA: Remove o token encontrado do início da string
			str = str.substring(token.length).trimStart();
		}
		//Tom: [K:C]
		match = str.match(/^\[K:\s*([^\]]+)\]/i);
		if (match) {
			const [token, valor] = match;

			// Se tiver classe (ex: TonalidadeAbc), converte. Se não, guarda a string.
			inlineHeaders['unidadeTempo'] = TempoDuracaoAbc.fromAbc(valor);
			// CORTA: Remove o token encontrado do início da string
			str = str.substring(token.length).trimStart();
		}
		//Tempo: [L:1/4]
		match = str.match(/^\[L:\s*([^\]]+)\]/i);
		if (match) {
			const [token, valor] = match;

			// Se tiver classe (ex: TonalidadeAbc), converte. Se não, guarda a string.
			inlineHeaders['mudancaDeTom'] = TonalidadeAbc.fromAbc(valor);
			// CORTA: Remove o token encontrado do início da string
			str = str.substring(token.length).trimStart();
		}
		//Andamento: [Q:1/4=90]
		match = str.match(/^\[Q:\s*([^\]]+)\]/i);
		if (match) {
			const [token, valor] = match;

			// Se tiver classe (ex: TonalidadeAbc), converte. Se não, guarda a string.
			inlineHeaders['andamento'] = TempoDuracaoAbc.fromAbc(valor);
			// CORTA: Remove o token encontrado do início da string
			str = str.substring(token.length).trimStart();
		}
		//Parte: [P:1]
		match = str.match(/^\[P:\s*([^\]]+)\]/i);
		if (match) {
			const [token, valor] = match;

			// Se tiver classe (ex: TonalidadeAbc), converte. Se não, guarda a string.
			inlineHeaders['parte'] = valor;
			// CORTA: Remove o token encontrado do início da string
			str = str.substring(token.length).trimStart();
		}
		return str; // Retorna a string "podada"
	}
	/**
	 * USAGE: Cria uma nova instância de Compasso a partir de uma string de notação ABC.
	 * Segue a lógica de: Cabeçalhos Iniciais -> Loop de Elementos -> Metadados Finais.
	 */
	static fromAbc(compassoString, contextOptions) {
		let str = compassoString.trim();
		const elements = [];
		let inlineHeaders = {};
		let barraInicial = null;
		let barraFinal = null;

		// --- 1. CABEÇALHOS E BARRA INICIAL ---
		const regexBarra = /^(:\|:|\|:|:\||\|\]|\|\||\|)/;
		const regexBarraFim = /(:\|:|\|:|:\||\|\]|\|\||\|)$/;
		const matchBarraIni = str.match(regexBarra);
		if (matchBarraIni) {
			barraInicial = TipoBarra.getByAbc(matchBarraIni[0]);
			str = str.substring(matchBarraIni[0].length).trimStart(); // CORTA barra inicial
		}
		const matchBarraFim = str.match(regexBarraFim);
		if (matchBarraFim) {
			barraFinal = TipoBarra.getByAbc(matchBarraFim[0]);
			str = str.slice(0, -matchBarraFim[0].length).trim(); // CORTA barra final
		}

		str = this.#extrairHeadersIniciais(str, inlineHeaders);

		const strGrupo = str.split(' ');
		const grupos = strGrupo.map(grupo => {
			const grupoStr = grupo.trim();
			if (grupoStr.length > 0) {
				return GrupoElementoAbc.fromAbc(grupoStr, contextOptions);
			}
		});


		// --- 2. DEFINIÇÃO DOS REGEX DE BUSCA (Individuais) ---
		// A Nota tem uma regra especial: captura a letra apenas se NÃO for seguida por " (cifra)
		const reUnissono  = /^\[[^\]]+\][\d/]*\-?/;
		const reQuialtera = /^\([0-9]+(?::[0-9]+:[0-9]+)?\-?/;
		const rePausa     = /^[zxyZXY][\d/]*\-?/;
		const reNota      = /^[=^_]?[a-gA-G][,']*[\d/]*\-?/; // A nota pura

		// Regex para identificar se o início da string é um Payload
		//const rePayload   = /^("[^"]+"|![^!]+!)+/;
		// Captura qualquer coisa (incluindo espaços e pontos)
		// desde que a posição atual NÃO seja o início de um elemento musical.
		//const rePayload = /^((?!"|!|\[|\(|[zxyZXY]|[=^_]?[a-gA-G]).)+/;
		// Captura 1 ou mais ocorrências de: Cifras ("...") OU Dinâmicas (!...!) OU qualquer caractere
		// que NÃO seja início de Nota, Pausa, Uníssono, Quialtera ou Barras/Ligaduras
		const rePayload = /^(?:"[^"]*"|![^!]*!|[^\[\(=^_a-gA-GzxyZXY\-\|:])+/;

		// --- 3. LOOP DE ELEMENTOS ---
		while (str.length > 0) {
			str = str.trimStart();
			let payloadAcumulado = "";

			// Sub-loop para extrair todos os payloads que precedem o elemento
			let matchPayload;
			while ((matchPayload = str.match(rePayload))) {
				payloadAcumulado += matchPayload[0];
				str = str.substring(matchPayload[0].length).trimStart(); // CORTA payload
			}

			// Agora testamos os elementos musicais na ordem de prioridade
			let matchElemento = null;
			let tipoEncontrado = null;

			if ((matchElemento = str.match(reUnissono))) {
				tipoEncontrado = 'unissono';
			} else if ((matchElemento = str.match(reQuialtera))) {
				tipoEncontrado = 'quialtera';
			} else if ((matchElemento = str.match(rePausa))) {
				tipoEncontrado = 'pausa';
			} else if ((matchElemento = str.match(reNota))) {
				tipoEncontrado = 'nota';
			}
			if (matchElemento) {
				let textoCorpo = matchElemento[0]; // Transformado em 'let' para ser atualizado pela quiáltera
				let fullToken = payloadAcumulado + textoCorpo;

				// Instancia de acordo com o tipo
				switch (tipoEncontrado) {
					case 'unissono':
						elements.push(UnissonoAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'quialtera': {
						// 1. Extrai 'p' e 'r' do cabeçalho da quiáltera para saber quantas notas caçar
						const matchHeader = textoCorpo.match(/^\(([0-9]+)(?::([0-9]+))?(?::([0-9]+))?/);
						const p = parseInt(matchHeader[1], 10);
						const r = matchHeader[3] ? parseInt(matchHeader[3], 10) : null;
						const limiteNotas = r || p;

						let subStr = str.substring(textoCorpo.length); // O resto da string, logo após o "(p:q:r"
						let notasConsumidas = "";
						let contador = 0;

						// 2. Caça e recorta exatamente 'limiteNotas' elementos musicais
						while (subStr.length > 0 && contador < limiteNotas) {
							let matchSubPayload;
							// Consome payloads perdidos no meio (ex: "C" ou espaços)
							while ((matchSubPayload = subStr.match(rePayload))) {
								notasConsumidas += matchSubPayload[0];
								subStr = subStr.substring(matchSubPayload[0].length);
							}

							// Verifica se o próximo item é Nota, Pausa ou Uníssono
							let subElem = subStr.match(reUnissono) || subStr.match(rePausa) || subStr.match(reNota);
							if (subElem) {
								notasConsumidas += subElem[0];
								subStr = subStr.substring(subElem[0].length);
								contador++;
							} else {
								break; // Evita loop infinito se a sintaxe estiver quebrada
							}
						}

						// 3. Captura traço de ligadura se estiver grudado após a última nota da quiáltera
						if (subStr.startsWith('-')) {
							notasConsumidas += '-';
						}

						// 4. "Engorda" as strings originais com o que foi consumido
						fullToken += notasConsumidas;
						textoCorpo += notasConsumidas; // ISSO garante que o 'str.substring' lá embaixo corte tudo!

						elements.push(QuialteraAbc.fromAbc(fullToken, contextOptions));
						break;
					}
					case 'pausa':
						elements.push(PausaAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'nota':
						if ( fullToken.endsWith('-') ) {
							console.log( 'Ligada', fullToken )
						}
						elements.push(NotaAbc.fromAbc(fullToken, contextOptions));
						break;
				}

				// Graças ao 'textoCorpo += notasConsumidas', isso agora corta a quiáltera inteira!
				str = str.substring(textoCorpo.length).trimStart();
			} else {
				// Se restou algo que não é header, barra ou nota (ex: lixo ou erro de sintaxe)
				if (str.startsWith('-') || str.match(regexBarra)) break;

				console.warn("Caractere ignorado pelo Lexer:", str[0]);
				str = str.substring(1).trimStart();
			}
		}

		const compassoInstance = new Compasso([], {
			...contextOptions,
			...inlineHeaders,
			barraInicial: barraInicial || contextOptions.barraInicial || TipoBarra.NONE,
			barraFinal: barraFinal || contextOptions.barraFinal || TipoBarra.NONE
		});
		if (grupos.length > 0) {
			compassoInstance.grupos = grupos;
		} else {
			compassoInstance.elements = elements;
		}

		// --- NOVO BLOCO: CASAMENTO DE LETRAS ---
		if (contextOptions && contextOptions.letraString) {
			this.#aplicarLetras(compassoInstance, contextOptions.letraString);
		}

		return compassoInstance;
	}

	/**
	 * Tokeniza a string de letras (w:) e mapeia para os elementos musicais do compasso.
	 * TODO: O padrão ABC de letras (w:) tem algumas regras específicas que você precisará tratar nesse tokensLetra:
	 ** - (Hífen solto): Liga sílabas entre notas.
	 ** _ (Underline): Pula a nota atual (deixa ela sem letra).
	 ** * (Asterisco): Pula um tempo/nota.
	 ** ~ (Til): Une duas palavras na mesma nota.
	 *
	 *
	 * @param {Compasso} compasso O compasso já preenchido com os elementos musicais.
	 * @param {string} letraString A string da letra extraída do ABC (ex: "| A ti rei o |")
	 * @private
	 */
	static #aplicarLetras(compasso, letraString) {
		// 1. Limpa e tokeniza a string de letras
		const cleanString = letraString.replace(/\|/g, '').trim();
		if (!cleanString) return;

		const tokens = cleanString.match(/([^\s\-]+-?|-)/g) || [];
		const numTokens = tokens.length;

		// 2. Coleta todos os elementos que podem receber letra em uma lista única
		const lyricableElements = [];
		if (compasso.grupos && compasso.grupos.length > 0) {
			compasso.grupos.forEach(grupo => lyricableElements.push(...grupo.elements));
		} else {
			lyricableElements.push(...compasso.elements);
		}
		const numElements = lyricableElements.length;

		if (numElements === 0) return;

		// 3. Aplica a lógica de distribuição
		if (numTokens > numElements) {
			// a) Mais tokens que elementos: agrupa o excedente no último
			for (let i = 0; i < numElements - 1; i++) {
				lyricableElements[i].letra = tokens[i];
			}
			const remainingTokens = tokens.slice(numElements - 1);
			lyricableElements[numElements - 1].letra = remainingTokens.join('.');

		} else {
			// b) Menos ou igual número de tokens: distribui e completa com vazio
			for (let i = 0; i < numElements; i++) {
				lyricableElements[i].letra = (i < numTokens) ? tokens[i] : '';
			}
		}
	}
}