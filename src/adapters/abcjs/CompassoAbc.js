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


export class CompassoAbc {
	/**
	 * USAGE: Orquestra a geração da string ABC completa do compasso.
	 * Agrupa as notas visivelmente baseando-se no total de pulsos e na metade do compasso.
	 * @param {Compasso} compasso - O compasso a ser convertido.
	 * @returns {string}
	 */
	static toAbc(compasso) {
		let abc = "";
		// Resolvendo unidade de tempo local com fallback para 1/8 exclusivo deste método
		const ut = compasso.getUnidadeTempo();
		let pulsosTotais = compasso.getPulsos(ut);

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
			const pulsosElemento = elemento.duracao.razao / ut.razao;
			pulsosAcumulados += pulsosElemento;

			// Insere o espaço para quebrar o agrupamento (beam) na metade do compasso
			// Usa uma pequena margem (0.001) para contornar imprecisões de ponto flutuante
			if (!meioAlcancado && pulsosAcumulados >= pontoDeCorte - 0.001) {
				if (idx < compasso.elements.length - 1) {
					abc += " ";
				}
				meioAlcancado = true;
			}
		});
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
		const matchBarraIni = str.match(regexBarra);
		if (matchBarraIni) {
			barraInicial = TipoBarra.getByAbc(matchBarraIni[0]);
			str = str.substring(matchBarraIni[0].length).trimStart(); // CORTA barra inicial
		}

		str = this.#extrairHeadersIniciais(str, inlineHeaders);

		// --- 2. DEFINIÇÃO DOS REGEX DE BUSCA (Individuais) ---
		// A Nota tem uma regra especial: captura a letra apenas se NÃO for seguida por " (cifra)
		const reUnissono  = /^\[[^\]]+\][\d/]*/;
		const reQuialtera = /^\([0-9]+(?::[0-9]+:[0-9]+)?/;
		const rePausa     = /^[zxyZXY][\d/]*/;
		const reNota      = /^[=^_]?[a-gA-G][,']*[\d/]*/; // A nota pura

		// Regex para identificar se o início da string é um Payload
		const rePayload   = /^("[^"]+"|![^!]+!)+/;

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
				const textoCorpo = matchElemento[0];
				const fullToken = payloadAcumulado + textoCorpo;

				// Instancia de acordo com o tipo
				switch (tipoEncontrado) {
					case 'unissono':
						elements.push(UnissonoAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'quialtera':
						elements.push(QuialteraAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'pausa':
						elements.push(PausaAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'nota':
						elements.push(NotaAbc.fromAbc(fullToken, contextOptions));
						break;
				}

				str = str.substring(textoCorpo.length).trimStart(); // CORTA o elemento processado
			} else {
				// Se restou algo que não é header, barra ou nota (ex: lixo ou erro de sintaxe)
				if (str.startsWith('-') || str.match(regexBarra)) break;

				console.warn("Caractere ignorado pelo Lexer:", str[0]);
				str = str.substring(1).trimStart();
			}
		}

		// --- 4. LIGADURAS E BARRA FINAL ---
		if (str.startsWith('-')) {
			inlineHeaders.ligadoAoProximo = true;
			str = str.substring(1).trimStart(); // CORTA traço
		}

		const matchBarraFim = str.match(regexBarra);
		if (matchBarraFim) {
			barraFinal = TipoBarra.getByAbc(matchBarraFim[0]);
			str = str.substring(matchBarraFim[0].length).trim(); // CORTA barra final
		}

		return new Compasso(elements, {
			...contextOptions,
			...inlineHeaders,
			barraInicial: barraInicial || contextOptions.barraInicial || TipoBarra.NONE,
			barraFinal: barraFinal || contextOptions.barraFinal || TipoBarra.NONE
		});
	}
}